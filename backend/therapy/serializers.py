from rest_framework import serializers
from therapy.models import (
    TherapistProfile,
    ClientProfile,
    Appointment,
    SessionRecord,
    NoteTemplate,
    NoteField,
    Note,
    ClientFile,
    AvailabilitySlot,
    BookingRequest,
    TherapeuticRelationship,
    EventType,
    ScheduleEvent,
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
    Notification,
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
    ContactMessage,
    QuickBooking,
    SafetyPlan,
)

from .utils import _resolve_therapist_from_request
from django.utils import timezone
from rest_framework import serializers
import json

# ----------------------------
# Therapist / Client / Appointment
# ----------------------------
class TherapistProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistProfile
        fields = "__all__"


class TherapistSessionLinkSerializer(serializers.ModelSerializer):
    therapist_name = serializers.CharField(source="therapist.name", read_only=True)

    class Meta:
        model = TherapistSessionLink
        fields = ["id", "therapist", "therapist_name", "name", "url", "is_default", "created_at"]
        extra_kwargs = {
            "therapist": {"read_only": True},
        }


class ClientProfileSerializer(serializers.ModelSerializer):
    therapist = TherapistProfileSerializer(read_only=True)
    has_active_relationship = serializers.BooleanField(read_only=True)
    is_first_session_eligible = serializers.BooleanField(read_only=True)

    class Meta:
        model = ClientProfile
        fields = "__all__"
        extra_kwargs = {
            "therapist": {"read_only": True},
        }


class AppointmentSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "client",
            "therapist",
            "booking_request",
            "availability_slot",
            "start_time",
            "end_time",
            "status",
            "status_label",
            "created_at",
            "updated_at",
            "cancelled_at",
            "completed_at",
        ]
        read_only_fields = [
            "status_label",
            "created_at",
            "updated_at",
        ]


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    therapist_display_name = serializers.CharField(source="therapist.name", read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = AvailabilitySlot
        fields = [
            "id",
            "therapist",
            "therapist_display_name",
            "start_time",
            "end_time",
            "status",
            "status_label",
            "visible_to_clients",
            "duration_minutes",
        ]
        read_only_fields = [
            "therapist_display_name",
            "duration_minutes",
            "status_label",
        ]
        extra_kwargs = {
            "therapist": {"read_only": True},
        }

    def validate(self, attrs):
        therapist = attrs.get("therapist") or self.context.get("therapist")
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))
        status = attrs.get("status", getattr(self.instance, "status", AvailabilitySlot.Status.OPEN))

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({"end_time": "End time must be after start time."})

        if therapist and start_time and end_time:
            overlap_statuses = [
                AvailabilitySlot.Status.OPEN,
                AvailabilitySlot.Status.HELD,
                AvailabilitySlot.Status.BOOKED,
                AvailabilitySlot.Status.BLOCKED,
            ]
            overlapping = AvailabilitySlot.objects.filter(
                therapist=therapist,
                status__in=overlap_statuses,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)
            if overlapping.exists():
                raise serializers.ValidationError("This availability overlaps an existing active slot.")

        attrs["status"] = status
        return attrs


