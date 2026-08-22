from django.conf import settings
from django.utils import timezone
from .models import TherapistProfile, ClientProfile, TherapeuticRelationship


def is_placeholder_client_label(value) -> bool:
    if not value or not str(value).strip():
        return True
    t = str(value).strip()
    lo = t.lower()
    if lo in {"user", "new client", "unknown", "client", "patient", "unnamed client"}:
        return True
    if lo.startswith("user_"):
        return True
    return False


def _name_parts_from_auth_payload(auth_payload) -> tuple[str, str]:
    if not isinstance(auth_payload, dict):
        return "", ""
    first = (
        auth_payload.get("given_name")
        or auth_payload.get("first_name")
        or auth_payload.get("firstName")
        or ""
    )
    last = (
        auth_payload.get("family_name")
        or auth_payload.get("last_name")
        or auth_payload.get("lastName")
        or ""
    )
    return str(first).strip(), str(last).strip()


def resolve_user_display_name(user, auth_payload=None, fallback="Client") -> str:
    """
    Human-readable label for profile creation. Never returns Clerk-style user IDs.
    """
    if not user:
        return fallback

    first = (getattr(user, "first_name", None) or "").strip()
    last = (getattr(user, "last_name", None) or "").strip()
    if auth_payload is not None and not first and not last:
        payload_first, payload_last = _name_parts_from_auth_payload(auth_payload)
        first = payload_first
        last = payload_last

    full_name = f"{first} {last}".strip()
    if full_name and not is_placeholder_client_label(full_name):
        return full_name[:100]

    raw_full = (getattr(user, "get_full_name", lambda: "")() or "").strip()
    if raw_full and not is_placeholder_client_label(raw_full):
        return raw_full[:100]

    username = (getattr(user, "username", None) or "").strip()
    if username and not is_placeholder_client_label(username):
        return username[:100]

    email = (getattr(user, "email", None) or "").strip().lower()
    if email and "@" in email and not email.endswith("@local") and not email.endswith("@example.invalid"):
        local = email.split("@", 1)[0]
        if local and not is_placeholder_client_label(local):
            return local[:100]

    return fallback


def sync_client_profile_identity(client, user, auth_payload=None) -> bool:
    """
    Repair placeholder client names/emails when real identity data becomes available.
    Returns True when the profile was updated.
    """
    if not client or not user:
        return False

    save_needed = False
    update_fields = []

    first = (getattr(user, "first_name", None) or "").strip()
    last = (getattr(user, "last_name", None) or "").strip()
    if auth_payload is not None and not first and not last:
        payload_first, payload_last = _name_parts_from_auth_payload(auth_payload)
        first = payload_first
        last = payload_last

    full_name = f"{first} {last}".strip()
    current_name = (client.name or "").strip()
    if is_placeholder_client_label(current_name):
        candidate = full_name
        if not candidate or is_placeholder_client_label(candidate):
            candidate = resolve_user_display_name(user, auth_payload=auth_payload, fallback="")
        if candidate and not is_placeholder_client_label(candidate):
            client.name = candidate[:100]
            save_needed = True
            update_fields.append("name")

    email = (getattr(user, "email", None) or "").strip().lower()
    if auth_payload and not email:
        email = (
            auth_payload.get("email")
            or auth_payload.get("email_address")
            or auth_payload.get("primary_email_address")
            or auth_payload.get("primaryEmailAddress")
            or ""
        )
        if isinstance(email, str):
            email = email.strip().lower()

    if email and not email.endswith("@example.invalid") and not email.endswith("@local"):
        current_email = (client.email or "").strip().lower()
        email_placeholder = (
            not current_email
            or "@example.invalid" in current_email
            or current_email.endswith("@local")
        )
        if email_placeholder:
            client.email = email
            save_needed = True
            update_fields.append("email")

    if save_needed:
        client.save(update_fields=list(dict.fromkeys(update_fields)))
    return save_needed


def caseload_client_ids_for_therapist(therapist, *, active_only=False) -> list[int]:
    """
    Clients that belong on a therapist's caseload via an explicit therapeutic
    relationship (booking, calendar session, or manual link/add).
    """
    if not therapist:
        return []
    qs = TherapeuticRelationship.objects.filter(therapist=therapist)
    if active_only:
        qs = qs.filter(status=TherapeuticRelationship.Status.ACTIVE)
    return list(qs.values_list("client_id", flat=True).distinct())


