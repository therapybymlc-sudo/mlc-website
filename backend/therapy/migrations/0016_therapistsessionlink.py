from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0015_scheduleevent_attendance_status"),
    ]

    operations = [
        migrations.CreateModel(
            name="TherapistSessionLink",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(default="Session link", max_length=100)),
                ("url", models.URLField()),
                ("is_default", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("therapist", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="session_links", to="therapy.therapistprofile")),
            ],
            options={
                "ordering": ["-is_default", "created_at"],
            },
        ),
    ]

