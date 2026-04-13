from django.contrib import admin
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import TherapistApplication, TherapistProfile


@admin.register(TherapistApplication)
class TherapistApplicationAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "status", "created_at")
    list_filter = ("status", "created_at", "home_country")
    search_fields = ("first_name", "last_name", "email")
    readonly_fields = ("created_at", "approved_at")

    def save_model(self, request, obj, form, change):
        previous_status = None
        if obj.pk:
            previous_status = TherapistApplication.objects.filter(pk=obj.pk).values_list(
                "status", flat=True
            ).first()

        super().save_model(request, obj, form, change)

        if obj.status != "approved" or previous_status == "approved":
            return

        if not obj.approved_at:
            obj.approved_at = timezone.now()
            obj.save(update_fields=["approved_at"])

        profile = TherapistProfile.objects.filter(email__iexact=obj.email).first()
        if not profile:
            display_name = f"{obj.first_name} {obj.last_name}".strip() or obj.email
            profile = TherapistProfile.objects.create(
                name=display_name,
                email=obj.email,
            )

        User = get_user_model()
        user = User.objects.filter(email__iexact=obj.email).first()
        if user and profile.user_id != user.id:
            profile.user = user
            profile.save(update_fields=["user"])
