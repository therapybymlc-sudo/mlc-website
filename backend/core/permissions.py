from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.conf import settings

def get_roles_from_request(request):
    """
    Extract roles from Clerk JWT payload (request.auth).
    Expect a custom claim like:
      { "roles": ["admin", "therapist"] }
    or nested under public_metadata.
    """
    payload = getattr(request, "auth", None)
    if not isinstance(payload, dict):
        return set()
    roles = payload.get("roles")
    if not roles:
        roles = payload.get("public_metadata", {}).get("roles")
    if not roles:
        roles = []
    admin_emails = [
        e.strip().lower()
        for e in getattr(settings, "ADMIN_EMAILS", "").split(",")
        if e.strip()
    ]
    admin_user_ids = [
        uid.strip()
        for uid in getattr(settings, "ADMIN_USER_IDS", "").split(",")
        if uid.strip()
    ]
    payload_email = None
    if isinstance(payload, dict):
        payload_email = payload.get("email") or payload.get("email_address")
        if payload.get("sub") in admin_user_ids:
            roles = list(roles) + ["admin"]
    email = getattr(getattr(request, "user", None), "email", None) or payload_email
    if email and email.lower() in admin_emails:
        roles = list(roles) + ["admin"]
    return set(roles)


class IsAuthenticatedWithJWT(BasePermission):
    def has_permission(self, request, view):
        return isinstance(getattr(request, "auth", None), dict)


class HasAnyRole(BasePermission):
    required_roles = []

    def has_permission(self, request, view):
        if not isinstance(getattr(request, "auth", None), dict):
            return False
        roles = get_roles_from_request(request)
        return bool(roles.intersection(set(self.required_roles)))


class IsAdmin(HasAnyRole):
    required_roles = ["admin"]


class IsTherapist(HasAnyRole):
    required_roles = ["therapist", "admin"]  # admin supersets


class IsReceptionist(HasAnyRole):
    required_roles = ["receptionist", "admin"]


class IsClient(HasAnyRole):
    required_roles = ["client", "admin"]


class IsAnyStaff(HasAnyRole):
    required_roles = ["admin", "therapist", "receptionist"]
