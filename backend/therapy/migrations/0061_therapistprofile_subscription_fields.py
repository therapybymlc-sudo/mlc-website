# Generated manually for therapist basic subscription gating

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0060_appointment_schedule_event"),
    ]

    operations = [
        migrations.AddField(
            model_name="therapistprofile",
            name="basic_plan",
            field=models.CharField(
                choices=[("none", "None"), ("monthly", "Monthly"), ("annual", "Annual")],
                default="none",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="is_basic_subscribed",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="razorpay_customer_id",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="razorpay_subscription_id",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="therapistprofile",
            name="subscription_status",
            field=models.CharField(
                choices=[
                    ("inactive", "Inactive"),
                    ("pending", "Pending"),
                    ("active", "Active"),
                    ("cancelled", "Cancelled"),
                    ("expired", "Expired"),
                ],
                default="inactive",
                max_length=20,
            ),
        ),
    ]

