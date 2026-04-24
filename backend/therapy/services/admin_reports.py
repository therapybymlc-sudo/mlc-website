"""
Admin analytics: period-bound aggregates for the reporting dashboard.
Each report type returns a focused payload for a dedicated UI section.
"""
from __future__ import annotations

import os
from decimal import Decimal
from typing import Any

from django.conf import settings
from django.db.models import Count, Sum, Value
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone
from datetime import datetime

from therapy.models import (
    Appointment,
    BookingRequest,
    ClientProfile,
    ContactMessage,
    QuickBooking,
    RazorpayPayment,
    SupervisionNote,
    SupervisoryRelationship,
    TherapistApplication,
    TherapistProfile,
    TherapistSubscriptionCharge,
    TherapeuticRelationship,
    WaitlistEntry,
    SupportTicket,
)


def rupees_from_paise(amount) -> float:
    if amount is None:
        return 0.0
    return float(Decimal(amount) / Decimal("100.0"))


def get_period_bounds(period: str, year: int, month: int, quarter: int):
    tz = timezone.get_current_timezone()
    period = (period or "monthly").lower()
    if period == "yearly":
        start = timezone.make_aware(datetime(year, 1, 1, 0, 0, 0), tz)
        end = timezone.make_aware(datetime(year + 1, 1, 1, 0, 0, 0), tz)
        return start, end, 12, f"{year}", period
    if period == "quarterly":
        q = min(max(quarter, 1), 4)
        start_month = (q - 1) * 3 + 1
        start = timezone.make_aware(datetime(year, start_month, 1, 0, 0, 0), tz)
        if start_month + 3 > 12:
            end = timezone.make_aware(datetime(year + 1, 1, 1, 0, 0, 0), tz)
        else:
            end = timezone.make_aware(datetime(year, start_month + 3, 1, 0, 0, 0), tz)
        return start, end, 3, f"Q{q} {year}", period

    m = min(max(month, 1), 12)
    start = timezone.make_aware(datetime(year, m, 1, 0, 0, 0), tz)
    if m == 12:
        end = timezone.make_aware(datetime(year + 1, 1, 1, 0, 0, 0), tz)
    else:
        end = timezone.make_aware(datetime(year, m + 1, 1, 0, 0, 0), tz)
    return start, end, 1, f"{year}-{m:02d}", period


def get_prior_period_bounds(period: str, year: int, month: int, quarter: int):
    period = (period or "monthly").lower()
    if period == "yearly":
        return get_period_bounds("yearly", year - 1, month, quarter)
    if period == "quarterly":
        q = min(max(quarter, 1), 4)
        if q <= 1:
            return get_period_bounds("quarterly", year - 1, month, 4)
        return get_period_bounds("quarterly", year, month, q - 1)
    m = min(max(month, 1), 12)
    if m <= 1:
        return get_period_bounds("monthly", year - 1, 12, quarter)
    return get_period_bounds("monthly", year, m - 1, quarter)


def _period_meta(
    period_type: str, label: str, start, end, months_in_period: int
) -> dict[str, Any]:
    return {
        "period_type": period_type,
        "label": label,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "months_in_period": months_in_period,
        "generated_at": timezone.now().isoformat(),
    }


def _subscription_price_decimals():
    monthly = Decimal(
        str(
            getattr(
                settings,
                "RAZORPAY_BASIC_MONTHLY_PRICE",
                os.getenv("RAZORPAY_BASIC_MONTHLY_PRICE", "0"),
            )
        )
    )
    annual = Decimal(
        str(
            getattr(
                settings,
                "RAZORPAY_BASIC_ANNUAL_PRICE",
                os.getenv("RAZORPAY_BASIC_ANNUAL_PRICE", "0"),
            )
        )
    )
    return monthly, annual


