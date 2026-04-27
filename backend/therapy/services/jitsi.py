import jwt
import time
from django.conf import settings


def resolve_jitsi_display_name(user):
    """
    Human-readable name for Jitsi / JaaS. Avoids Clerk-style usernames (user_...)
    when Django first/last name were never synced.
    """
    if not user or not getattr(user, "pk", None):
        return "Guest"

    first = (getattr(user, "first_name", None) or "").strip()
    last = (getattr(user, "last_name", None) or "").strip()
    full = f"{first} {last}".strip()
    if full:
        return full

    # Canonical clinical profiles (preferred over auth username)
    try:
        from therapy.models import ClientProfile, TherapistProfile

        tp = TherapistProfile.objects.filter(user_id=user.pk).first()
        if tp and (tp.name or "").strip():
            return tp.name.strip()
        cp = ClientProfile.objects.filter(user_id=user.pk).first()
        if cp and (cp.name or "").strip():
            return cp.name.strip()
    except Exception:
        pass

    email = (getattr(user, "email", None) or "").strip()
    if email and "@" in email and not email.endswith("@example.invalid"):
        local = email.split("@", 1)[0].strip()
        local = local.replace(".", " ").replace("_", " ").strip()
        if local and not local.lower().startswith("user"):
            return local if not local.islower() else local.title()

    uname = (getattr(user, "username", None) or "").strip()
    if uname and not uname.startswith("user_"):
        return uname

    return "MLC Participant"


def generate_jitsi_token(user, room_name):
    """
    Generates a JaaS (Jitsi as a Service) JWT token for a specific user and room.
    """
    if not all([settings.JITSI_APP_ID, settings.JITSI_KID, settings.JITSI_PRIVATE_KEY]):
        return None

    now = int(time.time())

    display_name = resolve_jitsi_display_name(user)
    try:
        from therapy.models import TherapistProfile

        is_moderator = TherapistProfile.objects.filter(user_id=user.pk).exists()
    except Exception:
        is_moderator = False

    # Jitsi JaaS JWT Payload
    payload = {
        "aud": "jitsi",
        "iss": "chat",
        "iat": now,
        "exp": now + 7200, # Valid for 2 hours
        "nbf": now - 10,
        "sub": settings.JITSI_APP_ID,
        "room": room_name,
        "context": {
            "features": {
                "livestreaming": True,
                "file-upload": True,
                "transcription": True,
                "recording": True
            },
            "user": {
                "name": display_name,
                "email": user.email or "",
                "id": str(user.id),
                "moderator": is_moderator,
            }
        }
    }

    headers = {
        "kid": settings.JITSI_KID,
        "typ": "JWT",
        "alg": "RS256"
    }

    try:
        # Load the private key (handle both file-style strings and single-line escapes)
        private_key = settings.JITSI_PRIVATE_KEY.replace('\\n', '\n')
        token = jwt.encode(payload, private_key, algorithm="RS256", headers=headers)
        return token
    except Exception as e:
        print(f"Error generating Jitsi token: {e}")
        return None
