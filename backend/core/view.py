from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

def keycloak_test(request):
    """Simple route to confirm Keycloak integration."""
    return JsonResponse({"message": "Keycloak test route working ✅"})

def keycloak_login(request):
    """Temporary login endpoint placeholder."""
    return JsonResponse({"message": "Login handled by Keycloak (mock endpoint)."})

@login_required
def protected_view(request):
    """Protected route example."""
    return JsonResponse({
        "message": "Authenticated via Keycloak ✅",
        "user": str(request.user),
    })
