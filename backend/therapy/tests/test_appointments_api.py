from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from therapy.models import TherapistProfile, ClientProfile, AvailabilitySlot, BookingRequest, Appointment


class AppointmentApiLockdownTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist_user = User.objects.create_user(
            username="therapistuser", email="therapist@example.com", password="pass1234"
        )
        self.other_therapist_user = User.objects.create_user(
            username="therapistuser2", email="therapist2@example.com", password="pass1234"
        )
        self.client_user = User.objects.create_user(
            username="clientuser", email="client@example.com", password="pass1234"
        )

        self.therapist = TherapistProfile.objects.create(
            user=self.therapist_user, name="Therapist One", email="therapist@example.com"
        )
        self.other_therapist = TherapistProfile.objects.create(
            user=self.other_therapist_user, name="Therapist Two", email="therapist2@example.com"
        )
        self.client_profile = ClientProfile.objects.create(
            user=self.client_user, name="Client One", email="client@example.com", therapist=self.therapist
        )

        self.appointments_url = reverse("appointments-list")

    def _auth_therapist(self):
        self.client.force_authenticate(user=self.therapist_user)

    def _auth_other_therapist(self):
        self.client.force_authenticate(user=self.other_therapist_user)

    def _create_slot_and_request(self):
        start_time = timezone.now() + timedelta(days=1)
        slot = AvailabilitySlot.objects.create(
            therapist=self.therapist,
            start_time=start_time,
            end_time=start_time + timedelta(minutes=50),
            status=AvailabilitySlot.Status.OPEN,
            visible_to_clients=True,
        )
        booking_request = BookingRequest.objects.create(
            client=self.client_profile,
            therapist=self.therapist,
            availability_slot=slot,
            status=BookingRequest.Status.PENDING,
        )
        return slot, booking_request

    def test_direct_create_is_not_allowed(self):
        self._auth_therapist()
        resp = self.client.post(
            self.appointments_url,
            {
                "client": self.client_profile.id,
                "therapist": self.therapist.id,
                "start_time": timezone.now().isoformat(),
                "end_time": (timezone.now() + timedelta(minutes=30)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 405)

    def test_direct_update_is_not_allowed(self):
        self._auth_therapist()
        slot, booking_request = self._create_slot_and_request()
        booking_request.status = BookingRequest.Status.CONFIRMED
        booking_request.save(update_fields=["status", "updated_at"])
        appointment = Appointment.objects.create(
            client=self.client_profile,
            therapist=self.therapist,
            availability_slot=slot,
            booking_request=booking_request,
            start_time=slot.start_time,
            end_time=slot.end_time,
            date=slot.start_time,
            status=Appointment.Status.SCHEDULED,
        )
        resp = self.client.patch(
            reverse("appointments-detail", args=[appointment.id]),
            {"status": Appointment.Status.COMPLETED},
            format="json",
        )
        self.assertEqual(resp.status_code, 405)

    def test_confirm_booking_request_creates_appointment(self):
        self._auth_therapist()
        _, booking_request = self._create_slot_and_request()
        resp = self.client.post(
            reverse("therapist-booking-requests-confirm", args=[booking_request.id]),
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(Appointment.objects.filter(booking_request=booking_request).exists())

    def test_unrelated_therapist_cannot_cancel(self):
        self._auth_therapist()
        slot, booking_request = self._create_slot_and_request()
        booking_request.status = BookingRequest.Status.CONFIRMED
        booking_request.save(update_fields=["status", "updated_at"])
        appointment = Appointment.objects.create(
            client=self.client_profile,
            therapist=self.therapist,
            availability_slot=slot,
            booking_request=booking_request,
            start_time=slot.start_time,
            end_time=slot.end_time,
            date=slot.start_time,
            status=Appointment.Status.SCHEDULED,
        )
        self._auth_other_therapist()
        resp = self.client.post(
            reverse("appointments-cancel", args=[appointment.id]),
            format="json",
        )
        self.assertEqual(resp.status_code, 403)
