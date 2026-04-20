import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from therapy.models import TherapistProfile

def verify_all_therapists():
    profiles = TherapistProfile.objects.all()
    count = profiles.count()
    updated = profiles.update(is_verified=True)
    print(f"Verified {updated} out of {count} therapists.")

if __name__ == "__main__":
    verify_all_therapists()
