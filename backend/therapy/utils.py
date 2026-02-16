from .models import TherapistProfile

def _resolve_therapist_from_request(request):
    """Resolve the logged-in therapist based on Keycloak token info."""
    try:
        keycloak_user = request.user  # This is usually the Keycloak user object
        email = getattr(keycloak_user, "email", None)
        username = getattr(keycloak_user, "username", None)

        # Match therapist by email first, fallback to name if needed
        if email:
            therapist = TherapistProfile.objects.filter(email__iexact=email).first()
        elif username:
            therapist = TherapistProfile.objects.filter(name__iexact=username).first()
        else:
            therapist = None

        if not therapist:
            raise TherapistProfile.DoesNotExist("No therapist found for current Keycloak user.")

        return therapist

    except Exception as e:
        print("⚠️ Therapist resolution failed:", e)
        return None
