from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0017_client_tools_and_premium"),
    ]

    operations = [
        migrations.CreateModel(
            name="TherapistApplication",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("first_name", models.CharField(max_length=100)),
                ("last_name", models.CharField(max_length=100)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(max_length=50)),
                ("website", models.URLField(blank=True, null=True)),
                ("linkedin", models.URLField(blank=True, null=True)),
                ("home_country", models.CharField(max_length=100)),
                ("home_city", models.CharField(max_length=100)),
                ("home_postal_code", models.CharField(max_length=50)),
                ("licensed_countries", models.JSONField(blank=True, default=list)),
                ("has_private_practice", models.CharField(max_length=20)),
                ("open_to_in_person", models.CharField(max_length=20)),
                ("office_space", models.CharField(blank=True, max_length=100, null=True)),
                ("in_person_country", models.CharField(blank=True, max_length=100, null=True)),
                ("in_person_street", models.CharField(blank=True, max_length=255, null=True)),
                ("in_person_city", models.CharField(blank=True, max_length=100, null=True)),
                ("in_person_state", models.CharField(blank=True, max_length=100, null=True)),
                ("in_person_postal_code", models.CharField(blank=True, max_length=50, null=True)),
                ("years_experience", models.CharField(max_length=50)),
                ("languages", models.JSONField(blank=True, default=list)),
                ("treat_minors", models.CharField(max_length=20)),
                ("youngest_age", models.CharField(max_length=50)),
                ("referral_source", models.CharField(max_length=100)),
                ("referral_name", models.CharField(blank=True, max_length=255, null=True)),
                ("resume", models.FileField(blank=True, null=True, upload_to="therapist_applications/resumes/")),
                ("subscribe", models.BooleanField(default=False)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")], default="pending", max_length=20)),
                ("review_notes", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("approved_at", models.DateTimeField(blank=True, null=True)),
            ],
        ),
    ]
