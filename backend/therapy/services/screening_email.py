"""Email alerts for manual therapist matching intakes."""
from __future__ import annotations

import json
import logging
import re
import urllib.error
import urllib.request

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


def _parse_sender() -> tuple[str, str]:
    raw = (
        getattr(settings, "INTAKE_EMAIL_FROM", None)
        or getattr(settings, "DEFAULT_FROM_EMAIL", "therapy@mlchealth.in")
    ).strip()
    match = re.match(r"^(.+?)\s*<([^>]+)>$", raw)
    if match:
        return match.group(2).strip(), match.group(1).strip().strip('"')
    return raw, "MLC Health"


def _build_intake_body(*, screening, contact_name: str, email: str, phone: str = "") -> tuple[str, str]:
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
    return subject, body


def _send_via_brevo_api(*, subject: str, body: str, recipients: list[str], reply_to: str | None) -> tuple[bool, str | None]:
    api_key = getattr(settings, "BREVO_API_KEY", "").strip()
    if not api_key:
        return False, "BREVO_API_KEY not configured."

    sender_email, sender_name = _parse_sender()
    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": addr} for addr in recipients],
        "subject": subject,
        "textContent": body,
    }
    if reply_to:
        payload["replyTo"] = {"email": reply_to}

    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": api_key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            if 200 <= resp.status < 300:
                return True, None
            return False, f"Brevo API returned status {resp.status}"
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        logger.error("Brevo API HTTP error %s: %s", exc.code, detail)
        return False, f"Brevo API error {exc.code}: {detail[:300]}"
    except Exception as exc:
        logger.exception("Brevo API request failed")
        return False, str(exc)


def _send_via_smtp(*, subject: str, body: str, recipients: list[str], reply_to: str | None) -> tuple[bool, str | None]:
    sender_email, sender_name = _parse_sender()
    from_email = f"{sender_name} <{sender_email}>"
    try:
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_email,
            to=recipients,
            reply_to=[reply_to] if reply_to else [],
        )
        msg.send(fail_silently=False)
        return True, None
    except Exception as exc:
        logger.exception("SMTP intake notification failed")
        return False, str(exc)


def send_manual_intake_notification(*, screening, contact_name: str, email: str, phone: str = "") -> tuple[bool, str | None]:
    recipients = _notify_emails()
    if not recipients:
        return False, "No intake notification emails configured."

    subject, body = _build_intake_body(
        screening=screening,
        contact_name=contact_name,
        email=email,
        phone=phone,
    )
    reply_to = email or None

    if getattr(settings, "BREVO_API_KEY", "").strip():
        sent, err = _send_via_brevo_api(
            subject=subject,
            body=body,
            recipients=recipients,
            reply_to=reply_to,
        )
        if sent:
            logger.info("Sent manual intake notification via Brevo API for screening %s", screening.id)
            return True, None
        logger.warning("Brevo API failed for screening %s, falling back to SMTP: %s", screening.id, err)

    sent, err = _send_via_smtp(subject=subject, body=body, recipients=recipients, reply_to=reply_to)
    if sent:
        logger.info("Sent manual intake notification via SMTP for screening %s", screening.id)
        return True, None
    return False, err
