import jwt
import time
import uuid
from django.conf import settings

def generate_jitsi_token(user, room_name):
    """
    Generates a JaaS (Jitsi as a Service) JWT token for a specific user and room.
    """
    if not all([settings.JITSI_APP_ID, settings.JITSI_KID, settings.JITSI_PRIVATE_KEY]):
        return None

    now = int(time.time())
    
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
                "name": f"{user.first_name} {user.last_name}" if user.first_name else user.username,
                "email": user.email,
                "id": str(user.id),
                "moderator": True if hasattr(user, 'therapist_profile') else False
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
