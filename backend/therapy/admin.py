from django.contrib import admin
from .models import TherapistApplication


@admin.register(TherapistApplication)
class TherapistApplicationAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "status", "created_at")
    list_filter = ("status", "created_at", "home_country")
    search_fields = ("first_name", "last_name", "email")
    readonly_fields = ("created_at", "approved_at")
