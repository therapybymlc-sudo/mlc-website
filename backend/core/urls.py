# core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from therapy.admin_report_views import (
    AdminReportEmailScheduleViewSet,
    AdminReportSnapshotViewSet,
)
from therapy.views import (
    TherapistProfileViewSet,
    ClientProfileViewSet,
    AppointmentViewSet,
    AvailabilitySlotViewSet,
    BookingRequestViewSet,
    TherapistBookingRequestViewSet,
    ClientAppointmentViewSet,
    NotificationViewSet,
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
    ResourceViewSet,
    SharedResourceAssignmentViewSet,
    ClientResourceAssignmentViewSet,
    TherapistApplicationCreateView,
    TeamMemberViewSet,
    ServiceViewSet,
    HomeContentViewSet,
    AboutContentViewSet,
    TherapistsContentViewSet,
    ServicesContentViewSet,
    ContactContentViewSet,
    TrainingProgramsContentViewSet,
    CareersContentViewSet,
    TherapistApplyContentViewSet,
    AvailabilitySlotPublicView,
    PublicTherapistDirectoryView,
    terminate_relationship,
    OnboardUserRoleView,
    TherapistMatchView,
    TherapistApplicationViewSet,
    VerifyTherapistView,
    ContactMessageViewSet,
    QuickBookingViewSet,
    SafetyPlanViewSet,
    TherapeuticRelationshipViewSet,
    SupervisoryRelationshipViewSet,
    SupervisionNoteViewSet,
    SupervisionActionItemViewSet,
    SupervisionReflectionViewSet,
    ClientFormAssignmentViewSet,
    RazorpayCreateOrderView,
    RazorpayVerifyPaymentView,
    RazorpayWebhookView,
    RazorpayCreateTherapistSubscriptionView,
    RazorpayVerifyTherapistSubscriptionView,
    TherapistSubscriptionStatusView,
    TherapistCancelSubscriptionView,
    AdminReportsOverviewView,
    AdminReportsCatalogView,
    AdminReportDetailView,
    RocketChatSessionView,
    SupportTicketViewSet,
    CommunityCategoryViewSet,
    CommunityThreadViewSet,
    CommunityCommentViewSet,
    ReferralViewSet,
    PlatformFeedbackViewSet,
)

