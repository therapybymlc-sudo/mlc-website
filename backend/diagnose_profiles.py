import os
import django
import sys

# Setup Django
sys.path.append("/Users/asma02/Documents/my_website_project/backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from therapy.models import ClientProfile, Appointment, ClientGoal, ClientJournal, ClientCheckin, TherapeuticRelationship, SafetyPlan
from django.contrib.auth import get_user_model

def diagnose_email(email_search):
    print(f"\n=== DIAGNOSING: {email_search} ===")
    profiles = ClientProfile.objects.filter(email__iexact=email_search)
    print(f"Total Profiles Found: {profiles.count()}")
    
    for p in profiles:
        print(f"\n--- Profile ID: {p.id} ---")
        print(f"Name: {p.name}")
        print(f"User Linked: {p.user.username if p.user else 'NONE'}")
        
        appts = Appointment.objects.filter(client=p).count()
        goals = ClientGoal.objects.filter(client=p).count()
        journals = ClientJournal.objects.filter(client=p).count()
        checkins = ClientCheckin.objects.filter(client=p).count()
        rels = TherapeuticRelationship.objects.filter(client=p, status="active").count()
        has_sp = hasattr(p, 'safety_plan')
        
        print(f" > Appointments: {appts}")
        print(f" > Goals: {goals}")
        print(f" > Journals: {journals}")
        print(f" > Check-ins: {checkins}")
        print(f" > Active Relationships: {rels}")
        print(f" > Safety Plan: {'YES' if has_sp else 'NO'}")
        
        if rels > 0:
            for r in TherapeuticRelationship.objects.filter(client=p, status="active"):
                print(f"   - Linked to Therapist: {r.therapist.name}")

if __name__ == "__main__":
    # Add any emails you want to check here
    search_emails = ["Therapy@mlchealth.in", "asma.ausa02@gmail.com"] 
    # Also search by the generic example invalid email from before
    search_emails.append("user_3CcEEL3CBmbZ3NHnYEVLbSCCui9@example.invalid")
    
    for email in search_emails:
        diagnose_email(email)
