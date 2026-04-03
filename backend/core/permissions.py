from rest_framework.permissions import BasePermission, SAFE_METHODS

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