# ----------------------------
# DRF Router: API endpoints
# ----------------------------
router = DefaultRouter()
router.register(r"therapists", TherapistProfileViewSet, basename="therapists")
router.register(r"clients", ClientProfileViewSet, basename="clients")
router.register(r"appointments", AppointmentViewSet, basename="appointments")
router.register(r"availability-slots", AvailabilitySlotViewSet, basename="availability-slots")
router.register(r"booking-requests", BookingRequestViewSet, basename="booking-requests")
router.register(r"therapist-booking-requests", TherapistBookingRequestViewSet, basename="therapist-booking-requests")
router.register(r"client-appointments", ClientAppointmentViewSet, basename="client-appointments")
router.register(r"notifications", NotificationViewSet, basename="notifications")
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
router.register(r"resources", ResourceViewSet, basename="resources")
router.register(r"resource-assignments", SharedResourceAssignmentViewSet, basename="resource-assignments")
router.register(r"client-resource-assignments", ClientResourceAssignmentViewSet, basename="client-resource-assignments")
router.register(r"team-members", TeamMemberViewSet, basename="team-members")
router.register(r"services", ServiceViewSet, basename="services")
router.register(r"home-content", HomeContentViewSet, basename="home-content")
router.register(r"about-content", AboutContentViewSet, basename="about-content")
router.register(r"therapists-content", TherapistsContentViewSet, basename="therapists-content")
router.register(r"services-content", ServicesContentViewSet, basename="services-content")
router.register(r"contact-content", ContactContentViewSet, basename="contact-content")
router.register(r"training-programs-content", TrainingProgramsContentViewSet, basename="training-programs-content")
router.register(r"careers-content", CareersContentViewSet, basename="careers-content")
router.register(r"therapist-apply-content", TherapistApplyContentViewSet, basename="therapist-apply-content")
router.register(r"manage-therapist-applications", TherapistApplicationViewSet, basename="manage-therapist-applications")
router.register(r"contact-messages", ContactMessageViewSet, basename="contact-messages")
router.register(r"quick-bookings", QuickBookingViewSet, basename="quick-bookings")
router.register(r"safety-plans", SafetyPlanViewSet, basename="safety-plans")
router.register(r"therapist-relationships", TherapeuticRelationshipViewSet, basename="therapist-relationships")
router.register(r"supervisory-relationships", SupervisoryRelationshipViewSet, basename="supervisory-relationships")
router.register(r"supervision-notes", SupervisionNoteViewSet, basename="supervision-notes")
router.register(r"supervision-action-items", SupervisionActionItemViewSet, basename="supervision-action-items")
router.register(r"supervision-reflections", SupervisionReflectionViewSet, basename="supervision-reflections")
router.register(r"client-form-assignments", ClientFormAssignmentViewSet, basename="client-form-assignments")
router.register(r"support-tickets", SupportTicketViewSet, basename="support-tickets")
router.register(r"admin/report-snapshots", AdminReportSnapshotViewSet, basename="admin-report-snapshots")
router.register(
    r"admin/report-email-schedules",
    AdminReportEmailScheduleViewSet,
    basename="admin-report-email-schedules",
)
router.register(r"community/categories", CommunityCategoryViewSet, basename="community-categories")
router.register(r"community/threads", CommunityThreadViewSet, basename="community-threads")
router.register(r"community/comments", CommunityCommentViewSet, basename="community-comments")
router.register(r"referrals", ReferralViewSet, basename="referrals")
router.register(r"feedback", PlatformFeedbackViewSet, basename="feedback")

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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def whoami(request):
    payload = request.auth or {}
    public_meta = {}
    if isinstance(payload, dict):
        public_meta = payload.get("public_metadata") or payload.get("publicMetadata") or {}
    roles = public_meta.get("roles") if isinstance(public_meta.get("roles"), list) else []
    if not roles and public_meta.get("role"):
        roles = [public_meta.get("role")]
    if isinstance(roles, str):
        roles = [roles]
    MASTER_ADMIN_IDS = ["user_3CalFf5iOUKgTEq1efJUXni3y98"]
    MASTER_ADMIN_EMAILS = ["therapybymlc@gmail.com", "therapy@mlchealth.in"]
    admin_emails = [
        e.strip().lower()
        for e in getattr(settings, "ADMIN_EMAILS", "").split(",")
        if e.strip()
    ] + MASTER_ADMIN_EMAILS
    admin_user_ids = [
        uid.strip()
        for uid in getattr(settings, "ADMIN_USER_IDS", "").split(",")
        if uid.strip()
    ] + MASTER_ADMIN_IDS
    payload_email = payload.get("email") or payload.get("email_address") if isinstance(payload, dict) else None
    payload_sub = payload.get("sub") if isinstance(payload, dict) else None
    user_email = getattr(request.user, "email", None)
    normalized_email = (payload_email or user_email or "").strip().lower()

    # Canonical profile signals (DB source of truth, no profile creation here).
    from therapy.models import TherapistProfile, ClientProfile

    therapist_profile = None
    client_profile = None
    try:
        therapist_profile = getattr(request.user, "therapist_profile", None)
    except Exception:
        therapist_profile = None
    try:
        client_profile = getattr(request.user, "client_profile", None)
    except Exception:
        client_profile = None

    if not therapist_profile:
        therapist_profile = TherapistProfile.objects.filter(user=request.user).first()
    if not therapist_profile and normalized_email:
        therapist_profile = TherapistProfile.objects.filter(email__iexact=normalized_email).first()

    if not client_profile:
        client_profile = ClientProfile.objects.filter(user=request.user).first()
    if not client_profile and normalized_email:
        client_profile = ClientProfile.objects.filter(email__iexact=normalized_email).first()

    username = getattr(request.user, "username", None)
    admin_by_email = normalized_email in admin_emails
    admin_by_user_id = payload_sub in admin_user_ids or (username in admin_user_ids if username else False)

    is_admin = admin_by_email or admin_by_user_id
    canonical_roles = []
    if is_admin:
        canonical_roles.append("admin")
    # Strict role separation: non-admin identities are either therapist OR client.
    if not is_admin and client_profile:
        canonical_roles.append("client")
    elif therapist_profile:
        canonical_roles.append("therapist")
    elif client_profile:
        canonical_roles.append("client")

    return Response({
        "user": str(request.user),
        "user_email": user_email,
        "payload_email": payload_email,
        "payload_sub": payload_sub,
        "roles": [str(r).lower() for r in roles if r],
        "admin_emails": admin_emails,
        "admin_user_ids": admin_user_ids,
        "admin_by_email": admin_by_email,
        "admin_by_user_id": admin_by_user_id,
        "canonical_roles": canonical_roles,
        "has_therapist_profile": bool(therapist_profile),
        "has_client_profile": bool(client_profile),
        "therapist_profile_id": getattr(therapist_profile, "id", None),
        "client_profile_id": getattr(client_profile, "id", None),
        "therapist_verified": bool(getattr(therapist_profile, "is_verified", False)),
    })

