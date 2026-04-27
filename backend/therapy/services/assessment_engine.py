from __future__ import annotations

from io import BytesIO
from typing import Any
from xml.sax.saxutils import escape

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


DEFAULT_OUTPUT = {
    "totalScore": 0,
    "severityLabel": "",
    "severityNumericLevel": 0,
    "subscaleScores": {},
    "riskFlags": [],
    "changeScore": None,
    "clinicallySignificantChange": None,
    "requiresImmediateReview": False,
}


ASSESSMENT_REGISTRY: dict[str, dict[str, Any]] = {
    "phq_9": {
        "id": "phq_9",
        "name": "Patient Health Questionnaire–9",
        "abbreviation": "PHQ-9",
        "domain": ["depressive_symptoms", "screening", "progress_monitoring"],
        "ageRange": "13+",
        "completionTime": "approximately 2 minutes",
        "administration": "therapist_assigned_self_report",
        "clientVisibility": "client_completes_only",
        "therapistVisibility": "full_results",
        "itemCount": 9,
        "scoringType": "sum",
        "content": {
            "overviewGeneral": (
                "The Patient Health Questionnaire–9 (PHQ-9) is a 9-item self-report screening and "
                "outcome-monitoring measure for depressive symptoms over the previous 2 weeks. "
                "It reflects DSM-aligned symptom domains and supports symptom burden tracking, but "
                "does not diagnose depression on its own."
            ),
            "overview": {
                "therapistFacing": (
                    "The PHQ-9 supports structured screening, baseline measurement, treatment planning, "
                    "risk visibility, and progress monitoring for adolescents and adults aged 13+."
                ),
                "clientFriendly": (
                    "This questionnaire asks about common symptoms of depression during the past 2 weeks. "
                    "Your answers help your therapist understand symptom impact and change over time."
                ),
            },
            "mlcUseContext": (
                "Within MLC, the PHQ-9 is therapist-assigned for intake screening, treatment monitoring, "
                "response review, risk review, and structured outcome tracking. Results should be reviewed "
                "alongside presenting concern, therapy history, risk profile, daily functioning, medical and "
                "medication context, supports, substance use, and recent stressors. Item 9 must be treated as "
                "a visible risk-related item requiring therapist follow-up when endorsed."
            ),
            "administrationInstructions": (
                "PHQ-9 contains 9 items. The client rates frequency during the previous 2 weeks using: "
                "0=Not at all, 1=Several days, 2=More than half the days, 3=Nearly every day. "
                "Estimated completion time is approximately 2 minutes. Completed privately by client; "
                "interpreted by therapist."
            ),
            "scoringInterpretation": (
                "Total score is the sum of item1-item9 (range 0-27). Severity bands: 0-4 No/minimal, "
                "5-9 Mild, 10-14 Moderate, 15-19 Moderately severe, 20-27 Severe depressive symptoms. "
                "A score >=10 is commonly used as a clinical cutoff for elevated likelihood of clinically "
                "significant depressive symptoms. Change score is current-total minus previous-total; "
                "absolute change >=5 is commonly treated as clinically meaningful."
            ),
            "psychometricProperties": (
                "PHQ-9 has extensive validation evidence across primary care, adolescent, community, and "
                "international samples. Original studies reported strong internal consistency (around alpha .89) "
                "and test-retest reliability (around .84), with useful screening performance varying by population."
            ),
            "limitationsEthics": (
                "PHQ-9 is not diagnostic. Interpretation must consider context, functioning, medical contributors, "
                "substance effects, trauma/grief, and broader clinical picture. Item 9 endorsement requires direct "
                "follow-up but should not be the sole basis for crisis decisions; full risk assessment remains required."
            ),
            "disclaimer": "This is a screening and progress-monitoring tool and not a standalone diagnostic instrument.",
            "attribution": (
                "Patient Health Questionnaire–9 (PHQ-9), developed by Kroenke, Spitzer, and Williams, 2001. "
                "MLC does not claim ownership of this instrument."
            ),
            "references": [
                "Bianchi R et al. Is the PHQ-9 a unidimensional measure of depression? Psychological Assessment (2022).",
                "Johansson R et al. Depression, anxiety and their comorbidity in the Swedish general population. PeerJ (2013).",
                "Kocalevent R-D et al. Standardization of PHQ-9 in the general population. General Hospital Psychiatry (2013).",
                "Kroenke K, Spitzer RL, Williams JBW. The PHQ-9. Journal of General Internal Medicine (2001).",
                "Martin A et al. Validity of the Brief PHQ Mood Scale. General Hospital Psychiatry (2006).",
                "McMillan D et al. Defining treatment outcome in depression using PHQ-9. Journal of Affective Disorders (2010).",
                "Richardson LP et al. Evaluation of PHQ-9 for adolescent depression detection. Pediatrics (2010).",
                "Urtasun M et al. Validation and calibration of PHQ-9 in Argentina. BMC Psychiatry (2019).",
            ],
        },
        "items": [
            {"itemNumber": 1, "itemIndex": 0, "itemText": "Little interest or pleasure in doing things", "isRiskItem": False},
            {"itemNumber": 2, "itemIndex": 1, "itemText": "Feeling down, depressed, or hopeless", "isRiskItem": False},
            {"itemNumber": 3, "itemIndex": 2, "itemText": "Trouble falling or staying asleep, or sleeping too much", "isRiskItem": False},
            {"itemNumber": 4, "itemIndex": 3, "itemText": "Feeling tired or having little energy", "isRiskItem": False},
            {"itemNumber": 5, "itemIndex": 4, "itemText": "Poor appetite or overeating", "isRiskItem": False},
            {"itemNumber": 6, "itemIndex": 5, "itemText": "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", "isRiskItem": False},
            {"itemNumber": 7, "itemIndex": 6, "itemText": "Trouble concentrating on things, such as reading the newspaper or watching television", "isRiskItem": False},
            {"itemNumber": 8, "itemIndex": 7, "itemText": "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", "isRiskItem": False},
            {"itemNumber": 9, "itemIndex": 8, "itemText": "Thoughts that you would be better off dead or of hurting yourself in some way", "isRiskItem": True},
        ],
        "responseScale": [
            {"value": 0, "label": "Not at all"},
            {"value": 1, "label": "Several days"},
            {"value": 2, "label": "More than half the days"},
            {"value": 3, "label": "Nearly every day"},
        ],
        "scoring": {"type": "sum", "range": {"min": 0, "max": 27}},
        "severityBands": [
            {"min": 0, "max": 4, "label": "No or minimal depressive symptoms", "severityNumericLevel": 0},
            {"min": 5, "max": 9, "label": "Mild depressive symptoms", "severityNumericLevel": 1},
            {"min": 10, "max": 14, "label": "Moderate depressive symptoms", "severityNumericLevel": 2},
            {"min": 15, "max": 19, "label": "Moderately severe depressive symptoms", "severityNumericLevel": 3},
            {"min": 20, "max": 27, "label": "Severe depressive symptoms", "severityNumericLevel": 4},
        ],
        "subscaleScores": {},
        "riskFlags": [
            {
                "id": "item9_self_harm",
                "label": "Item 9 endorsed: thoughts of death or self-harm",
                "urgency": "critical",
                "trigger": {"itemIndex": 8, "operator": ">", "value": 0},
                "action": (
                    "Trigger visible system alert, highlight in therapist-facing report, "
                    "require therapist follow-up, and prevent silent storage."
                ),
            }
        ],
        "outputs": [
            "totalScore",
            "severityLabel",
            "severityNumericLevel",
            "subscaleScores",
            "riskFlags",
            "changeScore",
            "clinicallySignificantChange",
            "requiresImmediateReview",
        ],
        "version": "1.0.0",
        "scoringVersion": "1.0.0",
        "attribution": (
            "Patient Health Questionnaire–9 (PHQ-9), developed by Kroenke, Spitzer, and Williams, 2001. "
            "MLC does not claim ownership of this instrument."
        ),
        "disclaimer": "screening only — clinical interpretation required",
    }
}


