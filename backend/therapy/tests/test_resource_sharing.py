from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from therapy.models import (
    TherapistProfile,
    ClientProfile,
    TherapeuticRelationship,
    Resource,
    SharedResourceAssignment,
    Notification,
)


class ResourceSharingTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist_user = User.objects.create_user(
            username="therapist", email="therapist@example.com", password="pass1234"
        )
        self.client_user = User.objects.create_user(
            username="client", email="client@example.com", password="pass1234"
        )
        self.other_client_user = User.objects.create_user(
            username="client2", email="client2@example.com", password="pass1234"
        )

        self.therapist = TherapistProfile.objects.create(
            user=self.therapist_user, name="Therapist One", email="therapist@example.com"
        )
        self.client_profile = ClientProfile.objects.create(
            user=self.client_user,
            name="Client One",
            email="client@example.com",
            therapist=self.therapist,
        )
        self.other_client = ClientProfile.objects.create(
            user=self.other_client_user,
            name="Client Two",
            email="client2@example.com",
            therapist=self.therapist,
        )

        TherapeuticRelationship.objects.create(
            therapist=self.therapist,
            client=self.client_profile,
            status=TherapeuticRelationship.Status.ACTIVE,
            started_at=timezone.now() - timedelta(days=1),
        )

        self.resources_url = reverse("resources-list")
        self.assignments_url = reverse("resource-assignments-list")
        self.client_assignments_url = reverse("client-resource-assignments-list")

    def test_therapist_can_create_text_resource(self):
        self.client.force_authenticate(user=self.therapist_user)
        resp = self.client.post(
            self.resources_url,
            {
                "title": "Grounding Exercise",
                "description": "Quick grounding steps.",
                "resource_type": "text",
                "text_content": "5-4-3-2-1 grounding.",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(Resource.objects.filter(title="Grounding Exercise").exists())

    def test_therapist_resource_requires_content_for_type(self):
        self.client.force_authenticate(user=self.therapist_user)
        resp = self.client.post(
            self.resources_url,
            {
                "title": "Missing text",
                "resource_type": "text",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_assign_resource_creates_notification(self):
        resource = Resource.objects.create(
            therapist=self.therapist,
            title="Breathing Guide",
            resource_type=Resource.ResourceType.TEXT,
            text_content="Box breathing steps.",
        )
        self.client.force_authenticate(user=self.therapist_user)
        before = Notification.objects.count()
        resp = self.client.post(
            self.assignments_url,
            {
                "resource": resource.id,
                "assigned_to": self.client_profile.id,
                "therapist_note": "Try this before sleep.",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(
            SharedResourceAssignment.objects.filter(
                resource=resource, assigned_to=self.client_profile
            ).exists()
        )
        self.assertGreater(Notification.objects.count(), before)

    def test_assign_requires_active_relationship(self):
        resource = Resource.objects.create(
            therapist=self.therapist,
            title="Worksheet",
            resource_type=Resource.ResourceType.TEXT,
            text_content="Reflection prompts.",
        )
        self.client.force_authenticate(user=self.therapist_user)
        resp = self.client.post(
            self.assignments_url,
            {
                "resource": resource.id,
                "assigned_to": self.other_client.id,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_client_only_sees_their_assignments(self):
        resource = Resource.objects.create(
            therapist=self.therapist,
            title="Journal Prompt",
            resource_type=Resource.ResourceType.TEXT,
            text_content="Write 3 lines about your day.",
        )
        assignment = SharedResourceAssignment.objects.create(
            therapeutic_relationship=TherapeuticRelationship.objects.get(
                therapist=self.therapist, client=self.client_profile
            ),
            resource=resource,
            assigned_by=self.therapist,
            assigned_to=self.client_profile,
            therapist_note="Share next session.",
        )
        SharedResourceAssignment.objects.create(
            therapeutic_relationship=TherapeuticRelationship.objects.get(
                therapist=self.therapist, client=self.client_profile
            ),
            resource=resource,
            assigned_by=self.therapist,
            assigned_to=self.client_profile,
            therapist_note="Another note.",
        )

        self.client.force_authenticate(user=self.client_user)
        resp = self.client.get(self.client_assignments_url)
        self.assertEqual(resp.status_code, 200)
        ids = {item["id"] for item in resp.json()}
        self.assertIn(assignment.id, ids)

    def test_client_can_mark_viewed_and_completed(self):
        resource = Resource.objects.create(
            therapist=self.therapist,
            title="Self-care checklist",
            resource_type=Resource.ResourceType.TEXT,
            text_content="Small steps.",
        )
        assignment = SharedResourceAssignment.objects.create(
            therapeutic_relationship=TherapeuticRelationship.objects.get(
                therapist=self.therapist, client=self.client_profile
            ),
            resource=resource,
            assigned_by=self.therapist,
            assigned_to=self.client_profile,
        )
        self.client.force_authenticate(user=self.client_user)

        viewed_url = reverse("client-resource-assignments-mark-viewed", args=[assignment.id])
        resp = self.client.post(viewed_url)
        self.assertEqual(resp.status_code, 200)
        assignment.refresh_from_db()
        self.assertTrue(assignment.is_viewed)

        completed_url = reverse("client-resource-assignments-mark-completed", args=[assignment.id])
        resp = self.client.post(completed_url)
        self.assertEqual(resp.status_code, 200)
        assignment.refresh_from_db()
        self.assertTrue(assignment.is_completed)
