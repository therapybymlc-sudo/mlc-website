from django.conf import settings
from .models import TherapistProfile, ClientProfile

def _resolve_therapist_from_request(request, allow_create=False):
    """Resolve the logged-in therapist based on authenticated user info."""
    try:
        auth_user = getattr(request, "user", None)
        if not auth_user or not auth_user.is_authenticated:
            return None

        therapist_profile = getattr(auth_user, "therapist_profile", None)
        if therapist_profile:
            return therapist_profile

        email = getattr(auth_user, "email", None)
        username = getattr(auth_user, "username", None)

        # Match therapist by email first, fallback to name if needed
        therapist = None
        if email:
            therapist = TherapistProfile.objects.filter(email__iexact=email).first()
        elif username:
            therapist = TherapistProfile.objects.filter(name__iexact=username).first()

        if therapist:
            if therapist.user_id != auth_user.id:
                therapist.user = auth_user
                therapist.save(update_fields=["user"])
            return therapist

        if not allow_create:
            return None

        display_name = (getattr(auth_user, "get_full_name", lambda: "")() or username or "Unnamed Therapist")
        safe_email = email or f"therapist_{auth_user.pk or 'nouser'}@local"
        therapist = TherapistProfile.objects.create(
            user=auth_user,
            name=display_name,
            email=safe_email,
        )
        return therapist

    except Exception as e:
        print("⚠️ Therapist resolution failed:", e)
        return None


def _resolve_client_from_request(request):
    """Resolve the logged-in client based on authenticated user info."""
    try:
        auth_user = getattr(request, "user", None)
        if not auth_user or not auth_user.is_authenticated:
            return None

        client_profile = getattr(auth_user, "client_profile", None)
        if client_profile:
            return client_profile

        email = getattr(auth_user, "email", None)
        if not email:
            return None

        client = ClientProfile.objects.filter(email__iexact=email).first()
        if client:
            if client.user_id != auth_user.id:
                client.user = auth_user
                client.save(update_fields=["user"])
            return client
            
        display_name = getattr(auth_user, "get_full_name", lambda: "")() or getattr(auth_user, "username", "Unknown")
        safe_email = email or f"client_{auth_user.pk or 'nouser'}@local"
        client = ClientProfile.objects.create(
            user=auth_user,
            name=display_name,
            email=safe_email,
        )
        return client
    except Exception as e:
        print("⚠️ Client resolution failed:", e)
        return None


DASS_MAPPING = {
    'stress': [30, 35, 37, 40, 41, 43, 47],
    'anxiety': [31, 33, 36, 38, 44, 48, 49],
    'depression': [32, 34, 39, 42, 45, 46, 50],
}


def calculate_dass_scores(answers):
    scores = {'depression': 0, 'anxiety': 0, 'stress': 0}
    for subscale, questions in DASS_MAPPING.items():
        total = 0
        for q_num in questions:
            val = int(answers.get(str(q_num), 0))
            total += val
        scores[subscale] = total * 2
    return scores


def get_dass_severity(scores):
    depression = scores['depression']
    anxiety = scores['anxiety']
    stress = scores['stress']
    
    levels = {}
    
    if depression <= 9: levels['depression'] = 'Normal'
    elif depression <= 13: levels['depression'] = 'Mild'
    elif depression <= 20: levels['depression'] = 'Moderate'
    elif depression <= 27: levels['depression'] = 'Severe'
    else: levels['depression'] = 'Extremely severe'
    
    if anxiety <= 7: levels['anxiety'] = 'Normal'
    elif anxiety <= 9: levels['anxiety'] = 'Mild'
    elif anxiety <= 14: levels['anxiety'] = 'Moderate'
    elif anxiety <= 19: levels['anxiety'] = 'Severe'
    else: levels['anxiety'] = 'Extremely severe'
    
    if stress <= 14: levels['stress'] = 'Normal'
    elif stress <= 18: levels['stress'] = 'Mild'
    elif stress <= 25: levels['stress'] = 'Moderate'
    elif stress <= 33: levels['stress'] = 'Severe'
    else: levels['stress'] = 'Extremely severe'
    
    return levels


def generate_dass_summary(levels):
    # Combine the subscale levels into a warm, non-diagnostic paragraph
    elevated = [k for k, v in levels.items() if v != 'Normal']
    
    if not elevated:
        return "Thank you for completing this screening. Your responses suggest that symptoms of depression, anxiety, and stress have remained largely within the typical range over the past week. Even so, therapy can still be valuable if there are concerns, patterns, or life circumstances you would like support with."
    
    if all(levels[k] in ['Normal', 'Mild', 'Moderate'] for k in levels):
        return f"Thank you for completing this screening. Your responses suggest that you may be experiencing some meaningful emotional strain at the moment, particularly in the areas of {', '.join(elevated)}. While this screening is not a diagnosis, it does suggest that support could be beneficial."

    if any(levels[k] == 'Extremely severe' for k in levels):
        extreme_domains = [k for k, v in levels.items() if v == 'Extremely severe']
        return f"Thank you for completing this screening. Your responses suggest a very elevated level of distress in the area of {', '.join(extreme_domains)}. While this screening is not a diagnosis, it does indicate that careful and timely support may be especially important at this time."

    return f"Thank you for completing this screening. Your responses suggest that you may be experiencing a significant level of distress at present, particularly in the areas of {', '.join(elevated)}. This screening is not diagnostic, but it does suggest that timely support may be important."