def compute_core_kpis(start, end, months_in_period: int) -> dict[str, Any]:
    monthly_price, annual_price = _subscription_price_decimals()

    incoming_registrations = TherapistApplication.objects.filter(
        created_at__gte=start, created_at__lt=end
    ).count()
    new_clients = ClientProfile.objects.filter(created_at__gte=start, created_at__lt=end).count()
    therapists_onboarded = TherapistProfile.objects.filter(
        created_at__gte=start, created_at__lt=end
    ).count()
    therapists_verified = TherapistProfile.objects.filter(
        is_verified=True,
        created_at__gte=start,
        created_at__lt=end,
    ).count()

    sessions_taken_qs = Appointment.objects.filter(
        status=Appointment.Status.COMPLETED,
        start_time__gte=start,
        start_time__lt=end,
    )
    sessions_taken = sessions_taken_qs.count()

    session_revenue_raw = (
        RazorpayPayment.objects.filter(
            status=RazorpayPayment.Status.PAID,
            created_at__gte=start,
            created_at__lt=end,
        ).aggregate(total=Coalesce(Sum("amount"), Value(0)))["total"]
        or 0
    )
    session_revenue = rupees_from_paise(session_revenue_raw)

    active_monthly_subscribers = TherapistProfile.objects.filter(
        is_basic_subscribed=True,
        basic_plan="monthly",
        subscription_status="active",
    ).count()
    active_annual_subscribers = TherapistProfile.objects.filter(
        is_basic_subscribed=True,
        basic_plan="annual",
        subscription_status="active",
    ).count()

    subscription_revenue_estimated = (
        (monthly_price * Decimal(active_monthly_subscribers) * Decimal(months_in_period))
        + (
            (annual_price / Decimal("12"))
            * Decimal(active_annual_subscribers)
            * Decimal(months_in_period)
        )
    )

    subscription_charges_qs = TherapistSubscriptionCharge.objects.filter(
        captured_at__gte=start,
        captured_at__lt=end,
        status__in=["captured", "paid", "active"],
    )
    subscription_revenue_recorded_raw = subscription_charges_qs.aggregate(
        total=Coalesce(Sum("amount"), Value(0))
    )["total"] or 0
    subscription_revenue_recorded = rupees_from_paise(subscription_revenue_recorded_raw)
    has_recorded = subscription_charges_qs.exists()
    subscription_revenue_final = (
        subscription_revenue_recorded if has_recorded else float(subscription_revenue_estimated)
    )

    return {
        "incoming_registrations": incoming_registrations,
        "new_clients": new_clients,
        "therapists_onboarded": therapists_onboarded,
        "therapists_verified": therapists_verified,
        "sessions_taken": sessions_taken,
        "session_revenue": round(session_revenue, 2),
        "subscription_revenue_estimated": round(float(subscription_revenue_estimated), 2),
        "subscription_revenue_recorded": round(subscription_revenue_recorded, 2),
        "subscription_revenue": round(subscription_revenue_final, 2),
        "subscription_revenue_source": "recorded" if has_recorded else "estimated",
        "total_revenue_estimated": round(session_revenue + subscription_revenue_final, 2),
        "active_monthly_subscribers": active_monthly_subscribers,
        "active_annual_subscribers": active_annual_subscribers,
    }


def build_executive_report(start, end, months_in_period, period_type, label) -> dict[str, Any]:
    kpis = compute_core_kpis(start, end, months_in_period)
    pstart, pend, p_months, plabel, _ = get_prior_period_bounds(
        period_type, *_unpack_period_args(period_type, start)
    )
    prior = compute_core_kpis(pstart, pend, p_months)

    # Subscriber counts are a snapshot ("now"), not window flow — omit from period-over-period deltas.
    delta_exclude = {"active_monthly_subscribers", "active_annual_subscribers"}

    def deltas(cur, prev):
        out = {}
        for k in cur:
            if k in delta_exclude:
                continue
            if isinstance(cur[k], (int, float)) and isinstance(prev.get(k), (int, float)):
                out[k] = round(float(cur[k]) - float(prev[k]), 2)
        return out

    return {
        "report_key": "executive",
        "title": "Executive summary",
        "period": _period_meta(period_type, label, start, end, months_in_period),
        "prior_period_label": plabel,
        "kpis": kpis,
        "kpis_prior_period": prior,
        "kpis_delta": deltas(kpis, prior),
    }


def _unpack_period_args(period_type, start):
    """Recover year/month/quarter from range start for prior-period helper."""
    y = start.year
    m = start.month
    if period_type == "quarterly":
        q = (m - 1) // 3 + 1
        return y, m, q
    return y, m, 1


