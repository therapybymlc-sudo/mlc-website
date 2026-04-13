from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from therapy.models import BookingRequest, AvailabilitySlot


class Command(BaseCommand):
    help = "Expire pending booking requests that have passed their expiry time."

    def handle(self, *args, **options):
        now = timezone.now()
        expired = (
            BookingRequest.objects.select_related("availability_slot")
            .filter(
                status=BookingRequest.Status.PENDING,
                expires_at__isnull=False,
                expires_at__lte=now,
            )
            .order_by("expires_at")
        )

        expired_count = 0
        reopened_slots = 0

        for request in expired:
            with transaction.atomic():
                request = BookingRequest.objects.select_for_update().select_related("availability_slot").get(
                    pk=request.pk
                )
                if request.status != BookingRequest.Status.PENDING:
                    continue

                request.status = BookingRequest.Status.EXPIRED
                request.responded_at = now
                request.save(update_fields=["status", "responded_at", "updated_at"])
                expired_count += 1

                slot = request.availability_slot
                if (
                    slot
                    and slot.status == AvailabilitySlot.Status.HELD
                    and slot.start_time
                    and slot.start_time > now
                ):
                    slot.status = AvailabilitySlot.Status.OPEN
                    slot.held_until = None
                    slot.save(update_fields=["status", "held_until", "updated_at"])
                    reopened_slots += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Expired {expired_count} booking request(s). Reopened {reopened_slots} slot(s)."
            )
        )
