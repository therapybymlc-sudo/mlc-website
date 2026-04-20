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

            # Check if this email is in our ironclad admin list
            admin_emails = [
                e.strip().lower()
                for e in getattr(settings, "ADMIN_EMAILS", "therapybymlc@gmail.com,therapy@mlchealth.in").split(",")
                if e.strip()
            ]
            is_master_admin = email and email.lower() in admin_emails

            User = get_user_model()
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email or f"{username}@example.invalid",
                    "is_staff": is_master_admin
                },
            )
            
            # Sync staff status and email if they changed
            save_needed = False
            if email and (created or not user.email or user.email.endswith("@example.invalid")):
                user.email = email
                save_needed = True
            
            if is_master_admin and not user.is_staff:
                user.is_staff = True
                save_needed = True
                
            if save_needed:
                user.save()

            return (user, payload)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Token invalid: {str(e)}")