def ensure_therapeutic_relationship(therapist, client, *, make_primary=False):
    """
    Create or reactivate a therapist↔client relationship. Never links a client
    to therapists they have not explicitly booked with or been added by.
    """
    if not therapist or not client:
        return None

    active = (
        TherapeuticRelationship.objects.filter(
            therapist=therapist,
            client=client,
            status=TherapeuticRelationship.Status.ACTIVE,
        )
        .order_by("-started_at")
        .first()
    )
    if active:
        if make_primary and not active.is_primary:
            TherapeuticRelationship.objects.filter(
                client=client,
                status=TherapeuticRelationship.Status.ACTIVE,
                is_primary=True,
            ).exclude(pk=active.pk).update(is_primary=False)
            active.is_primary = True
            active.save(update_fields=["is_primary", "updated_at"])
        return active

    paused = (
        TherapeuticRelationship.objects.filter(
            therapist=therapist,
            client=client,
            status=TherapeuticRelationship.Status.PAUSED,
        )
        .order_by("-updated_at")
        .first()
    )
    if paused:
        paused.status = TherapeuticRelationship.Status.ACTIVE
        paused.ended_at = None
        if make_primary:
            paused.is_primary = True
        paused.save(update_fields=["status", "ended_at", "is_primary", "updated_at"])
        return paused

    ended = (
        TherapeuticRelationship.objects.filter(
            therapist=therapist,
            client=client,
            status=TherapeuticRelationship.Status.ENDED,
        )
        .order_by("-updated_at")
        .first()
    )
    if ended:
        ended.status = TherapeuticRelationship.Status.ACTIVE
        ended.ended_at = None
        if make_primary:
            ended.is_primary = True
        ended.save(update_fields=["status", "ended_at", "is_primary", "updated_at"])
        return ended

    relationship = TherapeuticRelationship.objects.create(
        therapist=therapist,
        client=client,
        status=TherapeuticRelationship.Status.ACTIVE,
        is_primary=bool(make_primary),
        started_at=timezone.now(),
    )
    if make_primary:
        TherapeuticRelationship.objects.filter(
            client=client,
            status=TherapeuticRelationship.Status.ACTIVE,
            is_primary=True,
        ).exclude(pk=relationship.pk).update(is_primary=False)
    return relationship


def link_client_to_therapist_caseload(therapist, client, *, make_primary=False):
    """
    Connect an existing client profile to a therapist's caseload by email match or
    explicit add. Optionally sets the legacy primary therapist FK when unset.
    """
    if not therapist or not client:
        return None
    relationship = ensure_therapeutic_relationship(
        therapist, client, make_primary=make_primary
    )
    if not client.therapist_id and make_primary:
        client.therapist = therapist
        client.save(update_fields=["therapist"])
    return relationship


def client_preferred_display_name(client) -> str:
    """
    Stable label for therapist- and client-facing UIs. Avoids Clerk-style placeholders
    (e.g. user_... / "User") when real email or other fields exist.
    """
    if not client:
        return ""
    for candidate in (
        getattr(client, "preferred_first_name", None),
        (f"{(client.first_name or '')} {(client.last_name or '')}").strip() or None,
        client.name,
    ):
        if candidate and not is_placeholder_client_label(candidate):
            return str(candidate)[:200]
    email = (getattr(client, "email", None) or "").strip()
    if email and not email.endswith("@local") and "@" in email:
        return email
    if email and not email.endswith("@local"):
        return email
    local = email.split("@", 0)[0] if email and "@" in email else (email or "")
    if local and not is_placeholder_client_label(local):
        return local
    return f"Client #{getattr(client, 'pk', '')}"

def _resolve_therapist_from_request(request, allow_create=False):
    """Resolve the logged-in therapist based on authenticated user info."""
    try:
        auth_user = getattr(request, "user", None)
        if not auth_user or not auth_user.is_authenticated:
            return None

        therapist_profile = getattr(auth_user, "therapist_profile", None)
        if therapist_profile:
            return therapist_profile

        email = getattr(auth_user, "email", None)
        username = getattr(auth_user, "username", None)

        # Match therapist by email first, fallback to name if needed
        therapist = None
        if email:
            therapist = TherapistProfile.objects.filter(email__iexact=email).first()
        elif username:
            therapist = TherapistProfile.objects.filter(name__iexact=username).first()

        if therapist:
            if therapist.user_id != auth_user.id:
                therapist.user = auth_user
                therapist.save(update_fields=["user"])
            return therapist

        if not allow_create:
            return None

        if not email or email.endswith("@example.invalid"):
            return None

        display_name = resolve_user_display_name(auth_user, fallback="Therapist")
        safe_email = email
        therapist = TherapistProfile.objects.create(
            user=auth_user,
            name=display_name,
            email=safe_email,
        )
        return therapist

    except Exception as e:
        print("⚠️ Therapist resolution failed:", e)
        return None


