from django.db import migrations


def add_screening_note_template(apps, schema_editor):
    NoteTemplate = apps.get_model("therapy", "NoteTemplate")
    NoteField = apps.get_model("therapy", "NoteField")

    template, created = NoteTemplate.objects.get_or_create(
        name="Screening Note",
        defaults={"description": "Pre-therapy screening template"},
    )
    if not created:
        return

    fields = [
        ("Where does the client reside (or where will they reside during interventions?)", "text", []),
        ("Presenting Concern", "textarea", []),
        ("Concern History", "textarea", []),
        ("Current support system", "textarea", []),
        ("Previously in therapy?", "textarea", []),
        ("Treated or evaluated by a psychiatrist before", "textarea", []),
        ("Psychiatric medication(s)", "textarea", []),
        ("Previous psychiatric hospitalization(s)", "textarea", []),
        ("Past neurological assessment (if appropriate)", "textarea", []),
        ("Chronic medical conditions (if appropriate)", "textarea", []),
        ("Eating concerns", "textarea", []),
        ("Substance / alcohol use", "textarea", []),
        ("Suicidal ideation / plan / means / intent", "textarea", []),
        ("Self-harm", "textarea", []),
        ("Violence towards others", "textarea", []),
        ("Therapist and language preference(s)", "textarea", []),
        ("Does this potential client know a family member, close friend, or close associate who comes to Anara?", "select", [
            "Yes",
            "No",
            "I don't know",
        ]),
        ("Is this potential client closely related to or a close friend of ANY of the Anara clinicians/staff?", "select", [
            "Yes",
            "No",
            "I don't know",
            "Other",
        ]),
        ("Is there any additional information that may help us direct this client to an appropriate clinician?", "textarea", []),
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


def remove_screening_note_template(apps, schema_editor):
    NoteTemplate = apps.get_model("therapy", "NoteTemplate")
    NoteTemplate.objects.filter(name="Screening Note").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0010_add_template_adult_intake"),
    ]

    operations = [
        migrations.RunPython(add_screening_note_template, remove_screening_note_template),
    ]
