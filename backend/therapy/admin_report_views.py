from django.http import FileResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from therapy.models import AdminReportEmailSchedule, AdminReportSnapshot
from therapy.serializers import (
    AdminReportEmailScheduleSerializer,
    AdminReportSnapshotCreateSerializer,
    AdminReportSnapshotSerializer,
)
from therapy.services.admin_reports import REPORT_BUILDERS
from therapy.services.admin_report_delivery import (
    admin_email_from_request,
    attach_pdf_to_snapshot,
    create_snapshot,
    send_schedule_email,
)
from therapy.views import _require_admin


class AdminReportSnapshotViewSet(viewsets.ModelViewSet):
    """
    Saved report snapshots (JSON + PDF). Admin only.
    """

    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        _require_admin(self.request)
        return AdminReportSnapshot.objects.all().order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return AdminReportSnapshotCreateSerializer
        return AdminReportSnapshotSerializer

    def list(self, request, *args, **kwargs):
        _require_admin(request)
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        _require_admin(request)
        return super().retrieve(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        _require_admin(request)
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        _require_admin(request)
        ser = AdminReportSnapshotCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        key = ser.validated_data["report_key"].lower()
        if key not in REPORT_BUILDERS:
            return Response({"detail": "Unknown report type."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            snap = create_snapshot(
                report_key=key,
                period=ser.validated_data["period"],
                year=ser.validated_data["year"],
                month=ser.validated_data.get("month") or 1,
                quarter=ser.validated_data.get("quarter") or 1,
                title=ser.validated_data.get("title") or "",
                created_by_email=admin_email_from_request(request),
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        out = AdminReportSnapshotSerializer(snap, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="pdf")
    def pdf(self, request, pk=None):
        _require_admin(request)
        snap = self.get_object()
        if not snap.pdf:
            return Response({"detail": "PDF not available."}, status=status.HTTP_404_NOT_FOUND)
        f = snap.pdf.open("rb")
        return FileResponse(
            f,
            as_attachment=True,
            filename=f"mlc-report-{snap.report_key}-{snap.period_label or snap.id}.pdf",
        )

    @action(detail=True, methods=["post"], url_path="regenerate-pdf")
    def regenerate_pdf(self, request, pk=None):
        _require_admin(request)
        snap = self.get_object()
        attach_pdf_to_snapshot(snap)
        snap.refresh_from_db()
        return Response(AdminReportSnapshotSerializer(snap, context={"request": request}).data)


class AdminReportEmailScheduleViewSet(viewsets.ModelViewSet):
    """Scheduled email delivery for reports. Processed by `process_admin_report_schedules` command."""

    permission_classes = [IsAuthenticated]
    queryset = AdminReportEmailSchedule.objects.all().order_by("-created_at")
    serializer_class = AdminReportEmailScheduleSerializer
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        _require_admin(request)

    def perform_create(self, serializer):
        serializer.save(created_by_email=admin_email_from_request(self.request))

    @action(detail=True, methods=["post"], url_path="send-now")
    def send_now(self, request, pk=None):
        schedule = self.get_object()
        try:
            snap = send_schedule_email(schedule)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {
                "snapshot_id": snap.id,
                "pdf_url": AdminReportSnapshotSerializer(snap, context={"request": request}).data.get(
                    "pdf_url"
                ),
            },
            status=status.HTTP_200_OK,
        )