def build_growth_report(start, end, months_in_period, period_type, label) -> dict[str, Any]:
    apps_in_window = TherapistApplication.objects.filter(
        created_at__gte=start, created_at__lt=end
    )
    applications_funnel = {
        "submitted_in_period": apps_in_window.count(),
        "pending": apps_in_window.filter(status="pending").count(),
        "approved": apps_in_window.filter(status="approved").count(),
        "rejected": apps_in_window.filter(status="rejected").count(),
    }
    approved_in_period = TherapistApplication.objects.filter(
        status="approved",
        approved_at__isnull=False,
        approved_at__gte=start,
        approved_at__lt=end,
    ).count()

    relationships_started = TherapeuticRelationship.objects.filter(
        started_at__gte=start, started_at__lt=end
    ).count()
    relationships_ended = TherapeuticRelationship.objects.filter(
        status=TherapeuticRelationship.Status.ENDED,
        ended_at__gte=start,
        ended_at__lt=end,
    ).count()
    active_relationships = TherapeuticRelationship.objects.filter(
        status=TherapeuticRelationship.Status.ACTIVE
    ).count()

    new_supervisory = SupervisoryRelationship.objects.filter(
        created_at__gte=start, created_at__lt=end
    ).count()
    active_supervisory = SupervisoryRelationship.objects.filter(
        status=SupervisoryRelationship.Status.ACTIVE
    ).count()

    waitlist_new = WaitlistEntry.objects.filter(created_at__gte=start, created_at__lt=end).count()

    return {
        "report_key": "growth",
        "title": "Growth & pipeline",
        "period": _period_meta(period_type, label, start, end, months_in_period),
        "sections": {
            "therapist_applications": {
                "title": "Therapist applications",
                "description": "Applications created during this window, broken down by current status.",
                "counts": applications_funnel,
                "approved_in_period_by_review_date": approved_in_period,
            },
            "directory_signups": {
                "title": "New platform accounts",
                "description": "Profiles created in the period (all therapists and clients).",
                "new_therapist_profiles": TherapistProfile.objects.filter(
                    created_at__gte=start, created_at__lt=end
                ).count(),
                "new_client_profiles": ClientProfile.objects.filter(
                    created_at__gte=start, created_at__lt=end
                ).count(),
            },
            "clinical_relationships": {
                "title": "Therapeutic relationships",
                "description": "New and ended matches between clients and therapists.",
                "started_in_period": relationships_started,
                "ended_in_period": relationships_ended,
                "active_total_now": active_relationships,
            },
            "supervision_links": {
                "title": "Supervision relationships",
                "description": "Supervisor ↔ supervisee links created in the period vs active total.",
                "new_in_period": new_supervisory,
                "active_total_now": active_supervisory,
            },
            "waitlist": {
                "title": "Waitlist",
                "description": "New waitlist entries submitted in the period.",
                "new_entries": waitlist_new,
            },
        },
    }


