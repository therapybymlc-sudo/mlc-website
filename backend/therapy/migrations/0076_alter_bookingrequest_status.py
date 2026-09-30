from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0075_clientfile_archive_and_display_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bookingrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Awaiting confirmation"),
                    ("confirmed", "Confirmed"),
                    ("declined", "Declined"),
                    ("cancelled_by_client", "Cancelled by client"),
                    ("cancelled_by_therapist", "Cancelled by therapist"),
                    ("expired", "Expired"),
                    ("payment_failed", "Payment Failed"),
                    ("payment_pending", "Pending Payment"),
                ],
                default="pending",
                help_text="Current status of this booking request.",
                max_length=25,
            ),
        ),
    ]
