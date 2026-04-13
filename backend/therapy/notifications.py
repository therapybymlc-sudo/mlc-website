SCHEDULING_ACTION_URLS = {
    "therapist": {
        "booking_request_created": "/dashboard/therapist?tab=bookingRequests",
        "booking_request_confirmed": "/dashboard/therapist?tab=appointments",
        "booking_request_declined": "/dashboard/therapist?tab=bookingRequests",
        "booking_request_cancelled": "/dashboard/therapist?tab=bookingRequests",
        "booking_request_expired": "/dashboard/therapist?tab=bookingRequests",
        "appointment_scheduled": "/dashboard/therapist?tab=appointments",
        "appointment_cancelled": "/dashboard/therapist?tab=appointments",
        "appointment_completed": "/dashboard/therapist?tab=appointments",
        "appointment_rescheduled": "/dashboard/therapist?tab=appointments",
        "resource_assigned": "/dashboard/therapist?tab=resources",
    },
    "client": {
        "booking_request_created": "/dashboard/client?section=bookingRequests",
        "booking_request_confirmed": "/dashboard/client?section=sessions",
        "booking_request_declined": "/dashboard/client?section=bookingRequests",
        "booking_request_cancelled": "/dashboard/client?section=bookingRequests",
        "booking_request_expired": "/dashboard/client?section=bookingRequests",
        "appointment_scheduled": "/dashboard/client?section=sessions",
        "appointment_cancelled": "/dashboard/client?section=sessions",
        "appointment_completed": "/dashboard/client?section=sessions",
        "appointment_rescheduled": "/dashboard/client?section=sessions",
        "resource_assigned": "/dashboard/client?section=resources",
    },
}


def get_scheduling_action_url(notification_type: str, recipient=None) -> str:
    role = None
    if recipient is not None:
        if getattr(recipient, "therapist_profile", None):
            role = "therapist"
        elif getattr(recipient, "client_profile", None):
            role = "client"

    if role and notification_type in SCHEDULING_ACTION_URLS.get(role, {}):
        return SCHEDULING_ACTION_URLS[role][notification_type]

    for role_key in ("therapist", "client"):
        url = SCHEDULING_ACTION_URLS.get(role_key, {}).get(notification_type)
        if url:
            return url

    return ""
