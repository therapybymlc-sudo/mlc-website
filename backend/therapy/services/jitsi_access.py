"""
Time-window rules for issuing Jitsi / JaaS tokens tied to clinical sessions.

Rooms like MLC_<appointment_id> or MLC_Session_<relationship_id> are only open from
1 hour before session start through 1 hour after session end.

Informal / demo rooms (lobby, secure lounge) stay always available.
"""
from __future__ import annotations

import re
from datetime import timedelta

from django.utils import timezone

from therapy.models import Appointment, TherapeuticRelationship

_WINDOW_PRE = timedelta(hours=1)
_WINDOW_POST = timedelta(hours=1)
_DEFAULT_SESSION_MINUTES = 50

# Lowercased room tokens that are not bound to a specific appointment.
_ALWAYS_OPEN = frozenset(
    {
        "",
        "lobby",
        "mlc-secure-lounge",
        "mlc_secure_lounge",
        "secure-lounge",
        "secure_lounge",
    }
)


def normalize_room_token(room: str) -> str:
    return (room or "").strip().lower()


def is_always_open_room(normalized: str) -> bool:
    if not normalized:
        return True
    return normalized in _ALWAYS_OPEN


def _appointment_time_bounds(appt: Appointment):
    start = appt.start_time or appt.date
    if not start:
        return None, None
    end = appt.end_time
    if not end:
        minutes = _DEFAULT_SESSION_MINUTES
        try:
            if appt.therapist_id:
                sd = getattr(appt.therapist, "session_duration", None)
                if sd is not None:
                    minutes = int(sd) or _DEFAULT_SESSION_MINUTES
        except (TypeError, ValueError):
            minutes = _DEFAULT_SESSION_MINUTES
        end = start + timedelta(minutes=minutes)
    return start, end


def _user_participates_in_appointment(user, appt: Appointment) -> bool:
    if getattr(user, "is_staff", False):
        return True
    th_uid = getattr(appt.therapist, "user_id", None)
    cl_uid = getattr(appt.client, "user_id", None)
    if th_uid and th_uid == user.id:
        return True
    if cl_uid and cl_uid == user.id:
        return True
    return False


def _user_participates_in_relationship(user, rel: TherapeuticRelationship) -> bool:
    if getattr(user, "is_staff", False):
        return True
    if rel.therapist.user_id and rel.therapist.user_id == user.id:
        return True
    if rel.client.user_id and rel.client.user_id == user.id:
        return True
    return False


def _appointment_blocked_by_status(appt: Appointment) -> bool:
    return appt.status in {Appointment.Status.CANCELLED, Appointment.Status.NO_SHOW}


def assert_jitsi_room_allowed(user, room_name: str) -> tuple[bool, str | None]:
    """
    Returns (allowed, error_detail). error_detail is suitable for API 403 body.
    """
    n = normalize_room_token(room_name)
    if is_always_open_room(n):
        return True, None

    now = timezone.now()

    m_appt = re.match(r"^mlc_(\d+)$", n)
    if m_appt:
        appt_id = int(m_appt.group(1))
        appt = (
            Appointment.objects.filter(pk=appt_id)
            .select_related("therapist", "client")
            .first()
        )
        if not appt:
            return False, "Session not found."
        if _appointment_blocked_by_status(appt):
            return False, "This session is not available."
        if not _user_participates_in_appointment(user, appt):
            return False, "You do not have access to this session."
        start, end = _appointment_time_bounds(appt)
        if not start or not end:
            return False, "This session does not have a scheduled time yet."
        if not (start - _WINDOW_PRE <= now <= end + _WINDOW_POST):
            return (
                False,
                "The video room is only open from 1 hour before until 1 hour after your scheduled session.",
            )
        return True, None

    m_rel = re.match(r"^mlc_session_(\d+)$", n)
    if m_rel:
        rel_id = int(m_rel.group(1))
        rel = (
            TherapeuticRelationship.objects.filter(pk=rel_id)
            .select_related("therapist", "client")
            .first()
        )
        if not rel:
            return False, "Session room not found."
        if rel.status != TherapeuticRelationship.Status.ACTIVE:
            return False, "This care relationship is not active."
        if not _user_participates_in_relationship(user, rel):
            return False, "You do not have access to this session."

        qs = (
            Appointment.objects.filter(therapist=rel.therapist, client=rel.client)
            .exclude(
                status__in={
                    Appointment.Status.CANCELLED,
                    Appointment.Status.NO_SHOW,
                }
            )
            .select_related("therapist", "client")
        )
        for appt in qs.order_by("-start_time", "-date", "-id"):
            start, end = _appointment_time_bounds(appt)
            if not start or not end:
                continue
            if start - _WINDOW_PRE <= now <= end + _WINDOW_POST:
                return True, None
        return (
            False,
            "The video room is only open from 1 hour before until 1 hour after your scheduled session.",
        )

    return False, "Unrecognized meeting room."
