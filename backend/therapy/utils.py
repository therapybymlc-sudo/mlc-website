from django.conf import settings
from .models import TherapistProfile, ClientProfile

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

        display_name = (getattr(auth_user, "get_full_name", lambda: "")() or username or "Unnamed Therapist")
        safe_email = email or f"therapist_{auth_user.pk or 'nouser'}@local"
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
        if client and client.user_id != auth_user.id:
            client.user = auth_user
            client.save(update_fields=["user"])
        return client
    except Exception as e:
        print("⚠️ Client resolution failed:", e)
        return None
