from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0062_supervision_note_structure_and_workflow_models"),
    ]

    operations = [
        migrations.CreateModel(
            name="ClientFormAssignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("form_type", models.CharField(choices=[("consent", "Consent Form"), ("assessment", "Assessment Form")], max_length=20)),
                ("title", models.CharField(max_length=255)),
                ("instructions", models.TextField(blank=True, default="")),
                ("form_schema", models.JSONField(blank=True, default=dict)),
                ("response_data", models.JSONField(blank=True, default=dict)),
                ("therapist_note", models.TextField(blank=True, default="")),
                ("status", models.CharField(choices=[("assigned", "Assigned"), ("started", "Started"), ("submitted", "Submitted"), ("reviewed", "Reviewed")], default="assigned", max_length=20)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("assigned_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("assigned_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="form_assignments_made", to="therapy.therapistprofile")),
                ("assigned_to", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="form_assignments", to="therapy.clientprofile")),
                ("therapeutic_relationship", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="form_assignments", to="therapy.therapeuticrelationship")),
            ],
            options={
                "ordering": ["-assigned_at"],
            },
        ),
        migrations.AddIndex(
            model_name="clientformassignment",
            index=models.Index(fields=["assigned_by", "form_type", "status"], name="therapy_clie_assigne_94f7c8_idx"),
        ),
        migrations.AddIndex(
            model_name="clientformassignment",
            index=models.Index(fields=["assigned_to", "form_type", "status"], name="therapy_clie_assigne_625d2f_idx"),
        ),
        migrations.AddIndex(
            model_name="clientformassignment",
            index=models.Index(fields=["therapeutic_relationship", "status"], name="therapy_clie_therape_d47ff4_idx"),
        ),
    ]
