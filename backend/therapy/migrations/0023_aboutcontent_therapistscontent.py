from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0022_homecontent"),
    ]

    operations = [
        migrations.CreateModel(
            name="AboutContent",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero", models.JSONField(blank=True, default=dict)),
                ("why", models.JSONField(blank=True, default=dict)),
                ("pillars", models.JSONField(blank=True, default=list)),
                ("message", models.JSONField(blank=True, default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="TherapistsContent",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero", models.JSONField(blank=True, default=dict)),
                ("why", models.JSONField(blank=True, default=dict)),
                ("supervision", models.JSONField(blank=True, default=dict)),
                ("learning", models.JSONField(blank=True, default=dict)),
                ("work", models.JSONField(blank=True, default=dict)),
                ("values", models.JSONField(blank=True, default=dict)),
                ("cta", models.JSONField(blank=True, default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