def _resolve_client_from_request(request):
    """Resolve the logged-in client based on authenticated user info."""
    try:
        auth_user = getattr(request, "user", None)
        if not auth_user or not auth_user.is_authenticated:
            return None

        client_profile = getattr(auth_user, "client_profile", None)
        if client_profile:
            return client_profile

        email = getattr(auth_user, "email", None)
        if not email:
            return None

        client = ClientProfile.objects.filter(email__iexact=email).first()
        if client:
            if client.user_id != auth_user.id:
                client.user = auth_user
                client.save(update_fields=["user"])
            return client
            
        if email.endswith("@example.invalid"):
            return None

        display_name = resolve_user_display_name(auth_user, fallback="Client")
        safe_email = email
        client = ClientProfile.objects.create(
            user=auth_user,
            name=display_name,
            email=safe_email,
        )
        return client
    except Exception as e:
        print("⚠️ Client resolution failed:", e)
        return None


DASS_MAPPING = {
    'stress': [30, 35, 37, 40, 41, 43, 47],
    'anxiety': [31, 33, 36, 38, 44, 48, 49],
    'depression': [32, 34, 39, 42, 45, 46, 50],
}


def calculate_dass_scores(answers):
    scores = {'depression': 0, 'anxiety': 0, 'stress': 0}
    for subscale, questions in DASS_MAPPING.items():
        total = 0
        for q_num in questions:
            val = int(answers.get(str(q_num), 0))
            total += val
        scores[subscale] = total * 2
    return scores


def get_dass_severity(scores):
    depression = scores['depression']
    anxiety = scores['anxiety']
    stress = scores['stress']
    
    levels = {}
    
    if depression <= 9: levels['depression'] = 'Normal'
    elif depression <= 13: levels['depression'] = 'Mild'
    elif depression <= 20: levels['depression'] = 'Moderate'
    elif depression <= 27: levels['depression'] = 'Severe'
    else: levels['depression'] = 'Extremely severe'
    
    if anxiety <= 7: levels['anxiety'] = 'Normal'
    elif anxiety <= 9: levels['anxiety'] = 'Mild'
    elif anxiety <= 14: levels['anxiety'] = 'Moderate'
    elif anxiety <= 19: levels['anxiety'] = 'Severe'
    else: levels['anxiety'] = 'Extremely severe'
    
    if stress <= 14: levels['stress'] = 'Normal'
    elif stress <= 18: levels['stress'] = 'Mild'
    elif stress <= 25: levels['stress'] = 'Moderate'
    elif stress <= 33: levels['stress'] = 'Severe'
    else: levels['stress'] = 'Extremely severe'
    
    return levels


def generate_dass_summary(levels):
    # Combine the subscale levels into a warm, non-diagnostic paragraph
    elevated = [k for k, v in levels.items() if v != 'Normal']
    
    if not elevated:
        return "Thank you for completing this screening. Your responses suggest that symptoms of depression, anxiety, and stress have remained largely within the typical range over the past week. Even so, therapy can still be valuable if there are concerns, patterns, or life circumstances you would like support with."
    
    if all(levels[k] in ['Normal', 'Mild', 'Moderate'] for k in levels):
        return f"Thank you for completing this screening. Your responses suggest that you may be experiencing some meaningful emotional strain at the moment, particularly in the areas of {', '.join(elevated)}. While this screening is not a diagnosis, it does suggest that support could be beneficial."

    if any(levels[k] == 'Extremely severe' for k in levels):
        extreme_domains = [k for k, v in levels.items() if v == 'Extremely severe']
        return f"Thank you for completing this screening. Your responses suggest a very elevated level of distress in the area of {', '.join(extreme_domains)}. While this screening is not a diagnosis, it does indicate that careful and timely support may be especially important at this time."

    return f"Thank you for completing this screening. Your responses suggest that you may be experiencing a significant level of distress at present, particularly in the areas of {', '.join(elevated)}. This screening is not diagnostic, but it does suggest that timely support may be important."
