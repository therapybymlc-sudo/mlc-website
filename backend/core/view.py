from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

def keycloak_test(request):
    """Simple route to confirm Clerk integration."""
    return JsonResponse({"message": "Clerk test route working ✅"})

def keycloak_login(request):
    """Temporary login endpoint placeholder."""
    return JsonResponse({"message": "Login handled by Clerk (mock endpoint)."})

@login_required
def protected_view(request):
    """Protected route example."""
    return JsonResponse({
        "message": "Authenticated via Clerk ✅",
        "user": str(request.user),
    })
