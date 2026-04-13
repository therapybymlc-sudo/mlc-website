from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from therapy.models import TherapistProfile, TeamMember, AvailabilitySlot


class PublicTherapistDirectoryTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.client_user = User.objects.create_user(
            username="clientuser", email="client@example.com", password="pass1234"
        )
        self.therapist = TherapistProfile.objects.create(
            name="Therapist One",
            email="therapist@example.com",
        )
        TeamMember.objects.create(
            name="Therapist One",
            email="therapist@example.com",
            title="Clinical Psychologist",
            photo_url="https://example.com/photo.jpg",
            specialties="Anxiety, Stress",
            is_active=True,
        )
        TeamMember.objects.create(
            name="Unlinked Member",
            email="unlinked@example.com",
            is_active=True,
        )

        self.directory_url = reverse("therapists-public")
        self.slots_url = reverse("availability-slots-public")
        self.booking_url = reverse("booking-requests-list")

    def _auth(self):
        self.client.force_authenticate(user=self.client_user)

    def test_directory_returns_therapist_profile_id(self):
        self._auth()
        resp = self.client.get(self.directory_url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["id"], self.therapist.id)
        self.assertEqual(resp.data[0]["name"], "Therapist One")

    def test_directory_id_allows_booking_flow(self):
        self._auth()
        start_time = timezone.now() + timedelta(days=1)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=start_time,
            end_time=start_time + timedelta(minutes=45),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )

        resp = self.client.get(self.directory_url)
        therapist_id = resp.data[0]["id"]

        slot_resp = self.client.get(self.slots_url, {"therapist": therapist_id})
        self.assertEqual(slot_resp.status_code, 200)
        self.assertEqual(slot_resp.data[0]["id"], slot.id)

        booking_resp = self.client.post(
            self.booking_url,
            {"therapist": therapist_id, "availability_slot": slot.id},
            format="json",
        )
        self.assertEqual(booking_resp.status_code, 201)