def build_revenue_report(start, end, months_in_period, period_type, label) -> dict[str, Any]:
    monthly_price, annual_price = _subscription_price_decimals()
    kpis = compute_core_kpis(start, end, months_in_period)

    payments_qs = RazorpayPayment.objects.filter(created_at__gte=start, created_at__lt=end)
    payment_status_counts = dict(
        payments_qs.values("status").annotate(c=Count("id")).values_list("status", "c")
    )
    paid_payments = payments_qs.filter(status=RazorpayPayment.Status.PAID)
    avg_session_payment = None
    if paid_payments.exists():
        total_paise = paid_payments.aggregate(t=Coalesce(Sum("amount"), Value(0)))["t"] or 0
        avg_session_payment = round(rupees_from_paise(total_paise) / paid_payments.count(), 2)

    sub_by_therapist = list(
        TherapistSubscriptionCharge.objects.filter(
            captured_at__gte=start,
            captured_at__lt=end,
            status__in=["captured", "paid", "active"],
        )
        .values("therapist", "therapist__name")
        .annotate(
            charges=Count("id"),
            total_paise=Coalesce(Sum("amount"), Value(0)),
        )
        .order_by("-total_paise")[:50]
    )
    subscription_by_therapist = [
        {
            "therapist_id": r["therapist"],
            "therapist_name": r["therapist__name"] or "Unknown",
            "charge_count": r["charges"],
            "amount": round(rupees_from_paise(r["total_paise"]), 2),
        }
        for r in sub_by_therapist
    ]

    sessions_monthly_series = [
        {
            "month": row["bucket"].strftime("%Y-%m"),
            "sessions": row["sessions"],
        }
        for row in Appointment.objects.filter(
            status=Appointment.Status.COMPLETED,
            start_time__gte=start,
            start_time__lt=end,
        )
        .annotate(bucket=TruncMonth("start_time"))
        .values("bucket")
        .annotate(sessions=Count("id"))
        .order_by("bucket")
        if row["bucket"]
    ]

    session_revenue_monthly_series = [
        {
            "month": row["bucket"].strftime("%Y-%m"),
            "revenue": round(rupees_from_paise(row["total"]), 2),
        }
        for row in RazorpayPayment.objects.filter(
            status=RazorpayPayment.Status.PAID,
            created_at__gte=start,
            created_at__lt=end,
        )
        .annotate(bucket=TruncMonth("created_at"))
        .values("bucket")
        .annotate(total=Coalesce(Sum("amount"), Value(0)))
        .order_by("bucket")
        if row["bucket"]
    ]

    subscription_monthly_series = [
        {
            "month": row["bucket"].strftime("%Y-%m"),
            "revenue": round(rupees_from_paise(row["total"]), 2),
        }
        for row in TherapistSubscriptionCharge.objects.filter(
            captured_at__gte=start,
            captured_at__lt=end,
            status__in=["captured", "paid", "active"],
        )
        .annotate(bucket=TruncMonth("captured_at"))
        .values("bucket")
        .annotate(total=Coalesce(Sum("amount"), Value(0)))
        .order_by("bucket")
        if row["bucket"]
    ]

    return {
        "report_key": "revenue",
        "title": "Revenue & subscriptions",
        "period": _period_meta(period_type, label, start, end, months_in_period),
        "sections": {
            "headline": {
                "title": "Headline revenue",
                "kpis": {
                    "session_revenue": kpis["session_revenue"],
                    "subscription_revenue": kpis["subscription_revenue"],
                    "subscription_source": kpis["subscription_revenue_source"],
                    "combined_estimated": kpis["total_revenue_estimated"],
                    "active_monthly_subscribers": kpis["active_monthly_subscribers"],
                    "active_annual_subscribers": kpis["active_annual_subscribers"],
                },
                "plan_list_prices": {
                    "monthly": float(monthly_price),
                    "annual": float(annual_price),
                },
            },
            "session_payments": {
                "title": "Session checkout",
                "description": "Razorpay payment rows created in this window (all statuses).",
                "status_counts": payment_status_counts,
                "paid_count": payment_status_counts.get(RazorpayPayment.Status.PAID, 0),
                "failed_count": payment_status_counts.get(RazorpayPayment.Status.FAILED, 0),
                "avg_paid_checkout_inr": avg_session_payment,
            },
            "subscription_settlement": {
                "title": "Recorded subscription charges",
                "description": "Captured subscription charge rows in the period (when billing is wired).",
                "by_therapist": subscription_by_therapist,
            },
            "trends": {
                "title": "Monthly trends (within window)",
                "sessions_completed": sessions_monthly_series,
                "session_revenue": session_revenue_monthly_series,
                "subscription_revenue": subscription_monthly_series,
            },
        },
    }


