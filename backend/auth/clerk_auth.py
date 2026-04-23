import jwt
from jwt import PyJWKClient
from django.conf import settings
from rest_framework import authentication, exceptions
from django.contrib.auth import get_user_model
from urllib.parse import urlparse


class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Validate a Clerk JWT and return an authenticated Django user.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1].strip()

        try:
            unverified_payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": False, "verify_aud": False},
            )
            token_issuer = (unverified_payload.get("iss") or "").strip()

            jwks_url = (settings.CLERK_JWKS_URL or "").strip()
            if not jwks_url and token_issuer:
                parsed_issuer = urlparse(token_issuer)
                if parsed_issuer.scheme and parsed_issuer.netloc:
                    jwks_url = f"{parsed_issuer.scheme}://{parsed_issuer.netloc}/.well-known/jwks.json"

            if not jwks_url:
                raise exceptions.AuthenticationFailed("Unable to resolve Clerk JWKS URL.")

            jwks_client = PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            configured_issuer = (settings.CLERK_ISSUER or "").strip()
            issuers_to_try = []
            if configured_issuer:
                issuers_to_try.append(configured_issuer)
            if token_issuer and token_issuer.rstrip("/") != configured_issuer.rstrip("/"):
                issuers_to_try.append(token_issuer)
            if not issuers_to_try:
                issuers_to_try.append(None)

            payload = None
            last_decode_error = None
            for issuer in issuers_to_try:
                try:
                    decode_kwargs = {
                        "key": signing_key.key,
                        "algorithms": ["RS256", "EdDSA"],
                        "options": {"verify_aud": False, "verify_exp": True},
                    }
                    if issuer:
                        decode_kwargs["issuer"] = issuer
                    payload = jwt.decode(token, **decode_kwargs)
                    break
                except Exception as decode_exc:
                    last_decode_error = decode_exc

            if payload is None:
                raise exceptions.AuthenticationFailed(f"Invalid Clerk token: {last_decode_error}")

            email = (
                payload.get("email") 
                or payload.get("email_address") 
                or payload.get("primary_email_address")
                or payload.get("primaryEmailAddress")
            )
            username = (
                payload.get("preferred_username")
                or payload.get("username")
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
            
            # Sync names, staff status and email if they changed
            save_needed = False
            first_name = payload.get("given_name") or payload.get("first_name") or payload.get("firstName") or ""
            last_name = payload.get("family_name") or payload.get("last_name") or payload.get("lastName") or ""
            
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                save_needed = True
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                save_needed = True
                
            if email and (created or not user.email or user.email.endswith("@example.invalid")):
                user.email = email
                save_needed = True
            
            if is_master_admin and not user.is_staff:
                user.is_staff = True
                save_needed = True
                
            if save_needed:
                user.save()

            return (user, payload)

        except jwt.ExpiredSignatureError as exc:
            raise exceptions.AuthenticationFailed("Token expired.") from exc
        except exceptions.AuthenticationFailed:
            raise
        except Exception as exc:
            raise exceptions.AuthenticationFailed("Invalid Clerk token.") from exc
