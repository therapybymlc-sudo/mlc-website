"""
Send due admin report emails (snapshots + PDF attachments).

Intended to run on a cron / scheduler at least once per day, e.g.:

    0 7 * * * cd /path/to/backend && /path/to/venv/bin/python manage.py process_admin_report_schedules

Monthly schedules fire when today's calendar day matches `day_of_month`.
Weekly schedules fire when today's weekday matches `weekday` (0=Monday).

Configure real SMTP (or a provider) via EMAIL_* settings in Django; defaults to console backend.
"""
from django.core.management.base import BaseCommand

from therapy.services.admin_report_delivery import run_due_schedules


class Command(BaseCommand):
    help = "Process active AdminReportEmailSchedule rows and email due reports."

    def handle(self, *args, **options):
        sent, errors = run_due_schedules()
        self.stdout.write(self.style.SUCCESS(f"Admin report schedules: sent={sent}, errors={errors}"))
