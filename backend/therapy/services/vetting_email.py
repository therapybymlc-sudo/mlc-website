"""Transactional emails for therapist vetting and contract workflow."""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)


def _frontend_url(path: str = "") -> str:
    base = getattr(settings, "FRONTEND_URL", "https://www.mlchealth.in").rstrip("/")
    if not path:
        return base
    return f"{base}/{path.lstrip('/')}"


def send_therapist_contract_email(*, therapist, admin_feedback: str = "") -> tuple[bool, str | None]:
    """
    Notify a therapist that their profile content was approved and the MLC contract
    is ready for them to review and sign.
    """
    recipient = (getattr(therapist, "email", None) or "").strip()
    if not recipient:
        return False, "Therapist profile has no email address."

    name = (getattr(therapist, "name", None) or "there").strip()
    profile_url = _frontend_url("/dashboard/therapist/profile")
    subject = "MLC Health — Your therapist contract is ready to sign"

    feedback_block = ""
    if admin_feedback:
        feedback_block = f"\n\nNote from our clinical team:\n{admin_feedback}\n"

    body = (
        f"Dear {name},\n\n"
        "Congratulations — your MLC therapist profile content has been approved.\n\n"
        "The next step is to review and sign your therapist agreement with MLC Health. "
        "Our team will share the contract document with you separately if you have not "
        "already received it. Once signed, reply to this email or contact us at "
        "therapybymlc@gmail.com so we can publish your profile on the directory.\n"
        f"{feedback_block}\n"
        f"You can view your profile status here:\n{profile_url}\n\n"
        "Warm regards,\n"
        "MLC Health Clinical Team\n"
        "therapybymlc@gmail.com\n"
    )

    if getattr(settings, "RESEND_API_KEY", "").strip():
        from therapy.services.resend_email import send_templated_email
        context = {
            "name": name,
            "profile_url": profile_url,
            "admin_feedback": admin_feedback,
        }
        sent, err = send_templated_email(
            template_name="emails/therapist_contract_ready.html",
            context=context,
            to=recipient,
            subject=subject,
            reply_to="therapybymlc@gmail.com",
        )
        if sent:
            logger.info("Sent therapist contract HTML email via Resend to %s", recipient)
            return True, None
        logger.warning("Resend HTML failed for %s, trying SMTP: %s", recipient, err)

    try:
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
            reply_to=["therapybymlc@gmail.com"],
        )
        msg.send(fail_silently=False)
        logger.info("Sent therapist contract email to %s", recipient)
        return True, None
    except Exception as exc:
        logger.exception("Failed to send therapist contract email to %s", recipient)
        return False, str(exc)


def send_therapist_published_email(*, therapist) -> tuple[bool, str | None]:
    """Notify a therapist that their profile is live on the directory."""
    recipient = (getattr(therapist, "email", None) or "").strip()
    if not recipient:
        return False, "Therapist profile has no email address."

    name = (getattr(therapist, "name", None) or "there").strip()
    directory_url = _frontend_url("/therapists/directory")
    profile_url = _frontend_url("/dashboard/therapist/profile")
    subject = "MLC Health — Your therapist profile is now live"

    body = (
        f"Dear {name},\n\n"
        "Your contract has been verified and your MLC therapist profile is now published "
        "on our public directory.\n\n"
        f"View the directory: {directory_url}\n"
        f"Manage your profile: {profile_url}\n\n"
        "Welcome to the MLC collective.\n\n"
        "Warm regards,\n"
        "MLC Health Clinical Team\n"
    )

    if getattr(settings, "RESEND_API_KEY", "").strip():
        from therapy.services.resend_email import send_templated_email
        context = {
            "name": name,
            "directory_url": directory_url,
            "workspace_url": profile_url,
        }
        sent, err = send_templated_email(
            template_name="emails/therapist_published_live.html",
            context=context,
            to=recipient,
            subject=subject,
            reply_to="therapybymlc@gmail.com",
        )
        if sent:
            logger.info("Sent therapist published HTML email via Resend to %s", recipient)
            return True, None
        logger.warning("Resend HTML failed for %s, trying SMTP: %s", recipient, err)

    try:
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
            reply_to=["therapybymlc@gmail.com"],
        )
        msg.send(fail_silently=False)
        logger.info("Sent therapist published email to %s", recipient)
        return True, None
    except Exception as exc:
        logger.exception("Failed to send therapist published email to %s", recipient)
        return False, str(exc)
