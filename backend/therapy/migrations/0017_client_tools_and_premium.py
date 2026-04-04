from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0016_therapistsessionlink"),
    ]

    operations = [
        migrations.AddField(
            model_name="therapistprofile",
            name="is_premium",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="clientprofile",
            name="is_premium",
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name="ClientJournal",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("entry", models.TextField()),
                ("mood", models.CharField(blank=True, max_length=50, null=True)),
                ("shared_with_therapist", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="journals", to="therapy.clientprofile")),
                ("therapist", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="client_journals", to="therapy.therapistprofile")),
            ],
        ),
        migrations.CreateModel(
            name="ClientGoal",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("created_by", models.CharField(choices=[("client", "Client"), ("therapist", "Therapist")], default="client", max_length=20)),
                ("progress", models.PositiveIntegerField(default=0)),
                ("is_completed", models.BooleanField(default=False)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="goals", to="therapy.clientprofile")),
                ("therapist", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="client_goals", to="therapy.therapistprofile")),
            ],
        ),
        migrations.CreateModel(
            name="ClientCheckin",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("checkin_date", models.DateField(default=django.utils.timezone.now)),
                ("mood", models.CharField(blank=True, max_length=50, null=True)),
                ("energy", models.CharField(blank=True, max_length=50, null=True)),
                ("stress", models.CharField(blank=True, max_length=50, null=True)),
                ("sleep_hours", models.DecimalField(blank=True, decimal_places=1, max_digits=4, null=True)),
                ("gratitude", models.CharField(blank=True, max_length=255, null=True)),
                ("notes", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="checkins", to="therapy.clientprofile")),
                ("therapist", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="client_checkins", to="therapy.therapistprofile")),
            ],
            options={
                "ordering": ["-checkin_date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="TherapistMaterial",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True, null=True)),
                ("file_url", models.URLField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("therapist", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="materials", to="therapy.therapistprofile")),
            ],
        ),
        migrations.CreateModel(
            name="MaterialShare",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("note", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="material_shares", to="therapy.clientprofile")),
                ("material", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="shares", to="therapy.therapistmaterial")),
                ("shared_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="shares_made", to="therapy.therapistprofile")),
            ],
            options={
                "unique_together": {("material", "client")},
            },
        ),
    ]