def list_assessment_specs() -> list[dict[str, Any]]:
    return [ASSESSMENT_REGISTRY[key] for key in sorted(ASSESSMENT_REGISTRY.keys())]


def get_assessment_spec(assessment_id: str) -> dict[str, Any] | None:
    return ASSESSMENT_REGISTRY.get((assessment_id or "").strip().lower())


def build_assignment_schema(assessment_id: str) -> dict[str, Any]:
    spec = get_assessment_spec(assessment_id)
    if not spec:
        raise ValueError("Unknown assessment_id")
    return spec


def validate_assessment_responses(spec: dict[str, Any], responses: Any) -> tuple[bool, str]:
    if not isinstance(responses, list):
        return False, "Responses must be a list."
    expected = spec.get("items", [])
    if len(responses) != len(expected):
        return False, "All assessment items must be completed before scoring."

    allowed_values = {r.get("value") for r in spec.get("responseScale", [])}
    expected_items = sorted(expected, key=lambda item: item.get("itemIndex", 0))
    for pos, row in enumerate(responses):
        if not isinstance(row, dict):
            return False, "Each response must be an object."
        idx = row.get("itemIndex")
        value = row.get("value")
        if not isinstance(idx, int):
            return False, "Each response requires a numeric itemIndex."
        if not isinstance(value, int):
            return False, f"Response value for itemIndex {idx} must be an integer."
        expected_idx = expected_items[pos].get("itemIndex")
        if idx != expected_idx:
            return False, "Responses must be submitted in exact itemIndex order."
        if value not in allowed_values:
            return False, f"Invalid response value for itemIndex {idx}."
    return True, ""