def build_operations_report(start, end, months_in_period, period_type, label) -> dict[str, Any]:
    appt_base = Appointment.objects.filter(start_time__gte=start, start_time__lt=end)
    appt_by_status = dict(
        appt_base.values("status").annotate(c=Count("id")).values_list("status", "c")
    )

    completed = appt_base.filter(status=Appointment.Status.COMPLETED)
    cancelled = appt_base.filter(status=Appointment.Status.CANCELLED)
    no_show = appt_base.filter(status=Appointment.Status.NO_SHOW)
    scheduled_future = Appointment.objects.filter(
        status=Appointment.Status.SCHEDULED,
        start_time__gte=timezone.now(),
    ).count()

    br_qs = BookingRequest.objects.filter(created_at__gte=start, created_at__lt=end)
    br_by_status = dict(br_qs.values("status").annotate(c=Count("id")).values_list("status", "c"))

    first_free_completed = completed.filter(is_first_session_free=True).count()

    return {
        "report_key": "operations",
        "title": "Clinical operations & scheduling",
        "period": _period_meta(period_type, label, start, end, months_in_period),
        "sections": {
            "appointments_in_window": {
                "title": "Appointments (by session start time)",
                "description": "All appointments whose start falls in the reporting window.",
                "by_status": appt_by_status,
                "completed": completed.count(),
                "cancelled": cancelled.count(),
                "no_show": no_show.count(),
                "free_intros_completed": first_free_completed,
            },
            "booking_requests": {
                "title": "Booking requests",
                "description": "Requests created in the period, by outcome.",
                "created_in_period": br_qs.count(),
                "by_status": br_by_status,
            },
            "pipeline_now": {
                "title": "Upcoming workload",
                "description": "Scheduled appointments still in the future (snapshot, not window-limited).",
                "scheduled_upcoming_total": scheduled_future,
            },
        },
    }


def _therapist_client_funnel(start, end):
    new_clients_by_therapist = (
        TherapeuticRelationship.objects.filter(started_at__gte=start, started_at__lt=end)
        .values("therapist", "therapist__name")
        .annotate(new_clients=Count("client", distinct=True))
    )
    active_clients_by_therapist = (
        TherapeuticRelationship.objects.filter(status=TherapeuticRelationship.Status.ACTIVE)
        .values("therapist", "therapist__name")
        .annotate(active_clients=Count("client", distinct=True))
    )
    active_map = {row["therapist"]: row["active_clients"] for row in active_clients_by_therapist}
    rows = []
    for row in new_clients_by_therapist:
        tid = row["therapist"]
        nc = row["new_clients"] or 0
        ac = active_map.get(tid, 0)
        ret = round((ac / nc) * 100, 2) if nc else None
        rows.append(
            {
                "therapist_id": tid,
                "therapist_name": row["therapist__name"] or "Unknown therapist",
                "new_clients": nc,
                "active_clients": ac,
                "retention_pct": ret,
            }
        )
    return rows


