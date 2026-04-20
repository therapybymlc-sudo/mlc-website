import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from therapy.models import TherapistProfile

def diagnostic_check():
    profiles = TherapistProfile.objects.all()
    print(f"Total Profiles: {profiles.count()}")
    for p in profiles:
        print(f"ID: {p.id} | Name: {p.name} | Verified: {p.is_verified} | Email: {p.email}")
        # Ensure they are verified and have a name
        if not p.is_verified:
            p.is_verified = True
        if not p.name:
            p.name = "MLC Therapist"
        p.save()
    print("Diagnostic & Force-Verify complete.")

if __name__ == "__main__":
    diagnostic_check()
