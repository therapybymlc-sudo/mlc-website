from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0024_servicescontent"),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero", models.JSONField(blank=True, default=dict)),
                ("form", models.JSONField(blank=True, default=dict)),
                ("quote", models.JSONField(blank=True, default=dict)),
                ("hours", models.JSONField(blank=True, default=dict)),
                ("closing", models.JSONField(blank=True, default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="TrainingProgramsContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero", models.JSONField(blank=True, default=dict)),
                ("programs", models.JSONField(blank=True, default=dict)),
                ("faq", models.JSONField(blank=True, default=dict)),
                ("cta", models.JSONField(blank=True, default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
