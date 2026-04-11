from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0027_careerscontent_openings"),
    ]

    operations = [
        migrations.CreateModel(
            name="TherapistApplyContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero", models.JSONField(blank=True, default=dict)),
                ("sections", models.JSONField(blank=True, default=dict)),
                ("form", models.JSONField(blank=True, default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
