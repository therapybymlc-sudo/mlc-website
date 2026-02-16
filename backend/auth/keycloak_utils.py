import requests
from django.conf import settings

def refresh_keycloak_token(refresh_token):
    url = f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/token"
    data = {
        "client_id": settings.KEYCLOAK_CLIENT_ID,
        "client_secret": settings.KEYCLOAK_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }
    response = requests.post(url, data=data)
    if response.status_code == 200:
        return response.json()  # contains new access_token & refresh_token
    else:
        raise Exception(f"Token refresh failed: {response.text}")
