from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from therapy.models import TherapistProfile, ClientProfile, AvailabilitySlot, BookingRequest, Notification


class BookingRequestCreateTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.client_user = User.objects.create_user(
            username="clientuser", email="client@example.com", password="pass1234"
        )
        self.therapist_user = User.objects.create_user(
            username="therapistuser", email="therapist@example.com", password="pass1234"
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

        self.url = reverse("booking-requests-list")

    def _auth(self):
        self.client.force_authenticate(user=self.client_user)

    def test_create_booking_request_success(self):
        self._auth()
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(minutes=50)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=start_time,
            end_time=end_time,
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        notifications_before = Notification.objects.count()

        resp = self.client.post(
            self.url,
            {"therapist": self.therapist.id, "availability_slot": slot.id, "message_from_client": "Hi"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        slot.refresh_from_db()
        self.assertEqual(slot.status, AvailabilitySlot.Status.HELD)
        self.assertTrue(BookingRequest.objects.filter(availability_slot=slot).exists())
        self.assertGreater(Notification.objects.count(), notifications_before)

    def test_mismatched_therapist_rejected(self):
        self._auth()
        other_therapist = TherapistProfile.objects.create(
            name="Therapist Two", email="therapist2@example.com"
        )
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        resp = self.client.post(
            self.url,
            {"therapist": other_therapist.id, "availability_slot": slot.id},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_past_slot_rejected(self):
        self._auth()
        # Past slot must still have end_time > start_time to satisfy DB constraint.
        now = timezone.now()
        start_time = now - timedelta(days=1, hours=1)
        end_time = start_time + timedelta(minutes=30)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=start_time,
            end_time=end_time,
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        resp = self.client.post(
            self.url,
            {"therapist": self.therapist.id, "availability_slot": slot.id},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_double_request_blocked(self):
        self._auth()
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        first = self.client.post(
            self.url,
            {"therapist": self.therapist.id, "availability_slot": slot.id},
            format="json",
        )
        self.assertEqual(first.status_code, 201)
        second = self.client.post(
            self.url,
            {"therapist": self.therapist.id, "availability_slot": slot.id},
            format="json",
        )
        self.assertEqual(second.status_code, 400)

    def test_unavailable_slot_rejected(self):
        self._auth()
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, minutes=30),
            status=AvailabilitySlot.Status.BLOCKED,
            visible_to_clients=True,
        )
        resp = self.client.post(
            self.url,
            {"therapist": self.therapist.id, "availability_slot": slot.id},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_hidden_slot_rejected(self):
        self._auth()
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, minutes=30),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=False,
        )
        resp = self.client.post(
            self.url,
            {"therapist": self.therapist.id, "availability_slot": slot.id},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