def build_therapist_practice_report(start, end, months_in_period, period_type, label) -> dict[str, Any]:
    sessions_taken_qs = Appointment.objects.filter(
        status=Appointment.Status.COMPLETED,
        start_time__gte=start,
        start_time__lt=end,
    )
    revenue_rows = (
        RazorpayPayment.objects.filter(
            status=RazorpayPayment.Status.PAID,
            created_at__gte=start,
            created_at__lt=end,
            booking_request__therapist__isnull=False,
        )
        .values("booking_request__therapist", "booking_request__therapist__name")
        .annotate(total_amount=Coalesce(Sum("amount"), Value(0)), sessions=Count("id"))
        .order_by("-total_amount")
    )
    revenue_by_therapist = [
        {
            "therapist_id": r["booking_request__therapist"],
            "therapist_name": r["booking_request__therapist__name"] or "Unknown therapist",
            "paid_checkouts": r["sessions"],
            "session_revenue_inr": round(rupees_from_paise(r["total_amount"]), 2),
        }
        for r in revenue_rows
    ]
    sessions_per = (
        sessions_taken_qs.values("therapist", "therapist__name")
        .annotate(sessions=Count("id"))
        .order_by("-sessions")
    )
    sessions_per_therapist = [
        {
            "therapist_id": r["therapist"],
            "therapist_name": r["therapist__name"] or "Unknown therapist",
            "sessions_completed": r["sessions"],
        }
        for r in sessions_per
    ]
    funnel = _therapist_client_funnel(start, end)

    rev_map = {r["therapist_id"]: r for r in revenue_by_therapist}
    sess_map = {r["therapist_id"]: r for r in sessions_per_therapist}
    fun_map = {r["therapist_id"]: r for r in funnel}
    all_ids = set(rev_map) | set(sess_map) | set(fun_map)
    scorecard = []
    for tid in all_ids:
        name = (
            (rev_map.get(tid) or {}).get("therapist_name")
            or (sess_map.get(tid) or {}).get("therapist_name")
            or (fun_map.get(tid) or {}).get("therapist_name")
            or "Unknown"
        )
        scorecard.append(
            {
                "therapist_id": tid,
                "therapist_name": name,
                "sessions_completed": (sess_map.get(tid) or {}).get("sessions_completed", 0),
                "session_revenue_inr": (rev_map.get(tid) or {}).get("session_revenue_inr", 0),
                "paid_checkouts": (rev_map.get(tid) or {}).get("paid_checkouts", 0),
                "new_clients": (fun_map.get(tid) or {}).get("new_clients", 0),
                "active_clients": (fun_map.get(tid) or {}).get("active_clients", 0),
                "retention_pct": (fun_map.get(tid) or {}).get("retention_pct"),
            }
        )
    scorecard.sort(key=lambda x: (x["session_revenue_inr"], x["sessions_completed"]), reverse=True)

    return {
        "report_key": "therapist_practice",
        "title": "Therapist practice performance",
        "period": _period_meta(period_type, label, start, end, months_in_period),
        "sections": {
            "scorecard": {
                "title": "Combined scorecard",
                "description": "Per-therapist view of completed sessions, paid checkout revenue, and client funnel.",
                "rows": scorecard,
            },
            "session_revenue_detail": {
                "title": "Revenue by therapist (paid checkouts)",
                "rows": revenue_by_therapist,
            },
            "session_volume": {
                "title": "Completed sessions by therapist",
                "rows": sessions_per_therapist,
            },
            "client_funnel": {
                "title": "New vs active clients",
                "rows": funnel,
            },
        },
    }


def build_supervision_report(start, end, months_in_period, period_type, label) -> dict[str, Any]:
    new_supervisees_by_supervisor = (
        SupervisoryRelationship.objects.filter(created_at__gte=start, created_at__lt=end)
        .values("supervisor", "supervisor__name")
        .annotate(new_supervisees=Count("supervisee", distinct=True))
    )
    active_supervisees_by_supervisor = (
        SupervisoryRelationship.objects.filter(status=SupervisoryRelationship.Status.ACTIVE)
        .values("supervisor", "supervisor__name")
        .annotate(active_supervisees=Count("supervisee", distinct=True))
    )
    active_map = {r["supervisor"]: r["active_supervisees"] for r in active_supervisees_by_supervisor}
    supervisor_funnel = []
    for row in new_supervisees_by_supervisor:
        sid = row["supervisor"]
        ns = row["new_supervisees"] or 0
        aa = active_map.get(sid, 0)
        rp = round((aa / ns) * 100, 2) if ns else None
        supervisor_funnel.append(
            {
                "supervisor_id": sid,
                "supervisor_name": row["supervisor__name"] or "Unknown supervisor",
                "new_supervisees": ns,
                "active_supervisees": aa,
                "retention_pct": rp,
            }
        )

    notes_in_period = SupervisionNote.objects.filter(
        created_at__gte=start, created_at__lt=end
    ).count()

    return {
        "report_key": "supervision",
        "title": "Supervision network",
        "period": _period_meta(period_type, label, start, end, months_in_period),
        "sections": {
            "supervisor_funnel": {
                "title": "Supervisor / supervisee funnel",
                "description": "New supervisee links in the period vs currently active caseload.",
                "rows": supervisor_funnel,
            },
            "documentation": {
                "title": "Supervision notes",
                "description": "Structured notes created in the period.",
                "notes_created": notes_in_period,
            },
        },
    }


