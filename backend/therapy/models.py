from django.db import models, transaction
from django.apps import apps
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Q, F, Case, When, Value, IntegerField
from django.utils import timezone
from .notifications import get_scheduling_action_url

# ===========================
# 🔹 Therapist & Client Models
# ===========================
class TherapistProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="therapist_profile",
        help_text="Auth user linked to this therapist profile.",
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    is_premium = models.BooleanField(default=False)
    business_hours = models.JSONField(
        default=dict,
        blank=True,
        help_text="Stores repeating availability. Example: {'1': [{'startTime': '09:00', 'endTime': '17:00'}]}"
    )

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
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="client_profile",
        help_text="Auth user linked to this client profile.",
    )
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
        TherapistProfile, on_delete=models.CASCADE, related_name="clients", null=True, blank=True
    )
    is_premium = models.BooleanField(default=False)

    @property
    def has_active_relationship(self):
        return self.relationships.filter(status="active").exists()

    @property
    def is_first_session_eligible(self):
        has_appointments = apps.get_model("therapy", "Appointment").objects.filter(client=self).exists()
        has_requests = apps.get_model("therapy", "BookingRequest").objects.filter(client=self).exists()
        return not has_appointments and not has_requests

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
# 🔹 Therapist ↔ Client Relationship
# ===========================
class TherapeuticRelationship(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PAUSED = "paused", "Paused"
        ENDED = "ended", "Ended"

    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.CASCADE,
        related_name="relationships",
        help_text="Therapist in this relationship.",
    )
    client = models.ForeignKey(
        ClientProfile,
        on_delete=models.CASCADE,
        related_name="relationships",
        help_text="Client in this relationship.",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        help_text="Current relationship status.",
    )
    is_primary = models.BooleanField(
        default=False,
        help_text="Marks the primary therapist for this client.",
    )
    started_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the relationship started.",
    )
    ended_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the relationship ended (if ended).",
    )
    notes = models.TextField(
        blank=True,
        help_text="Internal notes about this relationship.",
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Therapeutic relationship"
        verbose_name_plural = "Therapeutic relationships"
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["therapist", "status", "started_at"]),
            models.Index(fields=["client", "status", "started_at"]),
            models.Index(fields=["status", "started_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(ended_at__gt=F("started_at")) | Q(ended_at__isnull=True),
                name="relationship_end_after_start",
            ),
            models.UniqueConstraint(
                fields=["therapist", "client"],
                condition=Q(status="active"),
                name="unique_active_relationship_per_pair",
            ),
            models.UniqueConstraint(
                fields=["client"],
                condition=Q(status="active", is_primary=True),
                name="unique_primary_therapist_per_client",
            ),
        ]

    def clean(self):
        if self.ended_at and self.ended_at <= self.started_at:
            raise ValidationError(
                {"ended_at": "End time must be after start time."}
            )
        if self.status == self.Status.ENDED and not self.ended_at:
            raise ValidationError(
                {"ended_at": "Ended relationships must have an end date."}
            )
        if self.is_primary and self.status != self.Status.ACTIVE:
            raise ValidationError(
                {"is_primary": "Only active relationships can be primary."}
            )
        super().clean()

    @property
    def is_active(self):
        return self.status == self.Status.ACTIVE

    @property
    def display_status_label(self):
        return self.get_status_display()

    def __str__(self) -> str:
        return f"{self.client.name} ↔ {self.therapist.name} ({self.get_status_display()})"

