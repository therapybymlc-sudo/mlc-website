"""
Transactional emails for appointment bookings and confirmations.
"""
from __future__ import annotations

import logging
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def send_booking_confirmation_emails(booking_request) -> tuple[bool, str | None]:
    """
    Sends booking confirmation email to the client and new appointment alert to the therapist.
    """
    if not booking_request:
        return False, "No booking request provided."

    client = getattr(booking_request, "client", None)
    therapist = getattr(booking_request, "therapist", None)
    slot = getattr(booking_request, "availability_slot", None)

    client_email = getattr(client, "email", None)
    therapist_email = getattr(therapist, "email", None)

    if not client_email:
        logger.warning("Booking request %s has no client email.", booking_request.id)
        return False, "Client has no email address."

    client_name = getattr(client, "name", "there")
    therapist_name = getattr(therapist, "name", "Therapist")
    duration = getattr(therapist, "session_duration", 50)

    # Format scheduled time
    start_time = getattr(slot, "start_time", None) if slot else None
    if start_time:
        if timezone.is_naive(start_time):
            start_time = timezone.make_aware(start_time)
        ist_time = timezone.localtime(start_time)
        scheduled_str = ist_time.strftime("%A, %d %b %Y · %I:%M %p IST")
    else:
        scheduled_str = "Scheduled session"

    # Check for payment amount
    payment = getattr(booking_request, "razorpay_payment", None)
    amount_str = ""
    if payment and payment.amount:
        amount_inr = payment.amount / 100
        amount_str = f"₹{amount_inr:,.0f}"

    frontend_url = getattr(settings, "FRONTEND_URL", "https://www.mlchealth.in").rstrip("/")

    # Resolve meeting link
    appointment = getattr(booking_request, "appointment", None)
    meeting_link = getattr(appointment, "meeting_link", None) if appointment else None
    if not meeting_link:
        meeting_link = f"{frontend_url}/conference/mlc_session_{booking_request.id}"

    dashboard_url = f"{frontend_url}/dashboard/client/appointments"
    schedule_url = f"{frontend_url}/dashboard/therapist/schedule"
    workspace_url = f"{frontend_url}/dashboard/therapist"

    from therapy.services.resend_email import send_templated_email

    # 1. Send confirmation to Client
    client_context = {
        "client_name": client_name,
        "therapist_name": therapist_name,
        "scheduled_time": scheduled_str,
        "duration_minutes": duration,
        "amount_formatted": amount_str,
        "meeting_link": meeting_link,
        "dashboard_url": dashboard_url,
    }
    client_sent, client_err = send_templated_email(
        template_name="emails/booking_confirmed_client.html",
        context=client_context,
        to=client_email,
        subject=f"Session Confirmed with {therapist_name} — MLC Health",
        reply_to="therapy@mlchealth.in",
    )
    if client_sent:
        logger.info("Sent booking confirmation to client %s for request %s", client_email, booking_request.id)
    else:
        logger.warning("Failed to send booking confirmation to client: %s", client_err)

    # 2. Send notification to Therapist
    if therapist_email:
        therapist_context = {
            "therapist_name": therapist_name,
            "client_name": client_name,
            "scheduled_time": scheduled_str,
            "duration_minutes": duration,
            "message_from_client": getattr(booking_request, "message_from_client", ""),
            "schedule_url": schedule_url,
            "workspace_url": workspace_url,
        }
        t_sent, t_err = send_templated_email(
            template_name="emails/booking_alert_therapist.html",
            context=therapist_context,
            to=therapist_email,
            subject=f"New Appointment Confirmed: {client_name} — MLC Health",
            reply_to=client_email,
        )
        if t_sent:
            logger.info("Sent booking notification to therapist %s for request %s", therapist_email, booking_request.id)
        else:
            logger.warning("Failed to send booking notification to therapist: %s", t_err)

    return client_sent, client_err