def build_platform_report(start, end, months_in_period, period_type, label) -> dict[str, Any]:
    tickets_qs = SupportTicket.objects.filter(created_at__gte=start, created_at__lt=end)
    tickets_by_status = dict(tickets_qs.values("status").annotate(c=Count("id")).values_list("status", "c"))
    tickets_by_category = dict(
        tickets_qs.values("category").annotate(c=Count("id")).values_list("category", "c")
    )

    messages = ContactMessage.objects.filter(created_at__gte=start, created_at__lt=end).count()
    quick = QuickBooking.objects.filter(created_at__gte=start, created_at__lt=end).count()

    return {
        "report_key": "platform",
        "title": "Platform health & inbound",
        "period": _period_meta(period_type, label, start, end, months_in_period),
        "sections": {
            "support_tickets": {
                "title": "Support tickets",
                "description": "Tickets opened in the reporting window.",
                "opened": tickets_qs.count(),
                "by_status": tickets_by_status,
                "by_category": tickets_by_category,
            },
            "contact_form": {
                "title": "Contact form messages",
                "messages_in_period": messages,
            },
            "quick_booking_leads": {
                "title": "Quick booking requests",
                "created_in_period": quick,
            },
        },
    }


def resolve_period_bounds_for_preset(preset: str):
    """
    Calendar boundaries for automated / snapshot presets (evaluated in the current timezone).
    - previous_month: last complete calendar month
    - previous_quarter: last complete calendar quarter
    - previous_year: last complete calendar year
    """
    preset = (preset or "previous_month").lower()
    now = timezone.now()
    local = timezone.localtime(now)
    y, m = local.year, local.month
    if preset == "previous_quarter":
        q = (m - 1) // 3 + 1
        if q == 1:
            return get_period_bounds("quarterly", y - 1, 1, 4)
        return get_period_bounds("quarterly", y, 1, q - 1)
    if preset == "previous_year":
        return get_period_bounds("yearly", y - 1, 1, 1)
    if m == 1:
        return get_period_bounds("monthly", y - 1, 12, 1)
    return get_period_bounds("monthly", y, m - 1, 1)


def denormalized_period_fields(period_type: str, start) -> dict[str, Any]:
    """Store query-friendly year / month / quarter on snapshots."""
    y = start.year
    mo = start.month
    if period_type == "yearly":
        return {"year": y, "month": None, "quarter": None}
    if period_type == "quarterly":
        q = (mo - 1) // 3 + 1
        return {"year": y, "month": None, "quarter": q}
    return {"year": y, "month": mo, "quarter": None}


REPORT_CATALOG = [
    {
        "key": "executive",
        "title": "Executive summary",
        "description": "Headline KPIs with comparison to the immediately prior period of the same length.",
    },
    {
        "key": "growth",
        "title": "Growth & pipeline",
        "description": "Applications, signups, therapeutic and supervision relationships, waitlist.",
    },
    {
        "key": "revenue",
        "title": "Revenue & subscriptions",
        "description": "Session checkout, subscriber billing, trends, and per-therapist subscription settlement.",
    },
    {
        "key": "operations",
        "title": "Clinical operations",
        "description": "Appointment outcomes, booking request funnel, and upcoming workload snapshot.",
    },
    {
        "key": "therapist_practice",
        "title": "Therapist practice",
        "description": "Combined scorecard: sessions, revenue, and client funnel by therapist.",
    },
    {
        "key": "supervision",
        "title": "Supervision network",
        "description": "Supervisor caseload funnel and supervision note volume.",
    },
    {
        "key": "platform",
        "title": "Platform & support",
        "description": "Support tickets, contact messages, and quick booking leads.",
    },
]

REPORT_BUILDERS = {
    "executive": build_executive_report,
    "growth": build_growth_report,
    "revenue": build_revenue_report,
    "operations": build_operations_report,
    "therapist_practice": build_therapist_practice_report,
    "supervision": build_supervision_report,
    "platform": build_platform_report,
}


def build_report(report_key: str, start, end, months_in_period, period_type, label):
    key = (report_key or "executive").lower()
    builder = REPORT_BUILDERS.get(key)
    if not builder:
        return None
    return builder(start, end, months_in_period, period_type, label)


