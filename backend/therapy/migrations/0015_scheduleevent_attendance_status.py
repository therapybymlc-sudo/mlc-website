from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0014_notetemplate_sections"),
    ]

    operations = [
        migrations.AddField(
            model_name="scheduleevent",
            name="attendance_status",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("arrived", "Arrived"),
                    ("did_not_arrive", "Did not arrive"),
                ],
                blank=True,
                null=True,
            ),
        ),
    ]

