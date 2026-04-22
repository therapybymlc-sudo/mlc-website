import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from therapy.models import NoteTemplate, EventType

print("--- EVENT TYPES ---")
for ets in EventType.objects.all():
    print(f"ID: {ets.id} | Name: {ets.name}")

print("\n--- NOTE TEMPLATES ---")
for nt in NoteTemplate.objects.all():
    print(f"ID: {nt.id} | Name: {nt.name} | Linked EventType ID: {nt.event_type_id}")
