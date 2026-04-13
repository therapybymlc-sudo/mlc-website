from django.core.exceptions import ValidationError

from therapy.models import BookingRequest


def confirm_booking_request(booking_request: BookingRequest, acting_user=None):
    if not booking_request.can_be_confirmed:
        raise ValidationError("This booking request cannot be confirmed.")
    return booking_request.confirm(confirmed_by=acting_user)


def decline_booking_request(booking_request: BookingRequest, therapist_note=""):
    if not booking_request.can_be_declined:
        raise ValidationError("This booking request cannot be declined.")
    return booking_request.decline(therapist_note=therapist_note or "")


def cancel_pending_by_client(booking_request: BookingRequest, reason=""):
    if booking_request.status != BookingRequest.Status.PENDING:
        raise ValidationError("Only pending requests can be cancelled by client.")
    return booking_request.cancel_by_client(reason=reason or "")


def cancel_pending_by_therapist(booking_request: BookingRequest, reason=""):
    if booking_request.status != BookingRequest.Status.PENDING:
        raise ValidationError("Only pending requests can be cancelled by therapist.")
    return booking_request.cancel_by_therapist(reason=reason or "")
