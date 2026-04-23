import os
import django
import sys

# Setup Django
sys.path.append("/Users/asma02/Documents/my_website_project/backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from therapy.models import ClientProfile, Appointment, ClientGoal, ClientJournal, ClientCheckin, TherapeuticRelationship
from django.contrib.auth import get_user_model

def rescue_profiles(email_search):
    User = get_user_model()
    print(f"--- Rescue Mission for: {email_search} ---")
    
    # 1. Find all profiles with this email
    profiles = ClientProfile.objects.filter(email__iexact=email_search)
    print(f"Found {profiles.count()} profiles with email {email_search}")
    
    for p in profiles:
        appts = Appointment.objects.filter(client=p).count()
        goals = ClientGoal.objects.filter(client=p).count()
        checkins = ClientCheckin.objects.filter(client=p).count()
        rels = TherapeuticRelationship.objects.filter(client=p).count()
        user_link = p.user.username if p.user else "NONE"
        print(f"Profile ID: {p.id} | Name: {p.name} | User: {user_link} | Appts: {appts} | Goals: {goals} | Journals: {journals} | Checkins: {checkins} | Rels: {rels}")

    # 2. Find the "Best" profile (the one with the most data)
    best_profile = None
    max_data = -1
    for p in profiles:
        score = Appointment.objects.filter(client=p).count() + TherapeuticRelationship.objects.filter(client=p).count()
        if score > max_data:
            max_data = score
            best_profile = p
            
    if not best_profile:
        print("CRITICAL: No best profile found.")
        return

    print(f"BEST PROFILE identified: {best_profile.id}")

    # 3. Find the User object
    # Let's search by email
    users = User.objects.filter(email__iexact=email_search)
    if not users.exists():
        # Search by name or sub?
        print("No user found by exact email. Searching by part of email...")
        users = User.objects.filter(email__icontains=email_search.split('@')[0])
        
    if not users.exists():
        print("STILL NO USER FOUND. Cannot link.")
        return
        
    target_user = users.first()
    print(f"TARGET USER identified: {target_user.username} (ID: {target_user.id})")

    # 4. FORCE MERGE
    print("EXECUTING FORCE MERGE...")
    
    # Unlink target user from any other profiles
    other_linked = ClientProfile.objects.filter(user=target_user).exclude(id=best_profile.id)
    for other in other_linked:
        print(f"Unlinking user from profile {other.id} and migrating data...")
        # Migrate data TO best_profile
        Appointment.objects.filter(client=other).update(client=best_profile)
        ClientGoal.objects.filter(client=other).update(client=best_profile)
        ClientJournal.objects.filter(client=other).update(client=best_profile)
        ClientCheckin.objects.filter(client=other).update(client=best_profile)
        
        other.user = None
        other.save()
        # Optionally delete if it's a ghost
        if other.name.startswith("user_"):
            print(f"Deleting ghost profile {other.id}")
            other.delete()

    # Link target user to best profile
    best_profile.user = target_user
    if best_profile.name.startswith("user_") and target_user.get_full_name():
        best_profile.name = target_user.get_full_name()
    best_profile.save()
    
    print("FORCE MERGE COMPLETE.")

if __name__ == "__main__":
    # Try multiple search patterns to find the ghost and the real profile
    rescue_profiles("user_3CcEEL3CBmbZ3NHnYEVLbSCCui9@example.invalid")
    
    # Try common real emails from the team?
    # I'll also check if I can find by username directly
    from django.contrib.auth import get_user_model
    User = get_user_model()
    u = User.objects.filter(username="user_3CcEEL3CBmbZ3NHnYEVLbSCCui9").first()
    if u and u.email:
        rescue_profiles(u.email)