def build_full_overview_payload(start, end, months_in_period, period_type, label):
    """
    Legacy combined payload (single call) — used by /api/admin/reports/overview/
    for backward compatibility and bulk export.
    """
    now = timezone.now()
    kpis = compute_core_kpis(start, end, months_in_period)
    monthly_price, annual_price = _subscription_price_decimals()

    sessions_taken_qs = Appointment.objects.filter(
        status=Appointment.Status.COMPLETED,
        start_time__gte=start,
        start_time__lt=end,
    )

    revenue_by_therapist = [
        {
            "therapist_id": r["booking_request__therapist"],
            "therapist_name": r["booking_request__therapist__name"] or "Unknown therapist",
            "sessions": r["sessions"],
            "amount": round(rupees_from_paise(r["total_amount"]), 2),
        }
        for r in RazorpayPayment.objects.filter(
            status=RazorpayPayment.Status.PAID,
            created_at__gte=start,
            created_at__lt=end,
            booking_request__therapist__isnull=False,
        )
        .values("booking_request__therapist", "booking_request__therapist__name")
        .annotate(total_amount=Coalesce(Sum("amount"), Value(0)), sessions=Count("id"))
        .order_by("-total_amount")
    ]

    sessions_per_therapist = [
        {
            "therapist_id": r["therapist"],
            "therapist_name": r["therapist__name"] or "Unknown therapist",
            "sessions": r["sessions"],
        }
        for r in sessions_taken_qs.values("therapist", "therapist__name")
        .annotate(sessions=Count("id"))
        .order_by("-sessions")
    ]

    therapist_client_funnel = _therapist_client_funnel(start, end)

    new_supervisees_by_supervisor = (
        SupervisoryRelationship.objects.filter(created_at__gte=start, created_at__lt=end)
        .values("supervisor", "supervisor__name")
        .annotate(new_supervisees=Count("supervisee", distinct=True))
    )
    active_supervisees_by_supervisor = (
        SupervisoryRelationship.objects.filter(status=SupervisoryRelationship.Status.ACTIVE)
        .values("supervisor", "supervisor__name")
        .annotate(active_supervisees=Count("supervisee", distinct=True))
    )
    active_super_map = {r["supervisor"]: r["active_supervisees"] for r in active_supervisees_by_supervisor}
    supervisor_funnel = []
    for row in new_supervisees_by_supervisor:
        sid = row["supervisor"]
        ns = row["new_supervisees"] or 0
        aa = active_super_map.get(sid, 0)
        rp = round((aa / ns) * 100, 2) if ns else None
        supervisor_funnel.append(
            {
                "supervisor_id": sid,
                "supervisor_name": row["supervisor__name"] or "Unknown supervisor",
                "new_supervisees": ns,
                "active_supervisees": aa,
                "retention_pct": rp,
            }
        )

    sessions_monthly_series = [
        {"month": row["bucket"].strftime("%Y-%m"), "sessions": row["sessions"]}
        for row in sessions_taken_qs.annotate(bucket=TruncMonth("start_time"))
        .values("bucket")
        .annotate(sessions=Count("id"))
        .order_by("bucket")
        if row["bucket"]
    ]
    session_revenue_monthly_series = [
        {"month": row["bucket"].strftime("%Y-%m"), "revenue": round(rupees_from_paise(row["total"]), 2)}
        for row in RazorpayPayment.objects.filter(
            status=RazorpayPayment.Status.PAID,
            created_at__gte=start,
            created_at__lt=end,
        )
        .annotate(bucket=TruncMonth("created_at"))
        .values("bucket")
        .annotate(total=Coalesce(Sum("amount"), Value(0)))
        .order_by("bucket")
        if row["bucket"]
    ]

    return {
        "period": {
            "period_type": period_type,
            "label": label,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "months_in_period": months_in_period,
            "generated_at": now.isoformat(),
        },
        "kpis": kpis,
        "subscription_breakdown": {
            "monthly_price": float(monthly_price),
            "annual_price": float(annual_price),
            "monthly_subscribers": kpis["active_monthly_subscribers"],
            "annual_subscribers": kpis["active_annual_subscribers"],
        },
        "therapist_performance": {
            "revenue_by_therapist": revenue_by_therapist,
            "sessions_per_therapist": sessions_per_therapist,
            "client_funnel": therapist_client_funnel,
        },
        "supervision_performance": {"supervisor_funnel": supervisor_funnel},
        "series": {
            "sessions_monthly": sessions_monthly_series,
            "session_revenue_monthly": session_revenue_monthly_series,
        },
    }
