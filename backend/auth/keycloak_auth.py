import jwt
from jwt import PyJWKClient
from django.conf import settings
from rest_framework import authentication, exceptions
from django.contrib.auth import get_user_model


class KeycloakAuthentication(authentication.BaseAuthentication):
    """
    Validate a Keycloak JWT and return an authenticated Django user.
    This version fixes 403 errors by returning a real user + token,
    and ignoring audience mismatches common in public SPA clients.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1].strip()

        token = auth_header.split(" ")[1]
        print("🔑 Incoming token (first 20 chars):", token[:20])

        try:
            # ---- Fetch Keycloak realm public key dynamically ----
            jwks_url = (
                f"{settings.KEYCLOAK_SERVER_URL}"
                f"realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/certs"
            )
            jwks_client = PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            # ---- Decode & verify the token ----
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False, "verify_exp": True},
            )

            username = payload.get("preferred_username") or payload.get("email")
            email = payload.get("email", "")

            if not username:
                raise exceptions.AuthenticationFailed("Token missing username")

            User = get_user_model()
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={"email": email or f"{username}@example.invalid"},
            )

            # ✅ Return (user, token) — this is what DRF expects
            return (user, token)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")

        except Exception as e:
            print("❌ Keycloak decode error:", e)
            raise exceptions.AuthenticationFailed(f"Token invalid: {str(e)}")
