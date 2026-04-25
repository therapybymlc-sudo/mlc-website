import base64
import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import jwt
from jwt import PyJWKClient
from django.conf import settings
from rest_framework import authentication, exceptions
from django.contrib.auth import get_user_model
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


def _b64url_decode_json(segment: str) -> dict:
    padding = 4 - len(segment) % 4
    if padding != 4:
        segment += "=" * padding
    return json.loads(base64.urlsafe_b64decode(segment.encode("ascii")))


def _fetch_clerk_primary_email(clerk_user_id: str) -> str | None:
    """
    Resolve the user's real primary email via Clerk Backend API when JWT claims
    don't include email fields.
    """
    if not clerk_user_id:
        return None

    secret_key = (getattr(settings, "CLERK_SECRET_KEY", "") or "").strip()
    if not secret_key:
        return None

    api_base = (getattr(settings, "CLERK_API_BASE", "https://api.clerk.com") or "https://api.clerk.com").rstrip("/")
    url = f"{api_base}/v1/users/{clerk_user_id}"
    req = Request(
        url,
        headers={
            "Authorization": f"Bearer {secret_key}",
            "Accept": "application/json",
        },
        method="GET",
    )

    try:
        with urlopen(req, timeout=8) as resp:
            body = resp.read().decode("utf-8")
        data = json.loads(body or "{}")
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        logger.warning("Clerk email lookup failed for %s: %s", clerk_user_id, exc)
        return None

    primary_id = data.get("primary_email_address_id")
    email_addresses = data.get("email_addresses") or []
    if isinstance(email_addresses, list):
        for item in email_addresses:
            if not isinstance(item, dict):
                continue
            if primary_id and item.get("id") != primary_id:
                continue
            email_value = (item.get("email_address") or "").strip().lower()
            if email_value:
                return email_value
        # Fallback to first valid email if primary id is missing.
        for item in email_addresses:
            if isinstance(item, dict):
                email_value = (item.get("email_address") or "").strip().lower()
                if email_value:
                    return email_value
    return None


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
            header = _b64url_decode_json(token.split(".")[0])
            token_alg = (header.get("alg") or "RS256").strip()

            unverified_payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": False, "verify_aud": False},
            )
            token_issuer = (unverified_payload.get("iss") or "").strip()

            configured_issuer = (settings.CLERK_ISSUER or "").strip()
            jwks_candidates = []

            configured_jwks = (settings.CLERK_JWKS_URL or "").strip()
            if configured_jwks:
                jwks_candidates.append(configured_jwks)

            if configured_issuer:
                parsed_config_issuer = urlparse(configured_issuer)
                if parsed_config_issuer.scheme and parsed_config_issuer.netloc:
                    jwks_candidates.append(
                        f"{parsed_config_issuer.scheme}://{parsed_config_issuer.netloc}/.well-known/jwks.json"
                    )

            if token_issuer:
                parsed_token_issuer = urlparse(token_issuer)
                if parsed_token_issuer.scheme and parsed_token_issuer.netloc:
                    jwks_candidates.append(
                        f"{parsed_token_issuer.scheme}://{parsed_token_issuer.netloc}/.well-known/jwks.json"
                    )

            # Preserve order but remove duplicates.
            seen = set()
            ordered_jwks_candidates = []
            for candidate in jwks_candidates:
                if candidate and candidate not in seen:
                    ordered_jwks_candidates.append(candidate)
                    seen.add(candidate)

            if not ordered_jwks_candidates:
                raise exceptions.AuthenticationFailed("Unable to resolve Clerk JWKS URL.")

            signing_key = None
            signing_key_error = None
            for jwks_url in ordered_jwks_candidates:
                try:
                    jwks_client = PyJWKClient(jwks_url)
                    signing_key = jwks_client.get_signing_key_from_jwt(token)
                    break
                except Exception as key_exc:
                    signing_key_error = key_exc

            if signing_key is None:
                raise exceptions.AuthenticationFailed(f"Invalid Clerk token: {signing_key_error}")

            issuers_to_try = []
            if configured_issuer:
                issuers_to_try.append(configured_issuer)
                normalized = configured_issuer.rstrip("/")
                if normalized and normalized != configured_issuer:
                    issuers_to_try.append(normalized)
            if token_issuer:
                issuers_to_try.append(token_issuer)
                normalized = token_issuer.rstrip("/")
                if normalized and normalized != token_issuer:
                    issuers_to_try.append(normalized)
            if not issuers_to_try:
                issuers_to_try.append(None)

            # Preserve order and dedupe.
            seen_issuers = set()
            ordered_issuers = []
            for issuer in issuers_to_try:
                key = issuer if issuer is not None else "__none__"
                if key in seen_issuers:
                    continue
                seen_issuers.add(key)
                ordered_issuers.append(issuer)

            payload = None
            last_decode_error = None
            algorithms_to_try = []
            if token_alg in ("RS256", "ES256", "EdDSA", "ES384", "ES512"):
                algorithms_to_try.append(token_alg)
            for fallback in ("RS256", "EdDSA"):
                if fallback not in algorithms_to_try:
                    algorithms_to_try.append(fallback)

            for issuer in ordered_issuers:
                payload = None
                for alg in algorithms_to_try:
                    try:
                        kwargs = {
                            "algorithms": [alg],
                            "options": {"verify_aud": False, "verify_exp": True},
                            "leeway": 120,
                        }
                        if issuer:
                            kwargs["issuer"] = issuer
                        try:
                            payload = jwt.decode(token, signing_key, **kwargs)
                        except TypeError:
                            payload = jwt.decode(token, signing_key.key, **kwargs)
                        break
                    except Exception as decode_exc:
                        last_decode_error = decode_exc
                        payload = None
                if payload is not None:
                    break

            if payload is None:
                sub_hint = unverified_payload.get("sub", "?")
                logger.error(
                    "Clerk JWT verify failed sub=%s last_error=%s issuers=%s algs=%s",
                    sub_hint,
                    last_decode_error,
                    ordered_issuers,
                    algorithms_to_try,
                )
                raise exceptions.AuthenticationFailed(f"Invalid Clerk token ({type(last_decode_error).__name__}): {last_decode_error}")

            email = (
                payload.get("email") 
                or payload.get("email_address") 
                or payload.get("primary_email_address")
                or payload.get("primaryEmailAddress")
            )
            if isinstance(email, str):
                email = email.strip().lower()
            username = (
                payload.get("preferred_username")
                or payload.get("username")
                or payload.get("sub")
            )

            if not username:
                raise exceptions.AuthenticationFailed("Token missing subject")

            # Permanent identity fix:
            # If JWT lacks email, resolve primary email directly from Clerk API.
            if not email:
                email = _fetch_clerk_primary_email(payload.get("sub"))

            # Check if this email is in our ironclad admin list
            admin_emails = [
                e.strip().lower()
                for e in getattr(settings, "ADMIN_EMAILS", "therapybymlc@gmail.com,therapy@mlchealth.in").split(",")
                if e.strip()
            ]
            # Must be bool: `email and ...` is None when email is missing (e.g. some
            # OAuth JWTs), and is_staff does not accept NULL on auth_user.
            is_master_admin = bool(email) and email.lower() in admin_emails

            User = get_user_model()
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    # Keep empty until real email is known; avoid sticky fake identities.
                    "email": email or "",
                    "is_staff": is_master_admin,
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
            logger.exception("Clerk authentication unexpected error")
            # Include exception class/message so clients/logs distinguish JWT verify
            # failures (handled above) from decode errors, DB issues, etc.
            raise exceptions.AuthenticationFailed(
                f"Invalid Clerk token ({type(exc).__name__}): {exc}"
            ) from exc
