from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0076_alter_bookingrequest_status"),
    ]

    operations = [
        # ClientProfile
        migrations.AddField(
            model_name="clientprofile",
            name="profile_image",
            field=models.FileField(blank=True, null=True, upload_to="client_profile/photos/"),
        ),

        # TherapistProfile - Identity
        migrations.AddField(
            model_name="therapistprofile",
            name="profile_image",
            field=models.FileField(blank=True, null=True, upload_to="therapist_profile/photos/"),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="title",
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="pronouns",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="headline",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),

        # TherapistProfile - Credentials
        migrations.AddField(
            model_name="therapistprofile",
            name="qualification_title",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="university",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="year_completed",
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="experience_post_qual",
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="license_details",
            field=models.TextField(blank=True, null=True),
        ),

        # TherapistProfile - Scope & Presentations
        migrations.AddField(
            model_name="therapistprofile",
            name="professional_role",
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="complexity_comfort",
            field=models.CharField(blank=True, default="Moderate", max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="independence_level",
            field=models.CharField(blank=True, default="Independent", max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="scope_of_practice",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="not_treated",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="exclusions",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="age_groups",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="identity_contexts",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="languages_info",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="concerns_levels",
            field=models.JSONField(blank=True, default=dict),
        ),

        # TherapistProfile - Modalities & Approach Dynamics
        migrations.AddField(
            model_name="therapistprofile",
            name="primary_orientation",
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="secondary_modalities",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="modalities_info",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="primary_lens",
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="structure",
            field=models.PositiveIntegerField(blank=True, default=50, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="orientation",
            field=models.PositiveIntegerField(blank=True, default=50, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="pacing",
            field=models.PositiveIntegerField(blank=True, default=50, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="action",
            field=models.PositiveIntegerField(blank=True, default=50, null=True),
        ),

        # TherapistProfile - Fees & Availability
        migrations.AddField(
            model_name="therapistprofile",
            name="currency",
            field=models.CharField(blank=True, default="KD", max_length=20, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="is_accepting_new",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="cancellation_policy",
            field=models.CharField(blank=True, default="24-hour notice required", max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="session_modes",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="locations",
            field=models.TextField(blank=True, null=True),
        ),

        # TherapistProfile - Media, Bio & FAQs
        migrations.AddField(
            model_name="therapistprofile",
            name="welcome_note",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="faqs",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="keywords",
            field=models.JSONField(blank=True, default=list),
        ),

        # TherapistProfile - Internal Governance & Risk
        migrations.AddField(
            model_name="therapistprofile",
            name="internal_risk_level",
            field=models.CharField(blank=True, default="Moderate", max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="risk_protocols",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="best_fit_notes",
            field=models.TextField(blank=True, null=True),
        ),
    ]
