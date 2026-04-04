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
    EventType,
    ScheduleEvent,
    WaitlistEntry,
    TherapistSessionLink,
    ClientJournal,
    ClientGoal,
    ClientCheckin,
    TherapistMaterial,
    MaterialShare,
    TherapistApplication,
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

    class Meta:
        model = ClientProfile
        fields = "__all__"
        extra_kwargs = {
            "therapist": {"read_only": True},
        }


class AppointmentSerializer(serializers.ModelSerializer):
    client = ClientProfileSerializer(read_only=True)
    therapist = TherapistProfileSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = "__all__"


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
        attrs["licensed_countries"] = licensed
        attrs["languages"] = languages

        if not licensed:
            raise serializers.ValidationError(
                {"licensed_countries": "Select at least one country of licensure."}
            )
        if not attrs.get("home_country"):
            raise serializers.ValidationError({"home_country": "Home country is required."})
        if not attrs.get("home_city"):
            raise serializers.ValidationError({"home_city": "Home city is required."})
        if not attrs.get("home_postal_code"):
            raise serializers.ValidationError({"home_postal_code": "Postal code is required."})
        return attrs
