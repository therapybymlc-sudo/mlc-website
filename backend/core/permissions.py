from rest_framework.permissions import BasePermission, SAFE_METHODS

def get_roles_from_request(request):
    """
    Your KeycloakAuthentication returns (decoded_token, None) as request.user.
    decoded_token looks like:
      {
        "realm_access": {"roles": ["admin", "therapist", ...]},
        ...
      }
    """
    decoded = getattr(request, "user", None)
    if not isinstance(decoded, dict):
        return set()
    roles = decoded.get("realm_access", {}).get("roles", []) or []
    return set(roles)


class IsAuthenticatedWithJWT(BasePermission):
    def has_permission(self, request, view):
        return isinstance(getattr(request, "user", None), dict)


class HasAnyRole(BasePermission):
    required_roles = []

    def has_permission(self, request, view):
        if not isinstance(getattr(request, "user", None), dict):
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
