from django.contrib.auth import get_user_model
from django.test import TestCase

from therapy.models import ClientProfile
from therapy.permissions import get_current_client_profile
from therapy.utils import resolve_user_display_name, sync_client_profile_identity


class ClientProfileIdentityTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="user_3CcEEL3CBmbZ3NHnYEVLbSCCui9",
            email="client@example.com",
            password="pass1234",
        )

    def test_resolve_user_display_name_never_uses_clerk_username(self):
        name = resolve_user_display_name(self.user, fallback="Client")
        self.assertEqual(name, "client")

    def test_resolve_user_display_name_prefers_real_name(self):
        self.user.first_name = "Asha"
        self.user.last_name = "Mehta"
        self.user.save(update_fields=["first_name", "last_name"])
        name = resolve_user_display_name(self.user, fallback="Client")
        self.assertEqual(name, "Asha Mehta")

    def test_get_current_client_profile_does_not_store_user_prefix(self):
        client = get_current_client_profile(self.user)
        self.assertIsNotNone(client)
        self.assertFalse(client.name.startswith("user_"))
        self.assertEqual(client.name, "client")

    def test_sync_client_profile_identity_repairs_placeholder_name(self):
        profile = ClientProfile.objects.create(
            user=self.user,
            name="user_3CcEEL3CBmbZ3NHnYEVLbSCCui9",
            email="client@example.com",
        )
        self.user.first_name = "Asha"
        self.user.last_name = "Mehta"
        self.user.save(update_fields=["first_name", "last_name"])

        changed = sync_client_profile_identity(profile, self.user)
        profile.refresh_from_db()

        self.assertTrue(changed)
        self.assertEqual(profile.name, "Asha Mehta")
