from rest_framework import viewsets, status, exceptions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.views.generic import TemplateView
from django.db import transaction, models, IntegrityError
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

from therapy.models import (
    ScheduleEvent,
    TherapistProfile,
    ClientProfile,
    Appointment,
    AvailabilitySlot,
    BookingRequest,
    Notification,
    SessionRecord,
    NoteTemplate,
    NoteField,
    Note,
    ClientFile,
    EventType,
    WaitlistEntry,
    TherapistSessionLink,
    ClientJournal,
    ClientGoal,
    ClientCheckin,
    TherapistMaterial,
    MaterialShare,
    Resource,
    SharedResourceAssignment,
    TherapistApplication,
    TherapeuticRelationship,
    TeamMember,
    Service,
    HomeContent,
    AboutContent,
    TherapistsContent,
    ServicesContent,
    ContactContent,
    TrainingProgramsContent,
    CareersContent,
    TherapistApplyContent,
)
from therapy.serializers import (
    TherapistProfileSerializer,
    ClientProfileSerializer,
    AppointmentSerializer,
    AvailabilitySlotSerializer,
    AvailabilitySlotPublicSerializer,
    BookingRequestSerializer,
    BookingRequestCreateSerializer,
    NotificationSerializer,
    SessionRecordSerializer,
    NoteTemplateSerializer,
    NoteSerializer,
    ClientFileSerializer,
    EventTypeSerializer,
    ScheduleEventSerializer,
    WaitlistEntrySerializer,
    TherapistSessionLinkSerializer,
    ClientJournalSerializer,
    ClientGoalSerializer,
    ClientCheckinSerializer,
    TherapistMaterialSerializer,
    MaterialShareSerializer,
    ResourceSerializer,
    ResourceCreateUpdateSerializer,
    SharedResourceAssignmentSerializer,
    SharedResourceAssignmentCreateSerializer,
    TherapistApplicationSerializer,
    TeamMemberSerializer,
    TherapistDirectorySerializer,
    ServiceSerializer,
    HomeContentSerializer,
    AboutContentSerializer,
    TherapistsContentSerializer,
    ServicesContentSerializer,
    ContactContentSerializer,
    TrainingProgramsContentSerializer,
    CareersContentSerializer,
    TherapistApplyContentSerializer,
)
from therapy.permissions import (
    IsTherapistOwnerOfSlot,
    IsClientOwnerOfBookingRequest,
    IsTherapistOwnerOfBookingRequest,
    IsTherapistOwnerOfBookingRequestAction,
    IsClientOwnerOfAppointment,
    IsTherapistOwnerOfAppointment,
    IsNotificationRecipient,
    IsTherapistOwnerOfResource,
    IsTherapistOwnerOfResourceAssignment,
    IsClientOwnerOfResourceAssignment,
)
from therapy.services.booking_requests import (
    confirm_booking_request,
    decline_booking_request,
    cancel_pending_by_client,
    cancel_pending_by_therapist,
)
from therapy.services.resources import assign_resource_to_client
from therapy.notifications import get_scheduling_action_url

def _profile_required_response(profile_type: str):
    return Response(
        {
            "detail": f"{profile_type.title()} profile required to use scheduling.",
            "code": "profile_missing",
            "profile_type": profile_type,
        },
        status=status.HTTP_403_FORBIDDEN,
    )
from therapy.services.appointments import cancel_appointment
from django.core.exceptions import ValidationError


# ----------------------------
# Helper
# ----------------------------
def _resolve_therapist_from_request(request, allow_create=False):
    """
    Return the TherapistProfile linked to the authenticated user.
    Optionally creates one for therapists/admins when missing.
    """
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return None

    # Prefer explicit linkage
    therapist_profile = getattr(user, "therapist_profile", None)
    if therapist_profile:
        return therapist_profile

    email = getattr(user, "email", None)
    therapist = None
    if email:
        therapist = TherapistProfile.objects.filter(email__iexact=email).first()
        if therapist and therapist.user_id != user.id:
            therapist.user = user
            therapist.save(update_fields=["user"])

    if therapist:
        return therapist

    if not allow_create:
        return None

    roles = _extract_roles_from_auth(request)
    if not any(role in roles for role in ["therapist", "premium_therapist", "admin"]):
        return None

    name = (
        getattr(user, "get_full_name", lambda: "")().strip()
        or getattr(user, "username", None)
        or "Unnamed Therapist"
    )
    email = email or f"therapist_{user.pk or 'nouser'}@local"
    return TherapistProfile.objects.create(user=user, name=name, email=email)


