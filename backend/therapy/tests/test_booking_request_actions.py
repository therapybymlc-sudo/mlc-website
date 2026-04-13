from datetime import timedelta

from django.contrib.auth import get_user_model
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
    TherapeuticRelationship,
)


class BookingRequestTherapistActionsTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist_user = User.objects.create_user(
            username="therapist1", email="therapist1@example.com", password="pass1234"
        )
        self.other_therapist_user = User.objects.create_user(
            username="therapist2", email="therapist2@example.com", password="pass1234"
        )
        self.client_user = User.objects.create_user(
            username="clientuser", email="client@example.com", password="pass1234"
        )

        self.therapist = TherapistProfile.objects.create(
            user=self.therapist_user, name="Therapist One", email="therapist1@example.com"
        )
        self.other_therapist = TherapistProfile.objects.create(
            user=self.other_therapist_user, name="Therapist Two", email="therapist2@example.com"
        )
        self.client_profile = ClientProfile.objects.create(
            user=self.client_user,
            name="Client One",
            email="client@example.com",
            therapist=self.therapist,
        )

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def _create_pending_request(self):
        start_time = timezone.now() + timedelta(days=1)
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

    def test_confirm_success_creates_appointment(self):
        booking_request = self._create_pending_request()
        self._auth(self.therapist_user)
        url = reverse("therapist-booking-requests-confirm", args=[booking_request.id])
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 200)
        booking_request.refresh_from_db()
        self.assertEqual(booking_request.status, BookingRequest.Status.CONFIRMED)
        booking_request.availability_slot.refresh_from_db()
        self.assertEqual(booking_request.availability_slot.status, AvailabilitySlot.Status.BOOKED)
        self.assertTrue(Appointment.objects.filter(booking_request=booking_request).exists())
        self.assertTrue(
            Notification.objects.filter(
                type=Notification.Type.BOOKING_REQUEST_CONFIRMED,
                related_id=str(booking_request.id),
            ).exists()
        )

    def test_decline_success_reopens_slot(self):
        booking_request = self._create_pending_request()
        self._auth(self.therapist_user)
        url = reverse("therapist-booking-requests-decline", args=[booking_request.id])
        resp = self.client.post(url, {"therapist_response_note": "Not available"}, format="json")
        self.assertEqual(resp.status_code, 200)
        booking_request.refresh_from_db()
        self.assertEqual(booking_request.status, BookingRequest.Status.DECLINED)
        booking_request.availability_slot.refresh_from_db()
        self.assertEqual(booking_request.availability_slot.status, AvailabilitySlot.Status.OPEN)
        self.assertTrue(
            Notification.objects.filter(
                type=Notification.Type.BOOKING_REQUEST_DECLINED,
                related_id=str(booking_request.id),
            ).exists()
        )

    def test_confirm_not_pending_rejected(self):
        booking_request = self._create_pending_request()
        booking_request.status = BookingRequest.Status.DECLINED
        booking_request.save(update_fields=["status"])
        self._auth(self.therapist_user)
        url = reverse("therapist-booking-requests-confirm", args=[booking_request.id])
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_other_therapist_cannot_confirm(self):
        booking_request = self._create_pending_request()
        self._auth(self.other_therapist_user)
        url = reverse("therapist-booking-requests-confirm", args=[booking_request.id])
        resp = self.client.post(url, {}, format="json")
        self.assertIn(resp.status_code, {403, 404})

    def test_other_therapist_cannot_decline(self):
        booking_request = self._create_pending_request()
        self._auth(self.other_therapist_user)
        url = reverse("therapist-booking-requests-decline", args=[booking_request.id])
        resp = self.client.post(url, {"therapist_response_note": "No"}, format="json")
        self.assertIn(resp.status_code, {403, 404})

    def test_confirm_creates_relationship_and_primary(self):
        booking_request = self._create_pending_request()
        self._auth(self.therapist_user)
        url = reverse("therapist-booking-requests-confirm", args=[booking_request.id])
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 200)
        relationship = TherapeuticRelationship.objects.get(
            therapist=self.therapist,
            client=self.client_profile,
        )
        self.assertEqual(relationship.status, TherapeuticRelationship.Status.ACTIVE)
        self.assertTrue(relationship.is_primary)

    def test_confirm_reactivates_paused_relationship(self):
        # Use a shared anchor so started_at is always before ended_at.
        anchor = timezone.now() - timedelta(days=10)
        started_at = anchor
        ended_at = anchor + timedelta(days=5)
        paused = TherapeuticRelationship.objects.create(
            therapist=self.therapist,
            client=self.client_profile,
            status=TherapeuticRelationship.Status.PAUSED,
            started_at=started_at,
            ended_at=ended_at,
        )
        booking_request = self._create_pending_request()
        self._auth(self.therapist_user)
        url = reverse("therapist-booking-requests-confirm", args=[booking_request.id])
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 200)
        paused.refresh_from_db()
        self.assertEqual(paused.status, TherapeuticRelationship.Status.ACTIVE)
        self.assertIsNone(paused.ended_at)

    def test_confirm_creates_new_relationship_when_ended(self):
        # Use a shared anchor so started_at is always before ended_at.
        anchor = timezone.now() - timedelta(days=10)
        started_at = anchor
        ended_at = anchor + timedelta(days=7)
        ended = TherapeuticRelationship.objects.create(
            therapist=self.therapist,
            client=self.client_profile,
            status=TherapeuticRelationship.Status.ENDED,
            started_at=started_at,
            ended_at=ended_at,
        )
        booking_request = self._create_pending_request()
        self._auth(self.therapist_user)
        url = reverse("therapist-booking-requests-confirm", args=[booking_request.id])
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 200)
        ended.refresh_from_db()
        self.assertEqual(ended.status, TherapeuticRelationship.Status.ENDED)
        self.assertEqual(
            TherapeuticRelationship.objects.filter(
                therapist=self.therapist,
                client=self.client_profile,
                status=TherapeuticRelationship.Status.ACTIVE,
            ).count(),
            1,
        )
