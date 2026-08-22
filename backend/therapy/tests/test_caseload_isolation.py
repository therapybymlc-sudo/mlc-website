from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from therapy.models import ClientProfile, TherapistProfile, TherapeuticRelationship
from therapy.utils import caseload_client_ids_for_therapist, link_client_to_therapist_caseload


class CaseloadIsolationTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist_a_user = User.objects.create_user(
            username="therapist_a", email="therapist_a@example.com", password="pass1234"
        )
        self.therapist_b_user = User.objects.create_user(
            username="therapist_b", email="therapist_b@example.com", password="pass1234"
        )
        self.client_user = User.objects.create_user(
            username="client_user", email="shared_client@example.com", password="pass1234"
        )

        self.therapist_a = TherapistProfile.objects.create(
            user=self.therapist_a_user,
            name="Therapist A",
            email="therapist_a@example.com",
            is_verified=True,
        )
        self.therapist_b = TherapistProfile.objects.create(
            user=self.therapist_b_user,
            name="Therapist B",
            email="therapist_b@example.com",
            is_verified=True,
        )
        self.client_profile = ClientProfile.objects.create(
            user=self.client_user,
            name="Shared Client",
            email="shared_client@example.com",
        )

    def test_client_not_on_caseload_without_relationship(self):
        self.assertEqual(caseload_client_ids_for_therapist(self.therapist_a), [])
        self.assertEqual(caseload_client_ids_for_therapist(self.therapist_b), [])

    def test_link_by_email_only_links_requesting_therapist(self):
        link_client_to_therapist_caseload(self.therapist_a, self.client_profile)

        self.assertIn(
            self.client_profile.id,
            caseload_client_ids_for_therapist(self.therapist_a),
        )
        self.assertNotIn(
            self.client_profile.id,
            caseload_client_ids_for_therapist(self.therapist_b),
        )

    def test_legacy_primary_fk_does_not_grant_caseload_access(self):
        self.client_profile.therapist = self.therapist_a
        self.client_profile.save(update_fields=["therapist"])

        self.assertEqual(caseload_client_ids_for_therapist(self.therapist_a), [])
        self.assertEqual(caseload_client_ids_for_therapist(self.therapist_b), [])

    def test_therapist_list_clients_excludes_unrelated_profiles(self):
        link_client_to_therapist_caseload(self.therapist_a, self.client_profile)

        other_client = ClientProfile.objects.create(
            name="Other Client",
            email="other_client@example.com",
        )
        TherapeuticRelationship.objects.create(
            therapist=self.therapist_b,
            client=other_client,
            status=TherapeuticRelationship.Status.ACTIVE,
        )

        self.client.force_authenticate(user=self.therapist_a_user)
        response = self.client.get(reverse("clients-list"))

        self.assertEqual(response.status_code, 200)
        payload = response.data.get("results", response.data)
        ids = {row["id"] for row in payload}
        self.assertEqual(ids, {self.client_profile.id})
