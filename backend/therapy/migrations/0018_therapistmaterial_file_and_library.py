from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0017_client_tools_and_premium"),
    ]

    operations = [
        migrations.AddField(
            model_name="therapistmaterial",
            name="file",
            field=models.FileField(blank=True, null=True, upload_to="therapist_materials/"),
        ),
        migrations.AddField(
            model_name="therapistmaterial",
            name="is_library",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="therapistmaterial",
            name="is_premium_only",
            field=models.BooleanField(default=False),
        ),
    ]
