from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from therapy.models import Notification


class NotificationEndpointTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="user1", email="user1@example.com", password="pass1234"
        )
        self.other_user = User.objects.create_user(
            username="user2", email="user2@example.com", password="pass1234"
        )

        self.user_notification = Notification.objects.create(
            recipient_user_profile=self.user,
            type=Notification.Type.BOOKING_REQUEST_CREATED,
            title="New booking request",
            body="A client requested a slot.",
            related_model="BookingRequest",
            related_id="1",
            action_url="/dashboard/therapist?tab=bookingRequests",
        )

        self.read_notification = Notification.objects.create(
            recipient_user_profile=self.user,
            type=Notification.Type.APPOINTMENT_CANCELLED,
            title="Appointment cancelled",
            body="An appointment was cancelled.",
            related_model="Appointment",
            related_id="2",
            action_url="/dashboard/therapist?tab=appointments",
            is_read=True,
        )

        self.other_notification = Notification.objects.create(
            recipient_user_profile=self.other_user,
            type=Notification.Type.BOOKING_REQUEST_CONFIRMED,
            title="Booking confirmed",
            body="A booking was confirmed.",
            related_model="BookingRequest",
            related_id="3",
            action_url="/dashboard/client?section=sessions",
        )

    def test_list_notifications_scoped_to_user(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("notifications-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        ids = {item["id"] for item in resp.json()}
        self.assertIn(self.user_notification.id, ids)
        self.assertIn(self.read_notification.id, ids)
        self.assertNotIn(self.other_notification.id, ids)

    def test_list_notifications_filter_unread(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("notifications-list")
        resp = self.client.get(url, {"is_read": "false"})
        self.assertEqual(resp.status_code, 200)
        ids = {item["id"] for item in resp.json()}
        self.assertIn(self.user_notification.id, ids)
        self.assertNotIn(self.read_notification.id, ids)

    def test_mark_as_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("notifications-mark-read", args=[self.user_notification.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200)
        self.user_notification.refresh_from_db()
        self.assertTrue(self.user_notification.is_read)
        self.assertIsNotNone(self.user_notification.read_at)

    def test_cannot_mark_other_users_notification(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("notifications-mark-read", args=[self.other_notification.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 404)
