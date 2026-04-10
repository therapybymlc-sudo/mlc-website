from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0021_service"),
    ]

    operations = [
        migrations.CreateModel(
            name="HomeContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero", models.JSONField(blank=True, default=dict)),
                ("portal", models.JSONField(blank=True, default=dict)),
                ("bubbles", models.JSONField(blank=True, default=list)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
