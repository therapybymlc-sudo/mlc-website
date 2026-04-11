from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0023_aboutcontent_therapistscontent"),
    ]

    operations = [
        migrations.CreateModel(
            name="ServicesContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero", models.JSONField(blank=True, default=dict)),
                ("portal", models.JSONField(blank=True, default=dict)),
                ("services", models.JSONField(blank=True, default=dict)),
                ("programs", models.JSONField(blank=True, default=dict)),
                ("approach", models.JSONField(blank=True, default=dict)),
                ("faq", models.JSONField(blank=True, default=dict)),
                ("cta", models.JSONField(blank=True, default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
