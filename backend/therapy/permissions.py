from rest_framework.permissions import BasePermission
from rest_framework import exceptions
from django.db import IntegrityError

from .models import (
    TherapistProfile,
    ClientProfile,
    BookingRequest,
    AvailabilitySlot,
    Appointment,
    Notification,
    Resource,
    SharedResourceAssignment,
)
from .utils import resolve_user_display_name, sync_client_profile_identity


def get_current_therapist_profile(user):
    if not user or not user.is_authenticated:
        return None
    try:
        if hasattr(user, "therapist_profile"):
            return user.therapist_profile
    except Exception:
        pass

    # Fail-safe email matching (Mirroring the view resolver for consistency)
    email = getattr(user, "email", None)
    if email:
        therapist = TherapistProfile.objects.filter(email__iexact=email).first()
        if therapist:
            if therapist.user_id != user.id:
                therapist.user = user
                therapist.save(update_fields=["user"])
            return therapist
    return None


def get_current_client_profile(user):
    if not user or not user.is_authenticated:
        return None
    
    # 1. Direct relationship check (fastest)
    try:
        if hasattr(user, "client_profile"):
            sync_client_profile_identity(user.client_profile, user)
            return user.client_profile
    except Exception:
        pass

    # 2. Check by email and sync user link if needed
    email = getattr(user, "email", None)
    if email:
        client = ClientProfile.objects.filter(email__iexact=email).first()
        if client:
            if client.user_id != user.id:
                client.user = user
                client.save(update_fields=["user"])
            sync_client_profile_identity(client, user)
            return client
            
    # 3. Create only when we have a real email — never use Clerk user IDs as names.
    normalized_email = (email or "").strip().lower()
    if not normalized_email or normalized_email.endswith("@example.invalid"):
        return None

    display_name = resolve_user_display_name(user, fallback="Client")
    try:
        client = ClientProfile.objects.create(
            user=user,
            name=display_name,
            email=normalized_email,
        )
        return client
    except IntegrityError:
        client = ClientProfile.objects.filter(email__iexact=normalized_email).first()
        if client:
            if client.user_id != user.id:
                client.user = user
                client.save(update_fields=["user"])
            sync_client_profile_identity(client, user)
            return client
        return None


def is_request_owned_by_therapist(user, booking_request: BookingRequest):
    therapist = get_current_therapist_profile(user)
    return bool(therapist and booking_request.therapist_id == therapist.id)


def is_request_owned_by_client(user, booking_request: BookingRequest):
    client = get_current_client_profile(user)
    return bool(client and booking_request.client_id == client.id)


def _is_admin_user(user):
    if not user or not user.is_authenticated:
        return False
    if user.is_staff or user.is_superuser:
        return True
    
    # Check custom admin emails from settings
    from django.conf import settings
    admin_emails = [
        e.strip().lower() 
        for e in getattr(settings, "ADMIN_EMAILS", "").split(",") 
        if e.strip()
    ]
    email = getattr(user, "email", None)
    return bool(email and email.lower() in admin_emails)


def _raise_profile_missing(profile_type: str):
    raise exceptions.PermissionDenied(
        {
            "detail": f"{profile_type.title()} profile required to use scheduling.",
            "code": "profile_missing",
            "profile_type": profile_type,
        }
    )


class IsTherapistOwnerOfSlot(BasePermission):
    """
    Therapist can manage only their own availability slots.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        if get_current_therapist_profile(request.user) is None:
            _raise_profile_missing("therapist")
        return True

    def has_object_permission(self, request, view, obj: AvailabilitySlot):
        if _is_admin_user(request.user):
            return True
        therapist = get_current_therapist_profile(request.user)
        return bool(therapist and obj.therapist_id == therapist.id)


class IsTherapistOwnerOfBookingRequest(BasePermission):
    """
    Therapist can view only booking requests tied to their own slots.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        if get_current_therapist_profile(request.user) is None:
            _raise_profile_missing("therapist")
        return True

    def has_object_permission(self, request, view, obj: BookingRequest):
        if _is_admin_user(request.user):
            return True
        return is_request_owned_by_therapist(request.user, obj)


class IsTherapistOwnerOfBookingRequestAction(BasePermission):
    """
    Therapist can confirm/decline only their own booking requests.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        if get_current_therapist_profile(request.user) is None:
            _raise_profile_missing("therapist")
        return True

    def has_object_permission(self, request, view, obj: BookingRequest):
        if _is_admin_user(request.user):
            return True
        return is_request_owned_by_therapist(request.user, obj)


class IsClientOwnerOfBookingRequest(BasePermission):
    """
    Client can create/view only their own booking requests.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        client = get_current_client_profile(request.user)
        if not client:
            _raise_profile_missing("client")

        if request.method in ("POST", "PUT", "PATCH"):
            client_id = request.data.get("client")
            if client_id is None:
                return True
            return str(client.id) == str(client_id)

        return True

    def has_object_permission(self, request, view, obj: BookingRequest):
        if _is_admin_user(request.user):
            return True
        return is_request_owned_by_client(request.user, obj)


class IsClientOwnerOfAppointment(BasePermission):
    """
    Client can view only their own appointments.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        if get_current_client_profile(request.user) is None:
            _raise_profile_missing("client")
        return True

    def has_object_permission(self, request, view, obj: Appointment):
        if _is_admin_user(request.user):
            return True
        client = get_current_client_profile(request.user)
        return bool(client and obj.client_id == client.id)


class IsTherapistOwnerOfAppointment(BasePermission):
    """
    Therapist can view/manage only their own appointments.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        if get_current_therapist_profile(request.user) is None:
            _raise_profile_missing("therapist")
        return True

    def has_object_permission(self, request, view, obj: Appointment):
        if _is_admin_user(request.user):
            return True
        therapist = get_current_therapist_profile(request.user)
        return bool(therapist and obj.therapist_id == therapist.id)


class IsNotificationRecipient(BasePermission):
    """
    Notifications are visible only to their recipient user.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj: Notification):
        if _is_admin_user(request.user):
            return True
        return obj.recipient_user_profile_id == request.user.id


class IsTherapistOwnerOfResource(BasePermission):
    """
    Therapist can manage only their own resources.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        if get_current_therapist_profile(request.user) is None:
            _raise_profile_missing("therapist")
        return True

    def has_object_permission(self, request, view, obj: Resource):
        if _is_admin_user(request.user):
            return True
        therapist = get_current_therapist_profile(request.user)
        
        # Community resources are viewable by any verified therapist
        if request.method in ("GET", "HEAD", "OPTIONS") and obj.is_community:
            return True

        return bool(therapist and obj.therapist_id == therapist.id)


class IsTherapistOwnerOfResourceAssignment(BasePermission):
    """
    Therapist can view/manage only assignments they created.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        if get_current_therapist_profile(request.user) is None:
            _raise_profile_missing("therapist")
        return True

    def has_object_permission(self, request, view, obj: SharedResourceAssignment):
        if _is_admin_user(request.user):
            return True
        therapist = get_current_therapist_profile(request.user)
        return bool(therapist and obj.assigned_by_id == therapist.id)


class IsClientOwnerOfResourceAssignment(BasePermission):
    """
    Client can view only their own resource assignments.
    """

    def has_permission(self, request, view):
        if _is_admin_user(request.user):
            return True
        if get_current_client_profile(request.user) is None:
            _raise_profile_missing("client")
        return True

    def has_object_permission(self, request, view, obj: SharedResourceAssignment):
        if _is_admin_user(request.user):
            return True
        client = get_current_client_profile(request.user)
        return bool(client and obj.assigned_to_id == client.id)