@api_view(["GET"])
def get_config(request):
    """
    Returns public configuration for the frontend.
    """
    return Response({
        "environment": getattr(settings, "APP_ENVIRONMENT", "development"),
        "debug": settings.DEBUG,
    })


# Simple health check
def healthz(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    # Admin & simple test/probe routes
    path("admin/", admin.site.urls),
    
    # Serve your built React (optional for local dev at 5173)
    path("", TemplateView.as_view(template_name="index.html"), name="frontend-home"),

    path("auth-test/", auth_test, name="auth_test"),
    path("auth-login/", auth_login, name="auth_login"),
    path("api/onboard/", OnboardUserRoleView.as_view(), name="onboard_role"),
    path("protected/", protected_view, name="protected"),
    path("api/whoami/", whoami, name="whoami"),
    path("api/availability-slots/public/", AvailabilitySlotPublicView.as_view(), name="availability-slots-public"),
    path("api/therapists/public/", PublicTherapistDirectoryView.as_view(), name="therapists-public"),
    path("api/therapists/match/", TherapistMatchView.as_view(), name="therapists-match"),
    path("api/clients/terminate_relationship/", terminate_relationship, name="terminate-relationship"),
    path("api/therapists/verify/<int:pk>/", VerifyTherapistView.as_view(), name="verify-therapist"),
    path("api/admin/reports/catalog/", AdminReportsCatalogView.as_view(), name="admin-reports-catalog"),
    path("api/admin/reports/overview/", AdminReportsOverviewView.as_view(), name="admin-reports-overview"),
    path("api/chat/rocket/session/", RocketChatSessionView.as_view(), name="rocket-chat-session"),
    path(
        "api/admin/reports/<slug:report_key>/",
        AdminReportDetailView.as_view(),
        name="admin-report-detail",
    ),

    # REST API
    path("api/", include(router.urls)),
    path("api/payments/razorpay/create-order/", RazorpayCreateOrderView.as_view(), name="razorpay-create-order"),
    path("api/payments/razorpay/verify/", RazorpayVerifyPaymentView.as_view(), name="razorpay-verify"),
    path(
        "api/payments/razorpay/subscriptions/create/",
        RazorpayCreateTherapistSubscriptionView.as_view(),
        name="razorpay-create-therapist-subscription",
    ),
    path(
        "api/payments/razorpay/subscriptions/verify/",
        RazorpayVerifyTherapistSubscriptionView.as_view(),
        name="razorpay-verify-therapist-subscription",
    ),
    path(
        "api/payments/therapist/subscription/status/",
        TherapistSubscriptionStatusView.as_view(),
        name="therapist-subscription-status",
    ),
    path(
        "api/payments/therapist/subscription/cancel/",
        TherapistCancelSubscriptionView.as_view(),
        name="therapist-subscription-cancel",
    ),
    path("api/payments/razorpay/webhook/", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
    path("api/therapist-applications/", TherapistApplicationCreateView.as_view(), name="therapist_applications"),

    # Simple health check
    path("healthz", healthz, name="healthz"),
    path("api/config/", get_config, name="get-config"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
