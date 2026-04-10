from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# ===========================
# 🔹 Therapist & Client Models
# ===========================
class TherapistProfile(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    is_premium = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.name


class TherapistSessionLink(models.Model):
    therapist = models.ForeignKey(
        TherapistProfile, on_delete=models.CASCADE, related_name="session_links"
    )
    name = models.CharField(max_length=100, default="Session link")
    url = models.URLField()
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_default", "created_at"]

    def save(self, *args, **kwargs):
        # Ensure only one default per therapist
        if self.is_default:
            TherapistSessionLink.objects.filter(
                therapist=self.therapist, is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.therapist.name} — {self.name}"


class ClientProfile(models.Model):
    # Core identity
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=50, blank=True, null=True)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    preferred_first_name = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    sex = models.CharField(max_length=50, blank=True, null=True)
    gender_identity = models.CharField(max_length=100, blank=True, null=True)
    pronouns = models.JSONField(default=list, blank=True)
    extra_information = models.TextField(blank=True, null=True)

    # Contact
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    phone_type = models.CharField(max_length=50, blank=True, null=True)
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    address_line3 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    post_code = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    time_zone = models.CharField(max_length=100, blank=True, null=True)

    # Notes & privacy
    appointment_notes = models.TextField(blank=True, null=True)
    privacy_policy_status = models.CharField(max_length=20, blank=True, null=True)

    # Relationships
    related_patients = models.JSONField(default=list, blank=True)

    # Communication preferences
    reminder_sms = models.BooleanField(default=False)
    reminder_email = models.BooleanField(default=False)
    followup_sms = models.BooleanField(default=False)
    followup_email = models.BooleanField(default=False)
    marketing_sms = models.BooleanField(default=False)
    marketing_email = models.BooleanField(default=False)
    receive_booking_confirmation = models.BooleanField(default=False)
    receive_booking_cancellation = models.BooleanField(default=False)

    # Billing
    concession_type = models.CharField(max_length=100, blank=True, null=True)
    invoice_to = models.TextField(blank=True, null=True)
    invoice_email_to = models.CharField(max_length=255, blank=True, null=True)
    invoice_extra_information = models.CharField(max_length=255, blank=True, null=True)

    # Other information
    occupation = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact = models.CharField(max_length=255, blank=True, null=True)
    medicare_number = models.CharField(max_length=100, blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    referring_doctor = models.CharField(max_length=255, blank=True, null=True)

    # Referral source
    referral_type = models.CharField(max_length=100, blank=True, null=True)

    # Administrative
    nationality = models.CharField(max_length=100, blank=True, null=True)
    civil_id_number = models.CharField(max_length=100, blank=True, null=True)
    patient_file_number = models.CharField(max_length=100, blank=True, null=True)
    terminated_patient = models.BooleanField(default=False)
    termination_reasons = models.JSONField(default=list, blank=True)
    termination_notes = models.TextField(blank=True, null=True)

    therapist = models.ForeignKey(
        TherapistProfile, on_delete=models.CASCADE, related_name="clients"
    )
    is_premium = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.name


class TherapistApplication(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    home_country = models.CharField(max_length=100)
    home_city = models.CharField(max_length=100)
    home_postal_code = models.CharField(max_length=50)
    licensed_countries = models.JSONField(default=list, blank=True)
    has_private_practice = models.CharField(max_length=20)
    open_to_in_person = models.CharField(max_length=20)
    office_space = models.CharField(max_length=100, blank=True, null=True)
    in_person_country = models.CharField(max_length=100, blank=True, null=True)
    in_person_street = models.CharField(max_length=255, blank=True, null=True)
    in_person_city = models.CharField(max_length=100, blank=True, null=True)
    in_person_state = models.CharField(max_length=100, blank=True, null=True)
    in_person_postal_code = models.CharField(max_length=50, blank=True, null=True)
    years_experience = models.CharField(max_length=50)
    languages = models.JSONField(default=list, blank=True)
    treat_minors = models.CharField(max_length=20)
    youngest_age = models.CharField(max_length=50)
    referral_source = models.CharField(max_length=100)
    referral_name = models.CharField(max_length=255, blank=True, null=True)
    resume = models.FileField(upload_to="therapist_applications/resumes/", blank=True, null=True)
    subscribe = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    review_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.email})"


# ===========================
# 🔹 Appointment & Session Models
# ===========================
class Appointment(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    therapist = models.ForeignKey(TherapistProfile, on_delete=models.CASCADE)
    date = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.client.name} - {self.date.strftime('%Y-%m-%d %H:%M')}"


class SessionRecord(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE)
    summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Session for {self.appointment.client.name}"


# ===========================
# 🔹 Dynamic Notes System
# ===========================
class NoteTemplate(models.Model):
    """Reusable template for therapist notes (e.g., Intake, Progress Note)."""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    sections = models.JSONField(default=list, blank=True)

    def __str__(self) -> str:
        return self.name


class NoteField(models.Model):
    """Defines fields within a given template (e.g., 'Mood', 'Goals', etc.)."""
    template = models.ForeignKey(
        NoteTemplate, related_name="fields", on_delete=models.CASCADE
    )
    label = models.CharField(max_length=255)
    field_type = models.CharField(
        max_length=50,
        choices=[
            ("text", "Text"),
            ("textarea", "Textarea"),
            ("number", "Number"),
            ("date", "Date"),
            ("choice", "Multiple Choice"),
            ("checkboxes", "Checkbox Group"),
            ("select", "Dropdown"),
            ("likert", "Likert Scale"),
        ],
    )
    is_required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    # Generic per-type configuration (choices, allow_other, likert bounds/labels, etc.)
    options = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self) -> str:
        return f"{self.template.name} - {self.label}"


