from rest_framework import viewsets, status, exceptions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from therapy.services import generate_jitsi_token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.views.generic import TemplateView
from django.db import transaction, models, IntegrityError
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from datetime import datetime, date, time, timedelta
import os
import base64
import hashlib
import hmac
import json
import urllib.request
import urllib.error
from decimal import Decimal

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
    QuickBooking,
    SafetyPlan,
    SupervisoryRelationship,
    SupervisionNote,
    SupervisionReport,
    SupervisionActionItem,
    SupervisionReflection,
    ClientFormAssignment,
    SupportTicket,
    AdminReportSnapshot,
    AdminReportEmailSchedule,
    CommunityCategory,
    CommunityThread,
    CommunityComment,
    RazorpayPayment,
    TherapistSubscriptionCharge,
    ContactMessage,
    TherapistScreening,
    Referral,
)
from therapy.utils import (
    calculate_dass_scores,
    get_dass_severity,
    generate_dass_summary,
)
from therapy.services.appointments import cancel_appointment
from therapy.services.admin_reports import (
    REPORT_CATALOG,
    build_full_overview_payload,
    build_report,
    get_period_bounds,
)
from therapy.services.rocket_chat import (
    RocketChatError,
    ensure_dm_room,
    get_config as get_rocket_chat_config,
    get_or_create_user as rocket_chat_get_or_create_user,
    login_managed_user as rocket_chat_login_managed_user,
)
from therapy.serializers import (
    TherapistProfileSerializer,
    TherapistApplicationSerializer,
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
    ContactMessageSerializer,
    QuickBookingSerializer,
    SafetyPlanSerializer,
    TherapeuticRelationshipSerializer,
    SupervisoryRelationshipSerializer,
    SupervisionNoteSerializer,
    SupervisionReportSerializer,
    SupervisionActionItemSerializer,
    SupervisionReflectionSerializer,
    ClientFormAssignmentSerializer,
    SupportTicketSerializer,
    AdminReportSnapshotSerializer,
    AdminReportEmailScheduleSerializer,
    CommunityCategorySerializer,
    CommunityThreadSerializer,
    CommunityCommentSerializer,
    ReferralSerializer,
)

# ... existing code ...

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        roles = _extract_roles_from_auth(self.request)
        if "admin" in roles:
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        user_role = "client"
        user_name = "Unknown"
        user_email = user.email

        # Try to resolve profile for extra info
        therapist = _resolve_therapist_from_request(self.request)
        if therapist:
            user_role = "therapist"
            user_name = therapist.name
        else:
            client = _resolve_client_from_request(self.request)
            if client:
                user_role = "client"
                user_name = client.name
        
        serializer.save(
            user=user,
            user_role=user_role,
            user_name=user_name,
            user_email=user_email
        )

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        _require_admin(request)
        ticket = self.get_object()
        ticket.status = SupportTicket.Status.RESOLVED
        ticket.resolved_at = timezone.now()
        ticket.admin_notes = request.data.get("admin_notes", ticket.admin_notes)
        ticket.save()
        return Response(SupportTicketSerializer(ticket).data)
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
from urllib import request as urllib_request
from urllib.error import URLError, HTTPError


def _profile_required_response(profile_type: str):
    return Response(
        {
            "detail": f"{profile_type.title()} profile required to use scheduling.",
            "code": "profile_missing",
            "profile_type": profile_type,
        },
        status=status.HTTP_403_FORBIDDEN,
    )


# ----------------------------
# Helper
# ----------------------------
def _resolve_therapist_from_request(request, allow_create=False):
    """
    Return the TherapistProfile linked to the authenticated user.
    Optionally creates one for therapists/admins when missing.
    """
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated or user.id is None:
        return None

    payload = getattr(request, "auth", {})
    payload_email = (payload.get("email") or payload.get("email_address") if isinstance(payload, dict) else None)
    auth_email = (getattr(user, "email", None) or payload_email or "").strip().lower() or None

    # Prefer explicit linkage (single canonical profile for this auth user)
    try:
        therapist_profile = getattr(user, "therapist_profile", None)
        if therapist_profile:
            # If the linked row is unverified, prefer a verified row for the same identity.
            if not therapist_profile.is_verified:
                verified_candidate = TherapistProfile.objects.filter(
                    Q(user=user) | (Q(email__iexact=auth_email) if auth_email else Q(pk__in=[])),
                    is_verified=True,
                ).exclude(pk=therapist_profile.pk).first()
                if verified_candidate:
                    with transaction.atomic():
                        if verified_candidate.user_id != user.id:
                            verified_candidate.user = user
                            verified_candidate.save(update_fields=["user"])
                        if therapist_profile.user_id == user.id:
                            therapist_profile.user = None
                            therapist_profile.save(update_fields=["user"])
                    therapist_profile = verified_candidate

            # If this account email points to a different therapist profile, reconcile to one canonical row.
            if auth_email:
                profile_by_email = TherapistProfile.objects.filter(email__iexact=auth_email).first()
                if profile_by_email and profile_by_email.id != therapist_profile.id:
                    # Only re-link when safe (target is unowned or already owned by this user).
                    if profile_by_email.user_id in (None, user.id):
                        # Prefer the email-matching profile when it's verified or current row is placeholder-ish.
                        current_is_placeholder = str(therapist_profile.email or "").endswith("@local")
                        if profile_by_email.is_verified or current_is_placeholder:
                            with transaction.atomic():
                                old_profile = therapist_profile
                                profile_by_email.user = user
                                profile_by_email.save(update_fields=["user"])
                                if old_profile.user_id == user.id:
                                    old_profile.user = None
                                    old_profile.save(update_fields=["user"])
                            therapist_profile = profile_by_email

            # Keep canonical profile email synced with auth identity when safe.
            current_email = str(therapist_profile.email or "").lower()
            if auth_email and current_email != auth_email:
                existing = TherapistProfile.objects.filter(email__iexact=auth_email).exclude(pk=therapist_profile.pk).exists()
                if not existing:
                    therapist_profile.email = auth_email
                    therapist_profile.save(update_fields=["email"])
            return therapist_profile
    except Exception:
        pass

    # Step 1: Try to find by email from user or token (Ruthless Match)
    email = auth_email
    
    therapist = None
    if email:
        therapist = TherapistProfile.objects.filter(email__iexact=email).first()
        if therapist:
            # If we found it by email, FORCE the link to the current user
            if therapist.user_id != user.id:
                therapist.user = user
                therapist.save(update_fields=["user"])
            return therapist

    # Step 2: If fail by email, check roles for NEW profile creation
    roles = _extract_roles_from_auth(request)
    is_admin = "admin" in roles
    is_therapist = any(role in roles for role in ["therapist", "premium_therapist", "admin"])

    if not allow_create and not is_admin:
        return None

    # Root-cause guard:
    # For allow_create flows (e.g. /therapists/me during first-login onboarding),
    # do NOT require role metadata to already contain "therapist".
    # This prevents a bootstrap deadlock where role-sync lags and no profile is created.
    if not allow_create and not is_therapist:
        return None

    # Step 3: Create NEW profile if needed
    name = (
        getattr(user, "get_full_name", lambda: "")().strip()
        or getattr(user, "username", None)
        or "Unnamed Therapist"
    )
    final_email = email or f"therapist_{user.pk or 'nouser'}@local"
    
    therapist = TherapistProfile.objects.filter(email__iexact=final_email).first()
    if not therapist:
        therapist = TherapistProfile.objects.create(
            user=user,
            email=final_email,
            name=name
        )
    elif therapist.user_id != user.id:
        therapist.user = user
        therapist.save(update_fields=["user"])

    return therapist


def _resolve_client_from_request(request):
    """
    Return the ClientProfile linked to the authenticated user.
    """
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return None

    # 1. Check direct relationship
    client_profile = getattr(user, "client_profile", None)
    if client_profile:
        # 🔄 Sync Check: Update name from User object ONLY if it's a real name
        save_needed = False
        first = user.first_name.strip()
        last = user.last_name.strip()
        full_name = f"{first} {last}".strip()
        
        # NEVER use "user_..." as a name
        if full_name and not full_name.startswith("user_"):
            if not client_profile.name or client_profile.name.startswith("user_") or client_profile.name == "Unknown":
                client_profile.name = full_name
                save_needed = True
        
        email = getattr(user, "email", None)
        if email and not email.endswith("@example.invalid"):
            if not client_profile.email or "@example.invalid" in client_profile.email:
                client_profile.email = email
                save_needed = True
            
        if save_needed:
            client_profile.save(update_fields=["name", "email"])
        return client_profile

    # 2. Aggressive Email Search (Before creating anything new)
    email = getattr(user, "email", None)
    if not client_profile and email and not email.endswith("@example.invalid"):
        client_profile = ClientProfile.objects.filter(email__iexact=email).first()
        if client_profile:
            print(f"DEBUG: Claiming profile {client_profile.id} for user {user.id} via email {email}")
            client_profile.user = user
            client_profile.save(update_fields=["user"])
            return client_profile

    # 3. Guard: Strictly separate roles
    roles = _extract_roles_from_auth(request)
    if "therapist" in roles and "admin" not in roles:
        return None
        
    # 4. Create new profile as a LAST resort
    first = user.first_name.strip()
    last = user.last_name.strip()
    display_name = f"{first} {last}".strip()
    
    if not display_name or display_name.startswith("user_"):
        display_name = "New Client"
        
    safe_email = email if (email and not email.endswith("@example.invalid")) else f"client_{user.pk or 'nouser'}@local"
    
    from django.db import IntegrityError
    try:
        client = ClientProfile.objects.create(
            user=user,
            name=display_name,
            email=safe_email
        )
        return client
    except IntegrityError:
        # Email uniqueness constraint - try to find by email one more time
        client = ClientProfile.objects.filter(email__iexact=safe_email).first()
        if client:
            if client.user_id != user.id:
                client.user = user
                client.save(update_fields=["user"])
            return client
        return None


def _active_client_ids_for_therapist(therapist):
    if not therapist:
        return ClientProfile.objects.none().values_list("id", flat=True)
    
    # Get all clients where therapist has ANY relationship
    rels = TherapeuticRelationship.objects.filter(
        therapist=therapist
    ).values_list("client_id", flat=True)
    
    # Also include clients where therapist is the primary therapist
    primaries = ClientProfile.objects.filter(therapist=therapist).values_list("id", flat=True)
    
    # Combine (union)
    return list(set(list(rels) + list(primaries)))


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


def _client_has_active_booking_with_other_therapist(client, therapist):
    """Block parallel open booking requests with a different therapist (relationship is created on confirm)."""
    if not client or not therapist:
        return False
    return BookingRequest.objects.filter(
        client=client,
        status__in=[BookingRequest.Status.PENDING, BookingRequest.Status.CONFIRMED],
    ).exclude(therapist_id=therapist.id).exists()


def _sync_appointment_from_schedule_event(event, *, notify_new: bool = False):
    """
    When a therapist creates/edits a schedule event with a client, mirror a client-facing
    Appointment and ensure an active relationship. If the client is removed from the event,
    remove or cancel the linked appointment.
    """
    if not event.client_id:
        linked = getattr(event, "linked_appointment", None)
        if linked:
            if linked.is_cancellable:
                try:
                    cancel_appointment(
                        linked,
                        cancelled_by=None,
                        reason="Session removed or updated on the calendar.",
                        reopen_slot=False,
                    )
                except ValidationError:
                    linked.delete()
            else:
                linked.schedule_event = None
                linked.save(update_fields=["schedule_event", "updated_at"])
        return None

    appt, ap_created = Appointment.objects.get_or_create(
        schedule_event=event,
        defaults={
            "client_id": event.client_id,
            "therapist_id": event.therapist_id,
            "date": event.start_time,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "notes": event.notes or "",
            "status": Appointment.Status.SCHEDULED,
        },
    )
    if not ap_created:
        appt.client_id = event.client_id
        appt.therapist_id = event.therapist_id
        appt.date = event.start_time
        appt.start_time = event.start_time
        appt.end_time = event.end_time
        appt.notes = event.notes or ""
        if appt.status in {Appointment.Status.SCHEDULED, Appointment.Status.RESCHEDULED}:
            appt.save(
                update_fields=[
                    "client",
                    "therapist",
                    "date",
                    "start_time",
                    "end_time",
                    "notes",
                    "updated_at",
                ]
            )
    _ensure_relationship(event.therapist, event.client, make_primary=False)
    u = getattr(event.client, "user", None)
    if notify_new and ap_created and u:
        Notification.objects.create(
            recipient_user_profile=u,
            type=Notification.Type.APPOINTMENT_SCHEDULED,
            title="New session scheduled",
            body="Your therapist scheduled a session for you.",
            related_model=Appointment.__name__,
            related_id=str(appt.pk),
            action_url=get_scheduling_action_url(
                Notification.Type.APPOINTMENT_SCHEDULED,
                recipient=u,
            ),
        )
    return appt


