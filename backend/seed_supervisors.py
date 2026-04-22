import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from therapy.models import TherapistProfile, TeamMember

def seed_supervisors():
    print("Seeding supervisors...")
    
    # 1. Dr. Sarah Mitchell
    t1, _ = TherapistProfile.objects.update_or_create(
        email="sarah.mitchell@example.com",
        defaults={
            "name": "Dr. Sarah Mitchell",
            "is_supervisor": True,
            "supervision_status": "approved",
            "is_verified": True,
            "years_experience": 15,
            "hourly_rate": 120.00,
            "supervision_years_experience": 10,
            "supervision_hourly_rate": 150.00,
            "modalities": ["Integrative Therapy", "CBT"],
            "supervision_modalities": ["Integrative Therapy", "CBT"],
            "supervision_areas": ["Private Practice", "Clinical"],
            "supervision_bio": "Senior clinical supervisor with 10 years of experience mentoring early-career psychologists.",
            "profile_image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            "specialties": ["Clinical Supervision", "Integrative Therapy", "CBT"],
        }
    )
    
    # 2. James Wilson
    t2, _ = TherapistProfile.objects.update_or_create(
        email="james.wilson@example.com",
        defaults={
            "name": "James Wilson",
            "is_supervisor": True,
            "supervision_status": "approved",
            "is_verified": True,
            "years_experience": 12,
            "hourly_rate": 100.00,
            "supervision_years_experience": 8,
            "supervision_hourly_rate": 130.00,
            "modalities": ["Psychodynamic", "Humanistic"],
            "supervision_modalities": ["Psychodynamic", "Humanistic"],
            "supervision_areas": ["Hospital", "Adults"],
            "supervision_bio": "Experienced supervisor specializing in psychodynamic approaches and hospital-based clinical practice.",
            "profile_image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
            "specialties": ["Psychodynamic", "Supervision", "Hospital Practice"],
        }
    )

    print(f"Seeded 2 supervisors: {t1.name}, {t2.name}")

    # Also add to TeamMember
    TeamMember.objects.update_or_create(
        email=t1.email,
        defaults={
            "name": t1.name,
            "title": "Senior Clinical Supervisor",
            "bio": t1.supervision_bio,
            "photo_url": t1.profile_image_url,
            "specialties": ", ".join(t1.specialties),
            "sort_order": 1,
            "is_active": True,
        }
    )
    
    TeamMember.objects.update_or_create(
        email=t2.email,
        defaults={
            "name": t2.name,
            "title": "Clinical Supervisor",
            "bio": t2.supervision_bio,
            "photo_url": t2.profile_image_url,
            "specialties": ", ".join(t2.specialties),
            "sort_order": 2,
            "is_active": True,
        }
    )
    print("Added supervisors to TeamMember list.")

if __name__ == "__main__":
    seed_supervisors()
