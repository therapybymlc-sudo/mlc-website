from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from therapy.models import TherapistProfile, AvailabilitySlot, ClientProfile


class AvailabilitySlotPublicViewTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="clientuser", email="client@example.com", password="pass1234"
        )
        self.therapist = TherapistProfile.objects.create(
            name="Therapist One", email="therapist@example.com"
        )
        self.client_profile = ClientProfile.objects.create(
            user=self.user,
            name="Client One",
            email="client@example.com",
            therapist=self.therapist,
        )
        self.url = reverse("availability-slots-public")

    def _auth(self):
        self.client.force_authenticate(user=self.user)

    def test_returns_only_open_visible_future_slots(self):
        self._auth()
        now = timezone.now()
        AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=now + timedelta(days=1),
            end_time=now + timedelta(days=1, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=now + timedelta(days=2),
            end_time=now + timedelta(days=2, minutes=30),
            status=AvailabilitySlot.Status.BLOCKED,
            visible_to_clients=True,
        )
        AvailabilitySlot.objects.create(
            therapist=self.therapist,
            # Past slot must still have end_time > start_time to satisfy DB constraint.
            start_time=now - timedelta(days=1, hours=1),
            end_time=now - timedelta(days=1, hours=1) + timedelta(minutes=30),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=now + timedelta(days=3),
            end_time=now + timedelta(days=3, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=False,
        )

        resp = self.client.get(self.url, {"therapist": self.therapist.id})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["therapist"], self.therapist.id)

    def test_requires_therapist_param(self):
        self._auth()
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, 400)

    def test_sorted_by_start_time(self):
        self._auth()
        now = timezone.now()
        slot_a = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=now + timedelta(days=2),
            end_time=now + timedelta(days=2, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        slot_b = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=now + timedelta(days=1),
            end_time=now + timedelta(days=1, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        resp = self.client.get(self.url, {"therapist": self.therapist.id})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data[0]["id"], slot_b.id)
        self.assertEqual(resp.data[1]["id"], slot_a.id)
