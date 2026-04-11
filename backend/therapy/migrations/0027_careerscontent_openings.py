from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0026_careerscontent"),
    ]

    operations = [
        migrations.AddField(
            model_name="careerscontent",
            name="openings",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
