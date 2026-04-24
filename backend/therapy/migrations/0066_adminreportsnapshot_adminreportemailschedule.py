# Generated manually for admin report snapshots & email schedules

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0065_supportticket_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="AdminReportEmailSchedule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(blank=True, max_length=255)),
                ("is_active", models.BooleanField(default=True)),
                ("report_key", models.CharField(db_index=True, max_length=64)),
                (
                    "period_preset",
                    models.CharField(
                        choices=[
                            ("previous_month", "Previous calendar month"),
                            ("previous_quarter", "Previous calendar quarter"),
                            ("previous_year", "Previous calendar year"),
                        ],
                        default="previous_month",
                        max_length=32,
                    ),
                ),
                (
                    "frequency",
                    models.CharField(
                        choices=[("weekly", "Weekly"), ("monthly", "Monthly")],
                        default="monthly",
                        max_length=16,
                    ),
                ),
                (
                    "weekday",
                    models.PositiveSmallIntegerField(
                        blank=True,
                        help_text="0=Monday … 6=Sunday (weekly schedules only).",
                        null=True,
                    ),
                ),
                (
                    "day_of_month",
                    models.PositiveSmallIntegerField(
                        blank=True,
                        help_text="1–28 recommended (monthly schedules).",
                        null=True,
                    ),
                ),
                ("recipient_emails", models.JSONField(default=list, help_text="List of recipient email strings.")),
                ("created_by_email", models.CharField(blank=True, max_length=254)),
                ("last_sent_at", models.DateTimeField(blank=True, null=True)),
                ("last_error", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="AdminReportSnapshot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(blank=True, max_length=255)),
                ("report_key", models.CharField(db_index=True, max_length=64)),
                ("period_type", models.CharField(max_length=16)),
                ("year", models.PositiveSmallIntegerField()),
                ("month", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("quarter", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("period_label", models.CharField(blank=True, max_length=128)),
                ("period_start", models.DateTimeField()),
                ("period_end", models.DateTimeField()),
                ("payload", models.JSONField()),
                ("pdf", models.FileField(blank=True, null=True, upload_to="admin_report_snapshots/")),
                ("pdf_generated_at", models.DateTimeField(blank=True, null=True)),
                ("pdf_error", models.TextField(blank=True)),
                ("created_by_email", models.CharField(blank=True, max_length=254)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "source_schedule",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="snapshots",
                        to="therapy.adminreportemailschedule",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
