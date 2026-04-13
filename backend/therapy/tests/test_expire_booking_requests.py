from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone

from therapy.models import TherapistProfile, ClientProfile, AvailabilitySlot, BookingRequest


class ExpireBookingRequestsCommandTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist_user = User.objects.create_user(
            username="therapist_expire",
            email="therapist_expire@example.com",
            password="pass1234",
        )
        self.client_user = User.objects.create_user(
            username="client_expire",
            email="client_expire@example.com",
            password="pass1234",
        )
        self.therapist = TherapistProfile.objects.create(
            user=self.therapist_user,
            name="Therapist Expire",
            email="therapist_expire@example.com",
        )
        self.client_profile = ClientProfile.objects.create(
            user=self.client_user,
            name="Client Expire",
            email="client_expire@example.com",
            therapist=self.therapist,
        )

    def test_pending_request_expires_and_slot_reopens(self):
        start_time = timezone.now() + timedelta(days=2)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=start_time,
            end_time=start_time + timedelta(minutes=45),
            status=AvailabilitySlot.Status.HELD,
            visible_to_clients=True,
            held_until=timezone.now() - timedelta(minutes=1),
        )
        request = BookingRequest.objects.create(
            client=self.client_profile,
            therapist=self.therapist,
            availability_slot=slot,
            status=BookingRequest.Status.PENDING,
            expires_at=timezone.now() - timedelta(minutes=1),
        )

        call_command("expire_booking_requests")

        request.refresh_from_db()
        slot.refresh_from_db()
        self.assertEqual(request.status, BookingRequest.Status.EXPIRED)
        self.assertIsNotNone(request.responded_at)
        self.assertEqual(slot.status, AvailabilitySlot.Status.OPEN)
        self.assertIsNone(slot.held_until)

    def test_booked_slots_are_not_reopened(self):
        start_time = timezone.now() + timedelta(days=3)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=start_time,
            end_time=start_time + timedelta(minutes=45),
            status=AvailabilitySlot.Status.BOOKED,
            visible_to_clients=True,
        )
        request = BookingRequest.objects.create(
            client=self.client_profile,
            therapist=self.therapist,
            availability_slot=slot,
            status=BookingRequest.Status.PENDING,
            expires_at=timezone.now() - timedelta(minutes=5),
        )

        call_command("expire_booking_requests")

        request.refresh_from_db()
        slot.refresh_from_db()
        self.assertEqual(request.status, BookingRequest.Status.EXPIRED)
        self.assertEqual(slot.status, AvailabilitySlot.Status.BOOKED)
