from django.db import migrations


def add_termination_summary_template(apps, schema_editor):
    NoteTemplate = apps.get_model("therapy", "NoteTemplate")
    NoteField = apps.get_model("therapy", "NoteField")

    template, created = NoteTemplate.objects.get_or_create(
        name="TERMINATION SUMMARY",
        defaults={"description": "Termination summary template"},
    )
    if not created:
        return

    fields = [
        ("Initiation of Care Date", "date", []),
        ("Presenting Concern(s)", "checkboxes", [
            "Anxiety – General",
            "Anxiety – Specific",
            "ADHD",
            "Behavior Challenges at Home",
            "Behavior Challenges at School",
            "Chronic Pain",
            "Cognitive Challenges",
            "Depression",
            "Grief Work",
            "OCD",
            "Relationship with Friends",
            "Relationship with Family",
            "Relationship with Partner",
            "School Related Challenges",
            "Self Harm",
            "Sensory Difficulties",
            "Stress – Family",
            "Stress – General",
            "Stress – Work",
            "Substance Use Difficulties",
            "Unusual Thoughts or Experiences",
            "Other",
        ]),
        ("Termination Date", "date", []),
        ("Reason for Termination", "checkboxes", [
            "Course of therapy completed",
            "Client moved and will continue with a different provider",
            "Client declined to reschedule",
            "Other",
        ]),
        ("Therapeutic Modalities Used", "checkboxes", [
            "ACT",
            "Bio and Neurofeedback Work",
            "CBT",
            "Cognitive Rehabilitation Work",
            "DBT",
            "EMDR",
            "Existential / Humanistic Work",
            "Formal Assessments",
            "Internal Family Systems (IFS) Work",
            "IPS",
            "Mindfulness-Based Cognitive Behavioral Therapy",
            "Person Centered Work",
            "Play Therapy",
            "PMR",
            "Psychodynamic Work",
            "VRET",
            "Other",
        ]),
        ("Brief Summary of Treatment (Treatment plan and goals, progress, challenges, setbacks)", "textarea", []),
        ("Intake Diagnosis (DSM-5-TR / ICD-11 Code)", "textarea", []),
        ("Termination Diagnosis", "textarea", []),
        ("Other Conditions (Medical, Social)", "textarea", []),
        ("Other Modalities of Treatment Received by Client (e.g., couples therapy, group therapy)", "textarea", []),
        ("Collateral Involvement", "textarea", []),
        ("Outcomes of Treatment", "textarea", []),
        ("Recommendations", "textarea", []),
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


def remove_termination_summary_template(apps, schema_editor):
    NoteTemplate = apps.get_model("therapy", "NoteTemplate")
    NoteTemplate.objects.filter(name="TERMINATION SUMMARY").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0012_add_template_standard_session_note"),
    ]

    operations = [
        migrations.RunPython(add_termination_summary_template, remove_termination_summary_template),
    ]