# ===========================
# 🔹 Scheduling Models
# ===========================
class AvailabilitySlot(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        HELD = "held", "Held"
        BLOCKED = "blocked", "Blocked"
        BOOKED = "booked", "Booked"
        EXPIRED = "expired", "Expired"

    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.CASCADE,
        related_name="availability_slots",
        help_text="Therapist who created this availability slot.",
    )
    start_time = models.DateTimeField(help_text="Start time of the slot.")
    end_time = models.DateTimeField(help_text="End time of the slot.")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        help_text="Current status of this slot.",
    )
    visible_to_clients = models.BooleanField(
        default=True,
        help_text="If true, this slot can appear in the client booking interface.",
    )
    held_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="If held, the time until which this slot remains reserved.",
    )
    notes = models.TextField(
        blank=True,
        help_text="Internal notes for therapist/admin use only.",
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Availability slot"
        verbose_name_plural = "Availability slots"
        ordering = ["start_time"]
        indexes = [
            models.Index(fields=["therapist", "start_time"]),
            models.Index(fields=["therapist", "status", "start_time"]),
            models.Index(fields=["status", "visible_to_clients", "start_time"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(end_time__gt=F("start_time")),
                name="availability_end_after_start",
            ),
        ]

    def clean(self):
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValidationError(
                    {"end_time": "End time must be after start time."}
                )
        if self.therapist_id and self.start_time and self.end_time:
            overlap_statuses = [
                self.Status.OPEN,
                self.Status.HELD,
                self.Status.BOOKED,
                self.Status.BLOCKED,
            ]
            overlapping = AvailabilitySlot.objects.filter(
                therapist=self.therapist,
                status__in=overlap_statuses,
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
            ).exclude(pk=self.pk)
            if overlapping.exists():
                raise ValidationError(
                    "This availability overlaps an existing active slot."
                )
        super().clean()

    @property
    def is_future(self):
        return bool(self.start_time and self.start_time > timezone.now())

    @property
    def is_open_for_booking(self):
        return (
            self.status == self.Status.OPEN
            and self.visible_to_clients
            and self.is_future
        )

    @property
    def duration_minutes(self):
        if not self.start_time or not self.end_time:
            return 0
        return int((self.end_time - self.start_time).total_seconds() / 60)

    @property
    def can_be_requested(self):
        return self.is_open_for_booking

    @property
    def can_be_deleted(self):
        return self.status in {self.Status.OPEN, self.Status.BLOCKED, self.Status.EXPIRED}

    @property
    def display_status_label(self):
        return self.get_status_display()

    def __str__(self) -> str:
        time_range = f"{self.start_time:%b %d, %Y %I:%M %p} - {self.end_time:%I:%M %p}"
        return f"{self.therapist.name} · {time_range} · {self.get_status_display()}"


class BookingRequestManager(models.Manager):
    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .annotate(
                _pending_order=Case(
                    When(status=self.model.Status.PENDING, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            )
            .order_by("_pending_order", "-created_at")
        )


class BookingRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Awaiting confirmation"
        CONFIRMED = "confirmed", "Confirmed"
        DECLINED = "declined", "Declined"
        CANCELLED_BY_CLIENT = "cancelled_by_client", "Cancelled by client"
        CANCELLED_BY_THERAPIST = "cancelled_by_therapist", "Cancelled by therapist"
        EXPIRED = "expired", "Expired"

    client = models.ForeignKey(
        ClientProfile,
        on_delete=models.CASCADE,
        related_name="booking_requests",
    )
    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.CASCADE,
        related_name="booking_requests",
    )
    availability_slot = models.ForeignKey(
        AvailabilitySlot,
        on_delete=models.CASCADE,
        related_name="booking_requests",
    )
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.PENDING,
        help_text="Current status of this booking request.",
    )
    message_from_client = models.TextField(
        blank=True,
        help_text="Optional message from the client to the therapist.",
    )
    therapist_response_note = models.TextField(
        blank=True,
        help_text="Optional response note from the therapist.",
    )
    is_first_session_free = models.BooleanField(
        default=False,
        help_text="Whether this booking request exercises the client's first 30-min free session."
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    objects = BookingRequestManager()

    class Meta:
        verbose_name = "Booking request"
        verbose_name_plural = "Booking requests"
        indexes = [
            models.Index(fields=["therapist", "status", "created_at"]),
            models.Index(fields=["client", "status", "created_at"]),
            models.Index(fields=["availability_slot", "status"]),
            models.Index(fields=["status", "created_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["availability_slot"],
                condition=Q(status__in=["pending", "confirmed"]),
                name="unique_active_request_per_slot",
            )
        ]

    def clean(self):
        if self.availability_slot_id and self.therapist_id:
            if self.availability_slot.therapist_id != self.therapist_id:
                raise ValidationError(
                    {"therapist": "Therapist must match availability slot therapist."}
                )
        if self.availability_slot and self.availability_slot.start_time:
            if self.pk is None and self.availability_slot.start_time <= timezone.now():
                raise ValidationError("Booking requests must target future slots.")
        if self.status in {self.Status.PENDING, self.Status.CONFIRMED}:
            if self.pk is None and self.status == self.Status.PENDING:
                if not self.availability_slot.can_be_requested:
                    raise ValidationError("This slot is not available for booking.")
        super().clean()

    @property
    def is_pending(self):
        return self.status == self.Status.PENDING

    @property
    def is_active(self):
        return self.status in {self.Status.PENDING, self.Status.CONFIRMED}

    @property
    def can_be_confirmed(self):
        if self.status != self.Status.PENDING:
            return False
        if self.expires_at and timezone.now() >= self.expires_at:
            return False
        return True

    @property
    def can_be_declined(self):
        return self.status == self.Status.PENDING

    @property
    def can_be_cancelled_by_client(self):
        return self.status in {self.Status.PENDING, self.Status.CONFIRMED}

    @property
    def can_be_cancelled_by_therapist(self):
        return self.status in {self.Status.PENDING, self.Status.CONFIRMED}

    @property
    def should_expire(self):
        return bool(self.expires_at and timezone.now() >= self.expires_at and self.status == self.Status.PENDING)

    @property
    def display_status_label(self):
        return self.get_status_display()

    def __str__(self) -> str:
        slot_time = self.availability_slot.start_time if self.availability_slot_id else None
        slot_label = slot_time.strftime("%b %d, %Y %I:%M %p") if slot_time else "Unknown time"
        return f"{self.client.name} → {self.therapist.name} · {slot_label} · {self.get_status_display()}"

    def _create_notification(self, recipient, notification_type, title, body, action_url=""):
        if not recipient:
            return None
        Notification = apps.get_model("therapy", "Notification")
        return Notification.objects.create(
            recipient_user_profile=recipient,
            type=notification_type,
            title=title,
            body=body,
            related_model=self.__class__.__name__,
            related_id=str(self.pk),
            action_url=action_url or "",
        )

    def _ensure_relationship(self):
        relationships = TherapeuticRelationship.objects.filter(
            therapist=self.therapist,
            client=self.client,
        ).order_by("-started_at")

        relationship = relationships.filter(
            status=TherapeuticRelationship.Status.ACTIVE
        ).first()

        if not relationship:
            paused = relationships.filter(
                status=TherapeuticRelationship.Status.PAUSED
            ).first()
            if paused:
                paused.status = TherapeuticRelationship.Status.ACTIVE
                paused.ended_at = None
                paused.save(update_fields=["status", "ended_at", "updated_at"])
                relationship = paused
            else:
                relationship = TherapeuticRelationship.objects.create(
                    therapist=self.therapist,
                    client=self.client,
                    status=TherapeuticRelationship.Status.ACTIVE,
                    is_primary=False,
                    started_at=timezone.now(),
                )

        if not TherapeuticRelationship.objects.filter(
            client=self.client,
            status=TherapeuticRelationship.Status.ACTIVE,
            is_primary=True,
        ).exists():
            relationship.is_primary = True
            relationship.save(update_fields=["is_primary", "updated_at"])

        return relationship

    def confirm(self, confirmed_by=None):
        if not self.can_be_confirmed:
            raise ValidationError("This booking request cannot be confirmed.")

        with transaction.atomic():
            slot = AvailabilitySlot.objects.select_for_update().get(pk=self.availability_slot_id)
            if slot.status in {AvailabilitySlot.Status.BOOKED, AvailabilitySlot.Status.BLOCKED, AvailabilitySlot.Status.EXPIRED}:
                raise ValidationError("This slot can no longer be booked.")
            if slot.start_time and slot.start_time <= timezone.now():
                raise ValidationError("This slot can no longer be booked.")

            self.status = self.Status.CONFIRMED
            self.responded_at = timezone.now()
            self.save(update_fields=["status", "responded_at", "updated_at"])

            slot.status = AvailabilitySlot.Status.BOOKED
            slot.held_until = None
            slot.save(update_fields=["status", "held_until", "updated_at"])

            appointment, created = Appointment.objects.get_or_create(
                booking_request=self,
                defaults={
                    "client": self.client,
                    "therapist": self.therapist,
                    "availability_slot": slot,
                    "start_time": slot.start_time,
                    "end_time": slot.start_time + timezone.timedelta(minutes=30) if self.is_first_session_free else slot.end_time,
                    "date": slot.start_time,
                    "status": Appointment.Status.SCHEDULED,
                    "is_first_session_free": self.is_first_session_free,
                },
            )
            if not created:
                updated_fields = []
                if appointment.availability_slot_id != slot.id:
                    appointment.availability_slot = slot
                    updated_fields.append("availability_slot")
                if appointment.start_time != slot.start_time:
                    appointment.start_time = slot.start_time
                    updated_fields.append("start_time")
                if appointment.end_time != slot.end_time:
                    appointment.end_time = slot.end_time
                    updated_fields.append("end_time")
                if appointment.date != slot.start_time:
                    appointment.date = slot.start_time
                    updated_fields.append("date")
                if updated_fields:
                    appointment.save(update_fields=updated_fields + ["updated_at"])

            self._ensure_relationship()

        self._create_notification(
            recipient=getattr(self.client, "user", None),
            notification_type=Notification.Type.BOOKING_REQUEST_CONFIRMED,
            title="Your booking was confirmed",
            body="Your therapist confirmed your session request.",
            action_url=get_scheduling_action_url(
                Notification.Type.BOOKING_REQUEST_CONFIRMED,
                recipient=getattr(self.client, "user", None),
            ),
        )
        self._create_notification(
            recipient=getattr(self.therapist, "user", None),
            notification_type=Notification.Type.BOOKING_REQUEST_CONFIRMED,
            title="Booking confirmed",
            body="You confirmed a booking request.",
            action_url=get_scheduling_action_url(
                Notification.Type.BOOKING_REQUEST_CONFIRMED,
                recipient=getattr(self.therapist, "user", None),
            ),
        )

        return self

    def decline(self, therapist_note=""):
        if not self.can_be_declined:
            raise ValidationError("This booking request cannot be declined.")
        self.status = self.Status.DECLINED
        self.responded_at = timezone.now()
        if therapist_note:
            self.therapist_response_note = therapist_note
        self.save(update_fields=["status", "responded_at", "therapist_response_note", "updated_at"])

        if self.availability_slot_id:
            slot = AvailabilitySlot.objects.filter(pk=self.availability_slot_id).first()
            if slot and slot.status == AvailabilitySlot.Status.HELD and slot.start_time > timezone.now():
                slot.status = AvailabilitySlot.Status.OPEN
                slot.held_until = None
                slot.save(update_fields=["status", "held_until", "updated_at"])

        self._create_notification(
            recipient=getattr(self.client, "user", None),
            notification_type=Notification.Type.BOOKING_REQUEST_DECLINED,
            title="Your booking was declined",
            body="Your therapist declined the session request.",
            action_url=get_scheduling_action_url(
                Notification.Type.BOOKING_REQUEST_DECLINED,
                recipient=getattr(self.client, "user", None),
            ),
        )
        return self

    def cancel_by_client(self, reason=""):
        if not self.can_be_cancelled_by_client:
            raise ValidationError("This booking request cannot be cancelled by client.")
        self.status = self.Status.CANCELLED_BY_CLIENT
        self.responded_at = timezone.now()
        if reason:
            self.message_from_client = reason
        self.save(update_fields=["status", "responded_at", "message_from_client", "updated_at"])

        if self.availability_slot_id:
            slot = AvailabilitySlot.objects.filter(pk=self.availability_slot_id).first()
            if slot and slot.status in {AvailabilitySlot.Status.HELD, AvailabilitySlot.Status.OPEN} and slot.start_time > timezone.now():
                slot.status = AvailabilitySlot.Status.OPEN
                slot.held_until = None
                slot.save(update_fields=["status", "held_until", "updated_at"])

        self._create_notification(
            recipient=getattr(self.therapist, "user", None),
            notification_type=Notification.Type.BOOKING_REQUEST_CANCELLED,
            title="Booking cancelled",
            body="A client cancelled their booking request.",
            action_url=get_scheduling_action_url(
                Notification.Type.BOOKING_REQUEST_CANCELLED,
                recipient=getattr(self.therapist, "user", None),
            ),
        )
        return self

    def cancel_by_therapist(self, reason=""):
        if not self.can_be_cancelled_by_therapist:
            raise ValidationError("This booking request cannot be cancelled by therapist.")
        self.status = self.Status.CANCELLED_BY_THERAPIST
        self.responded_at = timezone.now()
        if reason:
            self.therapist_response_note = reason
        self.save(update_fields=["status", "responded_at", "therapist_response_note", "updated_at"])

        if self.availability_slot_id:
            slot = AvailabilitySlot.objects.filter(pk=self.availability_slot_id).first()
            if slot and slot.status in {AvailabilitySlot.Status.HELD, AvailabilitySlot.Status.OPEN} and slot.start_time > timezone.now():
                slot.status = AvailabilitySlot.Status.OPEN
                slot.held_until = None
                slot.save(update_fields=["status", "held_until", "updated_at"])

        self._create_notification(
            recipient=getattr(self.client, "user", None),
            notification_type=Notification.Type.BOOKING_REQUEST_CANCELLED,
            title="Booking cancelled",
            body="Your therapist cancelled the booking request.",
            action_url=get_scheduling_action_url(
                Notification.Type.BOOKING_REQUEST_CANCELLED,
                recipient=getattr(self.client, "user", None),
            ),
        )
        return self


# ===========================
# 🔹 Appointment & Session Models
# ===========================
class Appointment(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    therapist = models.ForeignKey(TherapistProfile, on_delete=models.CASCADE)
    date = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    booking_request = models.OneToOneField(
        BookingRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointment",
        help_text="The booking request that created this appointment.",
    )
    availability_slot = models.ForeignKey(
        AvailabilitySlot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
        help_text="Availability slot linked to this appointment.",
    )
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_first_session_free = models.BooleanField(
        default=False,
        help_text="True if this appointment is a 30-min free session."
    )

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No show"
        RESCHEDULED = "rescheduled", "Rescheduled"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        help_text="Current appointment status.",
    )
    cancellation_reason = models.TextField(blank=True)
    cancelled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_appointments",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_time", "date"]
        indexes = [
            models.Index(fields=["therapist", "start_time", "status"]),
            models.Index(fields=["client", "start_time", "status"]),
            models.Index(fields=["status", "start_time"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(end_time__gt=F("start_time")) | Q(start_time__isnull=True) | Q(end_time__isnull=True),
                name="appointment_end_after_start",
            ),
            models.UniqueConstraint(
                fields=["availability_slot"],
                condition=Q(status__in=["scheduled", "rescheduled"]),
                name="unique_active_appointment_per_slot",
            ),
        ]

    def clean(self):
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValidationError({"end_time": "End time must be after start time."})
        if self.booking_request:
            if self.booking_request.status != BookingRequest.Status.CONFIRMED:
                raise ValidationError("Appointments should be created from confirmed requests.")
            if self.booking_request.therapist_id != self.therapist_id:
                raise ValidationError("Therapist must match booking request.")
            if self.booking_request.client_id != self.client_id:
                raise ValidationError("Client must match booking request.")
            if self.availability_slot and self.booking_request.availability_slot_id != self.availability_slot_id:
                raise ValidationError("Availability slot must match booking request.")
        if self.availability_slot and self.availability_slot.therapist_id != self.therapist_id:
            raise ValidationError("Availability slot therapist must match appointment therapist.")
        super().clean()

    @property
    def effective_start_time(self):
        return self.start_time or self.date

    @property
    def effective_end_time(self):
        return self.end_time

    @property
    def is_upcoming(self):
        return bool(self.effective_start_time and self.effective_start_time > timezone.now())

    @property
    def is_past(self):
        if self.effective_end_time:
            return self.effective_end_time < timezone.now()
        return bool(self.effective_start_time and self.effective_start_time < timezone.now())

    @property
    def is_cancellable(self):
        return self.status in {self.Status.SCHEDULED, self.Status.RESCHEDULED} and self.is_upcoming

    @property
    def can_mark_completed(self):
        if self.status not in {self.Status.SCHEDULED, self.Status.RESCHEDULED}:
            return False
        if self.effective_end_time:
            return self.effective_end_time <= timezone.now()
        return bool(self.effective_start_time and self.effective_start_time <= timezone.now())

    @property
    def duration_minutes(self):
        if self.start_time and self.end_time:
            return int((self.end_time - self.start_time).total_seconds() / 60)
        return 0

    @property
    def display_status_label(self):
        return self.get_status_display()

    def __str__(self) -> str:
        start = self.effective_start_time.strftime("%Y-%m-%d %H:%M") if self.effective_start_time else "Unknown"
        return f"{self.client.name} - {start}"


class SessionRecord(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE)
    summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Session for {self.appointment.client.name}"


class Notification(models.Model):
    class Type(models.TextChoices):
        BOOKING_REQUEST_CREATED = "booking_request_created", "Booking request created"
        BOOKING_REQUEST_CONFIRMED = "booking_request_confirmed", "Booking request confirmed"
        BOOKING_REQUEST_DECLINED = "booking_request_declined", "Booking request declined"
        BOOKING_REQUEST_CANCELLED = "booking_request_cancelled", "Booking request cancelled"
        BOOKING_REQUEST_EXPIRED = "booking_request_expired", "Booking request expired"
        APPOINTMENT_SCHEDULED = "appointment_scheduled", "Appointment scheduled"
        APPOINTMENT_CANCELLED = "appointment_cancelled", "Appointment cancelled"
        APPOINTMENT_COMPLETED = "appointment_completed", "Appointment completed"
        APPOINTMENT_RESCHEDULED = "appointment_rescheduled", "Appointment rescheduled"
        RESOURCE_ASSIGNED = "resource_assigned", "Resource assigned"

    recipient_user_profile = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        help_text="User who should receive this notification.",
    )
    type = models.CharField(max_length=40, choices=Type.choices)
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    related_model = models.CharField(
        max_length=100,
        help_text="Model name related to this notification (e.g., BookingRequest).",
    )
    related_id = models.CharField(
        max_length=64,
        help_text="Primary key or identifier of the related record.",
    )
    action_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        indexes = [
            models.Index(fields=["recipient_user_profile", "is_read", "created_at"]),
            models.Index(fields=["type", "created_at"]),
        ]

    @property
    def is_unread(self):
        return not self.is_read

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=["is_read", "read_at"])

    @property
    def display_type_label(self):
        return self.get_type_display()

    def __str__(self) -> str:
        return f"{self.title} → {self.recipient_user_profile}"


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
        
        # Block any overlapping availability slots so clients cannot book them
        overlapping_slots = AvailabilitySlot.objects.filter(
            therapist=self.therapist,
            status__in=[AvailabilitySlot.Status.OPEN, AvailabilitySlot.Status.HELD],
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        )
        if overlapping_slots.exists():
            overlapping_slots.update(status=AvailabilitySlot.Status.BLOCKED)

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
# 🔹 Resource Sharing (Therapist ↔ Client)
# ===========================
class Resource(models.Model):
    class ResourceType(models.TextChoices):
        FILE = "file", "File"
        LINK = "link", "Link"
        TEXT = "text", "Text"

    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.CASCADE,
        related_name="resources",
        help_text="Therapist who owns this resource.",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    resource_type = models.CharField(
        max_length=20,
        choices=ResourceType.choices,
        default=ResourceType.FILE,
        help_text="The primary content type for this resource.",
    )
    file = models.FileField(
        upload_to="resources/",
        blank=True,
        null=True,
        help_text="Upload a file for file-based resources.",
    )
    url = models.URLField(
        blank=True,
        help_text="External link for link-based resources.",
    )
    text_content = models.TextField(
        blank=True,
        help_text="Inline text content for text-based resources.",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="If false, the resource is hidden from assignment lists.",
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Resource"
        verbose_name_plural = "Resources"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["therapist", "is_active", "created_at"]),
            models.Index(fields=["resource_type", "created_at"]),
        ]

    def clean(self):
        if self.resource_type == self.ResourceType.FILE:
            if not self.file:
                raise ValidationError({"file": "A file is required for file resources."})
            if self.url or self.text_content:
                raise ValidationError("File resources cannot include link or text content.")
        elif self.resource_type == self.ResourceType.LINK:
            if not self.url:
                raise ValidationError({"url": "A URL is required for link resources."})
            if self.file or self.text_content:
                raise ValidationError("Link resources cannot include file or text content.")
        elif self.resource_type == self.ResourceType.TEXT:
            if not self.text_content:
                raise ValidationError({"text_content": "Text content is required for text resources."})
            if self.file or self.url:
                raise ValidationError("Text resources cannot include file or link content.")
        super().clean()

    @property
    def display_type_label(self):
        return self.get_resource_type_display()

    def __str__(self) -> str:
        return f"{self.title} ({self.get_resource_type_display()})"


