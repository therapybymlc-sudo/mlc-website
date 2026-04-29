from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0074_notefield_field_key"),
    ]

    operations = [
        migrations.AddField(
            model_name="clientfile",
            name="archived_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="clientfile",
            name="display_name",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="clientfile",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
    ]
