from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from therapy.models import (
    TherapistProfile,
    ClientProfile,
    TherapeuticRelationship,
)


class Command(BaseCommand):
    help = "Backfill auth user links and therapeutic relationships."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would change without writing to the database.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=None,
            help="Limit number of records processed per model (for testing).",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        limit = options["limit"]

        User = get_user_model()

        users = User.objects.exclude(email__isnull=True).exclude(email="").only("id", "email")
        if limit:
            users = users[:limit]
        user_by_email = {u.email.lower(): u for u in users if u.email}

        therapist_qs = TherapistProfile.objects.all()
        client_qs = ClientProfile.objects.select_related("therapist").all()
        if limit:
            therapist_qs = therapist_qs[:limit]
            client_qs = client_qs[:limit]

        therapist_updates = 0
        client_updates = 0
        relationships_created = 0
        relationships_primary = 0

        with transaction.atomic():
            for therapist in therapist_qs:
                if therapist.user_id:
                    continue
                if not therapist.email:
                    continue
                user = user_by_email.get(therapist.email.lower())
                if not user:
                    continue
                therapist_updates += 1
                if not dry_run:
                    therapist.user = user
                    therapist.save(update_fields=["user"])

            for client in client_qs:
                if not client.user_id and client.email:
                    user = user_by_email.get(client.email.lower())
                    if user:
                        client_updates += 1
                        if not dry_run:
                            client.user = user
                            client.save(update_fields=["user"])

                if not client.therapist_id:
                    continue

                rel, created = TherapeuticRelationship.objects.get_or_create(
                    therapist=client.therapist,
                    client=client,
                    defaults={
                        "status": TherapeuticRelationship.Status.ACTIVE,
                        "is_primary": False,
                        "started_at": timezone.now(),
                    },
                )
                if created:
                    relationships_created += 1

                has_primary = TherapeuticRelationship.objects.filter(
                    client=client,
                    status=TherapeuticRelationship.Status.ACTIVE,
                    is_primary=True,
                ).exists()
                if not has_primary:
                    relationships_primary += 1
                    if not dry_run:
                        rel.is_primary = True
                        rel.save(update_fields=["is_primary", "updated_at"])

            if dry_run:
                transaction.set_rollback(True)

        self.stdout.write(self.style.SUCCESS("Backfill summary"))
        self.stdout.write(f"Therapist profiles linked: {therapist_updates}")
        self.stdout.write(f"Client profiles linked: {client_updates}")
        self.stdout.write(f"Relationships created: {relationships_created}")
        self.stdout.write(f"Primary relationships set: {relationships_primary}")
