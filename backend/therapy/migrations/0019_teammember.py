from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("therapy", "0018_therapistmaterial_file_and_library"),
    ]

    operations = [
        migrations.CreateModel(
            name="TeamMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("title", models.CharField(blank=True, max_length=255, null=True)),
                ("bio", models.TextField(blank=True, null=True)),
                ("photo_url", models.URLField(blank=True, null=True)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                ("specialties", models.TextField(blank=True, null=True)),
                ("sort_order", models.IntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["sort_order", "name"],
            },
        ),
    ]
