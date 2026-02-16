from jose import jwt, JWTError
import requests
import base64
from django.conf import settings
from rest_framework import authentication, exceptions


class KeycloakAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class to verify Keycloak-issued JWT tokens.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            # Fetch JWKS from Keycloak
            jwks_url = f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/certs"
            jwks = requests.get(jwks_url).json()

            # Get the token header (to find matching key)
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")

            # Find the correct key
            key_data = next((key for key in jwks["keys"] if key["kid"] == kid), None)
            if not key_data:
                raise exceptions.AuthenticationFailed("Public key not found in JWKS")

            # Build public key PEM from modulus (n) and exponent (e)
            n = int.from_bytes(base64.urlsafe_b64decode(key_data["n"] + "=="), "big")
            e = int.from_bytes(base64.urlsafe_b64decode(key_data["e"] + "=="), "big")

            from cryptography.hazmat.primitives.asymmetric import rsa
            from cryptography.hazmat.primitives import serialization

            public_key = rsa.RSAPublicNumbers(e, n).public_key()
            pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            )

            # Decode the token using the generated public key
            decoded_token = jwt.decode(
                token,
                pem,
                algorithms=[key_data["alg"]],
                audience=settings.KEYCLOAK_CLIENT_ID,
                options={"verify_aud": False},
            )

            return (decoded_token, None)

        except JWTError as e:
            raise exceptions.AuthenticationFailed(f"Invalid or expired token: {str(e)}")

        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Token verification failed: {str(e)}")
