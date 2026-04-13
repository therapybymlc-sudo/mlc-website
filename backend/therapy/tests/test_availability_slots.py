from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from therapy.models import TherapistProfile, AvailabilitySlot


class AvailabilitySlotViewSetTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user1 = User.objects.create_user(
            username="therapist1", email="therapist1@example.com", password="pass1234"
        )
        self.user2 = User.objects.create_user(
            username="therapist2", email="therapist2@example.com", password="pass1234"
        )
        self.therapist1 = TherapistProfile.objects.create(
            user=self.user1, name="Therapist One", email="therapist1@example.com"
        )
        self.therapist2 = TherapistProfile.objects.create(
            user=self.user2, name="Therapist Two", email="therapist2@example.com"
        )
        self.list_url = reverse("availability-slots-list")

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_create_slot_success(self):
        self._auth(self.user1)
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(minutes=60)
        resp = self.client.post(
            self.list_url,
            {
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "status": AvailabilitySlot.Status.OPEN,
                "visible_to_clients": True,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.data)
        self.assertEqual(resp.data["therapist"], self.therapist1.id)

    def test_overlap_prevented(self):
        self._auth(self.user1)
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(minutes=60)
        AvailabilitySlot.objects.create(
            therapist=self.therapist1,
            start_time=start_time,
            end_time=end_time,
            status=AvailabilitySlot.Status.OPEN,
        )
        resp = self.client.post(
            self.list_url,
            {
                "start_time": (start_time + timedelta(minutes=30)).isoformat(),
                "end_time": (end_time + timedelta(minutes=30)).isoformat(),
                "status": AvailabilitySlot.Status.OPEN,
                "visible_to_clients": True,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_cannot_delete_booked_slot(self):
        self._auth(self.user1)
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(minutes=60)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist1,
            start_time=start_time,
            end_time=end_time,
            status=AvailabilitySlot.Status.BOOKED,
        )
        detail_url = reverse("availability-slots-detail", args=[slot.id])
        resp = self.client.delete(detail_url)
        self.assertEqual(resp.status_code, 400)

    def test_other_therapist_cannot_see_slots(self):
        AvailabilitySlot.objects.create(
            therapist=self.therapist1,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
        )
        self._auth(self.user2)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 0)

    def test_other_therapist_cannot_update_or_delete_slot(self):
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist1,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
        )
        detail_url = reverse("availability-slots-detail", args=[slot.id])

        self._auth(self.user2)
        resp = self.client.patch(
            detail_url,
            {"status": AvailabilitySlot.Status.BLOCKED},
            format="json",
        )
        self.assertIn(resp.status_code, {403, 404})

        resp = self.client.delete(detail_url)
        self.assertIn(resp.status_code, {403, 404})

    def test_cannot_edit_booked_slot(self):
        self._auth(self.user1)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist1,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, minutes=45),
            status=AvailabilitySlot.Status.BOOKED,
        )
        detail_url = reverse("availability-slots-detail", args=[slot.id])
        resp = self.client.patch(
            detail_url,
            {"status": AvailabilitySlot.Status.BLOCKED},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
