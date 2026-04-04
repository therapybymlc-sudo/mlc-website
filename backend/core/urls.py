# core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.http import JsonResponse
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
    ClientJournalViewSet,
    ClientGoalViewSet,
    ClientCheckinViewSet,
    TherapistMaterialViewSet,
    MaterialShareViewSet,
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
router.register(r"client-journals", ClientJournalViewSet, basename="client-journals")
router.register(r"client-goals", ClientGoalViewSet, basename="client-goals")
router.register(r"client-checkins", ClientCheckinViewSet, basename="client-checkins")
router.register(r"materials", TherapistMaterialViewSet, basename="materials")
router.register(r"material-shares", MaterialShareViewSet, basename="material-shares")

# ----------------------------
# Small utility/test endpoints
# ----------------------------
@api_view(["GET"])
def auth_test(request):
    return Response({"message": "Clerk test route working."})

@api_view(["GET"])
def auth_login(request):
    # Real login is handled by Clerk on the frontend; this is just a stub.
    return Response({"message": "Login handled by Clerk."})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({
        "message": "This is a protected route.",
        "user": str(request.user),
    })

def healthz(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    # Serve your built React (optional for local dev at 5173)
    path("", TemplateView.as_view(template_name="index.html"), name="frontend-home"),

    # Admin & simple test/probe routes
    path("admin/", admin.site.urls),
    path("auth-test/", auth_test, name="auth_test"),
    path("auth-login/", auth_login, name="auth_login"),
    path("protected/", protected_view, name="protected"),

    # REST API
    path("api/", include(router.urls)),

    # Simple health check
    path("healthz", healthz, name="healthz"),
]
