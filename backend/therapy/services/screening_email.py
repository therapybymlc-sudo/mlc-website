"""Email alerts for manual therapist matching intakes."""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)


def _notify_emails() -> list[str]:
    raw = getattr(
        settings,
        "THERAPIST_INTAKE_NOTIFY_EMAILS",
        getattr(settings, "ADMIN_EMAILS", "therapybymlc@gmail.com"),
    )
    return [e.strip() for e in str(raw).split(",") if e.strip()]


def send_manual_intake_notification(*, screening, contact_name: str, email: str, phone: str = "") -> tuple[bool, str | None]:
    recipients = _notify_emails()
    if not recipients:
        return False, "No intake notification emails configured."

    notify_phone = getattr(settings, "THERAPIST_INTAKE_NOTIFY_PHONE", "+91 9741672947")
    problem = (getattr(screening, "health_factors", None) or "").strip()
    concerns = getattr(screening, "presenting_concerns", None) or []
    location = getattr(screening, "location", None) or {}
    city = location.get("city") or "Not specified"

    subject = f"New therapist matching enquiry — {contact_name}"
    body = (
        "A new therapist matching intake was submitted on MLC Health.\n\n"
        f"Name: {contact_name}\n"
        f"Email: {email}\n"
        f"Phone: {phone or 'Not provided'}\n"
        f"City: {city}\n"
        f"Age: {screening.age or '—'}\n"
        f"Gender: {screening.gender or '—'}\n"
        f"Languages: {', '.join(screening.languages or []) or '—'}\n"
        f"Session preference: {screening.session_type_pref or '—'}\n"
        f"Therapist gender preference: {screening.therapist_gender_pref or '—'}\n"
        f"Urgency: {screening.urgency or '—'}\n"
        f"Presenting concerns: {', '.join(concerns) if concerns else '—'}\n\n"
        "Problem description:\n"
        f"{problem or '—'}\n\n"
        f"Screening ID: {screening.id}\n"
        f"Submitted at: {screening.created_at}\n\n"
        f"Business contact on file: {notify_phone}\n"
        "Reply to the client directly to share your therapist recommendation.\n"
    )

    try:
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
            reply_to=[email] if email else [],
        )
        msg.send(fail_silently=False)
        logger.info("Sent manual intake notification for screening %s", screening.id)
        return True, None
    except Exception as exc:
        logger.exception("Failed to send manual intake notification for screening %s", screening.id)
        return False, str(exc)
