from django.db import migrations


def add_standard_session_note_template(apps, schema_editor):
    NoteTemplate = apps.get_model("therapy", "NoteTemplate")
    NoteField = apps.get_model("therapy", "NoteField")

    template, created = NoteTemplate.objects.get_or_create(
        name="Standard Session Note",
        defaults={"description": "Routine ongoing therapy session note"},
    )
    if not created:
        return

    fields = [
        ("Today's Session", "checkboxes", [
            "Was via Video Call",
            "Was in-office",
            "Was at the client's home",
            "Client was early for session",
            "Client was on-time for session",
            "Client was late for today's session",
            "Alert and fully oriented to person, place, time, and situation",
            "Speech volume, rhythm, and tone were within normal limits",
            "Client was fully engaged and appeared interested in session content",
            "Client left this session calmly and in generally good spirits",
        ]),
        ("General Mood / Affect and Elaborated Mental Status", "textarea", []),
        ("Specific High-Risk Mental Status of Client Today", "checkboxes", [
            "Denies current suicidal ideation, intention, or plan",
            "Denies homicidal ideation, intention, or plan",
            "No physical self-harm since last appointment",
            "Denies active delusions, hallucinations, and obsessions",
        ]),
        ("Elaboration of Any Current High-Risk Concerns", "textarea", []),
        ("Current Progress Toward Treatment Goals", "textarea", []),
        ("Intervention(s) Offered This Session", "textarea", []),
        ("Treatment Plan", "textarea", []),
    ]

    for order, (label, field_type, choices) in enumerate(fields):
        options = {}
        if field_type in {"checkboxes", "select", "choice"}:
            options["choices"] = choices
        NoteField.objects.create(
            template=template,
            label=label,
            field_type=field_type,
            is_required=False,
            order=order,
            options=options,
        )


def remove_standard_session_note_template(apps, schema_editor):
    NoteTemplate = apps.get_model("therapy", "NoteTemplate")
    NoteTemplate.objects.filter(name="Standard Session Note").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0011_add_template_screening_note"),
    ]

    operations = [
        migrations.RunPython(add_standard_session_note_template, remove_standard_session_note_template),
    ]
