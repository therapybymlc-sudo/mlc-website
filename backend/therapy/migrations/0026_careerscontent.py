from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0025_contactcontent_trainingprogramscontent"),
    ]

    operations = [
        migrations.CreateModel(
            name="CareersContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero", models.JSONField(blank=True, default=dict)),
                ("why", models.JSONField(blank=True, default=dict)),
                ("opportunities", models.JSONField(blank=True, default=dict)),
                ("form", models.JSONField(blank=True, default=dict)),
                ("footer", models.JSONField(blank=True, default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
