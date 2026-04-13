from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db import transaction

from therapy.models import (
    SharedResourceAssignment,
    TherapeuticRelationship,
    Notification,
)
from therapy.notifications import get_scheduling_action_url


def assign_resource_to_client(*, therapist, client, resource, therapist_note=""):
    if resource.therapist_id != therapist.id:
        raise ValidationError("Resource must belong to the assigning therapist.")

    relationship = TherapeuticRelationship.objects.filter(
        therapist=therapist,
        client=client,
        status=TherapeuticRelationship.Status.ACTIVE,
    ).first()
    if not relationship:
        raise ValidationError("An active therapeutic relationship is required.")

    with transaction.atomic():
        assignment = SharedResourceAssignment(
            therapeutic_relationship=relationship,
            resource=resource,
            assigned_by=therapist,
            assigned_to=client,
            therapist_note=therapist_note or "",
            status=SharedResourceAssignment.Status.ASSIGNED,
            assigned_at=timezone.now(),
        )
        assignment.full_clean()
        assignment.save()

        if getattr(client, "user", None):
            Notification.objects.create(
                recipient_user_profile=client.user,
                type=Notification.Type.RESOURCE_ASSIGNED,
                title="New resource shared",
                body=f"{therapist.name} shared a resource with you.",
                related_model="SharedResourceAssignment",
                related_id=str(assignment.id),
                action_url=get_scheduling_action_url(
                    Notification.Type.RESOURCE_ASSIGNED,
                    recipient=client.user,
                ),
            )

    return assignment
