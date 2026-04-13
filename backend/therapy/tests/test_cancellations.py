from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from therapy.models import (
    TherapistProfile,
    ClientProfile,
    AvailabilitySlot,
    BookingRequest,
    Appointment,
    Notification,
)


class CancellationTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist_user = User.objects.create_user(
            username="therapist1", email="therapist1@example.com", password="pass1234"
        )
        self.client_user = User.objects.create_user(
            username="client1", email="client1@example.com", password="pass1234"
        )

        self.therapist = TherapistProfile.objects.create(
            user=self.therapist_user, name="Therapist One", email="therapist1@example.com"
        )
        self.client_profile = ClientProfile.objects.create(
            user=self.client_user,
            name="Client One",
            email="client1@example.com",
            therapist=self.therapist,
        )

    def _pending_request(self):
        start_time = timezone.now() + timedelta(days=2)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=start_time,
            end_time=start_time + timedelta(minutes=45),
            status=AvailabilitySlot.Status.HELD,
            visible_to_clients=True,
        )
        return BookingRequest.objects.create(
            client=self.client_profile,
            therapist=self.therapist,
            availability_slot=slot,
            status=BookingRequest.Status.PENDING,
        )

    def _confirmed_appointment(self):
        start_time = timezone.now() + timedelta(days=2)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=start_time,
            end_time=start_time + timedelta(minutes=45),
            status=AvailabilitySlot.Status.BOOKED,
            visible_to_clients=True,
        )
        booking_request = BookingRequest.objects.create(
            client=self.client_profile,
            therapist=self.therapist,
            availability_slot=slot,
            status=BookingRequest.Status.CONFIRMED,
        )
        appointment = Appointment.objects.create(
            client=self.client_profile,
            therapist=self.therapist,
            booking_request=booking_request,
            availability_slot=slot,
            start_time=slot.start_time,
            end_time=slot.end_time,
            date=slot.start_time,
            status=Appointment.Status.SCHEDULED,
        )
        return appointment

    def test_client_cancels_pending_request(self):
        booking_request = self._pending_request()
        self.client.force_authenticate(user=self.client_user)
        url = reverse("booking-requests-cancel", args=[booking_request.id])
        resp = self.client.post(url, {"message_from_client": "Need to reschedule"}, format="json")
        self.assertEqual(resp.status_code, 200)
        booking_request.refresh_from_db()
        self.assertEqual(booking_request.status, BookingRequest.Status.CANCELLED_BY_CLIENT)
        booking_request.availability_slot.refresh_from_db()
        self.assertEqual(booking_request.availability_slot.status, AvailabilitySlot.Status.OPEN)

    def test_therapist_cancels_pending_request(self):
        booking_request = self._pending_request()
        self.client.force_authenticate(user=self.therapist_user)
        url = reverse("therapist-booking-requests-cancel", args=[booking_request.id])
        resp = self.client.post(url, {"therapist_response_note": "Not available"}, format="json")
        self.assertEqual(resp.status_code, 200)
        booking_request.refresh_from_db()
        self.assertEqual(booking_request.status, BookingRequest.Status.CANCELLED_BY_THERAPIST)
        booking_request.availability_slot.refresh_from_db()
        self.assertEqual(booking_request.availability_slot.status, AvailabilitySlot.Status.OPEN)

    def test_therapist_cancels_confirmed_appointment(self):
        appointment = self._confirmed_appointment()
        notifications_before = Notification.objects.count()
        self.client.force_authenticate(user=self.therapist_user)
        url = reverse("appointments-cancel", args=[appointment.id])
        resp = self.client.post(url, {"cancellation_reason": "Emergency"}, format="json")
        self.assertEqual(resp.status_code, 200)
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, Appointment.Status.CANCELLED)
        appointment.availability_slot.refresh_from_db()
        self.assertEqual(appointment.availability_slot.status, AvailabilitySlot.Status.OPEN)
        appointment.booking_request.refresh_from_db()
        self.assertEqual(
            appointment.booking_request.status,
            BookingRequest.Status.CANCELLED_BY_THERAPIST,
        )
        self.assertGreater(Notification.objects.count(), notifications_before)

    @override_settings(ALLOW_CLIENT_APPOINTMENT_CANCEL=True)
    def test_client_cancels_confirmed_appointment(self):
        appointment = self._confirmed_appointment()
        notifications_before = Notification.objects.count()
        self.client.force_authenticate(user=self.client_user)
        url = reverse("client-appointments-cancel", args=[appointment.id])
        resp = self.client.post(url, {"cancellation_reason": "Cannot attend"}, format="json")
        self.assertEqual(resp.status_code, 200)
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, Appointment.Status.CANCELLED)
        appointment.booking_request.refresh_from_db()
        self.assertEqual(
            appointment.booking_request.status,
            BookingRequest.Status.CANCELLED_BY_CLIENT,
        )
        self.assertGreater(Notification.objects.count(), notifications_before)
