from django.core.exceptions import ValidationError
from django.utils import timezone

from therapy.models import Appointment, AvailabilitySlot, BookingRequest, Notification
from therapy.notifications import get_scheduling_action_url


def cancel_appointment(appointment: Appointment, cancelled_by=None, reason="", reopen_slot=True, force=False):
    if not force and not appointment.is_cancellable:
        raise ValidationError("This appointment cannot be cancelled.")

    appointment.status = Appointment.Status.CANCELLED
    appointment.cancelled_at = timezone.now()
    appointment.cancelled_by = cancelled_by
    if reason:
        appointment.cancellation_reason = reason
    appointment.save(update_fields=["status", "cancelled_at", "cancelled_by", "cancellation_reason", "updated_at"])

    booking_request = appointment.booking_request
    if booking_request and booking_request.status == BookingRequest.Status.CONFIRMED:
        if cancelled_by and getattr(appointment.client, "user_id", None) == getattr(cancelled_by, "id", None):
            booking_request.status = BookingRequest.Status.CANCELLED_BY_CLIENT
        else:
            booking_request.status = BookingRequest.Status.CANCELLED_BY_THERAPIST
        booking_request.responded_at = timezone.now()
        booking_request.save(update_fields=["status", "responded_at", "updated_at"])

    slot = appointment.availability_slot
    if reopen_slot and slot and slot.start_time and slot.start_time > timezone.now():
        slot.status = AvailabilitySlot.Status.OPEN
        slot.held_until = None
        slot.save(update_fields=["status", "held_until", "updated_at"])

    if getattr(appointment.client, "user", None):
        Notification.objects.create(
            recipient_user_profile=appointment.client.user,
            type=Notification.Type.APPOINTMENT_CANCELLED,
            title="Appointment cancelled",
            body="Your appointment has been cancelled.",
            related_model="Appointment",
            related_id=str(appointment.pk),
            action_url=get_scheduling_action_url(
                Notification.Type.APPOINTMENT_CANCELLED,
                recipient=appointment.client.user,
            ),
        )
    if getattr(appointment.therapist, "user", None):
        Notification.objects.create(
            recipient_user_profile=appointment.therapist.user,
            type=Notification.Type.APPOINTMENT_CANCELLED,
            title="Appointment cancelled",
            body="An appointment was cancelled.",
            related_model="Appointment",
            related_id=str(appointment.pk),
            action_url=get_scheduling_action_url(
                Notification.Type.APPOINTMENT_CANCELLED,
                recipient=appointment.therapist.user,
            ),
        )

    return appointment
