
import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from therapy.models import TherapistProfile, AvailabilitySlot

def create_test_slots():
    try:
        asma = TherapistProfile.objects.get(pk=4)
        print(f"Found Asma (ID 4)")
        
        # Clear existing test slots if any to start fresh
        AvailabilitySlot.objects.filter(therapist=asma).delete()
        
        now = timezone.now()
        
        # Create 3 slots
        slots_to_create = [
            (now + timedelta(hours=2), now + timedelta(hours=2, minutes=50)),
            (now + timedelta(days=1, hours=4), now + timedelta(days=1, hours=4, minutes=50)),
            (now + timedelta(days=2, hours=1), now + timedelta(days=2, hours=1, minutes=50)),
        ]
        
        for start, end in slots_to_create:
            slot = AvailabilitySlot.objects.create(
                therapist=asma,
                start_time=start,
                end_time=end,
                status=AvailabilitySlot.Status.OPEN
            )
            print(f"Created slot: {slot.start_time} - {slot.end_time}")
            
    except TherapistProfile.DoesNotExist:
        print("Asma (ID 4) not found in the current database.")

if __name__ == "__main__":
    create_test_slots()
