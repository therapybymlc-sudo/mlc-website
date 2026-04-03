# core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from therapy.views import (
    TherapistProfileViewSet,
    ClientProfileViewSet,
    AppointmentViewSet,
    SessionRecordViewSet,
    NoteViewSet,
    NoteTemplateViewSet,
    ClientFileViewSet,
    ScheduleEventViewSet,
    EventTypeViewSet,
    WaitlistEntryViewSet,
    TherapistSessionLinkViewSet,
)

# ----------------------------
# DRF Router: API endpoints
# ----------------------------
router = DefaultRouter()
router.register(r"therapists", TherapistProfileViewSet, basename="therapists")
router.register(r"clients", ClientProfileViewSet, basename="clients")
router.register(r"appointments", AppointmentViewSet, basename="appointments")
router.register(r"sessions", SessionRecordViewSet, basename="sessions")
router.register(r"notes", NoteViewSet, basename="notes")
router.register(r"note-templates", NoteTemplateViewSet, basename="note-templates")
router.register(r"files", ClientFileViewSet, basename="files")
router.register(r"schedule-events", ScheduleEventViewSet, basename="schedule-events")
router.register(r"event-types", EventTypeViewSet, basename="event-types")
router.register(r"waitlist", WaitlistEntryViewSet, basename="waitlist")
router.register(r"session-links", TherapistSessionLinkViewSet, basename="session-links")

# ----------------------------
# Small utility/test endpoints
# ----------------------------
@api_view(["GET"])
def keycloak_test(request):
    return Response({"message": "Clerk test route working."})

@api_view(["GET"])
def keycloak_login(request):
    # Real login is handled by Clerk on the frontend; this is just a stub.
    return Response({"message": "Login handled by Clerk."})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({
        "message": "This is a protected route.",
        "user": str(request.user),
    })

urlpatterns = [
    # Serve your built React (optional for local dev at 5173)
    path("", TemplateView.as_view(template_name="index.html"), name="frontend-home"),

    # Admin & simple test/probe routes
    path("admin/", admin.site.urls),
    path("keycloak-test/", keycloak_test, name="keycloak_test"),
    path("keycloak-login/", keycloak_login, name="keycloak_login"),
    path("protected/", protected_view, name="protected"),

    # REST API
    path("api/", include(router.urls)),

    # Simple health check
    path("api/health/", lambda r: Response({"status": "ok"})),
]
