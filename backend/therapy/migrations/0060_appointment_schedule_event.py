# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0059_therapistprofile_supervision_hourly_rate_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="appointment",
            name="schedule_event",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="linked_appointment",
                to="therapy.scheduleevent",
                help_text="When set, this appointment was created from a therapist calendar (schedule) event.",
            ),
        ),
    ]
