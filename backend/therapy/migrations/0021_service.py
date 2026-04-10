from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0020_merge_0018_therapist_application_0019_teammember"),
    ]

    operations = [
        migrations.CreateModel(
            name="Service",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("subtitle", models.CharField(blank=True, max_length=255, null=True)),
                ("description", models.TextField(blank=True, null=True)),
                ("image_url", models.URLField(blank=True, null=True)),
                ("cta_label", models.CharField(blank=True, max_length=100, null=True)),
                ("cta_link", models.CharField(blank=True, max_length=255, null=True)),
                ("sort_order", models.IntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["sort_order", "title"],
            },
        ),
    ]
