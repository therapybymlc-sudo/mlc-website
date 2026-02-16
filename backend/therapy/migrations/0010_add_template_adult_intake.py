from django.db import migrations


def add_adult_intake_template(apps, schema_editor):
    NoteTemplate = apps.get_model("therapy", "NoteTemplate")
    NoteField = apps.get_model("therapy", "NoteField")

    template, created = NoteTemplate.objects.get_or_create(
        name="Adult Intake (Initial Assessment) Report",
        defaults={"description": "Adult intake assessment template"},
    )
    if not created:
        return

    fields = [
        ("Date of Intake", "date", []),
        ("Identifying Information (age, gender, nationality, marital status, religion, occupation, etc.)", "textarea", []),
        ("Presenting Problem", "textarea", []),
        ("History of the Problem", "textarea", []),
        ("Symptoms of Depression", "checkboxes", [
            "Unremarkable",
            "Lasting depressed, sad, or \"empty\" mood",
            "Loss of interest in almost all activities (anhedonia)",
            "Changes in appetite and/or weight",
            "Changes in sleep patterns (insomnia or hypersomnia)",
            "Slowing of physical activity, speech, and thinking OR agitation, increased restlessness, and irritability",
            "Decreased energy, fatigue, or \"slowed down\"",
            "Feelings of worthlessness and/or feelings of undue guilt or self-blame",
            "Trouble concentrating or making decisions",
            "Repeating thoughts of death or suicide, wishing to die, or planning or attempting suicide",
        ]),
        ("Symptoms of Anxiety", "checkboxes", [
            "Unremarkable",
            "Excessive anxiety and worry (apprehensive expectation)",
            "Difficulty controlling the worry",
            "Restlessness or feeling keyed up or on edge",
            "Being easily fatigued",
            "Difficulty concentrating or mind going blank",
            "Irritability",
            "Muscle tension",
            "Sleep disturbance (difficulty falling or staying asleep, or restless unsatisfying sleep)",
        ]),
        ("Symptoms of Mania", "checkboxes", [
            "Unremarkable",
            "Inflated self-esteem or grandiosity (euphoria)",
            "Decreased need for sleep",
            "Increased talkativeness",
            "Racing thoughts",
            "Distractibility",
            "Increased goal-directed activity, energy, or psychomotor agitation",
            "Poor decision-making (going on buying sprees, taking sexual risks)",
        ]),
        ("Symptoms of Psychosis", "checkboxes", [
            "Unremarkable",
            "Hallucinations (hear, see, or taste things others don't)",
            "Delusions (unusual beliefs or thoughts that aren't in line with one's culture and don't make sense to others)",
            "Disorganized thinking",
            "Grossly disorganized or abnormal motor behavior",
            "Negative symptoms",
        ]),
        ("Cognitive Functioning", "checkboxes", [
            "Trouble concentrating",
            "Memory decline",
        ]),
        ("Sleep", "textarea", []),
        ("Eating Concerns", "textarea", []),
        ("Substance / Alcohol Use", "textarea", []),
        ("Psychiatric Treatment History (including medications used)", "textarea", []),
        ("Medical History", "textarea", []),
        ("Family History", "textarea", []),
        ("Developmental History", "textarea", []),
        ("Trauma History (Physical, sexual, religious, emotional, etc.)", "textarea", []),
        ("Social History", "textarea", []),
        ("Educational Background", "textarea", []),
        ("Work Background", "textarea", []),
        ("Suicidal Ideation", "textarea", []),
        ("Homicidal Ideation", "textarea", []),
        ("Non-suicidal Self-Injurious Behavior", "textarea", []),
        ("Appearance", "checkboxes", [
            "Neat",
            "Disheveled",
            "Inappropriate",
            "Bizarre",
            "Other",
        ]),
        ("Appearance Comments", "textarea", []),
        ("Speech", "checkboxes", [
            "Normal",
            "Tangential",
            "Pressured",
            "Impoverished",
        ]),
        ("Eye Contact", "checkboxes", [
            "Normal",
            "Intense",
            "Avoidant",
            "Other",
        ]),
        ("Posture", "checkboxes", [
            "Relaxed",
            "Slumped",
            "Rigid",
        ]),
        ("Motor Activity", "checkboxes", [
            "Normal",
            "Restless",
            "Tics",
            "Slowed",
            "Other",
        ]),
        ("Affect", "checkboxes", [
            "Full",
            "Constricted",
            "Flat",
            "Labile",
            "Other",
        ]),
        ("Affect Comments", "textarea", []),
        ("Mood", "checkboxes", [
            "Euthymic",
            "Anxious",
            "Angry",
            "Depressed",
            "Euphoric",
            "Irritable",
            "Other",
        ]),
        ("Mood Comments", "textarea", []),
        ("Orientation Impairment", "checkboxes", [
            "None",
            "Place",
            "Object",
            "Person",
            "Time",
        ]),
        ("Memory Impairment", "checkboxes", [
            "None",
            "Short-term",
            "Long-term",
            "Other",
        ]),
        ("Attention", "checkboxes", [
            "Normal",
            "Distracted",
            "Other",
        ]),
        ("Attention Comments", "textarea", []),
        ("Perception – Hallucinations", "checkboxes", [
            "None",
            "Auditory",
            "Visual",
            "Other",
        ]),
        ("Perception – Illusions", "checkboxes", [
            "None",
            "Optical",
            "Auditory",
            "Other",
        ]),
        ("Other Perceptual Disturbances", "checkboxes", [
            "None",
            "Derealization",
            "Depersonalization",
        ]),
        ("Other Perceptual Disturbances Comments", "textarea", []),
        ("Suicidality (Thought Content)", "checkboxes", [
            "None",
            "Ideation",
            "Plan",
            "Intent",
            "Self-harm",
        ]),
        ("Homicidality", "checkboxes", [
            "None",
            "Aggressive",
            "Intent",
            "Plan",
        ]),
        ("Delusions", "checkboxes", [
            "None",
            "Grandiose",
            "Persecutory",
            "Thought broadcasting",
            "Delusion of reference",
            "Other",
        ]),
        ("Behavior", "checkboxes", [
            "Cooperative",
            "Guarded",
            "Hyperactive",
            "Agitated",
            "Paranoid",
            "Stereotyped",
            "Aggressive",
            "Bizarre",
            "Withdrawn",
            "Other",
        ]),
        ("Behavior Comments", "textarea", []),
        ("Insight", "select", ["Good", "Fair", "Poor"]),
        ("Insight Comments", "textarea", []),
        ("Judgment", "select", ["Good", "Fair", "Poor"]),
        ("Judgment Comments", "textarea", []),
        ("Diagnosis (List diagnoses)", "textarea", []),
        ("Clinical Impressions / Case Formulation (including treatment model)", "textarea", []),
        ("Treatment Goals", "textarea", []),
        ("Interventions", "textarea", []),
        ("Duration and Frequency (Short-term / long-term / weekly / bi-weekly)", "textarea", []),
        ("Did the client agree to the treatment plan?", "select", ["Yes", "No"]),
        ("If No, explain reasons and clinician response", "textarea", []),
        ("Clinician's Evaluation of Level of Risk", "select", ["High", "Moderate", "Mild", "Minimal"]),
        ("High or Moderate Risk Actions", "checkboxes", [
            "Emergency contact confirmed",
            "Safety plan initiated",
            "Limits of confidentiality explained",
            "Case to be addressed in consultation",
        ]),
        ("Informed Consent and Clinical Policy Review", "select", ["Yes", "Unable", "Other"]),
        ("Dual Relationships Discussion", "select", ["Yes", "Unable", "Other"]),
        ("Peer Consultation & Ethics Code Review", "select", ["Yes", "Unable", "Other"]),
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


def remove_adult_intake_template(apps, schema_editor):
    NoteTemplate = apps.get_model("therapy", "NoteTemplate")
    NoteTemplate.objects.filter(name="Adult Intake (Initial Assessment) Report").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("therapy", "0009_waitlistentry"),
    ]

    operations = [
        migrations.RunPython(add_adult_intake_template, remove_adult_intake_template),
    ]