def _resolve_client_from_request(request):
    """
    Return the ClientProfile linked to the authenticated user.
    """
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return None

    client_profile = getattr(user, "client_profile", None)
    if client_profile:
        return client_profile

    email = getattr(user, "email", None)
    client = ClientProfile.objects.filter(email__iexact=email).first() if email else None
    if client:
        if client.user_id != user.id:
            client.user = user
            client.save(update_fields=["user"])
        return client
        
    display_name = getattr(user, "get_full_name", lambda: "")() or getattr(user, "username", "Unknown")
    safe_email = email or f"client_{user.pk or 'nouser'}@local"
    client = ClientProfile.objects.create(
        user=user,
        name=display_name,
        email=safe_email,
    )
    return client


def _active_client_ids_for_therapist(therapist):
    if not therapist:
        return ClientProfile.objects.none().values_list("id", flat=True)
    rels = TherapeuticRelationship.objects.filter(
        therapist=therapist, status=TherapeuticRelationship.Status.ACTIVE
    ).values_list("client_id", flat=True)
    if rels.exists():
        return rels
    return ClientProfile.objects.filter(therapist=therapist).values_list("id", flat=True)


def _ensure_relationship(therapist, client, make_primary=False):
    if not therapist or not client:
        return None
    relationship, created = TherapeuticRelationship.objects.get_or_create(
        therapist=therapist,
        client=client,
        defaults={
            "status": TherapeuticRelationship.Status.ACTIVE,
            "is_primary": bool(make_primary),
        },
    )
    if not created and make_primary and not relationship.is_primary:
        relationship.is_primary = True
        relationship.save(update_fields=["is_primary", "updated_at"])
    return relationship


def _extract_roles_from_auth(request):
    payload = request.auth or {}
    meta = payload.get("public_metadata") or payload.get("publicMetadata") or {}
    roles = meta.get("roles") or payload.get("roles") or []
    if isinstance(roles, str):
        roles = [roles]
    if not roles and meta.get("role"):
        roles = [meta.get("role")]
    # Fallback: allow explicit admin emails via env
    admin_emails = [
        e.strip().lower()
        for e in getattr(settings, "ADMIN_EMAILS", "").split(",")
        if e.strip()
    ]
    admin_user_ids = [
        uid.strip()
        for uid in getattr(settings, "ADMIN_USER_IDS", "").split(",")
        if uid.strip()
    ]
    payload_email = None
    if isinstance(payload, dict):
        payload_email = payload.get("email") or payload.get("email_address")
        if payload.get("sub") in admin_user_ids and "admin" not in roles:
            roles = list(roles) + ["admin"]
    email = getattr(getattr(request, "user", None), "email", None) or payload_email
    if email and email.lower() in admin_emails and "admin" not in roles:
        roles = list(roles) + ["admin"]
    return [str(r).lower() for r in roles if r]


def _is_premium_request(request):
    roles = _extract_roles_from_auth(request)
    return any(role in roles for role in ["admin", "premium", "premium_client", "premium_therapist"])


def _require_admin(request):
    roles = _extract_roles_from_auth(request)
    if "admin" not in roles:
        raise exceptions.PermissionDenied("Admin access required.")


# ----------------------------
# Therapist / Client / Appointment
# ----------------------------
class TherapistProfileViewSet(viewsets.ModelViewSet):
    serializer_class = TherapistProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        roles = _extract_roles_from_auth(self.request)
        if "admin" in roles:
            return TherapistProfile.objects.all()
        return TherapistProfile.objects.filter(id=therapist.id)


class TherapistSessionLinkViewSet(viewsets.ModelViewSet):
    serializer_class = TherapistSessionLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        return TherapistSessionLink.objects.filter(therapist=therapist)

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        serializer.save(therapist=therapist)


class ClientProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client_ids = _active_client_ids_for_therapist(therapist)
        return ClientProfile.objects.filter(id__in=client_ids).order_by("name")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = serializer.save(therapist=therapist)
        _ensure_relationship(therapist, client, make_primary=True)


class AppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsTherapistOwnerOfAppointment]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        qs = Appointment.objects.filter(therapist=therapist).order_by("-date")
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsTherapistOwnerOfAppointment])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        reason = request.data.get("cancellation_reason", "")
        reopen_slot = request.data.get("reopen_slot", True)
        try:
            appointment = cancel_appointment(
                appointment,
                cancelled_by=request.user,
                reason=reason,
                reopen_slot=bool(reopen_slot),
            )
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsTherapistOwnerOfAppointment])
    def mark_completed(self, request, pk=None):
        appointment = self.get_object()
        if not appointment.can_mark_completed:
            return Response(
                {"detail": "This appointment cannot be marked completed yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        appointment.status = Appointment.Status.COMPLETED
        appointment.completed_at = timezone.now()
        appointment.save(update_fields=["status", "completed_at", "updated_at"])
        return Response(AppointmentSerializer(appointment).data)


class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [IsAuthenticated, IsTherapistOwnerOfSlot]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            return AvailabilitySlot.objects.none()
        return AvailabilitySlot.objects.filter(therapist=therapist).order_by("start_time")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["therapist"] = _resolve_therapist_from_request(self.request, allow_create=False)
        return context

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            raise exceptions.PermissionDenied("Therapist profile required.")
        slot = serializer.save(therapist=therapist)
        slot.full_clean()
        slot.save()

    def perform_update(self, serializer):
        slot = self.get_object()
        if slot.status == AvailabilitySlot.Status.BOOKED:
            immutable_fields = {"start_time", "end_time", "status"}
            if any(field in serializer.validated_data for field in immutable_fields):
                raise exceptions.ValidationError(
                    {"detail": "Booked slots cannot be edited."}
                )
        updated = serializer.save()
        updated.full_clean()
        updated.save()

    def destroy(self, request, *args, **kwargs):
        slot = self.get_object()
        if not slot.can_be_deleted:
            raise exceptions.ValidationError(
                {"detail": "This slot cannot be deleted."}
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def block(self, request, pk=None):
        slot = self.get_object()
        if slot.status == AvailabilitySlot.Status.BOOKED:
            raise exceptions.ValidationError({"detail": "Booked slots cannot be blocked."})
        slot.status = AvailabilitySlot.Status.BLOCKED
        slot.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(slot).data)

    @action(detail=True, methods=["post"])
    def unblock(self, request, pk=None):
        slot = self.get_object()
        if slot.status == AvailabilitySlot.Status.BOOKED:
            raise exceptions.ValidationError({"detail": "Booked slots cannot be unblocked."})
        if slot.start_time and slot.start_time <= timezone.now():
            slot.status = AvailabilitySlot.Status.EXPIRED
        else:
            slot.status = AvailabilitySlot.Status.OPEN
        slot.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(slot).data)

    @action(detail=False, methods=["post"])
    def generate_bulk(self, request):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            return Response({"detail": "Therapist profile required."}, status=status.HTTP_400_BAD_REQUEST)
        
        business_hours = therapist.business_hours
        if not business_hours:
            return Response({"detail": "No business hours configured in profile."}, status=status.HTTP_400_BAD_REQUEST)
        
        start_date_str = request.data.get("start_date")
        end_date_str = request.data.get("end_date")
        if not start_date_str or not end_date_str:
            return Response({"detail": "start_date and end_date are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        from datetime import datetime, timedelta
        try:
            start_dt = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_dt = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        
        created_slots = 0
        current_dt = start_dt
        while current_dt <= end_dt:
            weekday = current_dt.isoweekday() # 1=Mon, 7=Sun
            day_str = str(weekday % 7) # 0=Sun, 1=Mon...
            
            day_slots = business_hours.get(day_str, [])
            for block in day_slots:
                start_str = block.get("startTime")
                end_str = block.get("endTime")
                if not start_str or not end_str:
                    continue
                
                try:
                    slot_start_time = datetime.strptime(f"{current_dt} {start_str}", "%Y-%m-%d %H:%M")
                    slot_end_time = datetime.strptime(f"{current_dt} {end_str}", "%Y-%m-%d %H:%M")
                    slot_start_time = timezone.make_aware(slot_start_time)
                    slot_end_time = timezone.make_aware(slot_end_time)
                except ValueError:
                    continue
                
                curr_slot_start = slot_start_time
                while curr_slot_start + timedelta(hours=1) <= slot_end_time:
                    curr_slot_end = curr_slot_start + timedelta(hours=1)
                    
                    overlap = AvailabilitySlot.objects.filter(
                        therapist=therapist,
                        status__in=[AvailabilitySlot.Status.OPEN, AvailabilitySlot.Status.HELD, AvailabilitySlot.Status.BOOKED, AvailabilitySlot.Status.BLOCKED],
                        start_time__lt=curr_slot_end,
                        end_time__gt=curr_slot_start
                    )
                    
                    overlap_events = ScheduleEvent.objects.filter(
                        therapist=therapist,
                        start_time__lt=curr_slot_end,
                        end_time__gt=curr_slot_start
                    )
                    
                    if not overlap.exists() and not overlap_events.exists():
                        AvailabilitySlot.objects.create(
                            therapist=therapist,
                            start_time=curr_slot_start,
                            end_time=curr_slot_end,
                            status=AvailabilitySlot.Status.OPEN,
                            visible_to_clients=True
                        )
                        created_slots += 1
                    
                    curr_slot_start += timedelta(hours=1)
            
            current_dt += timedelta(days=1)
            
        return Response({"detail": f"Generated {created_slots} open slots."})


class AvailabilitySlotPublicView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client = _resolve_client_from_request(request)
        if not client:
            return _profile_required_response("client")

        therapist_id = (
            request.query_params.get("therapist")
            or request.query_params.get("therapist_id")
        )
        if not therapist_id:
            return Response(
                {"detail": "therapist query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        one_month_from_now = timezone.now() + timezone.timedelta(days=30)
        slots = AvailabilitySlot.objects.filter(
            therapist_id=therapist_id,
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
            start_time__gt=timezone.now(),
            start_time__lte=one_month_from_now,
        ).order_by("start_time")

        serializer = AvailabilitySlotPublicSerializer(slots, many=True)
        return Response(serializer.data)


class PublicTherapistDirectoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client = _resolve_client_from_request(request)
        if not client:
            return _profile_required_response("client")

        team_members = TeamMember.objects.filter(
            is_active=True,
            email__isnull=False,
        ).exclude(email="")

        emails = [m.email.lower() for m in team_members if m.email]
        profiles = TherapistProfile.objects.filter(email__in=emails)
        profile_by_email = {p.email.lower(): p for p in profiles}

        payload = []
        for member in team_members:
            profile = profile_by_email.get(member.email.lower())
            if not profile:
                continue
            payload.append(
                {
                    "id": profile.id,
                    "name": member.name or profile.name,
                    "title": member.title,
                    "photo_url": member.photo_url,
                    "specialties": member.specialties,
                }
            )

        serializer = TherapistDirectorySerializer(payload, many=True)
        return Response(serializer.data)


class BookingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BookingRequestSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOfBookingRequest]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        client = _resolve_client_from_request(self.request)
        if not client:
            return BookingRequest.objects.none()
        return BookingRequest.objects.filter(client=client).select_related(
            "therapist", "availability_slot"
        ).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        client = _resolve_client_from_request(request)
        if not client:
            raise exceptions.PermissionDenied("Client profile required.")

        data = request.data.copy()
        data["client"] = client.id

        serializer = BookingRequestCreateSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        is_first_session_free = serializer.validated_data.get("is_first_session_free", False)

        with transaction.atomic():
            slot = AvailabilitySlot.objects.select_for_update().get(
                pk=serializer.validated_data["availability_slot"].id
            )

            therapist = serializer.validated_data.get("therapist") or slot.therapist

            active_rel = client.relationships.filter(status="active").first()
            if active_rel and active_rel.therapist_id != therapist.id:
                return Response(
                    {"detail": "You must terminate your existing therapeutic relationship before booking with a new therapist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if is_first_session_free and not client.is_first_session_eligible:
                return Response(
                    {"detail": "You are not eligible for a free first session."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if slot.status != AvailabilitySlot.Status.OPEN or not slot.visible_to_clients:
                return Response(
                    {"detail": "This slot is not available for booking."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if slot.start_time <= timezone.now():
                return Response(
                    {"detail": "This slot is no longer available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            therapist = serializer.validated_data.get("therapist") or slot.therapist
            if slot.therapist_id != therapist.id:
                return Response(
                    {"detail": "Therapist must match the slot therapist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            hold_minutes = int(getattr(settings, "BOOKING_REQUEST_HOLD_MINUTES", 15))
            held_until = timezone.now() + timedelta(minutes=hold_minutes) if hold_minutes > 0 else None

            try:
                booking_request = BookingRequest.objects.create(
                    client=client,
                    therapist=therapist,
                    availability_slot=slot,
                    status=BookingRequest.Status.PENDING,
                    message_from_client=serializer.validated_data.get("message_from_client", ""),
                    expires_at=held_until,
                    is_first_session_free=is_first_session_free,
                )
            except IntegrityError:
                return Response(
                    {"detail": "This slot already has an active request."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            slot.status = AvailabilitySlot.Status.HELD
            slot.held_until = held_until
            slot.save(update_fields=["status", "held_until", "updated_at"])

        if getattr(therapist, "user", None):
            booking_request._create_notification(
                recipient=therapist.user,
                notification_type=Notification.Type.BOOKING_REQUEST_CREATED,
                title="New booking request",
                body="A client requested a session slot.",
                action_url=get_scheduling_action_url(
                    Notification.Type.BOOKING_REQUEST_CREATED,
                    recipient=therapist.user,
                ),
            )

        output = BookingRequestSerializer(booking_request)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsClientOwnerOfBookingRequest])
    def cancel(self, request, pk=None):
        booking_request = self.get_object()
        reason = request.data.get("message_from_client", "")
        try:
            booking_request = cancel_pending_by_client(booking_request, reason=reason)
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(BookingRequestSerializer(booking_request).data)


class TherapistBookingRequestViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingRequestSerializer
    permission_classes = [IsAuthenticated, IsTherapistOwnerOfBookingRequest]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            return BookingRequest.objects.none()
        return BookingRequest.objects.filter(therapist=therapist).select_related(
            "client", "availability_slot"
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsTherapistOwnerOfBookingRequestAction])
    def confirm(self, request, pk=None):
        booking_request = self.get_object()
        try:
            booking_request = confirm_booking_request(booking_request, acting_user=request.user)
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(BookingRequestSerializer(booking_request).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsTherapistOwnerOfBookingRequestAction])
    def decline(self, request, pk=None):
        booking_request = self.get_object()
        therapist_note = request.data.get("therapist_response_note", "")
        try:
            booking_request = decline_booking_request(booking_request, therapist_note=therapist_note)
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(BookingRequestSerializer(booking_request).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsTherapistOwnerOfBookingRequestAction])
    def cancel(self, request, pk=None):
        booking_request = self.get_object()
        reason = request.data.get("therapist_response_note", "")
        try:
            booking_request = cancel_pending_by_therapist(booking_request, reason=reason)
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(BookingRequestSerializer(booking_request).data)


class SessionRecordViewSet(viewsets.ModelViewSet):
    queryset = SessionRecord.objects.all()
    serializer_class = SessionRecordSerializer
    permission_classes = [IsAuthenticated]


class ClientAppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOfAppointment]

    def get_queryset(self):
        client = _resolve_client_from_request(self.request)
        if not client:
            return Appointment.objects.none()
        return Appointment.objects.filter(client=client).order_by("start_time")

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsClientOwnerOfAppointment])
    def cancel(self, request, pk=None):
        allow_client_cancel = getattr(settings, "ALLOW_CLIENT_APPOINTMENT_CANCEL", False)
        if not allow_client_cancel:
            raise exceptions.PermissionDenied("Client appointment cancellation is not enabled.")
        appointment = self.get_object()
        reason = request.data.get("cancellation_reason", "")
        reopen_slot = request.data.get("reopen_slot", True)
        try:
            appointment = cancel_appointment(
                appointment,
                cancelled_by=request.user,
                reason=reason,
                reopen_slot=bool(reopen_slot),
            )
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(AppointmentSerializer(appointment).data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsNotificationRecipient]

    scheduling_types = {
        Notification.Type.BOOKING_REQUEST_CREATED,
        Notification.Type.BOOKING_REQUEST_CONFIRMED,
        Notification.Type.BOOKING_REQUEST_DECLINED,
        Notification.Type.BOOKING_REQUEST_CANCELLED,
        Notification.Type.BOOKING_REQUEST_EXPIRED,
        Notification.Type.APPOINTMENT_SCHEDULED,
        Notification.Type.APPOINTMENT_CANCELLED,
        Notification.Type.APPOINTMENT_COMPLETED,
        Notification.Type.APPOINTMENT_RESCHEDULED,
        Notification.Type.RESOURCE_ASSIGNED,
    }

    def get_queryset(self):
        queryset = Notification.objects.filter(
            recipient_user_profile=self.request.user,
            type__in=self.scheduling_types,
        ).order_by("-created_at")

        is_read = self.request.query_params.get("is_read")
        if is_read is not None:
            normalized = str(is_read).lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_read=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_read=False)

        return queryset

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_as_read()
        return Response(self.get_serializer(notification).data)


# ----------------------------
# Note Templates (with options for choice/checkboxes/select/likert)
# ----------------------------
class NoteTemplateViewSet(viewsets.ModelViewSet):
    """
    Example payload:
    {
      "name": "Progress Note",
      "description": "SOAP format",
      "new_fields": [
         {
           "label": "Mood",
           "field_type": "checkboxes",
           "options": {"choices": ["Good", "Neutral", "Low"], "allow_other": true},
           "is_required": true,
           "order": 0
         }
      ]
    }
    """
    queryset = NoteTemplate.objects.all().order_by("name")
    serializer_class = NoteTemplateSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        name = request.data.get("name", "").strip()
        description = request.data.get("description", "")
        new_fields = request.data.get("new_fields", [])

        if not name:
            return Response({"detail": "Template name is required."}, status=400)

        template = NoteTemplate.objects.create(name=name, description=description)

        for idx, f in enumerate(new_fields):
            NoteField.objects.create(
                template=template,
                label=(f.get("label") or "").strip(),
                field_type=f.get("field_type", "text"),
                is_required=bool(f.get("is_required", False)),
                order=f.get("order", idx),
                options=f.get("options", {}) or {},
            )

        return Response(self.get_serializer(template).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance: NoteTemplate = self.get_object()
        name = request.data.get("name", instance.name).strip()
        description = request.data.get("description", instance.description or "")
        new_fields = request.data.get("new_fields", None)

        instance.name = name
        instance.description = description
        instance.save()

        if new_fields is not None:
            # replace all fields cleanly
            instance.fields.all().delete()
            for idx, f in enumerate(new_fields):
                NoteField.objects.create(
                    template=instance,
                    label=(f.get("label") or "").strip(),
                    field_type=f.get("field_type", "text"),
                    is_required=bool(f.get("is_required", False)),
                    order=f.get("order", idx),
                    options=f.get("options", {}) or {},
                )

        return Response(self.get_serializer(instance).data, status=status.HTTP_200_OK)


# ----------------------------
# Notes (uses TherapistProfile, supports draft/final/co-sign)
# ----------------------------
class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        qs = Note.objects.filter(
            therapist=therapist,
            archived=False
        ).select_related("template", "client").prefetch_related("cosigners", "cosigned_by")

        client_id = self.request.query_params.get("client")
        status_param = self.request.query_params.get("status")

        if client_id:
            qs = qs.filter(client_id=client_id)
        if status_param in {"draft", "final"}:
            qs = qs.filter(status=status_param)

        return qs.order_by("-created_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        from .utils import _resolve_therapist_from_request  # adjust import if needed
        therapist = _resolve_therapist_from_request(self.request)
        serializer.save(therapist=therapist)

    def perform_update(self, serializer):
        note = serializer.save()
        if note.status == "final" and not note.finalized_at:
            note.finalized_at = timezone.now()
            note.save()

    # ✅ co-sign endpoint
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def cosign(self, request, pk=None):
        therapist = _resolve_therapist_from_request(request)
        note = self.get_object()

        if not note.requires_cosign:
            return Response({"detail": "This note does not require co-signing."}, status=400)

        if therapist not in note.cosigners.all():
            return Response({"detail": "You are not assigned to co-sign this note."}, status=403)

        # mark as signed
        note.cosigned_by.add(therapist)
        note.save()

        # auto-finalize if all co-signers done
        total = note.cosigners.count()
        signed = note.cosigned_by.count()
        if total > 0 and signed >= total:
            note.status = "final"
            note.finalized_at = timezone.now()
            note.cosigned_at = timezone.now()
            note.save()

        return Response(NoteSerializer(note).data, status=200)


# ----------------------------
# Client File Uploads
# ----------------------------
class ClientFileViewSet(viewsets.ModelViewSet):
    serializer_class = ClientFileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client_ids = _active_client_ids_for_therapist(therapist)
        qs = ClientFile.objects.filter(client_id__in=client_ids).order_by("-uploaded_at")
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


# ----------------------------
# Event Types / Schedule
# ----------------------------
class EventTypeViewSet(viewsets.ModelViewSet):
    queryset = EventType.objects.all().order_by("name")
    serializer_class = EventTypeSerializer
    permission_classes = [IsAuthenticated]


class ScheduleEventViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist_id = self.request.query_params.get("therapist")
        if therapist_id:
            return ScheduleEvent.objects.filter(therapist_id=therapist_id).order_by("-start_time")
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        if therapist:
            return ScheduleEvent.objects.filter(therapist=therapist).order_by("-start_time")
        return ScheduleEvent.objects.none()


class WaitlistEntryViewSet(viewsets.ModelViewSet):
    serializer_class = WaitlistEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client_ids = _active_client_ids_for_therapist(therapist)
        return WaitlistEntry.objects.filter(
            client_id__in=client_ids
        ).order_by("-created_at")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        serializer.save(therapist=serializer.validated_data.get("therapist") or therapist)


# ----------------------------
# Client Experience / Premium
# ----------------------------
class ClientJournalViewSet(viewsets.ModelViewSet):
    serializer_class = ClientJournalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        qs = ClientJournal.objects.all()
        if therapist:
            client_ids = _active_client_ids_for_therapist(therapist)
            qs = qs.filter(client_id__in=client_ids)
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(client_id=client_id)
            return qs.order_by("-created_at")
        if client:
            if not _is_premium_request(self.request):
                raise exceptions.PermissionDenied("Premium is required to sync journals.")
            return qs.filter(client=client).order_by("-created_at")
        return ClientJournal.objects.none()

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        if therapist:
            serializer.save(therapist=therapist)
        elif client:
            if not _is_premium_request(self.request):
                raise exceptions.PermissionDenied("Premium is required to sync journals.")
            serializer.save(client=client, therapist=client.therapist)


class ClientGoalViewSet(viewsets.ModelViewSet):
    serializer_class = ClientGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        qs = ClientGoal.objects.all()
        if therapist:
            client_ids = _active_client_ids_for_therapist(therapist)
            qs = qs.filter(client_id__in=client_ids)
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(client_id=client_id)
            return qs.order_by("-created_at")
        if client:
            if not _is_premium_request(self.request):
                raise exceptions.PermissionDenied("Premium is required to sync goals.")
            return qs.filter(client=client).order_by("-created_at")
        return ClientGoal.objects.none()

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        if therapist:
            client_id = self.request.data.get("client")
            client_obj = None
            if client_id:
                client_obj = ClientProfile.objects.filter(
                    id=client_id, therapist=therapist
                ).first()
            if not client_obj:
                raise exceptions.ValidationError({"client": "Valid client is required."})
            serializer.save(therapist=therapist, client=client_obj)
        elif client:
            if not _is_premium_request(self.request):
                raise exceptions.PermissionDenied("Premium is required to sync goals.")
            serializer.save(client=client, therapist=client.therapist)


class ClientCheckinViewSet(viewsets.ModelViewSet):
    serializer_class = ClientCheckinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        qs = ClientCheckin.objects.all()
        if therapist:
            client_ids = _active_client_ids_for_therapist(therapist)
            qs = qs.filter(client_id__in=client_ids)
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(client_id=client_id)
            return qs.order_by("-created_at")
        if client:
            if not _is_premium_request(self.request):
                raise exceptions.PermissionDenied("Premium is required to sync check-ins.")
            return qs.filter(client=client).order_by("-created_at")
        return ClientCheckin.objects.none()

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        if therapist:
            serializer.save(therapist=therapist)
        elif client:
            if not _is_premium_request(self.request):
                raise exceptions.PermissionDenied("Premium is required to sync check-ins.")
            serializer.save(client=client, therapist=client.therapist)


class TherapistMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = TherapistMaterialSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        if not therapist:
            return TherapistMaterial.objects.none()
        roles = _extract_roles_from_auth(self.request)
        if "admin" in roles:
            return TherapistMaterial.objects.all().order_by("-created_at")
        if _is_premium_request(self.request):
            return TherapistMaterial.objects.filter(
                models.Q(therapist=therapist) | models.Q(is_library=True)
            ).order_by("-created_at")
        return TherapistMaterial.objects.filter(therapist=therapist).order_by("-created_at")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        serializer.save(therapist=therapist, is_library=False, is_premium_only=False)


class MaterialShareViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialShareSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        if therapist:
            client_ids = _active_client_ids_for_therapist(therapist)
            qs = MaterialShare.objects.filter(client_id__in=client_ids)
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(client_id=client_id)
            return qs.order_by("-created_at")
        if client:
            return MaterialShare.objects.filter(client=client).order_by("-created_at")
        return MaterialShare.objects.none()

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        if therapist:
            serializer.save(shared_by=therapist)


class ResourceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTherapistOwnerOfResource]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            return Resource.objects.none()
        return Resource.objects.filter(therapist=therapist).order_by("-created_at")

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ResourceCreateUpdateSerializer
        return ResourceSerializer

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            raise exceptions.PermissionDenied("Therapist profile required.")
        resource = serializer.save(therapist=therapist)
        try:
            resource.full_clean()
        except ValidationError as exc:
            raise exceptions.ValidationError(exc.message_dict or {"detail": exc.message})
        resource.save()

    def perform_update(self, serializer):
        resource = serializer.save()
        try:
            resource.full_clean()
        except ValidationError as exc:
            raise exceptions.ValidationError(exc.message_dict or {"detail": exc.message})
        resource.save()

    def destroy(self, request, *args, **kwargs):
        resource = self.get_object()
        if resource.assignments.exists():
            raise exceptions.ValidationError(
                {"detail": "Resources with assignments cannot be deleted."}
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        resource = self.get_object()
        resource.is_active = False
        resource.save(update_fields=["is_active", "updated_at"])
        return Response(ResourceSerializer(resource).data)


class SharedResourceAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = SharedResourceAssignmentSerializer
    permission_classes = [IsAuthenticated, IsTherapistOwnerOfResourceAssignment]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            return SharedResourceAssignment.objects.none()
        qs = SharedResourceAssignment.objects.filter(assigned_by=therapist).select_related(
            "resource", "assigned_to", "therapeutic_relationship"
        )
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(assigned_to_id=client_id)
        return qs.order_by("-assigned_at")

    def get_serializer_class(self):
        if self.action == "create":
            return SharedResourceAssignmentCreateSerializer
        return SharedResourceAssignmentSerializer

    def create(self, request, *args, **kwargs):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            raise exceptions.PermissionDenied("Therapist profile required.")
        serializer = SharedResourceAssignmentCreateSerializer(
            data=request.data,
            context={"therapist": therapist},
        )
        serializer.is_valid(raise_exception=True)
        assignment = assign_resource_to_client(
            therapist=therapist,
            client=serializer.validated_data["assigned_to"],
            resource=serializer.validated_data["resource"],
            therapist_note=serializer.validated_data.get("therapist_note", ""),
        )
        output = SharedResourceAssignmentSerializer(assignment)
        return Response(output.data, status=status.HTTP_201_CREATED)


class ClientResourceAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SharedResourceAssignmentSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOfResourceAssignment]

    def get_queryset(self):
        client = _resolve_client_from_request(self.request)
        if not client:
            return SharedResourceAssignment.objects.none()
        return SharedResourceAssignment.objects.filter(assigned_to=client).select_related(
            "resource", "assigned_by"
        ).order_by("-assigned_at")

    @action(detail=True, methods=["post"])
    def mark_viewed(self, request, pk=None):
        assignment = self.get_object()
        assignment.mark_viewed()
        return Response(self.get_serializer(assignment).data)

    @action(detail=True, methods=["post"])
    def mark_completed(self, request, pk=None):
        assignment = self.get_object()
        assignment.mark_completed()
        return Response(self.get_serializer(assignment).data)


class TeamMemberViewSet(viewsets.ModelViewSet):
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TeamMember.objects.filter(is_active=True).order_by("sort_order", "name")

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Service.objects.filter(is_active=True).order_by("sort_order", "title")

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class HomeContentViewSet(viewsets.ModelViewSet):
    serializer_class = HomeContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return HomeContent.objects.all()

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class AboutContentViewSet(viewsets.ModelViewSet):
    serializer_class = AboutContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return AboutContent.objects.all()

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class TherapistsContentViewSet(viewsets.ModelViewSet):
    serializer_class = TherapistsContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TherapistsContent.objects.all()

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class ServicesContentViewSet(viewsets.ModelViewSet):
    serializer_class = ServicesContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ServicesContent.objects.all()

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class ContactContentViewSet(viewsets.ModelViewSet):
    serializer_class = ContactContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ContactContent.objects.all()

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class TrainingProgramsContentViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingProgramsContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TrainingProgramsContent.objects.all()

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class CareersContentViewSet(viewsets.ModelViewSet):
    serializer_class = CareersContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return CareersContent.objects.all()

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)


class TherapistApplyContentViewSet(viewsets.ModelViewSet):
    serializer_class = TherapistApplyContentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TherapistApplyContent.objects.all()

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        _require_admin(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)

# ----------------------------
# Therapist Applications (Public)
# ----------------------------
class TherapistApplicationCreateView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = TherapistApplicationSerializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save()
            return Response(
                {"id": application.id, "status": application.status},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------
# Authenticated User Info
# ----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user_data = {
        "username": getattr(request.user, "username", "Unknown"),
        "email": getattr(request.user, "email", "No email found"),
    }
    return Response(user_data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def terminate_relationship(request):
    client = _resolve_client_from_request(request)
    if not client:
        return Response({"detail": "Client profile required."}, status=status.HTTP_403_FORBIDDEN)
    
    active_rels = client.relationships.filter(status="active")
    if not active_rels.exists():
        return Response({"detail": "No active therapeutic relationship found."}, status=status.HTTP_400_BAD_REQUEST)
        
    for rel in active_rels:
        rel.status = "ended" # TherapeuticRelationship.Status.ENDED
        rel.ended_at = timezone.now()
        rel.save(update_fields=["status", "ended_at", "updated_at"])
        
    return Response({"detail": "Therapeutic relationship terminated successfully."})


class FrontendAppView(TemplateView):
    template_name = "index.html"
