"""
Create snapshots, generate PDFs, and send scheduled report emails.
"""
from __future__ import annotations

import logging
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from django.utils import timezone

from therapy.models import AdminReportEmailSchedule, AdminReportSnapshot
from therapy.services.admin_reports import (
    REPORT_BUILDERS,
    build_report,
    denormalized_period_fields,
    get_period_bounds,
    resolve_period_bounds_for_preset,
)
from therapy.services.report_pdf import build_report_pdf_bytes

logger = logging.getLogger(__name__)


def admin_email_from_request(request) -> str:
    payload = getattr(request, "auth", None) or {}
    user = request.user
    if isinstance(payload, dict):
        pe = payload.get("email") or payload.get("email_address")
    else:
        pe = None
    raw = (getattr(user, "email", None) or pe or "").strip()
    return raw[:254]


def create_snapshot(
    *,
    report_key: str,
    period: str,
    year: int,
    month: int,
    quarter: int,
    title: str,
    created_by_email: str,
    source_schedule: AdminReportEmailSchedule | None = None,
    skip_pdf: bool = False,
) -> AdminReportSnapshot:
    key = (report_key or "").lower()
    if key not in REPORT_BUILDERS:
        raise ValueError("Unknown report type.")

    start, end, months_in_period, label, period_type = get_period_bounds(period, year, month, quarter)
    payload = build_report(key, start, end, months_in_period, period_type, label)
    if payload is None:
        raise ValueError("Could not build report.")

    denorm = denormalized_period_fields(period_type, start)
    snap = AdminReportSnapshot.objects.create(
        title=(title or "")[:255],
        report_key=key,
        period_type=period_type,
        year=denorm["year"],
        month=denorm["month"],
        quarter=denorm["quarter"],
        period_label=label,
        period_start=start,
        period_end=end,
        payload=payload,
        created_by_email=(created_by_email or "")[:254],
        source_schedule=source_schedule,
    )

    if not skip_pdf:
        attach_pdf_to_snapshot(snap, payload)
    return snap


def attach_pdf_to_snapshot(snap: AdminReportSnapshot, payload: dict | None = None) -> None:
    data = payload if payload is not None else snap.payload
    try:
        pdf_bytes = build_report_pdf_bytes(data)
        name = f"snapshot_{snap.id}.pdf"
        snap.pdf.save(name, ContentFile(pdf_bytes), save=True)
        snap.pdf_generated_at = timezone.now()
        snap.pdf_error = ""
        snap.save(update_fields=["pdf", "pdf_generated_at", "pdf_error"])
    except Exception as exc:
        logger.exception("PDF generation failed for snapshot %s", snap.id)
        snap.pdf_error = str(exc)[:2000]
        snap.save(update_fields=["pdf_error"])


def schedule_is_due(schedule: AdminReportEmailSchedule, now=None) -> bool:
    if not schedule.is_active:
        return False
    emails = schedule.recipient_emails or []
    if not emails or not isinstance(emails, list):
        return False

    now = now or timezone.now()
    local = timezone.localtime(now)
    today = local.date()

    if schedule.last_sent_at:
        last = timezone.localtime(schedule.last_sent_at).date()
        if schedule.frequency == AdminReportEmailSchedule.Frequency.MONTHLY:
            if last.year == today.year and last.month == today.month:
                return False
        elif schedule.frequency == AdminReportEmailSchedule.Frequency.WEEKLY:
            if last.isocalendar()[:2] == today.isocalendar()[:2]:
                return False

    if schedule.frequency == AdminReportEmailSchedule.Frequency.MONTHLY:
        dom = schedule.day_of_month or 1
        return today.day == dom
    if schedule.frequency == AdminReportEmailSchedule.Frequency.WEEKLY:
        wd = schedule.weekday
        if wd is None:
            return False
        return today.weekday() == int(wd)
    return False


def send_schedule_email(schedule: AdminReportEmailSchedule) -> AdminReportSnapshot:
    start, end, mip, label, ptype = resolve_period_bounds_for_preset(schedule.period_preset)
    payload = build_report(schedule.report_key, start, end, mip, ptype, label)
    if payload is None:
        raise ValueError("Unknown report type.")

    denorm = denormalized_period_fields(ptype, start)
    snap = AdminReportSnapshot.objects.create(
        title=f"Scheduled: {schedule.name or schedule.report_key}",
        report_key=schedule.report_key,
        period_type=ptype,
        year=denorm["year"],
        month=denorm["month"],
        quarter=denorm["quarter"],
        period_label=label,
        period_start=start,
        period_end=end,
        payload=payload,
        created_by_email="schedule",
        source_schedule=schedule,
    )

    pdf_bytes = build_report_pdf_bytes(payload)
    name = f"snapshot_{snap.id}.pdf"
    snap.pdf.save(name, ContentFile(pdf_bytes), save=True)
    snap.pdf_generated_at = timezone.now()
    snap.pdf_error = ""
    snap.save(update_fields=["pdf", "pdf_generated_at", "pdf_error"])

    subject = f"[MLC] Report: {payload.get('title') or schedule.report_key} — {label}"
    body = (
        f"This message was sent by an automated report schedule ({schedule.name or 'unnamed'}).\n\n"
        f"Report: {schedule.report_key}\n"
        f"Period preset: {schedule.get_period_preset_display()}\n"
        f"Window: {label}\n\n"
        f"Full data is attached as PDF. Snapshot id: {snap.id}\n"
    )
    recipients = [e.strip() for e in (schedule.recipient_emails or []) if isinstance(e, str) and e.strip()]

    msg = EmailMessage(
        subject=subject,
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipients,
    )
    msg.attach(f"mlc-report-{schedule.report_key}-{label}.pdf", pdf_bytes, "application/pdf")
    msg.send(fail_silently=False)

    schedule.last_sent_at = timezone.now()
    schedule.last_error = ""
    schedule.save(update_fields=["last_sent_at", "last_error", "updated_at"])
    return snap


def run_due_schedules(now=None) -> tuple[int, int]:
    """Process all active schedules; returns (sent_count, error_count)."""
    sent = 0
    errors = 0
    now = now or timezone.now()
    for schedule in AdminReportEmailSchedule.objects.filter(is_active=True).order_by("id"):
        if not schedule_is_due(schedule, now):
            continue
        try:
            send_schedule_email(schedule)
            sent += 1
        except Exception as exc:
            errors += 1
            logger.exception("Schedule %s failed", schedule.id)
            schedule.last_error = str(exc)[:2000]
            schedule.save(update_fields=["last_error", "updated_at"])
    return sent, errors
