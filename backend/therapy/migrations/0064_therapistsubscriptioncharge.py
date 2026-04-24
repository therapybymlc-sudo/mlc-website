from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0063_clientformassignment"),
    ]

    operations = [
        migrations.CreateModel(
            name="TherapistSubscriptionCharge",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("razorpay_subscription_id", models.CharField(blank=True, default="", max_length=64)),
                ("razorpay_payment_id", models.CharField(blank=True, default="", max_length=64)),
                ("amount", models.PositiveIntegerField(help_text="Amount in smallest currency unit.")),
                ("currency", models.CharField(default="INR", max_length=10)),
                ("status", models.CharField(default="captured", max_length=20)),
                ("captured_at", models.DateTimeField(blank=True, null=True)),
                ("raw", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("therapist", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="subscription_charges", to="therapy.therapistprofile")),
            ],
        ),
        migrations.AddIndex(
            model_name="therapistsubscriptioncharge",
            index=models.Index(fields=["therapist", "captured_at"], name="therapy_ther_therapi_72f613_idx"),
        ),
        migrations.AddIndex(
            model_name="therapistsubscriptioncharge",
            index=models.Index(fields=["razorpay_subscription_id", "captured_at"], name="therapy_ther_razorpa_5ba718_idx"),
        ),
        migrations.AddIndex(
            model_name="therapistsubscriptioncharge",
            index=models.Index(fields=["status", "captured_at"], name="therapy_ther_status_f31cf0_idx"),
        ),
    ]