def score_assessment(spec: dict[str, Any], responses: list[dict[str, Any]], previous_score: int | None = None) -> dict[str, Any]:
    output = dict(DEFAULT_OUTPUT)
    total = sum(int(r.get("value", 0)) for r in responses)
    output["totalScore"] = total

    for band in spec.get("severityBands", []):
        if band.get("min", 0) <= total <= band.get("max", 0):
            output["severityLabel"] = band.get("label", "")
            output["severityNumericLevel"] = band.get("severityNumericLevel", 0)
            break

    risk_flags = detect_risk_flags(spec, responses)
    output["riskFlags"] = risk_flags
    output["requiresImmediateReview"] = any(flag.get("requiresImmediateReview") for flag in risk_flags)

    if previous_score is not None:
        delta = total - int(previous_score)
        output["changeScore"] = delta
        output["clinicallySignificantChange"] = abs(delta) >= 5

    return output


def detect_risk_flags(spec: dict[str, Any], responses: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_index = {r.get("itemIndex"): int(r.get("value", 0)) for r in responses}
    flags = []
    for rule in spec.get("riskFlags", []):
        trigger = rule.get("trigger") or {}
        idx = trigger.get("itemIndex")
        op = trigger.get("operator")
        trigger_value = trigger.get("value")
        val = by_index.get(idx, 0)
        matched = (
            (op == ">" and val > trigger_value)
            or (op == ">=" and val >= trigger_value)
            or (op == "==" and val == trigger_value)
        )
        if matched:
            flags.append(
                {
                    "id": rule.get("id"),
                    "label": rule.get("label", "Risk flag"),
                    "urgency": rule.get("urgency", "high"),
                    "trigger": {
                        "itemIndex": idx,
                        "operator": op,
                        "value": trigger_value,
                        "actualValue": val,
                    },
                    "action": rule.get("action", ""),
                    "itemIndex": idx,
                    "responseValue": val,
                    "requiresImmediateReview": rule.get("urgency") in {"high", "critical"},
                }
            )
    return flags


def _p(text: str, style):
    return Paragraph(escape(str(text)), style)


def _table(data: list[list[Any]], col_widths=None):
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#305E57")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7faf9")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return tbl


def build_assessment_report_pdf_bytes(*, assignment, spec: dict[str, Any], scoring_output: dict[str, Any], responses: list[dict[str, Any]]) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title=f"{spec.get('name', 'Assessment')} Report",
    )
    styles = getSampleStyleSheet()
    story = [
        _p("MLC Assessment Report", styles["Title"]),
        Spacer(1, 0.3 * cm),
        _p(spec.get("name", "Assessment"), styles["Heading2"]),
        _p(f"Assigned: {timezone.localtime(assignment.assigned_at).strftime('%Y-%m-%d %H:%M')}", styles["Normal"]),
        _p(f"Completed: {timezone.localtime(assignment.submitted_at).strftime('%Y-%m-%d %H:%M') if assignment.submitted_at else 'N/A'}", styles["Normal"]),
        Spacer(1, 0.25 * cm),
        _p("Score Summary", styles["Heading3"]),
    ]

    summary_rows = [
        ["Field", "Value"],
        ["Total score", scoring_output.get("totalScore", 0)],
        ["Severity", scoring_output.get("severityLabel", "")],
        ["Severity level", scoring_output.get("severityNumericLevel", 0)],
        ["Immediate review", "Yes" if scoring_output.get("requiresImmediateReview") else "No"],
    ]
    story.append(_table(summary_rows, col_widths=[6.5 * cm, 10 * cm]))
    story.append(Spacer(1, 0.3 * cm))

    risk_flags = scoring_output.get("riskFlags") or []
    if risk_flags:
        story.append(_p("Risk Flags", styles["Heading3"]))
        risk_rows = [["Flag", "Details"]]
        for flag in risk_flags:
            risk_rows.append([flag.get("label", "Risk flag"), f"Item {flag.get('itemIndex')} (response {flag.get('responseValue')})"])
        story.append(_table(risk_rows, col_widths=[7 * cm, 9.5 * cm]))
        story.append(Spacer(1, 0.3 * cm))

    story.append(_p("Interpretation", styles["Heading3"]))
    story.append(
        _p(
            f"{scoring_output.get('severityLabel', 'Unknown')} symptom range. {spec.get('disclaimer', '')}",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 0.35 * cm))

    # Required by product: response sheet always appended at end.
    story.append(_p("Client Response Sheet", styles["Heading2"]))
    item_by_index = {item.get("itemIndex"): item for item in spec.get("items", [])}
    label_map = {row.get("value"): row.get("label") for row in spec.get("responseScale", [])}
    response_rows = [["Item", "Question", "Response"]]
    for response in sorted(responses, key=lambda r: r.get("itemIndex", 0)):
        idx = response.get("itemIndex")
        question = item_by_index.get(idx, {}).get("itemText", f"Item {idx}")
        value = response.get("value")
        response_rows.append([str((idx or 0) + 1), question, f"{value} - {label_map.get(value, '')}"])
    story.append(_table(response_rows, col_widths=[1.2 * cm, 10.3 * cm, 5 * cm]))

    doc.build(story)
    return buf.getvalue()
