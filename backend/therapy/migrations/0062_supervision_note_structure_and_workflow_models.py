from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0061_therapistprofile_subscription_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="supervisionnote",
            name="action_items_summary",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="supervisionnote",
            name="agenda",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="supervisionnote",
            name="case_formulation",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="supervisionnote",
            name="homework",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="supervisionnote",
            name="next_steps",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="supervisionnote",
            name="reminder_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="supervisionnote",
            name="risk_flags",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="supervisionnote",
            name="shared_with_supervisee",
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name="SupervisionActionItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True, default="")),
                ("owner", models.CharField(choices=[("supervisor", "Supervisor"), ("supervisee", "Supervisee")], default="supervisee", max_length=20)),
                ("status", models.CharField(choices=[("open", "Open"), ("in_progress", "In Progress"), ("done", "Done")], default="open", max_length=20)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_by_supervisor", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("note", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="action_items", to="therapy.supervisionnote")),
                ("relationship", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="action_items", to="therapy.supervisoryrelationship")),
            ],
            options={"ordering": ["status", "due_date", "-created_at"]},
        ),
        migrations.CreateModel(
            name="SupervisionReflection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("reflection_type", models.CharField(choices=[("pre_session", "Pre-session"), ("post_session", "Post-session")], max_length=20)),
                ("goals", models.TextField(blank=True, default="")),
                ("discussion_points", models.TextField(blank=True, default="")),
                ("takeaways", models.TextField(blank=True, default="")),
                ("confidence_score", models.PositiveSmallIntegerField(default=5)),
                ("submitted_by_supervisee", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("appointment", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="supervision_reflections", to="therapy.appointment")),
                ("relationship", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reflections", to="therapy.supervisoryrelationship")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