class SharedResourceAssignment(models.Model):
    class Status(models.TextChoices):
        ASSIGNED = "assigned", "Assigned"
        VIEWED = "viewed", "Viewed"
        COMPLETED = "completed", "Completed"

    therapeutic_relationship = models.ForeignKey(
        TherapeuticRelationship,
        on_delete=models.CASCADE,
        related_name="resource_assignments",
    )
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    assigned_by = models.ForeignKey(
        TherapistProfile,
        on_delete=models.CASCADE,
        related_name="resource_assignments_made",
    )
    assigned_to = models.ForeignKey(
        ClientProfile,
        on_delete=models.CASCADE,
        related_name="resource_assignments",
    )
    therapist_note = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ASSIGNED,
        help_text="Progress status for the assigned resource.",
    )
    assigned_at = models.DateTimeField(default=timezone.now)
    viewed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Shared resource assignment"
        verbose_name_plural = "Shared resource assignments"
        ordering = ["-assigned_at"]
        indexes = [
            models.Index(fields=["assigned_by", "status", "assigned_at"]),
            models.Index(fields=["assigned_to", "status", "assigned_at"]),
            models.Index(fields=["therapeutic_relationship", "status"]),
        ]

    def clean(self):
        if self.therapeutic_relationship_id:
            relationship = self.therapeutic_relationship
            if relationship.status != TherapeuticRelationship.Status.ACTIVE:
                raise ValidationError("Resource assignments require an active relationship.")
            if self.assigned_by_id and relationship.therapist_id != self.assigned_by_id:
                raise ValidationError("Assigned therapist must match the relationship therapist.")
            if self.assigned_to_id and relationship.client_id != self.assigned_to_id:
                raise ValidationError("Assigned client must match the relationship client.")

        if self.resource_id and self.assigned_by_id:
            if self.resource.therapist_id != self.assigned_by_id:
                raise ValidationError("Resource must belong to the assigning therapist.")

        if self.status == self.Status.VIEWED and not self.viewed_at:
            raise ValidationError({"viewed_at": "Viewed assignments require a viewed timestamp."})
        if self.status == self.Status.COMPLETED and not self.completed_at:
            raise ValidationError({"completed_at": "Completed assignments require a completed timestamp."})
        super().clean()

    @property
    def is_viewed(self):
        return self.status in {self.Status.VIEWED, self.Status.COMPLETED}

    @property
    def is_completed(self):
        return self.status == self.Status.COMPLETED

    @property
    def status_label(self):
        return self.get_status_display()

    def mark_viewed(self):
        if not self.is_viewed:
            self.status = self.Status.VIEWED
            self.viewed_at = timezone.now()
            self.save(update_fields=["status", "viewed_at", "updated_at"])

    def mark_completed(self):
        if not self.is_completed:
            self.status = self.Status.COMPLETED
            self.completed_at = timezone.now()
            if not self.viewed_at:
                self.viewed_at = self.completed_at
            self.save(update_fields=["status", "completed_at", "viewed_at", "updated_at"])

    def __str__(self) -> str:
        return f"{self.resource.title} → {self.assigned_to.name} ({self.get_status_display()})"


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


