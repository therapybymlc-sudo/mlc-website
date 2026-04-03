import jwt
from jwt import PyJWKClient
from django.conf import settings
from rest_framework import authentication, exceptions
from django.contrib.auth import get_user_model


class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Validate a Clerk JWT and return an authenticated Django user.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1].strip()

        if not settings.CLERK_JWKS_URL:
            raise exceptions.AuthenticationFailed("CLERK_JWKS_URL is not configured")

        try:
            jwks_client = PyJWKClient(settings.CLERK_JWKS_URL)
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            decode_kwargs = {
                "key": signing_key.key,
                "algorithms": ["RS256"],
                "options": {"verify_aud": False, "verify_exp": True},
            }
            if settings.CLERK_ISSUER:
                decode_kwargs["issuer"] = settings.CLERK_ISSUER

            payload = jwt.decode(token, **decode_kwargs)

            email = payload.get("email") or payload.get("email_address")
            username = (
                payload.get("preferred_username")
                or email
                or payload.get("sub")
            )

            if not username:
                raise exceptions.AuthenticationFailed("Token missing subject")

            User = get_user_model()
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={"email": email or f"{username}@example.invalid"},
            )

            return (user, token)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Token invalid: {str(e)}")
