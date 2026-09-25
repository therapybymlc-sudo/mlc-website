"""
Resend HTTP API client for transactional emails across MLC Health.
Zero external library dependencies (uses Python standard urllib.request).
"""
from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)


def send_resend_email(
    *,
    to: str | list[str],
    subject: str,
    text: str | None = None,
    html: str | None = None,
    reply_to: str | list[str] | None = None,
    from_email: str | None = None,
) -> tuple[bool, str | None]:
    """
    Sends an email using Resend's REST API.
    Returns (success: bool, error_message: str | None).
    """
    api_key = getattr(settings, "RESEND_API_KEY", "").strip()
    if not api_key:
        return False, "RESEND_API_KEY is not configured."

    sender = (
        from_email
        or getattr(settings, "RESEND_FROM_EMAIL", None)
        or getattr(settings, "DEFAULT_FROM_EMAIL", "MLC Health <therapy@mlchealth.in>")
    ).strip()

    recipients = [to] if isinstance(to, str) else [r.strip() for r in to if r.strip()]
    if not recipients:
        return False, "No recipient email addresses provided."

    payload: dict[str, Any] = {
        "from": sender,
        "to": recipients,
        "subject": subject,
    }

    if text:
        payload["text"] = text
    if html:
        payload["html"] = html
    if not text and not html:
        payload["text"] = subject

    if reply_to:
        reply_list = [reply_to] if isinstance(reply_to, str) else list(reply_to)
        payload["reply_to"] = reply_list

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "MLCHealth/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            email_id = data.get("id")
            logger.info("Resend email delivered successfully [id=%s] to %s", email_id, recipients)
            return True, None
    except urllib.error.HTTPError as exc:
        err_msg = exc.read().decode("utf-8", errors="replace")
        logger.error("Resend API HTTP error %s: %s", exc.code, err_msg)

        # Graceful sandbox fallback: If sending from custom domain failed because DNS isn't verified yet,
        # retry with Resend's verified onboarding sandbox sender.
        if "domain" in err_msg.lower() and "verify" in err_msg.lower() and "onboarding@resend.dev" not in sender:
            logger.warning("Domain not verified yet on Resend. Retrying with onboarding@resend.dev...")
            payload["from"] = "MLC Health <onboarding@resend.dev>"
            fallback_req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "MLCHealth/1.0",
                },
                method="POST",
            )
            try:
                with urllib.request.urlopen(fallback_req, timeout=12) as fresp:
                    fdata = json.loads(fresp.read().decode("utf-8"))
                    logger.info("Resend sandbox fallback email delivered [id=%s]", fdata.get("id"))
                    return True, None
            except Exception as fexc:
                logger.error("Resend sandbox fallback also failed: %s", fexc)

        return False, f"Resend API error ({exc.code}): {err_msg[:300]}"
    except Exception as exc:
        logger.exception("Resend request failed")
        return False, str(exc)


def send_templated_email(
    *,
    template_name: str,
    context: dict[str, Any],
    to: str | list[str],
    subject: str,
    reply_to: str | list[str] | None = None,
    from_email: str | None = None,
) -> tuple[bool, str | None]:
    """
    Renders an HTML email template with context and sends it via Resend.
    """
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags

    try:
        html_content = render_to_string(template_name, context)
        text_content = strip_tags(html_content).strip()
    except Exception as exc:
        logger.exception("Failed to render email template %s: %s", template_name, exc)
        return False, f"Template rendering error: {str(exc)}"

    return send_resend_email(
        to=to,
        subject=subject,
        html=html_content,
        text=text_content,
        reply_to=reply_to,
        from_email=from_email,
    )