class Note(models.Model):
    """Actual filled-in note linked to a client, therapist, and template."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending_cosign", "Pending Co-Sign"),
        ("final", "Final"),
    ]

    therapist = models.ForeignKey(
        TherapistProfile, on_delete=models.CASCADE, related_name="notes"
    )
    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="notes"
    )
    template = models.ForeignKey(NoteTemplate, on_delete=models.CASCADE)
    data = models.JSONField(default=dict)

    # 🕓 workflow tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # ----------------------------
    # 🔹 Co-sign System
    # ----------------------------

    require_cosign = models.BooleanField(default=False)
    cosigners = models.ManyToManyField(
        TherapistProfile,
        related_name="cosign_notes",
        blank=True,
        help_text="Therapists selected to co-sign this note."
    )
    cosigned_by = models.ManyToManyField(
        TherapistProfile,
        related_name="cosigned_notes",
        blank=True,
        help_text="Therapists who have completed co-signing this note."
    )
    cosign_completed = models.BooleanField(default=False)

    started_at = models.DateTimeField(default=timezone.now, editable=False)
    finalized_at = models.DateTimeField(null=True, blank=True)
    archived = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # ✅ stamp finalization time when moved to final
        if self.status == "final" and not self.finalized_at:
            self.finalized_at = timezone.now()

        # ✅ auto-finalize when all co-signers have signed
        if self.require_cosign and self.status == "pending_cosign":
            total = self.cosigners.count()
            signed = self.cosigned_by.count()
            if total > 0 and signed >= total:
                self.status = "final"
                self.finalized_at = timezone.now()
                self.cosigned_at = timezone.now()

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.client.name} - {self.template.name} ({self.status})"


# ===========================
# 🔹 Client File Uploads
# ===========================
class ClientFile(models.Model):
    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="files"
    )
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to="client_files/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.client.name} - {self.file.name}"


# ===========================
# 🔹 Schedule Model (Cliniko-style)
# ===========================
class EventType(models.Model):
    """Flexible, color-coded types for scheduling (e.g., Follow-up, Workshop, Leave)."""
    name = models.CharField(max_length=80, unique=True)
    color = models.CharField(max_length=7, default="#A9CBB7")  # HEX like #C9A960
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name


class ScheduleEvent(models.Model):
    therapist = models.ForeignKey(
        TherapistProfile, on_delete=models.CASCADE, related_name="events"
    )
    client = models.ForeignKey(
        ClientProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )

    title = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    event_type = models.ForeignKey(
        EventType, on_delete=models.SET_NULL, null=True, blank=True, related_name="events"
    )

    kind = models.CharField(
        max_length=30,
        choices=[
            ("appointment", "Appointment"),
            ("admin", "Admin Time"),
            ("break", "Break"),
            ("meeting", "Meeting"),
            ("leave", "Leave"),
            ("outreach", "Outreach"),
            ("task", "Task"),
        ],
        default="appointment",
    )

    color = models.CharField(max_length=20, default="#A9CBB7")
    notes = models.TextField(blank=True, null=True)
    attendance_status = models.CharField(
        max_length=20,
        choices=[
            ("arrived", "Arrived"),
            ("did_not_arrive", "Did not arrive"),
        ],
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto-apply color from event type if color not explicitly set
        if self.event_type and (not self.color or self.color == "#A9CBB7"):
            self.color = self.event_type.color
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.title} ({self.therapist.name})"


class WaitlistEntry(models.Model):
    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="waitlist_entries"
    )
    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="waitlist_entries",
    )
    event_type = models.ForeignKey(
        EventType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="waitlist_entries",
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.client.name} (wait list)"


# ===========================
# 🔹 Client Experience Models
# ===========================
class ClientJournal(models.Model):
    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="journals"
    )
    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="client_journals",
    )
    entry = models.TextField()
    mood = models.CharField(max_length=50, blank=True, null=True)
    shared_with_therapist = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.client.name} journal ({self.created_at.date()})"


class ClientGoal(models.Model):
    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="goals"
    )
    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="client_goals",
    )
    title = models.CharField(max_length=255)
    created_by = models.CharField(
        max_length=20,
        choices=[("client", "Client"), ("therapist", "Therapist")],
        default="client",
    )
    progress = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.client.name} goal: {self.title}"


class ClientCheckin(models.Model):
    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="checkins"
    )
    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="client_checkins",
    )
    checkin_date = models.DateField(default=timezone.now)
    mood = models.CharField(max_length=50, blank=True, null=True)
    energy = models.CharField(max_length=50, blank=True, null=True)
    stress = models.CharField(max_length=50, blank=True, null=True)
    sleep_hours = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    gratitude = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-checkin_date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.client.name} check-in ({self.checkin_date})"


class TherapistMaterial(models.Model):
    therapist = models.ForeignKey(
        TherapistProfile, on_delete=models.CASCADE, related_name="materials"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to="therapist_materials/", blank=True, null=True)
    is_library = models.BooleanField(default=False)
    is_premium_only = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.therapist.name} material: {self.title}"


class MaterialShare(models.Model):
    material = models.ForeignKey(
        TherapistMaterial, on_delete=models.CASCADE, related_name="shares"
    )
    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="material_shares"
    )
    shared_by = models.ForeignKey(
        TherapistProfile, on_delete=models.SET_NULL, null=True, related_name="shares_made"
    )
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("material", "client")

    def __str__(self) -> str:
        return f"{self.material.title} → {self.client.name}"


# ===========================
# 🔹 Public Website Content
# ===========================
class TeamMember(models.Model):
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    photo_url = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    specialties = models.TextField(blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return self.name


class Service(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    cta_label = models.CharField(max_length=100, blank=True, null=True)
    cta_link = models.CharField(max_length=255, blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self) -> str:
        return self.title