class AvailabilitySlotPublicSerializer(serializers.ModelSerializer):
    therapist_display_name = serializers.CharField(source="therapist.name", read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = AvailabilitySlot
        fields = [
            "id",
            "therapist",
            "therapist_display_name",
            "start_time",
            "end_time",
            "duration_minutes",
            "status_label",
        ]
        read_only_fields = fields


class BookingRequestSerializer(serializers.ModelSerializer):
    therapist_display_name = serializers.SerializerMethodField()
    client_display_name = serializers.SerializerMethodField()
    slot_start_time = serializers.SerializerMethodField()
    slot_end_time = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = BookingRequest
        fields = [
            "id",
            "client",
            "therapist",
            "availability_slot",
            "status",
            "status_label",
            "message_from_client",
            "therapist_response_note",
            "is_first_session_free",
            "created_at",
            "updated_at",
            "responded_at",
            "therapist_display_name",
            "client_display_name",
            "slot_start_time",
            "slot_end_time",
        ]
        read_only_fields = [
            "status_label",
            "created_at",
            "updated_at",
            "responded_at",
            "therapist_display_name",
            "client_display_name",
            "slot_start_time",
            "slot_end_time",
        ]

    def get_therapist_display_name(self, obj):
        return getattr(obj.therapist, "name", None) or getattr(obj.therapist, "email", "")

    def get_client_display_name(self, obj):
        client = obj.client
        return (
            client.preferred_first_name
            or client.first_name
            or client.name
            or client.email
            or ""
        )

    def get_slot_start_time(self, obj):
        if obj.availability_slot_id:
            return obj.availability_slot.start_time
        return None

    def get_slot_end_time(self, obj):
        if obj.availability_slot_id:
            return obj.availability_slot.end_time
        return None


class BookingRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingRequest
        fields = [
            "id",
            "client",
            "therapist",
            "availability_slot",
            "message_from_client",
            "is_first_session_free",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        slot = attrs.get("availability_slot")
        therapist = attrs.get("therapist")
        client = attrs.get("client")

        if not slot:
            raise serializers.ValidationError({"availability_slot": "Availability slot is required."})

        if slot.start_time and slot.start_time <= timezone.now():
            raise serializers.ValidationError({"availability_slot": "Slot must be in the future."})

        if not slot.can_be_requested:
            raise serializers.ValidationError({"availability_slot": "This slot is not available for booking."})

        if therapist and slot.therapist_id != therapist.id:
            raise serializers.ValidationError({"therapist": "Therapist must match the slot therapist."})

        if therapist is None:
            attrs["therapist"] = slot.therapist

        if not client:
            raise serializers.ValidationError({"client": "Client is required."})

        if BookingRequest.objects.filter(
            availability_slot=slot,
            status__in=[BookingRequest.Status.PENDING, BookingRequest.Status.CONFIRMED],
        ).exists():
            raise serializers.ValidationError({"availability_slot": "This slot already has an active request."})

        return attrs


class BookingRequestActionSerializer(serializers.Serializer):
    ACTION_CONFIRM = "confirm"
    ACTION_DECLINE = "decline"
    ACTION_CANCEL_CLIENT = "cancel_by_client"
    ACTION_CANCEL_THERAPIST = "cancel_by_therapist"

    action = serializers.ChoiceField(
        choices=[
            ACTION_CONFIRM,
            ACTION_DECLINE,
            ACTION_CANCEL_CLIENT,
            ACTION_CANCEL_THERAPIST,
        ]
    )
    therapist_response_note = serializers.CharField(required=False, allow_blank=True)
    message_from_client = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        booking_request = self.instance or self.context.get("booking_request")
        if not booking_request:
            raise serializers.ValidationError("Booking request is required for this action.")

        action = attrs.get("action")
        if action == self.ACTION_CONFIRM and not booking_request.can_be_confirmed:
            raise serializers.ValidationError("This booking request cannot be confirmed.")
        if action == self.ACTION_DECLINE and not booking_request.can_be_declined:
            raise serializers.ValidationError("This booking request cannot be declined.")
        if action == self.ACTION_CANCEL_CLIENT and not booking_request.can_be_cancelled_by_client:
            raise serializers.ValidationError("This booking request cannot be cancelled by client.")
        if action == self.ACTION_CANCEL_THERAPIST and not booking_request.can_be_cancelled_by_therapist:
            raise serializers.ValidationError("This booking request cannot be cancelled by therapist.")

        return attrs

    def save(self, **kwargs):
        booking_request = self.instance or self.context.get("booking_request")
        action = self.validated_data["action"]

        if action == self.ACTION_CONFIRM:
            return booking_request.confirm(confirmed_by=kwargs.get("user"))
        if action == self.ACTION_DECLINE:
            return booking_request.decline(
                therapist_note=self.validated_data.get("therapist_response_note", "")
            )
        if action == self.ACTION_CANCEL_CLIENT:
            return booking_request.cancel_by_client(
                reason=self.validated_data.get("message_from_client", "")
            )
        if action == self.ACTION_CANCEL_THERAPIST:
            return booking_request.cancel_by_therapist(
                reason=self.validated_data.get("therapist_response_note", "")
            )
        return booking_request


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "title",
            "body",
            "is_read",
            "action_url",
            "created_at",
            "read_at",
        ]
        read_only_fields = [
            "created_at",
            "read_at",
        ]


class SessionRecordSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(read_only=True)

    class Meta:
        model = SessionRecord
        fields = "__all__"


# ----------------------------
# Notes / Templates
# ----------------------------
class NoteFieldSerializer(serializers.ModelSerializer):
    """Read serializer for fields inside a template."""
    class Meta:
        model = NoteField
        # expose full options to render checkboxes/select/likert in UI
        fields = ["id", "label", "field_type", "is_required", "order", "options"]


class NoteFieldWriteSerializer(serializers.ModelSerializer):
    """Write serializer for creating/updating fields via NoteTemplateSerializer.new_fields."""
    class Meta:
        model = NoteField
        fields = ["id", "label", "field_type", "is_required", "order", "options"]

    def validate(self, attrs):
        label = (attrs.get("label") or "").strip()
        if not label:
            raise serializers.ValidationError({"label": "Field label is required."})

        field_type = attrs.get("field_type")
        allowed = {"text", "textarea", "number", "date", "choice", "checkboxes", "select", "likert"}
        if field_type not in allowed:
            raise serializers.ValidationError({"field_type": "Invalid field type."})

        options = attrs.get("options", {}) or {}

        # For choice/select/checkboxes: ensure options.choices is list[str]
        if field_type in {"choice", "select", "checkboxes"}:
            choices = options.get("choices", [])
            if not isinstance(choices, list) or not all(isinstance(c, str) and c.strip() for c in choices):
                raise serializers.ValidationError(
                    {"options": {"choices": "Provide a list of non-empty strings."}}
                )

        # For likert: validate min/max & labels
        if field_type == "likert":
            try:
                min_v = int(options.get("min", 1))
                max_v = int(options.get("max", 5))
            except Exception:
                raise serializers.ValidationError({"options": "Likert min/max must be integers."})
            if min_v >= max_v:
                raise serializers.ValidationError({"options": "Likert min must be < max."})
            # labels optional; if present must be strings
            for k in ("min_label", "max_label"):
                if k in options and not isinstance(options[k], str):
                    raise serializers.ValidationError({"options": f"{k} must be a string."})

        return attrs


class NoteTemplateSerializer(serializers.ModelSerializer):
    fields = NoteFieldSerializer(many=True, read_only=True)
    new_fields = NoteFieldWriteSerializer(many=True, write_only=True, required=False)
    sections = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    class Meta:
        model = NoteTemplate
        fields = ["id", "name", "description", "fields", "new_fields", "sections"]

    def create(self, validated_data):
        new_fields = validated_data.pop("new_fields", [])
        sections = validated_data.pop("sections", [])
        template = NoteTemplate.objects.create(**validated_data)

        # 🔹 Persist sections (if provided)
        if sections:
            template.sections = sections
            template.save(update_fields=["sections"])
        elif new_fields:
            template.sections = [{"title": "Section 1", "description": "", "fields": new_fields}]
            template.save(update_fields=["sections"])

        # 🔹 Handle nested sections
        all_fields = []
        if sections:
            for s_index, section in enumerate(sections):
                for f_index, field in enumerate(section.get("fields", [])):
                    all_fields.append(field)
        else:
            all_fields = new_fields

        for order, f in enumerate(all_fields):
            NoteField.objects.create(
                template=template,
                label=f.get("label", "").strip(),
                field_type=f.get("field_type", "text"),
                is_required=bool(f.get("is_required", False)),
                order=f.get("order", order),
                options=f.get("options", {}) or {},
            )
        return template

    def update(self, instance, validated_data):
        new_fields = validated_data.pop("new_fields", [])
        sections = validated_data.pop("sections", [])
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if sections:
            instance.sections = sections
            instance.save(update_fields=["sections"])
        elif new_fields:
            instance.sections = [{"title": "Section 1", "description": "", "fields": new_fields}]
            instance.save(update_fields=["sections"])

        instance.fields.all().delete()
        all_fields = []
        if sections:
            for s_index, section in enumerate(sections):
                for f_index, field in enumerate(section.get("fields", [])):
                    all_fields.append(field)
        else:
            all_fields = new_fields

        for order, f in enumerate(all_fields):
            NoteField.objects.create(
                template=instance,
                label=f.get("label", "").strip(),
                field_type=f.get("field_type", "text"),
                is_required=bool(f.get("is_required", False)),
                order=f.get("order", order),
                options=f.get("options", {}) or {},
            )
        return instance




class NoteSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source="template.name", read_only=True)
    client_name = serializers.CharField(source="client.name", read_only=True)

    # Keep your read serializers:
    cosigners = TherapistProfileSerializer(many=True, read_only=True)
    cosigned_by = TherapistProfileSerializer(many=True, read_only=True)

    # ✅ Add a write-only field to accept cosigner IDs from the frontend
    cosigner_ids = serializers.PrimaryKeyRelatedField(
        source="cosigners",  # binds to the M2M field
        queryset=TherapistProfile.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Note
        fields = [
            "id",
            "therapist",
            "client",
            "client_name",
            "template",
            "template_name",
            "data",
            "status",
            "started_at",
            "finalized_at",
            "archived",
            "require_cosign",
            "cosigners",        # read
            "cosigned_by",      # read
            "cosigner_ids",     # write
            "cosign_completed",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "therapist",
            "started_at",
            "finalized_at",
            "created_at",
            "updated_at",
            "cosigners",
            "cosigned_by",
            "cosign_completed",
        ]

    def _ensure_dict(self, maybe_dict):
        # Guard: frontend might accidentally send a JSON string
        return maybe_dict if isinstance(maybe_dict, dict) else {}

    def create(self, validated_data):
        """
        therapist is injected by the ViewSet's perform_create(serializer.save(therapist=...)).
        client/template come through validated_data normally because they're in fields.
        """
        # Pull out write-only cosigner IDs (already validated as PKs)
        cosigners = validated_data.pop("cosigners", [])
        # Normalize data blob
        validated_data["data"] = self._ensure_dict(validated_data.get("data", {}))

        note = Note.objects.create(**validated_data)

        if cosigners:
            note.cosigners.set(cosigners)

        # auto-stamp finalization if caller created as final
        if note.status == "final" and not note.finalized_at:
            note.finalized_at = timezone.now()
            note.save(update_fields=["finalized_at"])

        return note

    def update(self, instance, validated_data):
        # pop write-only cosigner IDs (already validated as PKs)
        cosigners = validated_data.pop("cosigners", None)

        # update simple fields
        if "data" in validated_data:
            instance.data = self._ensure_dict(validated_data["data"])
        if "status" in validated_data:
            instance.status = validated_data["status"]
        if "require_cosign" in validated_data:
            instance.require_cosign = bool(validated_data["require_cosign"])
            # If no cosign required anymore, clear any pending cosigners
            if not instance.require_cosign:
                instance.cosigners.clear()

        # update cosigners if explicitly provided
        if cosigners is not None:
            instance.cosigners.set(cosigners)

        # stamp finalized_at on first transition to final
        if instance.status == "final" and not instance.finalized_at:
            instance.finalized_at = timezone.now()

        instance.save()
        return instance


# ----------------------------
# Files / Events / Schedule
# ----------------------------
class ClientFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientFile
        fields = "__all__"
        extra_kwargs = {"uploaded_by": {"read_only": True}}


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = "__all__"


class ScheduleEventSerializer(serializers.ModelSerializer):
    event_type_name = serializers.CharField(source="event_type.name", read_only=True)
    therapist_name = serializers.CharField(source="therapist.name", read_only=True)
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = ScheduleEvent
        fields = [
            "id",
            "title",
            "therapist",
            "therapist_name",
            "client",
            "client_name",
            "start_time",
            "end_time",
            "event_type",
            "event_type_name",
            "kind",
            "color",
            "notes",
            "attendance_status",
            "created_at",
        ]

    def validate(self, attrs):
        start = attrs.get("start_time") or getattr(self.instance, "start_time", None)
        end = attrs.get("end_time") or getattr(self.instance, "end_time", None)
        if start and end and end <= start:
            raise serializers.ValidationError({"end_time": "End time must be after start time."})
        return attrs


class WaitlistEntrySerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    therapist_name = serializers.CharField(source="therapist.name", read_only=True)
    event_type_name = serializers.CharField(source="event_type.name", read_only=True)

    class Meta:
        model = WaitlistEntry
        fields = [
            "id",
            "client",
            "client_name",
            "therapist",
            "therapist_name",
            "event_type",
            "event_type_name",
            "notes",
            "created_at",
        ]


# ----------------------------
# Client Experience / Premium
# ----------------------------
class ClientJournalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientJournal
        fields = "__all__"
        extra_kwargs = {"therapist": {"read_only": True}, "client": {"read_only": True}}


class ClientGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientGoal
        fields = "__all__"
        extra_kwargs = {"therapist": {"read_only": True}, "client": {"read_only": True}}


class ClientCheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientCheckin
        fields = "__all__"
        extra_kwargs = {"therapist": {"read_only": True}, "client": {"read_only": True}}


class TherapistMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistMaterial
        fields = "__all__"
        extra_kwargs = {"therapist": {"read_only": True}}


class MaterialShareSerializer(serializers.ModelSerializer):
    material_title = serializers.CharField(source="material.title", read_only=True)
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = MaterialShare
        fields = [
            "id",
            "material",
            "material_title",
            "client",
            "client_name",
            "shared_by",
            "note",
            "created_at",
        ]
        extra_kwargs = {"shared_by": {"read_only": True}}


class ResourceSerializer(serializers.ModelSerializer):
    therapist_name = serializers.CharField(source="therapist.name", read_only=True)
    resource_type_label = serializers.CharField(source="get_resource_type_display", read_only=True)

    class Meta:
        model = Resource
        fields = [
            "id",
            "therapist",
            "therapist_name",
            "title",
            "description",
            "resource_type",
            "resource_type_label",
            "file",
            "url",
            "text_content",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "therapist",
            "therapist_name",
            "resource_type_label",
            "created_at",
            "updated_at",
        ]


class ResourceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "description",
            "resource_type",
            "file",
            "url",
            "text_content",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        resource_type = attrs.get("resource_type", getattr(self.instance, "resource_type", None))
        file = attrs.get("file", getattr(self.instance, "file", None))
        url = attrs.get("url", getattr(self.instance, "url", None))
        text_content = attrs.get("text_content", getattr(self.instance, "text_content", None))

        if resource_type == Resource.ResourceType.FILE:
            if not file:
                raise serializers.ValidationError({"file": "A file is required for file resources."})
            if url or text_content:
                raise serializers.ValidationError("File resources cannot include link or text content.")
        elif resource_type == Resource.ResourceType.LINK:
            if not url:
                raise serializers.ValidationError({"url": "A URL is required for link resources."})
            if file or text_content:
                raise serializers.ValidationError("Link resources cannot include file or text content.")
        elif resource_type == Resource.ResourceType.TEXT:
            if not text_content:
                raise serializers.ValidationError({"text_content": "Text content is required for text resources."})
            if file or url:
                raise serializers.ValidationError("Text resources cannot include file or link content.")
        return attrs


class SharedResourceAssignmentSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source="resource.title", read_only=True)
    resource_type = serializers.CharField(source="resource.resource_type", read_only=True)
    resource_type_label = serializers.CharField(source="resource.get_resource_type_display", read_only=True)
    resource_url = serializers.CharField(source="resource.url", read_only=True)
    resource_file = serializers.FileField(source="resource.file", read_only=True)
    resource_text_content = serializers.CharField(source="resource.text_content", read_only=True)
    assigned_by_name = serializers.CharField(source="assigned_by.name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.name", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = SharedResourceAssignment
        fields = [
            "id",
            "therapeutic_relationship",
            "resource",
            "resource_title",
            "resource_type",
            "resource_type_label",
            "resource_url",
            "resource_file",
            "resource_text_content",
            "assigned_by",
            "assigned_by_name",
            "assigned_to",
            "assigned_to_name",
            "therapist_note",
            "status",
            "status_label",
            "assigned_at",
            "viewed_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "therapeutic_relationship",
            "assigned_by",
            "assigned_by_name",
            "assigned_to_name",
            "status_label",
            "assigned_at",
            "viewed_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]


class SharedResourceAssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedResourceAssignment
        fields = [
            "resource",
            "assigned_to",
            "therapist_note",
        ]

    def validate(self, attrs):
        therapist = self.context.get("therapist")
        if not therapist:
            raise serializers.ValidationError("Therapist profile required.")

        resource = attrs.get("resource")
        if resource and resource.therapist_id != therapist.id:
            raise serializers.ValidationError({"resource": "Resource must belong to the therapist."})
        if resource and not resource.is_active:
            raise serializers.ValidationError({"resource": "Resource must be active to assign."})

        client = attrs.get("assigned_to")
        if not client:
            raise serializers.ValidationError({"assigned_to": "Client is required."})

        relationship = TherapeuticRelationship.objects.filter(
            therapist=therapist,
            client=client,
            status=TherapeuticRelationship.Status.ACTIVE,
        ).first()
        if not relationship:
            raise serializers.ValidationError(
                {"assigned_to": "An active therapeutic relationship is required to assign resources."}
            )

        attrs["therapeutic_relationship"] = relationship
        return attrs


class TherapistApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistApplication
        fields = "__all__"

    def _coerce_list(self, value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [v.strip() for v in value.split(",") if v.strip()]
        return []

    def validate(self, attrs):
        licensed = self._coerce_list(attrs.get("licensed_countries"))
        languages = self._coerce_list(attrs.get("languages"))
        expertise = self._coerce_list(attrs.get("expertise_areas"))
        populations = self._coerce_list(attrs.get("populations"))
        supervisions = self._coerce_list(attrs.get("supervisions_detailed"))
        trainings = self._coerce_list(attrs.get("trainings_detailed"))
        
        attrs["licensed_countries"] = licensed
        attrs["languages"] = languages
        attrs["expertise_areas"] = expertise
        attrs["populations"] = populations
        attrs["supervisions_detailed"] = supervisions
        attrs["trainings_detailed"] = trainings

        if not licensed:
            hc = attrs.get("home_country")
            if hc:
                attrs["licensed_countries"] = [hc]
        
        return attrs


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = "__all__"


class TherapistDirectorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    title = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    photo_url = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    specialties = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class HomeContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeContent
        fields = "__all__"


class AboutContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutContent
        fields = "__all__"


class TherapistsContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistsContent
        fields = "__all__"


class ServicesContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicesContent
        fields = "__all__"


class ContactContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactContent
        fields = "__all__"


class TrainingProgramsContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingProgramsContent
        fields = "__all__"


class CareersContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareersContent
        fields = "__all__"


class TherapistApplyContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistApplyContent
        fields = "__all__"

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"

class QuickBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickBooking
        fields = "__all__"

class SafetyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SafetyPlan
        fields = "__all__"

class TherapeuticRelationshipSerializer(serializers.ModelSerializer):
    therapist_name = serializers.ReadOnlyField(source="therapist.name")
    client_name = serializers.ReadOnlyField(source="client.name")
    
    class Meta:
        model = TherapeuticRelationship
        fields = "__all__"
