from rest_framework import viewsets, status, exceptions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.views.generic import TemplateView
from django.db import transaction, models
from django.utils import timezone

from therapy.models import (
    ScheduleEvent,
    TherapistProfile,
    ClientProfile,
    Appointment,
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
    TherapistApplication,
    TeamMember,
)
from therapy.serializers import (
    TherapistProfileSerializer,
    ClientProfileSerializer,
    AppointmentSerializer,
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
    TherapistApplicationSerializer,
    TeamMemberSerializer,
)


# ----------------------------
# Helper
# ----------------------------
def _resolve_therapist_from_request(request):
    """
    Return the TherapistProfile linked to the authenticated user.
    Creates one if missing (stable behavior for first-time logins).
    """
    user = request.user
    email = getattr(user, "email", None)
    name = getattr(user, "username", None) or getattr(user, "get_full_name", lambda: "")() or "Unnamed Therapist"

    if not email:
        # fallback if user has no email
        email = f"therapist_{user.pk or 'nouser'}@local"

    therapist, _ = TherapistProfile.objects.get_or_create(
        email=email,
        defaults={"name": name},
    )
    return therapist


def _resolve_client_from_request(request):
    """
    Return the ClientProfile linked to the authenticated user by email.
    """
    user = request.user
    email = getattr(user, "email", None)
    if not email:
        return None
    return ClientProfile.objects.filter(email__iexact=email).first()


def _extract_roles_from_auth(request):
    payload = request.auth or {}
    meta = payload.get("public_metadata") or payload.get("publicMetadata") or {}
    roles = meta.get("roles") or payload.get("roles") or []
    if isinstance(roles, str):
        roles = [roles]
    if not roles and meta.get("role"):
        roles = [meta.get("role")]
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
        therapist = _resolve_therapist_from_request(self.request)
        roles = _extract_roles_from_auth(self.request)
        if "admin" in roles:
            return TherapistProfile.objects.all()
        return TherapistProfile.objects.filter(id=therapist.id)


class TherapistSessionLinkViewSet(viewsets.ModelViewSet):
    serializer_class = TherapistSessionLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        return TherapistSessionLink.objects.filter(therapist=therapist)

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        serializer.save(therapist=therapist)


class ClientProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        return ClientProfile.objects.filter(therapist=therapist).order_by("name")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        serializer.save(therapist=therapist)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        qs = Appointment.objects.filter(therapist=therapist).order_by("-date")
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs


class SessionRecordViewSet(viewsets.ModelViewSet):
    queryset = SessionRecord.objects.all()
    serializer_class = SessionRecordSerializer
    permission_classes = [IsAuthenticated]


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
        therapist = _resolve_therapist_from_request(self.request)
        qs = ClientFile.objects.filter(client__therapist=therapist).order_by("-uploaded_at")
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
        therapist = _resolve_therapist_from_request(self.request)
        if therapist:
            return ScheduleEvent.objects.filter(therapist=therapist).order_by("-start_time")
        return ScheduleEvent.objects.none()


class WaitlistEntryViewSet(viewsets.ModelViewSet):
    serializer_class = WaitlistEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        return WaitlistEntry.objects.filter(
            client__therapist=therapist
        ).order_by("-created_at")

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        serializer.save(therapist=serializer.validated_data.get("therapist") or therapist)


# ----------------------------
# Client Experience / Premium
# ----------------------------
class ClientJournalViewSet(viewsets.ModelViewSet):
    serializer_class = ClientJournalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        client = _resolve_client_from_request(self.request)
        qs = ClientJournal.objects.all()
        if therapist:
            qs = qs.filter(client__therapist=therapist)
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
        therapist = _resolve_therapist_from_request(self.request)
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
        therapist = _resolve_therapist_from_request(self.request)
        client = _resolve_client_from_request(self.request)
        qs = ClientGoal.objects.all()
        if therapist:
            qs = qs.filter(client__therapist=therapist)
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
        therapist = _resolve_therapist_from_request(self.request)
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
        therapist = _resolve_therapist_from_request(self.request)
        client = _resolve_client_from_request(self.request)
        qs = ClientCheckin.objects.all()
        if therapist:
            qs = qs.filter(client__therapist=therapist)
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
        therapist = _resolve_therapist_from_request(self.request)
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
        therapist = _resolve_therapist_from_request(self.request)
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
        therapist = _resolve_therapist_from_request(self.request)
        serializer.save(therapist=therapist, is_library=False, is_premium_only=False)


class MaterialShareViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialShareSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        therapist = _resolve_therapist_from_request(self.request)
        client = _resolve_client_from_request(self.request)
        if therapist:
            qs = MaterialShare.objects.filter(client__therapist=therapist)
            client_id = self.request.query_params.get("client")
            if client_id:
                qs = qs.filter(client_id=client_id)
            return qs.order_by("-created_at")
        if client:
            return MaterialShare.objects.filter(client=client).order_by("-created_at")
        return MaterialShare.objects.none()

    def perform_create(self, serializer):
        therapist = _resolve_therapist_from_request(self.request)
        if therapist:
            serializer.save(shared_by=therapist)


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


class FrontendAppView(TemplateView):
    template_name = "index.html"