def _extract_roles_from_auth(request):
    payload = request.auth or {}
    meta = payload.get("public_metadata") or payload.get("publicMetadata") or {}
    roles = meta.get("roles") or payload.get("roles") or []
    if isinstance(roles, str):
        roles = [roles]
    if not roles and meta.get("role"):
        roles = [meta.get("role")]
        
    unsafe_meta = payload.get("unsafe_metadata") or payload.get("unsafeMetadata") or {}
    if not roles:
        unsafe_roles = unsafe_meta.get("roles")
        if isinstance(unsafe_roles, str):
            unsafe_roles = [unsafe_roles]
        roles = unsafe_roles or []
        if not roles and unsafe_meta.get("role"):
            roles = [unsafe_meta.get("role")]
    # Fallback: allow explicit admin emails via env
    # Hard-coded Master Unlocks (Absolute Bypass)
    MASTER_ADMIN_IDS = ["user_3CalFf5iOUKgTEq1efJUXni3y98"]
    MASTER_ADMIN_EMAILS = ["therapybymlc@gmail.com", "therapy@mlchealth.in"]

    admin_emails = [
        e.strip().lower()
        for e in getattr(settings, "ADMIN_EMAILS", "").split(",")
        if e.strip()
    ] + MASTER_ADMIN_EMAILS
    
    admin_user_ids = [
        uid.strip()
        for uid in getattr(settings, "ADMIN_USER_IDS", "").split(",")
        if uid.strip()
    ] + MASTER_ADMIN_IDS
    payload_email = None
    payload_sub = None
    if isinstance(payload, dict):
        payload_email = payload.get("email") or payload.get("email_address")
        payload_sub = payload.get("sub")
        
        # 1. Match by Clerk ID (Fix A)
        if payload_sub and payload_sub in admin_user_ids:
            if "admin" not in roles:
                roles = list(roles) + ["admin"]
                
    # 2. Match by Email (Fix C)
    user_obj = getattr(request, "user", None)
    email = getattr(user_obj, "email", None) or payload_email
    
    # If the user's username IS the Clerk ID, check it against admin_user_ids too
    username = getattr(user_obj, "username", None)
    if username and username in admin_user_ids and "admin" not in roles:
        roles = list(roles) + ["admin"]

    if email and email.lower() in admin_emails:
        if "admin" not in roles:
            roles = list(roles) + ["admin"]
        # Force staff status on user object for this request's lifespan
        if getattr(request, "user", None):
            request.user.is_staff = True
            
    derived_roles = [str(r).lower() for r in roles if r]
    # Debug: see what's happening in logs
    if "admin" in derived_roles or "therapist" in derived_roles:
        print(f"[AUTH] User: {email} | Roles: {derived_roles}")
    
    return derived_roles


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
    
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        roles = _extract_roles_from_auth(self.request)
        
        # 1. Admins see everything (with filtering support)
        # 1. Admins see everything by default, but respect filtering if provided
        if "admin" in roles or self.request.user.is_staff:
            queryset = TherapistProfile.objects.all()
            
            is_supervisor = self.request.query_params.get("is_supervisor")
            if is_supervisor is not None:
                is_supervisor_bool = is_supervisor.lower() == "true"
                queryset = queryset.filter(is_supervisor=is_supervisor_bool)
                if is_supervisor_bool:
                    queryset = queryset.filter(years_experience__gte=5)

            is_verified = self.request.query_params.get("is_verified")
            if is_verified is not None:
                is_verified_bool = is_verified.lower() == "true"
                queryset = queryset.filter(is_verified=is_verified_bool)
            return queryset

        # 2. Public/Discovery Discovery View
        if self.action in ["list", "retrieve"]:
            queryset = TherapistProfile.objects.filter(is_verified=True)
            
            is_supervisor = self.request.query_params.get("is_supervisor")
            if is_supervisor is not None:
                is_supervisor_bool = is_supervisor.lower() == "true"
                queryset = queryset.filter(is_supervisor=is_supervisor_bool)
                
                # Enforce MLC Collective standard: 5+ years for public discovery
                if is_supervisor_bool:
                    queryset = queryset.filter(years_experience__gte=5)
                
            supervision_status = self.request.query_params.get("supervision_status")
            if supervision_status:
                queryset = queryset.filter(supervision_status=supervision_status)
                
            return queryset

        # 3. For edits/dashboard actions, restrict to owner
        payload = getattr(self.request, "auth", {})
        payload_email = (payload.get("email") or payload.get("email_address") if isinstance(payload, dict) else None)
        email = getattr(self.request.user, "email", None) or payload_email
        
        from django.db.models import Q
        filters = Q(user=self.request.user)
        if email:
            filters |= Q(email__iexact=email)
        return TherapistProfile.objects.filter(filters)

    def create(self, request, *args, **kwargs):
        # Resilience: if trying to create but it exists by session, resolve and return me
        therapist = _resolve_therapist_from_request(request, allow_create=True)
        if therapist:
            # Ensure user linkage is up to date
            if therapist.user_id != request.user.id:
                therapist.user = request.user
                therapist.save(update_fields=["user"])
            serializer = self.get_serializer(therapist)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        # If not found by session, check the actual email in the POST body
        body_email = request.data.get("email")
        if body_email:
            existing = TherapistProfile.objects.filter(email__iexact=body_email).first()
            if existing:
                if existing.user_id != request.user.id:
                    existing.user = request.user
                    existing.save(update_fields=["user"])
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        return super().create(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """Force-allow retrieval by ID for authenticated users to fix 404 sync issues."""
        pk = kwargs.get("pk")
        try:
            instance = TherapistProfile.objects.get(pk=pk)
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except TherapistProfile.DoesNotExist:
            return Response({"detail": "Therapist not found."}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, *args, **kwargs):
        """Override to resolve by email instead of queryset to prevent 404 on role-delay."""
        kwargs["partial"] = True
        pk = kwargs.get("pk") or self.kwargs.get("pk")
        
        # Try to get via normal queryset first
        instance = self.get_queryset().filter(pk=pk).first()
        
        # Fallback: resolve via email linkage
        if not instance:
            instance = _resolve_therapist_from_request(request, allow_create=False)
        
        if not instance:
            return Response({"detail": "Profile not found or access denied."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        """Resiliently resolve and optionally update the current user's profile."""
        therapist = _resolve_therapist_from_request(request, allow_create=True)
        if not therapist:
            return Response({"detail": "Therapist profile not found and could not be initialized."}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == "PATCH":
            serializer = self.get_serializer(therapist, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
        serializer = self.get_serializer(therapist)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="jitsi-token")
    def jitsi_token(self, request):
        room_name = request.query_params.get("room", "MLC-Secure-Lounge")
        token = generate_jitsi_token(request.user, room_name)
        if not token:
            return Response({"detail": "Token generation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"token": token})


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
        user = self.request.user
        
        # 1. Start with profiles where the user is the owner
        queryset = ClientProfile.objects.filter(user=user)
        
        # 2. Add profiles managed by this user if they are a therapist
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if therapist:
            client_ids = _active_client_ids_for_therapist(therapist)
            queryset = queryset | ClientProfile.objects.filter(id__in=client_ids)
            
        return queryset.distinct().order_by("name")

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        client = _resolve_client_from_request(request)
        if not client:
            return Response({"detail": "Client profile not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(client)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="jitsi-token")
    def jitsi_token(self, request):
        room_name = request.query_params.get("room", "MLC-Secure-Lounge")
        token = generate_jitsi_token(request.user, room_name)
        if not token:
            return Response({"detail": "Token generation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"token": token})

    def update(self, request, *args, **kwargs):
        from django.db import transaction
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        email = request.data.get("email")
        
        # 🔗 Merging Logic: Consolidate ALL profiles with this email
        if email and email.lower() != (instance.email or "").lower():
            other_profiles = ClientProfile.objects.filter(email__iexact=email).exclude(id=instance.id)
            if other_profiles.exists():
                print(f"DEBUG: Consolidating {other_profiles.count()} other profiles into {instance.id} or vice versa")
                try:
                    with transaction.atomic():
                        # We'll pick the most 'established' profile as the survivor (the one with the most appts/rels)
                        all_candidates = list(other_profiles) + [instance]
                        
                        def get_score(p):
                            from .models import Appointment, TherapeuticRelationship
                            return Appointment.objects.filter(client=p).count() + TherapeuticRelationship.objects.filter(client=p).count() * 5
                        
                        survivor = max(all_candidates, key=get_score)
                        print(f"DEBUG: SURVIVOR identified as Profile {survivor.id}")
                        
                        # Move user link to survivor
                        for p in all_candidates:
                            if p.id != survivor.id and p.user:
                                if p.user != request.user:
                                     # Safety check
                                     continue
                                p.user = None
                                p.save(update_fields=["user"])
                        
                        survivor.user = request.user
                        # Apply new data
                        for key, value in request.data.items():
                             if value and hasattr(survivor, key):
                                 setattr(survivor, key, value)
                        survivor.save()

                        # Migrate ALL data from all others to survivor
                        from .models import Appointment, ClientGoal, ClientJournal, ClientCheckin, SafetyPlan, TherapeuticRelationship
                        for p in all_candidates:
                            if p.id == survivor.id: continue
                            
                            Appointment.objects.filter(client=p).update(client=survivor)
                            ClientGoal.objects.filter(client=p).update(client=survivor)
                            ClientJournal.objects.filter(client=p).update(client=survivor)
                            ClientCheckin.objects.filter(client=p).update(client=survivor)
                            
                            # Relationships
                            existing_rels = TherapeuticRelationship.objects.filter(client=survivor).values_list('therapist_id', flat=True)
                            TherapeuticRelationship.objects.filter(client=p).exclude(therapist_id__in=existing_rels).update(client=survivor)
                            
                            # Safety Plan
                            if hasattr(p, 'safety_plan') and not hasattr(survivor, 'safety_plan'):
                                sp = p.safety_plan
                                sp.client = survivor
                                sp.save()
                            
                            # Delete if it's a ghost or was just emptied
                            if p.id != survivor.id:
                                if not TherapeuticRelationship.objects.filter(client=p).exists():
                                    p.delete()
                        
                        serializer = self.get_serializer(survivor)
                        return Response(serializer.data)
                except Exception as e:
                    print(f"ERROR: CONSOLIDATION FAILED - {str(e)}")
                    raise e

        return super().update(request, *args, **kwargs)

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = serializer.save(therapist=therapist)
        _ensure_relationship(therapist, client, make_primary=True)

    @action(detail=False, methods=["post"], url_path="link_by_email")
    def link_by_email(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email required."}, status=status.HTTP_400_BAD_REQUEST)
        
        therapist = _resolve_therapist_from_request(request, allow_create=True)
        client = ClientProfile.objects.filter(email__iexact=email).first()
        
        if not client:
            return Response({"detail": "No record found with this email."}, status=status.HTTP_404_NOT_FOUND)
        
        # Build the bridge
        _ensure_relationship(therapist, client, make_primary=False)
        
        return Response({"detail": "Client successfully linked to your caseload.", "client_id": client.id})


    @action(detail=False, methods=["post"], url_path="repair-account")
    def repair_account(self, request):
        from django.db import transaction
        client = _resolve_client_from_request(request)
        if not client:
            return Response({"detail": "No profile to repair."}, status=status.HTTP_404_NOT_FOUND)
        
        email = client.email
        if not email:
            return Response({"detail": "Profile has no email to search by."}, status=status.HTTP_400_BAD_REQUEST)

        other_profiles = ClientProfile.objects.filter(email__iexact=email).exclude(id=client.id)
        if not other_profiles.exists():
            return Response({"detail": "No other profiles found with this email. Your account is already unique."}, status=status.HTTP_200_OK)

        print(f"DEBUG: REPAIRING ACCOUNT - Consolidating {other_profiles.count()} profiles for {email}")
        try:
            with transaction.atomic():
                all_candidates = list(other_profiles) + [client]
                
                def get_score(p):
                    from .models import Appointment, TherapeuticRelationship
                    return Appointment.objects.filter(client=p).count() + TherapeuticRelationship.objects.filter(client=p).count() * 5
                
                survivor = max(all_candidates, key=get_score)
                
                # Move user link
                for p in all_candidates:
                    if p.id != survivor.id and p.user == request.user:
                        p.user = None
                        p.save(update_fields=["user"])
                
                survivor.user = request.user
                survivor.save()

                # Migrate all data
                from .models import Appointment, ClientGoal, ClientJournal, ClientCheckin, SafetyPlan, TherapeuticRelationship
                for p in all_candidates:
                    if p.id == survivor.id: continue
                    
                    Appointment.objects.filter(client=p).update(client=survivor)
                    ClientGoal.objects.filter(client=p).update(client=survivor)
                    ClientJournal.objects.filter(client=p).update(client=survivor)
                    ClientCheckin.objects.filter(client=p).update(client=survivor)
                    
                    existing_rels = TherapeuticRelationship.objects.filter(client=survivor).values_list('therapist_id', flat=True)
                    TherapeuticRelationship.objects.filter(client=p).exclude(therapist_id__in=existing_rels).update(client=survivor)
                    
                    if hasattr(p, 'safety_plan') and not hasattr(survivor, 'safety_plan'):
                        sp = p.safety_plan
                        sp.client = survivor
                        sp.save()
                    
                    if p.id != survivor.id:
                        p.delete()
                
                return Response({"detail": "Account successfully repaired and consolidated.", "survivor_id": survivor.id})
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsTherapistOwnerOfAppointment]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            return Appointment.objects.none()
            
        qs = Appointment.objects.filter(therapist=therapist).order_by("-date")
        client_id = self.request.query_params.get("client")
        if client_id:
            # Sanitize: strip trailing slashes or non-numeric noise
            clean_id = "".join(filter(str.isdigit, str(client_id)))
            if clean_id:
                qs = qs.filter(client_id=clean_id)
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
        
        # Helper to match day names or numbers
        DAY_MAP = {
            "0": "sunday", "1": "monday", "2": "tuesday", "3": "wednesday", 
            "4": "thursday", "5": "friday", "6": "saturday"
        }

        while current_dt <= end_dt:
            weekday_idx = str(current_dt.isoweekday() % 7) # 0=Sun, 1=Mon
            day_name = DAY_MAP.get(weekday_idx)
            
            # Look for hours using number OR name (Robust Match)
            day_slots = business_hours.get(weekday_idx) or business_hours.get(day_name) or []
            
            for block in day_slots:
                start_str = block.get("startTime")
                end_str = block.get("endTime")
                if not start_str or not end_str:
                    continue
                
                try:
                    slot_start_time = timezone.make_aware(datetime.strptime(f"{current_dt} {start_str}", "%Y-%m-%d %H:%M"))
                    slot_end_time = timezone.make_aware(datetime.strptime(f"{current_dt} {end_str}", "%Y-%m-%d %H:%M"))
                except ValueError:
                    continue
                
                # Check for overlap before creating (Prevents bloating)
                overlap = AvailabilitySlot.objects.filter(
                    therapist=therapist,
                    start_time__lt=slot_end_time,
                    end_time__gt=slot_start_time,
                    status__in=[AvailabilitySlot.Status.OPEN, AvailabilitySlot.Status.BOOKED, AvailabilitySlot.Status.HELD, AvailabilitySlot.Status.BLOCKED]
                ).exists()

                if not overlap:
                    AvailabilitySlot.objects.create(
                        therapist=therapist,
                        start_time=slot_start_time,
                        end_time=slot_end_time,
                        status=AvailabilitySlot.Status.OPEN,
                        visible_to_clients=True
                    )
                    created_slots += 1
            
            current_dt += timedelta(days=1)
            
        return Response({"detail": f"Successfully generated {created_slots} slots based on your weekly hours."})


class AvailabilitySlotPublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # We no longer require a client profile just to VIEW public slots.
        # Booking still requires authentication and a profile elsewhere.

        therapist_id = (
            request.query_params.get("therapist")
            or request.query_params.get("therapist_id")
        )
        if not therapist_id:
            return Response(
                {"detail": "therapist query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # RESTORED: Professional Filtering (ID + Email Bridge)
        email_param = request.query_params.get("email")
        if not email_param:
            t_obj = TherapistProfile.objects.filter(id=therapist_id).first()
            email_param = t_obj.email if t_obj else None

        if email_param:
            therapist_ids = TherapistProfile.objects.filter(email__iexact=email_param).values_list('id', flat=True)
        else:
            therapist_ids = [therapist_id]

        # NEW: Fail-Safe Dynamic 'Actual Calendar' Sync (Teal Blocks)
        try:
            from datetime import datetime, date, time, timedelta
            
            # 1. Resolve primary profile
            profile = TherapistProfile.objects.filter(id=therapist_id).first()
            if not profile:
                return Response({"detail": "Profile not found"}, status=404)

            # Professional 14-day window with timezone buffer
            start_buffer = timezone.now() - timezone.timedelta(hours=6)
            end_buffer = timezone.now() + timezone.timedelta(days=14)

            # 2. Get manual slots with specific visibility
            for_supervision = self.request.query_params.get("for_sv") == "true"
            
            visibility_filter = Q(visible_to_supervisees=True) if for_supervision else Q(visible_to_clients=True)

            existing_slots = AvailabilitySlot.objects.filter(
                visibility_filter,
                therapist__email__iexact=profile.email,
                status=AvailabilitySlot.Status.OPEN,
                start_time__gt=start_buffer,
                start_time__lte=end_buffer,
            )
            serializer = AvailabilitySlotPublicSerializer(existing_slots, many=True)
            final_data = serializer.data

            # 3. Dynamic Injection from Weekly Hours
            dynamic_slots = []
            if profile.business_hours:
                current_day = timezone.now().date()
                DAY_MAP = {"0": "sunday", "1": "monday", "2": "tuesday", "3": "wednesday", "4": "thursday", "5": "friday", "6": "saturday"}
                
                for i in range(14): 
                    check_date = current_day + timedelta(days=i)
                    weekday_idx = str(check_date.isoweekday() % 7)
                    day_name = DAY_MAP.get(weekday_idx)
                    
                    day_blocks = profile.business_hours.get(weekday_idx) or profile.business_hours.get(day_name) or []
                    for block in day_blocks:
                        try:
                            # Re-parse time robustly
                            if isinstance(block, str):
                                h, m = map(int, block.split(':'))
                                s_time = time(h, m)
                                start_t = timezone.make_aware(datetime.combine(check_date, s_time))
                                end_t = start_t + timedelta(hours=1)
                            else:
                                start_t = timezone.make_aware(datetime.strptime(f"{check_date} {block['startTime']}", "%Y-%m-%d %H:%M"))
                                end_t = timezone.make_aware(datetime.strptime(f"{check_date} {block['endTime']}", "%Y-%m-%d %H:%M"))
                            
                            if start_t < timezone.now(): continue
                            
                            if not ScheduleEvent.objects.filter(therapist__email__iexact=profile.email, start_time__lt=end_t, end_time__gt=start_t).exists():
                                dynamic_slots.append({
                                    "id": f"dyn-{start_t.timestamp()}",
                                    "therapist": profile.id,
                                    "start_time": start_t.isoformat(),
                                    "end_time": end_t.isoformat(),
                                    "status_label": "Open",
                                    "is_dynamic": True
                                })
                        except Exception: continue

            final_data += dynamic_slots
            final_data.sort(key=lambda x: x['start_time'])
            return Response(final_data)

        except Exception as e:
            # SHIELD: Log it and RETURN AN ARRAY so the frontend doesn't crash
            print(f"CRITICAL CALENDAR SYNC ERROR: {str(e)}")
            return Response([], status=200) # Give an empty list to keep the UI stable


def _razorpay_key_id():
    return getattr(settings, "RAZORPAY_KEY_ID", None) or os.getenv("RAZORPAY_KEY_ID")


def _razorpay_key_secret():
    return getattr(settings, "RAZORPAY_KEY_SECRET", None) or os.getenv("RAZORPAY_KEY_SECRET")


def _razorpay_webhook_secret():
    return getattr(settings, "RAZORPAY_WEBHOOK_SECRET", None) or os.getenv("RAZORPAY_WEBHOOK_SECRET")


def _is_razorpay_test_mode() -> bool:
    key_id = _razorpay_key_id() or ""
    return str(key_id).startswith("rzp_test_")


def _razorpay_request(method: str, path: str, payload=None):
    """
    Minimal Razorpay REST client using stdlib only.
    path example: "/v1/orders"
    """
    key_id = _razorpay_key_id()
    key_secret = _razorpay_key_secret()
    if not key_id or not key_secret:
        raise exceptions.ValidationError("Razorpay credentials are not configured.")

    url = f"https://api.razorpay.com{path}"
    body_bytes = None
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    auth = base64.b64encode(f"{key_id}:{key_secret}".encode("utf-8")).decode("ascii")
    headers["Authorization"] = f"Basic {auth}"

    if payload is not None:
        body_bytes = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url, data=body_bytes, method=method.upper(), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8") if e.fp else ""
        raise exceptions.ValidationError(f"Razorpay HTTP error {e.code}: {raw or e.reason}")
    except Exception as e:
        raise exceptions.ValidationError(f"Razorpay request failed: {str(e)}")


def _verify_razorpay_checkout_signature(order_id: str, payment_id: str, signature: str) -> bool:
    secret = _razorpay_key_secret()
    if not secret:
        return False
    message = f"{order_id}|{payment_id}".encode("utf-8")
    expected = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature or "")


def _verify_razorpay_subscription_signature(subscription_id: str, payment_id: str, signature: str) -> bool:
    """
    Razorpay subscription signature verification:
    hmac_sha256(subscription_id|payment_id, key_secret)
    """
    secret = _razorpay_key_secret()
    if not secret:
        return False
    message = f"{subscription_id}|{payment_id}".encode("utf-8")
    expected = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature or "")


class RazorpayCreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            client = _resolve_client_from_request(request)
            if not client:
                return _profile_required_response("client")

            therapist_id = request.data.get("therapist_id") or request.data.get("therapist")
            slot_id = request.data.get("slot_id") or request.data.get("slot")
            if not therapist_id or not slot_id:
                return Response({"detail": "therapist_id and slot_id are required."}, status=status.HTTP_400_BAD_REQUEST)

            therapist = TherapistProfile.objects.filter(pk=therapist_id).first()
            if not therapist:
                return Response({"detail": "Therapist not found."}, status=status.HTTP_404_NOT_FOUND)

            # Handle dynamic slots (dyn-timestamp)
            if isinstance(slot_id, str) and slot_id.startswith("dyn-"):
                try:
                    ts = float(slot_id.replace("dyn-", ""))
                    # Convert timestamp to datetime
                    slot_start = timezone.make_aware(datetime.fromtimestamp(ts))
                    slot_end = slot_start + timedelta(hours=1) 

                    # Try to find if this slot was already created
                    slot = AvailabilitySlot.objects.filter(
                        therapist=therapist,
                        start_time=slot_start
                    ).first()

                    if not slot:
                        # Materialize it
                        slot = AvailabilitySlot.objects.create(
                            therapist=therapist,
                            start_time=slot_start,
                            end_time=slot_end,
                            status=AvailabilitySlot.Status.OPEN,
                            visible_to_clients=True
                        )
                except Exception as e:
                    return Response({"detail": f"Invalid dynamic slot format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                slot = AvailabilitySlot.objects.filter(pk=slot_id).select_related("therapist").first()

            if not slot:
                return Response({"detail": "Availability slot not found."}, status=status.HTTP_404_NOT_FOUND)

            # Ensure slot therapist matches
            if slot.therapist_id != therapist.id:
                return Response({"detail": "Therapist must match the slot therapist."}, status=status.HTTP_400_BAD_REQUEST)

            if slot.status != AvailabilitySlot.Status.OPEN or not slot.visible_to_clients:
                return Response({"detail": "This slot is not available for booking."}, status=status.HTTP_400_BAD_REQUEST)

            if slot.start_time <= timezone.now():
                return Response({"detail": "This slot is no longer available."}, status=status.HTTP_400_BAD_REQUEST)

            active_rel = client.relationships.filter(status="active").first()
            if active_rel and active_rel.therapist_id != therapist.id:
                return Response(
                    {"detail": "You must terminate your existing therapeutic relationship before booking with a new therapist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if _client_has_active_booking_with_other_therapist(client, therapist):
                return Response(
                    {
                        "detail": "You already have a pending or confirmed booking with another therapist. "
                        "Complete or cancel it before booking a different therapist."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            hold_minutes = int(getattr(settings, "BOOKING_REQUEST_HOLD_MINUTES", 15))
            held_until = timezone.now() + timedelta(minutes=hold_minutes) if hold_minutes > 0 else None

            # Amount: use therapist hourly_rate (assumed INR) in paise.
            if therapist.hourly_rate is None:
                return Response({"detail": "Therapist hourly rate is not configured."}, status=status.HTTP_400_BAD_REQUEST)
            amount_paise = int((Decimal(therapist.hourly_rate) * Decimal("100")).to_integral_value())
            currency = getattr(settings, "RAZORPAY_CURRENCY", "INR")

            with transaction.atomic():
                try:
                    booking_request = BookingRequest.objects.create(
                        client=client,
                        therapist=therapist,
                        availability_slot=slot,
                        status=BookingRequest.Status.PENDING,
                        message_from_client=request.data.get("message_from_client", ""),
                        expires_at=held_until,
                        is_first_session_free=False,
                    )
                except IntegrityError:
                    return Response({"detail": "This slot already has an active request."}, status=status.HTTP_400_BAD_REQUEST)

                slot.status = AvailabilitySlot.Status.HELD
                slot.held_until = held_until
                slot.save(update_fields=["status", "held_until", "updated_at"])

                order = _razorpay_request(
                    "POST",
                    "/v1/orders",
                    {
                        "amount": amount_paise,
                        "currency": currency,
                        "receipt": f"booking_request_{booking_request.id}",
                        "notes": {
                            "booking_request_id": str(booking_request.id),
                            "therapist_id": str(therapist.id),
                            "slot_id": str(slot.id),
                        },
                    },
                )

                payment = RazorpayPayment.objects.create(
                    booking_request=booking_request,
                    amount=amount_paise,
                    currency=currency,
                    status=RazorpayPayment.Status.CREATED,
                    razorpay_order_id=order.get("id", ""),
                    raw={"order": order},
                )

            return Response(
                {
                    "key_id": _razorpay_key_id(),
                    "order_id": payment.razorpay_order_id,
                    "amount": payment.amount,
                    "currency": payment.currency,
                    "booking_request_id": booking_request.id,
                    "expires_at": booking_request.expires_at.isoformat() if booking_request.expires_at else None,
                    "therapist_name": therapist.name,
                }
            )
        except Exception as e:
            print(f"RAZORPAY ERROR: {str(e)}")
            return Response({"detail": f"Razorpay processing error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RazorpayVerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        client = _resolve_client_from_request(request)
        if not client:
            return _profile_required_response("client")

        booking_request_id = request.data.get("booking_request_id")
        rzp_payment_id = request.data.get("razorpay_payment_id")
        rzp_order_id = request.data.get("razorpay_order_id")
        rzp_signature = request.data.get("razorpay_signature")
        if not booking_request_id or not rzp_payment_id or not rzp_order_id or not rzp_signature:
            return Response({"detail": "Missing Razorpay verification fields."}, status=status.HTTP_400_BAD_REQUEST)

        booking_request = BookingRequest.objects.filter(pk=booking_request_id, client=client).select_related("availability_slot").first()
        if not booking_request:
            return Response({"detail": "Booking request not found."}, status=status.HTTP_404_NOT_FOUND)

        payment = RazorpayPayment.objects.filter(booking_request=booking_request).first()
        if not payment:
            return Response({"detail": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure order id matches server-side record
        if payment.razorpay_order_id != rzp_order_id:
            return Response({"detail": "Order ID mismatch."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify checkout signature (mandatory)
        if not _verify_razorpay_checkout_signature(rzp_order_id, rzp_payment_id, rzp_signature):
            return Response({"detail": "Invalid payment signature."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch payment status from Razorpay API and ensure it is captured
        payment_details = _razorpay_request("GET", f"/v1/payments/{rzp_payment_id}", payload=None)
        status_str = str(payment_details.get("status", "")).lower()
        amount = int(payment_details.get("amount") or 0)
        currency = str(payment_details.get("currency") or "").upper()

        if amount != payment.amount or currency != payment.currency.upper():
            return Response({"detail": "Payment amount or currency mismatch."}, status=status.HTTP_400_BAD_REQUEST)

        if status_str != "captured":
            return Response({"detail": f"Payment not captured (status={status_str})."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            payment.razorpay_payment_id = rzp_payment_id
            payment.razorpay_signature = rzp_signature
            payment.status = RazorpayPayment.Status.PAID
            payment.captured_at = timezone.now()
            payment.raw = {**(payment.raw or {}), "payment": payment_details}
            payment.save(update_fields=["razorpay_payment_id", "razorpay_signature", "status", "captured_at", "raw", "updated_at"])

            # Confirm booking immediately upon verified payment.
            if booking_request.can_be_confirmed:
                booking_request.confirm(confirmed_by=request.user)

        return Response({"detail": "Payment verified and booking confirmed."})


class RazorpayWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    parser_classes = [JSONParser]

    def post(self, request):
        secret = _razorpay_webhook_secret()
        if not secret:
            return Response({"detail": "Webhook secret not configured."}, status=status.HTTP_400_BAD_REQUEST)

        signature = request.headers.get("X-Razorpay-Signature") or request.META.get("HTTP_X_RAZORPAY_SIGNATURE")
        if not signature:
            return Response({"detail": "Missing webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        # IMPORTANT: Use raw body for signature verification.
        raw_body = request.body or b""
        expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature):
            return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        event = request.data.get("event")
        payload = request.data.get("payload") or {}

        if event == "payment.captured":
            entity = ((payload.get("payment") or {}).get("entity") or {})
            rzp_payment_id = entity.get("id")
            rzp_order_id = entity.get("order_id")
            if not rzp_payment_id or not rzp_order_id:
                return Response({"detail": "Missing payment entity fields."}, status=status.HTTP_400_BAD_REQUEST)

            payment = RazorpayPayment.objects.filter(razorpay_order_id=rzp_order_id).select_related("booking_request").first()
            if not payment:
                return Response({"detail": "Payment record not found."}, status=status.HTTP_200_OK)

            with transaction.atomic():
                if payment.status != RazorpayPayment.Status.PAID:
                    payment.status = RazorpayPayment.Status.PAID
                    payment.razorpay_payment_id = payment.razorpay_payment_id or rzp_payment_id
                    payment.captured_at = payment.captured_at or timezone.now()
                    payment.raw = {**(payment.raw or {}), "webhook": request.data}
                    payment.save(update_fields=["status", "razorpay_payment_id", "captured_at", "raw", "updated_at"])

                br = payment.booking_request
                if br and br.can_be_confirmed:
                    br.confirm(confirmed_by=None)

        # Therapist subscription lifecycle updates
        if event in {"subscription.activated", "subscription.charged", "subscription.authenticated"}:
            entity = ((payload.get("subscription") or {}).get("entity") or {})
            sub_id = entity.get("id")
            if sub_id:
                therapist = TherapistProfile.objects.filter(razorpay_subscription_id=sub_id).first()
                if therapist:
                    therapist.is_basic_subscribed = True
                    therapist.subscription_status = "active"
                    therapist.save(update_fields=["is_basic_subscribed", "subscription_status"])

            # Persist charge records for true subscription revenue analytics.
            payment_entity = ((payload.get("payment") or {}).get("entity") or {})
            if sub_id and payment_entity:
                therapist = TherapistProfile.objects.filter(razorpay_subscription_id=sub_id).first()
                if therapist:
                    payment_id = str(payment_entity.get("id") or "")
                    if payment_id:
                        TherapistSubscriptionCharge.objects.update_or_create(
                            therapist=therapist,
                            razorpay_payment_id=payment_id,
                            defaults={
                                "razorpay_subscription_id": sub_id,
                                "amount": int(payment_entity.get("amount") or 0),
                                "currency": str(payment_entity.get("currency") or "INR"),
                                "status": str(payment_entity.get("status") or "captured"),
                                "captured_at": timezone.now(),
                                "raw": request.data,
                            },
                        )

        if event in {"subscription.cancelled", "subscription.halted"}:
            entity = ((payload.get("subscription") or {}).get("entity") or {})
            sub_id = entity.get("id")
            if sub_id:
                therapist = TherapistProfile.objects.filter(razorpay_subscription_id=sub_id).first()
                if therapist:
                    therapist.subscription_status = "cancelled"
                    therapist.is_basic_subscribed = False
                    therapist.save(update_fields=["subscription_status", "is_basic_subscribed"])

        if event in {"subscription.completed", "subscription.expired"}:
            entity = ((payload.get("subscription") or {}).get("entity") or {})
            sub_id = entity.get("id")
            if sub_id:
                therapist = TherapistProfile.objects.filter(razorpay_subscription_id=sub_id).first()
                if therapist:
                    therapist.subscription_status = "expired"
                    therapist.is_basic_subscribed = False
                    therapist.save(update_fields=["subscription_status", "is_basic_subscribed"])

        return Response({"detail": "ok"})


class RazorpayCreateTherapistSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        therapist = _resolve_therapist_from_request(request, allow_create=False)
        if not therapist:
            return _profile_required_response("therapist")

        plan_type = str(request.data.get("plan_type") or "").lower()
        if plan_type not in {"monthly", "annual"}:
            return Response({"detail": "plan_type must be monthly or annual."}, status=status.HTTP_400_BAD_REQUEST)

        monthly_plan_id = (
            getattr(settings, "RAZORPAY_BASIC_MONTHLY_PLAN_ID", None)
            or os.getenv("RAZORPAY_BASIC_MONTHLY_PLAN_ID")
        )
        annual_plan_id = (
            getattr(settings, "RAZORPAY_BASIC_ANNUAL_PLAN_ID", None)
            or os.getenv("RAZORPAY_BASIC_ANNUAL_PLAN_ID")
        )
        plan_id = monthly_plan_id if plan_type == "monthly" else annual_plan_id
        if not plan_id:
            return Response({"detail": f"Razorpay {plan_type} plan is not configured."}, status=status.HTTP_400_BAD_REQUEST)

        customer_notify = bool(request.data.get("customer_notify", 1))
        total_count = 120 if plan_type == "monthly" else 10

        payload = {
            "plan_id": plan_id,
            "customer_notify": 1 if customer_notify else 0,
            "total_count": total_count,
            "notes": {
                "therapist_id": str(therapist.id),
                "plan_type": plan_type,
                "email": therapist.email or "",
            },
        }
        sub = _razorpay_request("POST", "/v1/subscriptions", payload)
        sub_id = sub.get("id")
        if not sub_id:
            return Response({"detail": "Failed to create subscription with Razorpay."}, status=status.HTTP_400_BAD_REQUEST)

        therapist.razorpay_subscription_id = sub_id
        therapist.subscription_status = "pending"
        therapist.basic_plan = plan_type
        therapist.save(update_fields=["razorpay_subscription_id", "subscription_status", "basic_plan"])

        return Response(
            {
                "key_id": _razorpay_key_id(),
                "subscription_id": sub_id,
                "plan_type": plan_type,
                "status": sub.get("status"),
                "short_url": sub.get("short_url", ""),
            }
        )


class RazorpayVerifyTherapistSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        therapist = _resolve_therapist_from_request(request, allow_create=False)
        if not therapist:
            return _profile_required_response("therapist")

        sub_id = request.data.get("razorpay_subscription_id")
        payment_id = request.data.get("razorpay_payment_id")
        signature = request.data.get("razorpay_signature")
        if not sub_id or not payment_id or not signature:
            return Response({"detail": "Missing Razorpay verification fields."}, status=status.HTTP_400_BAD_REQUEST)

        if therapist.razorpay_subscription_id and therapist.razorpay_subscription_id != sub_id:
            return Response({"detail": "Subscription mismatch."}, status=status.HTTP_400_BAD_REQUEST)

        if not _verify_razorpay_subscription_signature(sub_id, payment_id, signature):
            return Response({"detail": "Invalid subscription signature."}, status=status.HTTP_400_BAD_REQUEST)

        # Optional live fetch to confirm current status
        sub_details = _razorpay_request("GET", f"/v1/subscriptions/{sub_id}", payload=None)
        sub_status = str(sub_details.get("status") or "").lower()
        test_mode = _is_razorpay_test_mode()
        is_active = sub_status in {"active", "authenticated"}
        # In Razorpay test mode, subscriptions may remain created/pending immediately after
        # successful signature verification. Allow temporary access to unblock local/UAT gating.
        if test_mode and sub_status in {"created", "pending"}:
            is_active = True

        therapist.razorpay_subscription_id = sub_id
        therapist.subscription_status = "active" if is_active else "pending"
        therapist.is_basic_subscribed = bool(is_active)
        # Preserve selected plan type if present in notes
        notes = sub_details.get("notes") or {}
        plan_type = str(notes.get("plan_type") or therapist.basic_plan or "none").lower()
        if plan_type in {"monthly", "annual"}:
            therapist.basic_plan = plan_type
        therapist.save(
            update_fields=[
                "razorpay_subscription_id",
                "subscription_status",
                "is_basic_subscribed",
                "basic_plan",
            ]
        )

        return Response(
            {
                "detail": "Therapist subscription verified.",
                "subscription_status": therapist.subscription_status,
                "is_basic_subscribed": therapist.is_basic_subscribed,
                "basic_plan": therapist.basic_plan,
                "razorpay_test_mode": test_mode,
                "razorpay_subscription_status": sub_status,
            }
        )


class TherapistSubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        therapist = _resolve_therapist_from_request(request, allow_create=False)
        if not therapist:
            return _profile_required_response("therapist")

        sync = str(request.query_params.get("sync") or "").lower() in {"1", "true", "yes"}
        razorpay_status = None
        current_end = None

        if sync and therapist.razorpay_subscription_id:
            try:
                sub = _razorpay_request("GET", f"/v1/subscriptions/{therapist.razorpay_subscription_id}", payload=None)
                razorpay_status = str(sub.get("status") or "").lower() or None
                current_end_ts = sub.get("current_end")
                if current_end_ts:
                    try:
                        current_end = timezone.make_aware(datetime.fromtimestamp(int(current_end_ts))).isoformat()
                    except Exception:
                        current_end = None

                test_mode = _is_razorpay_test_mode()
                if razorpay_status in {"active", "authenticated"}:
                    therapist.subscription_status = "active"
                    therapist.is_basic_subscribed = True
                elif test_mode and razorpay_status in {"created", "pending"}:
                    therapist.subscription_status = "active"
                    therapist.is_basic_subscribed = True
                elif razorpay_status in {"cancelled", "halted"}:
                    therapist.subscription_status = "cancelled"
                    therapist.is_basic_subscribed = False
                elif razorpay_status in {"completed", "expired"}:
                    therapist.subscription_status = "expired"
                    therapist.is_basic_subscribed = False
                elif razorpay_status in {"created", "pending"}:
                    therapist.subscription_status = "pending"
                    therapist.is_basic_subscribed = False
                therapist.save(update_fields=["subscription_status", "is_basic_subscribed"])
            except Exception:
                # Do not fail status view if Razorpay sync errors.
                pass

        return Response(
            {
                "is_basic_subscribed": therapist.is_basic_subscribed,
                "basic_plan": therapist.basic_plan,
                "subscription_status": therapist.subscription_status,
                "razorpay_subscription_id": therapist.razorpay_subscription_id,
                "razorpay_status": razorpay_status,
                "current_end": current_end,
            }
        )


class TherapistCancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        therapist = _resolve_therapist_from_request(request, allow_create=False)
        if not therapist:
            return _profile_required_response("therapist")

        sub_id = therapist.razorpay_subscription_id
        if not sub_id:
            return Response({"detail": "No active Razorpay subscription found."}, status=status.HTTP_400_BAD_REQUEST)

        cancel_at_cycle_end = bool(request.data.get("cancel_at_cycle_end", True))
        _razorpay_request(
            "POST",
            f"/v1/subscriptions/{sub_id}/cancel",
            {"cancel_at_cycle_end": 1 if cancel_at_cycle_end else 0},
        )

        therapist.subscription_status = "cancelled" if not cancel_at_cycle_end else "pending"
        if not cancel_at_cycle_end:
            therapist.is_basic_subscribed = False
        therapist.save(update_fields=["subscription_status", "is_basic_subscribed"])

        return Response(
            {
                "detail": "Subscription cancel request submitted.",
                "subscription_status": therapist.subscription_status,
                "is_basic_subscribed": therapist.is_basic_subscribed,
            }
        )

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
            if _client_has_active_booking_with_other_therapist(client, therapist):
                return Response(
                    {
                        "detail": "You already have a pending or confirmed booking with another therapist. "
                        "Complete or cancel it before booking a different therapist."
                    },
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
        try:
            client = _resolve_client_from_request(self.request)
            if not client:
                return Appointment.objects.none()
            return Appointment.objects.filter(client=client).order_by("start_time")
        except Exception:
            # Absolute fail-safe to prevent 500 Internal Server Errors
            return Appointment.objects.none()

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
        Notification.Type.STREAK_REMINDER,
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
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        if not therapist:
            return Note.objects.none()
            
        # Resilient filtering by therapist identity
        qs = Note.objects.filter(
            therapist=therapist,
            archived=False
        ).select_related("client") # Removed "template" join to prevent crashes on missing links

        client_id = self.request.query_params.get("client")
        if client_id:
            # Sanitize: strip trailing slashes or non-numeric noise
            clean_id = "".join(filter(str.isdigit, str(client_id)))
            if clean_id:
                qs = qs.filter(client_id=clean_id)
            
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
            # Sanitize: strip trailing slashes or non-numeric noise
            clean_id = "".join(filter(str.isdigit, str(client_id)))
            if clean_id:
                qs = qs.filter(client_id=clean_id)
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

    def perform_create(self, serializer):
        event = serializer.save()
        _sync_appointment_from_schedule_event(event, notify_new=True)

    def perform_update(self, serializer):
        event = serializer.save()
        _sync_appointment_from_schedule_event(event, notify_new=False)

    def perform_destroy(self, instance):
        appt = getattr(instance, "linked_appointment", None)
        if appt and appt.is_cancellable:
            try:
                cancel_appointment(
                    appt,
                    cancelled_by=self.request.user,
                    reason="Session removed from the schedule.",
                    reopen_slot=False,
                )
            except ValidationError:
                pass
        instance.delete()


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
            client_ids = list(_active_client_ids_for_therapist(therapist))
            # ONLY Admins get to see their own "client" self in the therapist view
            roles = _extract_roles_from_auth(self.request)
            if client and "admin" in roles:
                client_ids.append(client.id)
            
            qs = qs.filter(client_id__in=client_ids)
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(client_id=client_id)
            return qs.order_by("-created_at")
        if client:
            return qs.filter(client=client).order_by("-created_at")
        return ClientJournal.objects.none()

    def perform_create(self, serializer):
        client = _resolve_client_from_request(self.request)
        if not client:
            raise exceptions.PermissionDenied("You must have a client profile to create a journal entry.")
        
        therapist = _resolve_therapist_from_request(self.request) or client.therapist
        try:
            serializer.save(client=client, therapist=therapist)
        except Exception as e:
            # Re-wrap as a ValidationError to avoid 500 and show real error in console
            raise exceptions.ValidationError({"detail": str(e)})


    @action(detail=True, methods=["post"])
    def add_update(self, request, pk=None):
        journal = self.get_object()
        text = request.data.get("text")
        if not text:
            return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        update = {
            "text": text,
            "created_at": timezone.now().isoformat(),
            "author": "Therapist" if _resolve_therapist_from_request(request) else "Client"
        }
        
        updates = journal.updates or []
        updates.append(update)
        journal.updates = updates
        journal.save()
        
        return Response(self.get_serializer(journal).data)


class ClientGoalViewSet(viewsets.ModelViewSet):
    serializer_class = ClientGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        qs = ClientGoal.objects.all()
        if therapist:
            client_ids = list(_active_client_ids_for_therapist(therapist))
            # ONLY Admins get to see their own "client" self in the therapist view
            roles = _extract_roles_from_auth(self.request)
            if client and "admin" in roles:
                client_ids.append(client.id)
                
            qs = qs.filter(client_id__in=client_ids)
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(client_id=client_id)
            return qs.order_by("-created_at")
        if client:
            return qs.filter(client=client).order_by("-created_at")
        return ClientGoal.objects.none()

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        client_id = self.request.data.get("client")
        # Client self-service creation should not require passing a client id.
        if client and not client_id:
            serializer.save(client=client, therapist=client.therapist)
            return

        if therapist:
            client_obj = None
            if client_id:
                client_obj = ClientProfile.objects.filter(
                    id=client_id, therapist=therapist
                ).first()
            if not client_obj:
                raise exceptions.ValidationError({"client": "Valid client is required."})
            serializer.save(therapist=therapist, client=client_obj)
            return

        if client:
            serializer.save(client=client, therapist=client.therapist)


class ClientCheckinViewSet(viewsets.ModelViewSet):
    serializer_class = ClientCheckinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=True)
        client = _resolve_client_from_request(self.request)
        qs = ClientCheckin.objects.all()
        if therapist:
            client_ids = list(_active_client_ids_for_therapist(therapist))
            # ONLY Admins get to see their own "client" self in the therapist view
            roles = _extract_roles_from_auth(self.request)
            if client and "admin" in roles:
                client_ids.append(client.id)

            qs = qs.filter(client_id__in=client_ids)
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(client_id=client_id)
            return qs.order_by("-created_at")
        if client:
            return qs.filter(client=client).order_by("-created_at")
        return ClientCheckin.objects.none()

    def perform_create(self, serializer):
        client = _resolve_client_from_request(self.request)
        if not client:
            raise exceptions.PermissionDenied("You must have a client profile to perform a check-in.")
        
        therapist = _resolve_therapist_from_request(self.request) or client.therapist
        serializer.save(client=client, therapist=therapist)


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
        is_community_view = self.request.query_params.get("community") == "true"
        
        if is_community_view:
            queryset = Resource.objects.filter(is_community=True, is_active=True)
            category_slug = self.request.query_params.get("category_slug")
            if category_slug:
                queryset = queryset.filter(community_category__slug=category_slug)
            return queryset.order_by("-created_at")

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

class OnboardUserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def _sync_clerk_role(self, user, role):
        """
        Persist selected role in Clerk public metadata so frontend role-based routing
        consistently matches backend profile onboarding.
        """
        clerk_secret_key = getattr(settings, "CLERK_SECRET_KEY", "")
        if not clerk_secret_key:
            return False, "CLERK_SECRET_KEY is not configured."

        auth_payload = getattr(self.request, "auth", {}) or {}
        clerk_user_id = auth_payload.get("sub")
        if not clerk_user_id:
            return False, "Missing Clerk subject in auth token."

        metadata_payload = {
            "public_metadata": {
                "role": role,
                "roles": [role],
            }
        }

        try:
            req = urllib_request.Request(
                url=f"https://api.clerk.com/v1/users/{clerk_user_id}",
                data=json.dumps(metadata_payload).encode("utf-8"),
                method="PATCH",
                headers={
                    "Authorization": f"Bearer {clerk_secret_key}",
                    "Content-Type": "application/json",
                },
            )
            with urllib_request.urlopen(req, timeout=8):
                return True, None
        except (HTTPError, URLError, TimeoutError) as exc:
            return False, str(exc)

    def post(self, request):
        role = request.data.get("role")
        user = request.user
        
        if not role or role not in ["client", "therapist"]:
            return Response({"detail": "Invalid or missing role. Must be 'client' or 'therapist'."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the user doesn't already have the requested profile
        if role == "client":
            if not getattr(user, "client_profile", None):
                _resolve_client_from_request(request)
            synced, sync_error = self._sync_clerk_role(user, "client")
            payload = {"detail": "Client profile created successfully.", "role": "client", "clerk_role_synced": synced}
            if sync_error:
                payload["clerk_sync_error"] = sync_error
            return Response(payload)
            
        elif role == "therapist":
            _resolve_therapist_from_request(request, allow_create=True)
            synced, sync_error = self._sync_clerk_role(user, "therapist")
            payload = {
                "detail": "Therapist profile created successfully and pending verification.",
                "role": "therapist",
                "clerk_role_synced": synced,
            }
            if sync_error:
                payload["clerk_sync_error"] = sync_error
            return Response(payload)


class TherapistApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = TherapistApplication.objects.all().order_by("-created_at")
    serializer_class = TherapistApplicationSerializer

    def get_queryset(self):
        # We allow staff and admins to see applications
        roles = _extract_roles_from_auth(self.request)
        if "admin" in roles or self.request.user.is_staff:
            return super().get_queryset()
        return TherapistApplication.objects.none()

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        roles = _extract_roles_from_auth(request)
        if "admin" not in roles and not request.user.is_staff:
            return Response({"detail": "Admin permissions required."}, status=status.HTTP_403_FORBIDDEN)
            
        app = self.get_object()
            
        review_notes = request.data.get("review_notes", "")
        
        with transaction.atomic():
            app.status = "approved"
            if not app.approved_at:
                app.approved_at = timezone.now()
            if review_notes:
                app.review_notes = review_notes
            app.save()
            
            # Create or update Therapist Profile
            # Note: We try to find by email first
            profile, created = TherapistProfile.objects.get_or_create(
                email=app.email,
                defaults={
                    "name": f"{app.first_name} {app.last_name}",
                    "bio": app.relevant_experience or "Approved Therapist",
                    "languages": app.languages,
                    "concerns": app.therapeutic_stance or "",
                    "is_verified": True,
                },
            )
            
            if not created:
                profile.is_verified = True
                profile.name = f"{app.first_name} {app.last_name}"
                profile.save()

            # Bind approved profile to the canonical Django user (if present).
            matched_user = User.objects.filter(email__iexact=app.email).first()
            if matched_user and profile.user_id != matched_user.id:
                profile.user = matched_user
                profile.save(update_fields=["user"])

            # Keep verification consistent across duplicate rows of the same identity.
            TherapistProfile.objects.filter(email__iexact=app.email).update(is_verified=True)
            if profile.user_id:
                TherapistProfile.objects.filter(user_id=profile.user_id).update(is_verified=True)
                
        return Response({"detail": f"Application for {app.first_name} approved/repaired successfully."})


class VerifyTherapistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        _require_admin(request)
            
        try:
            profile = TherapistProfile.objects.get(pk=pk)
            profile.is_verified = True
            # Attach to canonical user on manual verify as well.
            matched_user = User.objects.filter(email__iexact=profile.email).first()
            if matched_user and profile.user_id != matched_user.id:
                profile.user = matched_user
                profile.save(update_fields=["is_verified", "user"])
            else:
                profile.save(update_fields=["is_verified"])

            # Ensure the canonical row for this identity reflects verification too.
            TherapistProfile.objects.filter(email__iexact=profile.email).update(is_verified=True)
            if profile.user_id:
                TherapistProfile.objects.filter(user_id=profile.user_id).update(is_verified=True)
            
            return Response({"detail": f"Therapist {profile.name} verified successfully."})
        except TherapistProfile.DoesNotExist:
            return Response({"detail": "Therapist not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": f"Verification failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TherapistMatchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Return the latest screening for the authenticated client."""
        client = _resolve_client_from_request(request)
        if not client:
            return Response({"matches": []})
            
        latest = client.screenings.order_by("-created_at").first()
        if not latest:
            return Response({"matches": []})
            
        matches = []
        for t in latest.recommended_therapists.all():
            t_data = TherapistProfileSerializer(t).data
            t_data["match_score"] = 0 
            matches.append(t_data)
            
        # Fallback: If for some reason the saved matches are empty (old logic),
        # return all verified therapists. If none are verified, return anyone 
        # who has a real profile (bio or experience).
        if not matches:
            # 1. Try verified first
            all_v = TherapistProfile.objects.filter(is_verified=True)[:5]
            
            # 2. If no verified, show any profile that looks "Real" 
            # (has a bio or name that isn't just a User ID)
            if not all_v:
                all_v = TherapistProfile.objects.exclude(bio__isnull=True).exclude(bio="").exclude(name__startswith="user_")[:5]
                
            # 3. Ultimate fallback if even the "Real" ones are empty
            if not all_v:
                all_v = TherapistProfile.objects.all()[:3]
                
            for t in all_v:
                t_data = TherapistProfileSerializer(t).data
                t_data["match_score"] = 0
                matches.append(t_data)
            
        return Response({
            "screening_id": latest.id,
            "dass_summary": latest.summary_paragraph,
            "dass_interpretations": {
                "depression": latest.dass_depression_level,
                "anxiety": latest.dass_anxiety_level,
                "stress": latest.dass_stress_level
            },
            "risk_level": latest.risk_level,
            "matches": matches,
        })


    def post(self, request):
        data = request.data
        
        # 1. Branch: Supervision Matching
        if data.get("discovery_type") == "supervision" or data.get("role") == "supervisee_prospect":
            # Filter for approved supervisors
            supervisors = TherapistProfile.objects.filter(is_supervisor=True, supervision_status="approved", is_verified=True)
            if not supervisors.exists():
                # Fallback to any verified therapist with high experience
                supervisors = TherapistProfile.objects.filter(is_verified=True, years_experience__gte=5)
            
            matches = []
            others = []
            target_modality = data.get("primary_modality", "").lower()
            target_context = data.get("current_context", "").lower()
            
            for s in supervisors:
                s_score = 0
                s_modalities = [m.lower() for m in (s.supervision_modalities or [])]
                s_areas = [a.lower() for a in (s.supervision_areas or [])]
                
                # Modality Match (Highest Weighted)
                if target_modality and target_modality in s_modalities:
                    s_score += 40
                
                # Context/Area Match
                if target_context and any(kw in target_context for kw in s_areas):
                    s_score += 20
                
                # Seniority Boost
                s_score += (s.supervision_years_experience or 0) * 2
                
                s_data = TherapistProfileSerializer(s).data
                s_data["match_score"] = s_score
                # Replace bio with supervision_bio if available
                if s.supervision_bio:
                   s_data["bio"] = s.supervision_bio
                
                if s_score >= 40:
                    matches.append(s_data)
                else:
                    others.append(s_data)
            
            matches.sort(key=lambda x: x["match_score"], reverse=True)
            others.sort(key=lambda x: x["match_score"], reverse=True)
            
            return Response({
                "discovery_type": "supervision",
                "matches": matches[:5],
                "others": others[:10],
                "message": f"Successfully found {len(matches)} matching supervisors for your clinical growth path."
            })

        # 1. DASS-21 Scoring (Standard Pathology Path)
        dass_answers = data.get("dass_answers", {})
        dass_scores = calculate_dass_scores(dass_answers)
        dass_levels = get_dass_severity(dass_scores)
        dass_summary = generate_dass_summary(dass_levels)
        
        # 2. Risk Assessment
        suicidal_thoughts = data.get("suicidal_thoughts", "No")
        feels_safe = data.get("feels_safe", "Yes")
        immediate_safety_concern = data.get("immediate_safety_concern", "No")
        
        risk_level = "routine"
        if suicidal_thoughts == "Yes, and I feel at risk of acting on these thoughts" or feels_safe == "No" or immediate_safety_concern == "Yes":
            risk_level = "high"
        elif suicidal_thoughts != "No" or feels_safe == "I am not completely sure":
            risk_level = "moderate"
            
        # 3. Soft Filters & Scoring
        all_verified = TherapistProfile.objects.filter(is_verified=True)
        
        matches = []
        others = []
        
        primary_concern = data.get("primary_concern", "").lower()
        secondary_concerns = [c.lower() for c in data.get("presenting_concerns", [])]
        style_pref = data.get("therapy_style_pref", "").lower()
        gender_pref = data.get("therapist_gender_pref", "").lower()
        religion_pref = data.get("religion_pref", "").lower()
        lang_req = [l.lower() for l in data.get("languages", [])]
        st_req = (data.get("service_type") or "").lower()
        
        for t in all_verified:
            score = 0
            t_concerns = [c.lower() for c in (t.concerns or [])]
            t_modalities = [m.lower() for m in (t.modalities or [])]
            t_langs = [l.lower() for l in (t.languages or [])]
            
            # Primary Concern (High)
            if primary_concern in t_concerns:
                score += 15
                
            # Secondary Concerns (Medium)
            matching_secondaries = set(t_concerns).intersection(set(secondary_concerns))
            score += len(matching_secondaries) * 5
            
            # Languages (High)
            if any(l in t_langs for l in lang_req):
                score += 12
                
            # Service Type / Role Match (Medium)
            if st_req:
                if "individual" in st_req and t.years_experience >= 1:
                    score += 5
                if "couples" in st_req and "couples" in t_concerns:
                    score += 8
            
            # Gender Preference (High)
            if gender_pref and gender_pref != "no preference":
                if t.gender and gender_pref in t.gender.lower():
                    score += 10

            # Religion Preference (Medium)
            if religion_pref and religion_pref != "no preference":
                if t.religion and religion_pref in t.religion.lower():
                    score += 5
            
            # DASS Profile Fit (Medium-High)
            if (dass_levels['anxiety'] != 'Normal' or dass_levels['stress'] != 'Normal') and \
               any(kw in t_concerns for kw in ['anxiety', 'stress', 'burnout', 'overwhelmed']):
                score += 8
            if dass_levels['depression'] != 'Normal' and \
               any(kw in t_concerns for kw in ['depression', 'low mood', 'sadness']):
                score += 8
                
            # Style Preference (Medium)
            if style_pref:
                if 'structured' in style_pref and any(m in t_modalities for m in ['cbt', 'dbf', 'solution-focused']):
                    score += 5
                elif 'reflective' in style_pref and any(m in t_modalities for m in ['humanistic', 'psychodynamic', 'existential']):
                    score += 5

            # 🛡️ GLOBAL VERIFICATION BOOST (Critical for visibility)
            if t.is_verified:
                score += 50 # Ensure they always appear in 'matches'

            t_data = TherapistProfileSerializer(t).data
            t_data["match_score"] = score
            
            # Since everyone has +50 if verified, they all go to matches
            if score >= 10:
                matches.append(t_data)
            else:
                others.append(t_data)
        
        # Sort matches by score descending
        matches.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        others.sort(key=lambda x: x["match_score"], reverse=True)
        
        # 5. Save Screening
        client = _resolve_client_from_request(request)
        screening = TherapistScreening.objects.create(
            client=client,

            age=data.get("age"),
            gender=data.get("gender"),
            location=data.get("location", {}),
            languages=data.get("languages", []),
            session_type_pref=data.get("session_type_pref"),
            service_type=data.get("service_type"),
            therapist_gender_pref=data.get("therapist_gender_pref"),
            therapy_style_pref=data.get("therapy_style_pref"),
            urgency=data.get("urgency"),
            religion_pref=data.get("religion_pref"),
            presenting_concerns=data.get("presenting_concerns", []),
            primary_concern=data.get("primary_concern"),
            duration=data.get("duration"),
            impairment_level=data.get("impairment_level"),
            prior_therapy=data.get("prior_therapy"),
            psychiatry_history=data.get("psychiatry_history"),
            on_medication=data.get("on_medication"),
            has_diagnosis=data.get("has_diagnosis"),
            diagnosis_details=data.get("diagnosis_details"),
            health_factors=data.get("health_factors"),
            daily_functioning=data.get("daily_functioning"),
            sleep_quality=data.get("sleep_quality"),
            energy_level=data.get("energy_level"),
            appetite_level=data.get("appetite_level"),
            support_level=data.get("support_level"),
            support_sources=data.get("support_sources", []),
            suicidal_thoughts=suicidal_thoughts,
            feels_safe=feels_safe,
            immediate_safety_concern=immediate_safety_concern,
            risk_level=risk_level,
            dass_answers=dass_answers,
            dass_depression_score=dass_scores['depression'],
            dass_anxiety_score=dass_scores['anxiety'],
            dass_stress_score=dass_scores['stress'],
            dass_depression_level=dass_levels['depression'],
            dass_anxiety_level=dass_levels['anxiety'],
            dass_stress_level=dass_levels['stress'],
            summary_paragraph=dass_summary,
            marketing_email_consent=data.get("marketing_email_consent", False),
            marketing_whatsapp_consent=data.get("marketing_whatsapp_consent", False),
        )
        # Add matches to M2M
        for m in matches[:5]:
            screening.recommended_therapists.add(m["id"])
            
        # Final Safety: If for some reason matches is empty, return anything found to the frontend
        # so they don't see a blank screen on the first results load
        if not matches:
            fallback_list = TherapistProfile.objects.all()[:5]
            for f in fallback_list:
                matches.append(TherapistProfileSerializer(f).data)

        # 6. Save clinical intake note + DASS scores to the client's profile
        if client:
            client.intake_clinical_notes = {
                "screening_id": screening.id,
                "screening_date": screening.created_at.isoformat(),
                "age": data.get("age"),
                "gender": data.get("gender"),
                "location": data.get("location", {}),
                "languages": data.get("languages", []),
                "presenting_concerns": data.get("presenting_concerns", []),
                "primary_concern": data.get("primary_concern"),
                "duration": data.get("duration"),
                "impairment_level": data.get("impairment_level"),
                "life_stage_context": data.get("life_stage_context"),
                "cultural_social_context": data.get("cultural_social_context"),
                "identity_lived_experience": data.get("identity_lived_experience"),
                "other_identity_details": data.get("other_identity_details"),
                "prior_therapy": data.get("prior_therapy"),
                "psychiatry_history": data.get("psychiatry_history"),
                "on_medication": data.get("on_medication"),
                "has_diagnosis": data.get("has_diagnosis"),
                "diagnosis_details": data.get("diagnosis_details"),
                "health_factors": data.get("health_factors"),
                "sleep_quality": data.get("sleep_quality"),
                "energy_level": data.get("energy_level"),
                "appetite_level": data.get("appetite_level"),
                "support_sources": data.get("support_sources", []),
                "risk_level": risk_level,
                "suicidal_thoughts": suicidal_thoughts,
                "feels_safe": feels_safe,
                "summary": dass_summary,
            }
            client.dass_scores = {
                "depression_score": dass_scores['depression'],
                "anxiety_score": dass_scores['anxiety'],
                "stress_score": dass_scores['stress'],
                "depression_level": dass_levels['depression'],
                "anxiety_level": dass_levels['anxiety'],
                "stress_level": dass_levels['stress'],
                "summary": dass_summary,
            }
            client.save(update_fields=["intake_clinical_notes", "dass_scores"])

        return Response({
            "screening_id": screening.id,
            "dass_summary": dass_summary,
            "dass_interpretations": dass_levels,
            "risk_level": risk_level,
            "matches": matches[:5],
            "others": others[:10]
        })


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.action != 'create':
            _require_admin(self.request)
        return super().get_queryset()

class QuickBookingViewSet(viewsets.ModelViewSet):
    queryset = QuickBooking.objects.all().order_by("-created_at")
    serializer_class = QuickBookingSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.action != 'create':
            _require_admin(self.request)
        return super().get_queryset()

class SafetyPlanViewSet(viewsets.ModelViewSet):
    serializer_class = SafetyPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        client = _resolve_client_from_request(self.request)
        if not client: return SafetyPlan.objects.none()
        return SafetyPlan.objects.filter(client=client)

    def perform_create(self, serializer):
        client = _resolve_client_from_request(self.request)
        serializer.save(client=client)

    @action(detail=False, methods=['get'])
    def current(self, request):
        client = _resolve_client_from_request(request)
        if not client: return Response({"detail": "Client profile not found."}, status=status.HTTP_404_NOT_FOUND)
        plan, created = SafetyPlan.objects.get_or_create(client=client)
        serializer = self.get_serializer(plan)
        return Response(serializer.data)

class TherapeuticRelationshipViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TherapeuticRelationshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 1. Try resolving as a Client
        client = _resolve_client_from_request(self.request)
        if client:
            # 🛠️ Auto-repair Strategy 1: Primary Therapist assigned in Profile
            if client.therapist and not TherapeuticRelationship.objects.filter(client=client, therapist=client.therapist, status="active").exists():
                print(f"DEBUG: Auto-repairing relationship (Profile Link) for client {client.id}")
                _ensure_relationship(client.therapist, client, make_primary=True)
            
            # 🛠️ Auto-repair Strategy 2: Appointments exist but no Relationship record
            if not TherapeuticRelationship.objects.filter(client=client, status="active").exists():
                from .models import Appointment
                latest_appt = Appointment.objects.filter(client=client).order_by("-start_time").first()
                if latest_appt:
                    print(f"DEBUG: Auto-repairing relationship (Appointment Link) for client {client.id} with therapist {latest_appt.therapist_id}")
                    _ensure_relationship(latest_appt.therapist, client, make_primary=True)

            return TherapeuticRelationship.objects.filter(client=client, status="active")
        
        therapist = _resolve_therapist_from_request(self.request)
        if therapist:
            return TherapeuticRelationship.objects.filter(therapist=therapist, status="active")
            
        return TherapeuticRelationship.objects.none()

class SupervisoryRelationshipViewSet(viewsets.ModelViewSet):
    serializer_class = SupervisoryRelationshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        if not therapist:
            return SupervisoryRelationship.objects.none()
            
        # Can see relationships where I am supervisor OR supervisee
        from django.db.models import Q
        return SupervisoryRelationship.objects.filter(
            Q(supervisor=therapist) | Q(supervisee=therapist)
        )

    @action(detail=False, methods=["get"], url_path="my-supervisee-sessions")
    def my_supervisee_sessions(self, request):
        therapist = _resolve_therapist_from_request(request)
        if not therapist:
            return Response([])

        notes = (
            SupervisionNote.objects.filter(
                relationship__supervisee=therapist,
                appointment__isnull=False,
            )
            .select_related("relationship__supervisor", "appointment")
            .order_by("-appointment__start_time", "-created_at")
        )

        sessions = []
        for note in notes:
            appointment = note.appointment
            payment_status = "paid" if appointment.booking_request_id else "pending"
            sessions.append(
                {
                    "note_id": note.id,
                    "relationship_id": note.relationship_id,
                    "supervisor_name": note.relationship.supervisor.name,
                    "supervisor_id": note.relationship.supervisor_id,
                    "start_time": appointment.start_time,
                    "end_time": appointment.end_time,
                    "status": appointment.status,
                    "status_label": appointment.get_status_display(),
                    "payment_status": payment_status,
                    "meeting_link": appointment.meeting_link,
                }
            )

        return Response(sessions)

    @action(detail=False, methods=["get"], url_path="my-supervisor-sessions")
    def my_supervisor_sessions(self, request):
        therapist = _resolve_therapist_from_request(request)
        if not therapist:
            return Response([])

        notes = (
            SupervisionNote.objects.filter(
                relationship__supervisor=therapist,
                relationship__status=SupervisoryRelationship.Status.ACTIVE,
                appointment__isnull=False,
            )
            .select_related("relationship__supervisee", "appointment")
            .order_by("-appointment__start_time", "-created_at")
        )

        sessions = []
        for note in notes:
            appointment = note.appointment
            supervisee = note.relationship.supervisee
            payment_status = "paid" if appointment.booking_request_id else "pending"
            sessions.append(
                {
                    "note_id": note.id,
                    "relationship_id": note.relationship_id,
                    "appointment_id": appointment.id,
                    "supervisee_id": supervisee.id,
                    "supervisee_name": supervisee.name,
                    "supervisee_title": getattr(supervisee, "title", "") or "Practitioner",
                    "supervisee_email": supervisee.email,
                    "supervisee_years_experience": supervisee.years_experience,
                    "supervisee_bio": supervisee.bio,
                    "supervisee_modalities": supervisee.modalities,
                    "start_time": appointment.start_time,
                    "end_time": appointment.end_time,
                    "status": appointment.status,
                    "status_label": appointment.get_status_display(),
                    "payment_status": payment_status,
                    "meeting_link": appointment.meeting_link,
                }
            )

        return Response(sessions)

    @action(detail=True, methods=['post'], url_path='generate-report')
    def generate_report(self, request, pk=None):
        relationship = self.get_object()
        therapist = _resolve_therapist_from_request(request)
        
        # Only supervisor can generate reports
        if relationship.supervisor != therapist:
            return Response({"detail": "Only the supervisor can generate mentorship reports."}, status=status.HTTP_403_FORBIDDEN)
            
        month_str = request.data.get("month") # e.g. "2024-04-01"
        if not month_str:
            return Response({"detail": "Month (YYYY-MM-DD) is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        from datetime import datetime
        try:
            report_month = datetime.strptime(month_str, "%Y-%m-%d").date().replace(day=1)
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Find all notes for this month
        notes = SupervisionNote.objects.filter(
            relationship=relationship,
            created_at__year=report_month.year,
            created_at__month=report_month.month
        )
        
        total_sessions = notes.count()
        total_minutes = 0
        session_details = []
        
        for note in notes:
            duration = 50 # Default
            if note.appointment:
                duration = (note.appointment.end_time - note.appointment.start_time).total_seconds() / 60
            
            total_minutes += duration
            session_details.append({
                "note_id": note.id,
                "date": note.created_at.isoformat(),
                "duration": int(duration),
                "summary": note.content[:100] + "..." if len(note.content) > 100 else note.content
            })
            
        # Calculate payable
        rate = relationship.supervisor.supervision_hourly_rate or relationship.supervisor.hourly_rate or 0
        total_hours = total_minutes / 60
        total_payable = float(rate) * total_hours
        
        # Create or Update Report
        report, created = SupervisionReport.objects.update_or_create(
            relationship=relationship,
            month=report_month,
            defaults={
                "total_sessions": total_sessions,
                "total_minutes": int(total_minutes),
                "total_payable": total_payable,
                "report_data": {
                    "sessions": session_details,
                    "calculation_rate": float(rate),
                    "generated_by": therapist.name
                },
                "status": SupervisionReport.Status.DRAFT
            }
        )
        
        return Response(SupervisionReportSerializer(report).data)

    @action(detail=True, methods=['get'], url_path='reports')
    def get_reports(self, request, pk=None):
        relationship = self.get_object()
        reports = relationship.reports.all()
        return Response(SupervisionReportSerializer(reports, many=True).data)

    @action(detail=True, methods=["get"], url_path="timeline")
    def timeline(self, request, pk=None):
        relationship = self.get_object()
        notes = relationship.notes.all().order_by("-created_at")[:50]
        actions = relationship.action_items.all().order_by("-created_at")[:100]
        reflections = relationship.reflections.all().order_by("-created_at")[:100]

        timeline_items = []
        for n in notes:
            timeline_items.append(
                {
                    "type": "note",
                    "id": n.id,
                    "created_at": n.created_at,
                    "title": "Supervision note added",
                    "summary": (n.content or "")[:180],
                }
            )
        for a in actions:
            timeline_items.append(
                {
                    "type": "action_item",
                    "id": a.id,
                    "created_at": a.created_at,
                    "title": a.title,
                    "summary": f"{a.owner} · {a.status}",
                    "due_date": a.due_date,
                }
            )
        for r in reflections:
            timeline_items.append(
                {
                    "type": "reflection",
                    "id": r.id,
                    "created_at": r.created_at,
                    "title": f"{r.get_reflection_type_display()} reflection",
                    "summary": (r.takeaways or r.goals or "")[:180],
                }
            )

        timeline_items.sort(key=lambda x: x.get("created_at") or timezone.now(), reverse=True)
        return Response(timeline_items)

class SupervisionNoteViewSet(viewsets.ModelViewSet):
    serializer_class = SupervisionNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        if not therapist:
            return SupervisionNote.objects.none()
            
        # Notes are private to the SUPERVISOR of the relationship
        return SupervisionNote.objects.filter(relationship__supervisor=therapist)


class SupervisionActionItemViewSet(viewsets.ModelViewSet):
    serializer_class = SupervisionActionItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        if not therapist:
            return SupervisionActionItem.objects.none()

        return SupervisionActionItem.objects.filter(
            Q(relationship__supervisor=therapist) | Q(relationship__supervisee=therapist)
        ).select_related("relationship")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        relationship = serializer.validated_data.get("relationship")
        if not relationship or therapist not in (relationship.supervisor, relationship.supervisee):
            raise exceptions.PermissionDenied("You do not have access to this supervisory relationship.")

        serializer.save(
            created_by_supervisor=(therapist == relationship.supervisor)
        )

    @action(detail=False, methods=["get"], url_path="my-reminders")
    def my_reminders(self, request):
        therapist = _resolve_therapist_from_request(request)
        if not therapist:
            return Response([])
        today = timezone.now().date()
        items = self.get_queryset().filter(status__in=["open", "in_progress"]).order_by("due_date", "-created_at")
        data = SupervisionActionItemSerializer(items, many=True).data
        for row in data:
            due_date = row.get("due_date")
            row["is_overdue"] = bool(due_date and due_date < str(today))
        return Response(data)


class SupervisionReflectionViewSet(viewsets.ModelViewSet):
    serializer_class = SupervisionReflectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        if not therapist:
            return SupervisionReflection.objects.none()
        return SupervisionReflection.objects.filter(
            Q(relationship__supervisor=therapist) | Q(relationship__supervisee=therapist)
        ).select_related("relationship", "appointment")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        relationship = serializer.validated_data.get("relationship")
        if not relationship or therapist not in (relationship.supervisor, relationship.supervisee):
            raise exceptions.PermissionDenied("You do not have access to this supervisory relationship.")
        serializer.save(submitted_by_supervisee=(therapist == relationship.supervisee))


class ClientFormAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = ClientFormAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        client = _resolve_client_from_request(self.request)

        if therapist:
            qs = ClientFormAssignment.objects.filter(assigned_by=therapist).select_related(
                "assigned_by", "assigned_to", "therapeutic_relationship"
            )
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(assigned_to_id=client_id)
            return qs

        if client:
            return ClientFormAssignment.objects.filter(assigned_to=client).select_related(
                "assigned_by", "assigned_to", "therapeutic_relationship"
            )

        return ClientFormAssignment.objects.none()

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        if not therapist:
            raise exceptions.PermissionDenied("Therapist profile required.")

        assigned_to = serializer.validated_data.get("assigned_to")
        relationship = TherapeuticRelationship.objects.filter(
            therapist=therapist,
            client=assigned_to,
            status=TherapeuticRelationship.Status.ACTIVE,
        ).first()
        if not relationship:
            raise exceptions.ValidationError({"assigned_to": "Active therapeutic relationship required."})

        form_type = serializer.validated_data.get("form_type")
        default_schema = {
            "consent": {
                "sections": [
                    "Informed consent acknowledgement",
                    "Confidentiality and limits",
                    "Telehealth policy",
                    "Emergency protocol acknowledgement",
                ]
            },
            "assessment": {
                "sections": [
                    "Presenting concerns",
                    "Symptoms and severity",
                    "Risk/safety screening",
                    "Goals and expectations",
                ]
            },
        }
        if not serializer.validated_data.get("form_schema"):
            serializer.validated_data["form_schema"] = default_schema.get(form_type, {})

        if not serializer.validated_data.get("title"):
            serializer.validated_data["title"] = (
                "Client Consent Form" if form_type == "consent" else "Client Assessment Form"
            )

        serializer.save(
            assigned_by=therapist,
            assigned_to=assigned_to,
            therapeutic_relationship=relationship,
        )

    @action(detail=True, methods=["post"])
    def submit_response(self, request, pk=None):
        assignment = self.get_object()
        client = _resolve_client_from_request(request)
        if not client or assignment.assigned_to_id != client.id:
            return Response({"detail": "Only assigned client can submit this form."}, status=status.HTTP_403_FORBIDDEN)

        assignment.response_data = request.data.get("response_data") or {}
        assignment.status = ClientFormAssignment.Status.SUBMITTED
        assignment.submitted_at = timezone.now()
        assignment.save(update_fields=["response_data", "status", "submitted_at", "updated_at"])
        return Response(self.get_serializer(assignment).data)

    @action(detail=True, methods=["post"])
    def mark_reviewed(self, request, pk=None):
        assignment = self.get_object()
        therapist = _resolve_therapist_from_request(request)
        if not therapist or assignment.assigned_by_id != therapist.id:
            return Response({"detail": "Only assigning therapist can mark reviewed."}, status=status.HTTP_403_FORBIDDEN)

        assignment.status = ClientFormAssignment.Status.REVIEWED
        assignment.reviewed_at = timezone.now()
        assignment.save(update_fields=["status", "reviewed_at", "updated_at"])
        return Response(self.get_serializer(assignment).data)


class AdminReportsCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _require_admin(request)
        return Response({"reports": REPORT_CATALOG})


class AdminReportDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_key):
        _require_admin(request)
        period = str(request.query_params.get("period") or "monthly").lower()
        year = int(request.query_params.get("year") or timezone.now().year)
        month = int(request.query_params.get("month") or timezone.now().month)
        quarter = int(request.query_params.get("quarter") or ((timezone.now().month - 1) // 3 + 1))
        start, end, months_in_period, label, period_type = get_period_bounds(period, year, month, quarter)
        payload = build_report(report_key, start, end, months_in_period, period_type, label)
        if payload is None:
            return Response({"detail": "Unknown report type."}, status=status.HTTP_404_NOT_FOUND)
        return Response(payload)


class AdminReportsOverviewView(APIView):
    """Legacy single-call aggregate (same shape as before). Prefer /admin/reports/<key>/ for focused loads."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        _require_admin(request)

        period = str(request.query_params.get("period") or "monthly").lower()
        year = int(request.query_params.get("year") or timezone.now().year)
        month = int(request.query_params.get("month") or timezone.now().month)
        quarter = int(request.query_params.get("quarter") or ((timezone.now().month - 1) // 3 + 1))

        start, end, months_in_period, label, period_type = get_period_bounds(period, year, month, quarter)
        return Response(build_full_overview_payload(start, end, months_in_period, period_type, label))


class RocketChatSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cfg = get_rocket_chat_config()
        if not cfg.enabled:
            return Response(
                {
                    "enabled": False,
                    "detail": "Rocket.Chat is not configured.",
                }
            )

        therapist = _resolve_therapist_from_request(request, allow_create=False)
        client = _resolve_client_from_request(request)
        if not therapist and not client:
            return Response({"detail": "Therapist or client profile required."}, status=status.HTTP_403_FORBIDDEN)

        is_therapist_view = therapist is not None
        if is_therapist_view:
            relationships = list(
                TherapeuticRelationship.objects.filter(
                    therapist=therapist,
                    status=TherapeuticRelationship.Status.ACTIVE,
                ).select_related("client")
            )
            peers = [rel.client for rel in relationships]
            current_name = therapist.name
            current_email = therapist.email
            current_username = f"mlc_therapist_{therapist.id}"
            role = "therapist"
        else:
            relationships = list(
                TherapeuticRelationship.objects.filter(
                    client=client,
                    status=TherapeuticRelationship.Status.ACTIVE,
                ).select_related("therapist")
            )
            peers = [rel.therapist for rel in relationships]
            current_name = client.name
            current_email = client.email
            current_username = f"mlc_client_{client.id}"
            role = "client"

        try:
            current_user = rocket_chat_get_or_create_user(
                cfg,
                username=current_username,
                name=current_name,
                email=current_email,
            )
            peer_summaries = []
            for rel in relationships:
                if is_therapist_view:
                    peer = rel.client
                    peer_username = f"mlc_client_{peer.id}"
                    peer_role = "client"
                else:
                    peer = rel.therapist
                    peer_username = f"mlc_therapist_{peer.id}"
                    peer_role = "therapist"
                peer_user = rocket_chat_get_or_create_user(
                    cfg,
                    username=peer_username,
                    name=peer.name,
                    email=peer.email,
                )
                ensure_dm_room(
                    cfg,
                    username_a=current_user["username"],
                    username_b=peer_user["username"],
                )
                peer_summaries.append(
                    {
                        "relationship_id": rel.id,
                        "peer_id": peer.id,
                        "peer_name": peer.name,
                        "peer_role": peer_role,
                        "peer_username": peer_user["username"],
                    }
                )

            login = rocket_chat_login_managed_user(cfg, username=current_user["username"])
            return Response(
                {
                    "enabled": True,
                    "role": role,
                    "rocket_chat_url": cfg.base_url,
                    "current_user": {
                        "username": login.get("username") or current_user["username"],
                        "name": login.get("name") or current_name,
                        "user_id": login.get("user_id"),
                    },
                    "login_token": login.get("auth_token"),
                    "peers": peer_summaries,
                }
            )
        except RocketChatError as exc:
            return Response(
                {
                    "enabled": False,
                    "detail": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )


# ------------------------------------------------------------------------------
# COMMUNITY VIEWSETS
# ------------------------------------------------------------------------------

class CommunityCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CommunityCategory.objects.all().order_by("order", "name")
    serializer_class = CommunityCategorySerializer
    permission_classes = [IsAuthenticated]


class CommunityThreadViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CommunityThread.objects.filter(is_approved=True)
        category_slug = self.request.query_params.get("category_slug")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        return queryset.order_by("-is_pinned", "-created_at")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        if not therapist:
            raise exceptions.PermissionDenied("Only verified therapists can participate in the community.")
        serializer.save(author=therapist)

    @action(detail=True, methods=["POST"])
    def increment_view(self, request, pk=None):
        thread = self.get_object()
        thread.views_count += 1
        thread.save(update_fields=["views_count"])
        return Response({"status": "view incremented"})


class CommunityCommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CommunityComment.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        if not therapist:
            raise exceptions.PermissionDenied("Only verified therapists can participate in the community.")
        serializer.save(author=therapist)


class ReferralViewSet(viewsets.ModelViewSet):
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            return Referral.objects.none()
        
        # Therapists can see referrals they SENT or RECEIVED
        return Referral.objects.filter(
            Q(referring_therapist=therapist) | Q(receiving_therapist=therapist)
        ).order_by("-created_at")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request, allow_create=False)
        if not therapist:
            raise exceptions.PermissionDenied("Only verified therapists can send referrals.")
        serializer.save(referring_therapist=therapist)
