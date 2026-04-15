
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from therapy.models import HomeContent

def update_home_content():
    hc = HomeContent.objects.first()
    if not hc:
        hc = HomeContent.objects.create(
            hero={},
            portal={},
            bubbles=[]
        )
        print("Created new HomeContent object.")

    # Update Hero
    hero = hc.hero or {}
    hero['primary_link'] = '/signup/client'
    hc.hero = hero

    # Update Portal
    portal = hc.portal or {}
    portal['client_title'] = "Client Workspace"
    portal['client_body'] = "A dedicated environment for your healing journey. Track your progress, access shared resources, and collaborate securely with your therapist."
    portal['client_primary_link'] = '/signup/client'
    portal['client_primary_label'] = "Sign up as a client"
    portal['client_secondary_link'] = '/client-checkin'
    portal['client_secondary_label'] = "Take a quick check‑in"
    
    portal['therapist_title'] = "Therapist Workspace"
    portal['therapist_body'] = "A professional environment for clinical excellence. Manage your practice, collaborate with clients, and focus on the clinical work."
    portal['therapist_primary_link'] = '/therapist-apply'
    portal['therapist_primary_label'] = "Apply as a therapist"
    portal['therapist_secondary_link'] = '/login/therapist'
    portal['therapist_secondary_label'] = "Sign in"
    hc.portal = portal

    hc.save()
    print("Successfully updated HomeContent in database.")

if __name__ == "__main__":
    update_home_content()
