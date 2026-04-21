import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'base.settings')
django.setup()

from therapy.models import NoteTemplate, NoteField

templates = NoteTemplate.objects.all()
print(f"DEBUG: Found {templates.count()} templates.")

for t in templates:
    print(f"\n--- Template: {t.name} (ID: {t.id}) ---")
    print(f"Description: {t.description}")
    print(f"Sections Data: {t.sections}")
    fields = t.fields.all().order_by('order')
    for f in fields:
        print(f"  [{f.order}] {f.label} ({f.field_type})")