class HomeContent(models.Model):
    hero = models.JSONField(default=dict, blank=True)
    portal = models.JSONField(default=dict, blank=True)
    bubbles = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return "Home Content"


class AboutContent(models.Model):
    hero = models.JSONField(default=dict, blank=True)
    why = models.JSONField(default=dict, blank=True)
    pillars = models.JSONField(default=list, blank=True)
    message = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return "About Content"


class TherapistsContent(models.Model):
    hero = models.JSONField(default=dict, blank=True)
    why = models.JSONField(default=dict, blank=True)
    supervision = models.JSONField(default=dict, blank=True)
    learning = models.JSONField(default=dict, blank=True)
    work = models.JSONField(default=dict, blank=True)
    values = models.JSONField(default=dict, blank=True)
    cta = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return "Therapists Content"


class ServicesContent(models.Model):
    hero = models.JSONField(default=dict, blank=True)
    portal = models.JSONField(default=dict, blank=True)
    services = models.JSONField(default=dict, blank=True)
    programs = models.JSONField(default=dict, blank=True)
    approach = models.JSONField(default=dict, blank=True)
    faq = models.JSONField(default=dict, blank=True)
    cta = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return "Services Content"


class ContactContent(models.Model):
    hero = models.JSONField(default=dict, blank=True)
    form = models.JSONField(default=dict, blank=True)
    quote = models.JSONField(default=dict, blank=True)
    hours = models.JSONField(default=dict, blank=True)
    closing = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return "Contact Content"


class TrainingProgramsContent(models.Model):
    hero = models.JSONField(default=dict, blank=True)
    programs = models.JSONField(default=dict, blank=True)
    faq = models.JSONField(default=dict, blank=True)
    cta = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return "Training Programs Content"


class CareersContent(models.Model):
    hero = models.JSONField(default=dict, blank=True)
    why = models.JSONField(default=dict, blank=True)
    openings = models.JSONField(default=dict, blank=True)
    opportunities = models.JSONField(default=dict, blank=True)
    form = models.JSONField(default=dict, blank=True)
    footer = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return "Careers Content"


class TherapistApplyContent(models.Model):
    hero = models.JSONField(default=dict, blank=True)
    sections = models.JSONField(default=dict, blank=True)
    form = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return "Therapist Apply Content"
