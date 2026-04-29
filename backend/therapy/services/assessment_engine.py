from __future__ import annotations

from io import BytesIO
from typing import Any
from xml.sax.saxutils import escape
import urllib.request
import urllib.error

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, Image
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.axes import XValueAxis, YValueAxis
from reportlab.graphics.widgets.markers import makeMarker


DEFAULT_OUTPUT = {
    "totalScore": 0,
    "severityLabel": "",
    "severityNumericLevel": 0,
    "subscaleScores": None,
    "riskFlags": [],
    "changeScore": None,
    "clinicallySignificantChange": None,
    "requiresImmediateReview": False,
}


ASSESSMENT_REGISTRY: dict[str, dict[str, Any]] = {
    "phq_9": {
        "id": "phq_9",
        "name": "Patient Health Questionnaire-9",
        "abbreviation": "PHQ-9",
        "domain": "Depression",
        "ageRange": "13+",
        "completionTime": "2 minutes",
        "administration": "Self-report, therapist-assigned",
        "clientVisibility": "client_completes_only",
        "therapistVisibility": "full_results",
        "itemCount": 9,
        "scoringType": "Summed ordinal scale (0–3 per item)",
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
        "subscaleScores": None,
        "riskFlags": [
            {
                "id": "item9_self_harm",
                "label": "Self-harm / death thoughts endorsed",
                "urgency": "high",
                "trigger": {"itemIndex": 8, "operator": ">", "value": 0},
                "action": "Trigger alert, highlight in report, require therapist review",
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
        "version": "1.0",
        "scoringVersion": "1.0",
        "attribution": "Kroenke, Spitzer, Williams (2001)",
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
    output["subscaleScores"] = spec.get("subscaleScores")
    total = sum(int(r.get("value", 0)) for r in responses)
    output["totalScore"] = total

    for band in spec.get("severityBands", []):
        if band.get("min", 0) <= total <= band.get("max", 0):
            output["severityLabel"] = band.get("label", "")
            output["severityNumericLevel"] = band.get("severityNumericLevel", band.get("level", 0))
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
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#56756D")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8.5),
                ("FONTSIZE", (0, 1), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D7DEDB")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FAF9")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return tbl


def _section_title(text: str, styles):
    return Paragraph(f"<font color='#2F3E3A'><b>{escape(str(text))}</b></font>", styles["Heading3"])


def _load_mlc_logo() -> BytesIO | None:
    # Prefer live brand logo used by website; fail gracefully if unavailable.
    logo_urls = [
        "https://www.mlchealth.in/logo_tra.png",
        "https://mlchealth.in/logo_tra.png",
        "https://www.mlchealth.in/logo.png",
    ]
    for url in logo_urls:
        try:
            with urllib.request.urlopen(url, timeout=5) as resp:
                payload = resp.read()
                if payload:
                    return BytesIO(payload)
        except (urllib.error.URLError, TimeoutError, ValueError):
            continue
    return None


def _brand_header(styles):
    logo_io = _load_mlc_logo()
    logo_cell: Any = ""
    if logo_io is not None:
        try:
            logo = Image(logo_io, width=2.6 * cm, height=2.6 * cm)
            logo.hAlign = "LEFT"
            logo_cell = logo
        except Exception:
            logo_cell = ""

    heading_html = (
        "<font color='#56756D'><b>MLC Health &amp; Wellness Centre</b></font><br/>"
        "<font size='12'><b>Assessment Report</b></font><br/>"
        "<font size='9' color='#4A5568'>Clinical Outcome Summary</font>"
    )
    heading = Paragraph(heading_html, styles["Normal"])
    t = Table([[logo_cell, heading]], colWidths=[3 * cm, 13.5 * cm])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    return t


def _build_score_history_points(assignment, spec: dict[str, Any], scoring_output: dict[str, Any]) -> list[tuple[int, int]]:
    """Return [(sequence_index, totalScore)] for same assessment/client over time."""
    try:
        from therapy.models import ClientFormAssignment  # local import avoids circulars
    except Exception:
        return [(1, int(scoring_output.get("totalScore", 0)))]

    assessment_id = (spec.get("id") or "").strip().lower()
    if not assessment_id or not getattr(assignment, "assigned_to_id", None):
        return [(1, int(scoring_output.get("totalScore", 0)))]

    submitted_statuses = [
        ClientFormAssignment.Status.SUBMITTED,
        ClientFormAssignment.Status.REVIEWED,
    ]
    rows = (
        ClientFormAssignment.objects.filter(
            assigned_to_id=assignment.assigned_to_id,
            form_type=ClientFormAssignment.FormType.ASSESSMENT,
            status__in=submitted_statuses,
        )
        .order_by("submitted_at", "id")
        .only("id", "form_schema", "response_data", "submitted_at")
    )
    points: list[tuple[int, int]] = []
    seq = 0
    for row in rows:
        row_spec_id = ((row.form_schema or {}).get("id") or "").strip().lower()
        if row_spec_id != assessment_id:
            continue
        score = ((row.response_data or {}).get("scoring") or {}).get("totalScore")
        if isinstance(score, (int, float)):
            seq += 1
            points.append((seq, int(score)))
    if not points:
        return [(1, int(scoring_output.get("totalScore", 0)))]
    return points


def _trend_label(change_score: int | None) -> str | None:
    if change_score is None:
        return None
    if change_score <= -5:
        return "Improvement"
    if change_score >= 5:
        return "Deterioration"
    return "Stability / no reliable change"


def _severity_interp(total_score: int) -> dict[str, str]:
    # Mirrors the interpretation mapping contract from the PHQ-9 spec.
    if 0 <= total_score <= 4:
        return {
            "therapistInterpretation": "Symptoms are absent or low and may not be causing significant impairment.",
            "followUp": "Review presenting concern, functioning, and context. Continue monitoring if depression remains clinically relevant.",
        }
    if 5 <= total_score <= 9:
        return {
            "therapistInterpretation": "Symptoms may be present and may cause some distress or mild functional difficulty.",
            "followUp": "Explore stressors, sleep, routines, coping, support system, and early intervention needs.",
        }
    if 10 <= total_score <= 14:
        return {
            "therapistInterpretation": "Suggests elevated symptom burden and increased likelihood of clinically significant depressive symptoms.",
            "followUp": "Further clinical evaluation is recommended. Consider treatment planning, functional impairment, comorbidity, and risk review.",
        }
    if 15 <= total_score <= 19:
        return {
            "therapistInterpretation": "Symptoms are pronounced and likely affecting functioning, relationships, work, school, or self-care.",
            "followUp": "Active clinical follow-up is recommended. Review risk, safety, treatment intensity, and supports.",
        }
    return {
        "therapistInterpretation": "Symptoms are severe and may substantially disrupt daily functioning.",
        "followUp": "Prompt therapist review is recommended. Assess risk, impairment, crisis needs, care coordination, and treatment intensity.",
    }


def _score_trend_chart(points: list[tuple[int, int]]) -> Drawing:
    drawing = Drawing(16 * cm, 6 * cm)
    chart = LinePlot()
    chart.x = 1.1 * cm
    chart.y = 0.8 * cm
    chart.height = 4.5 * cm
    chart.width = 13.8 * cm
    chart.data = [points]
    chart.lines[0].strokeColor = colors.HexColor("#1F6F61")
    chart.lines[0].strokeWidth = 2
    chart.lines[0].symbol = makeMarker("FilledCircle")
    chart.lines[0].symbol.size = 5
    chart.lines[0].symbol.fillColor = colors.HexColor("#1F6F61")

    chart.xValueAxis = XValueAxis()
    chart.xValueAxis.valueMin = 1
    chart.xValueAxis.valueMax = max(p[0] for p in points) if points else 1
    chart.xValueAxis.valueSteps = list(range(1, chart.xValueAxis.valueMax + 1))
    chart.xValueAxis.labelTextFormat = lambda x: f"A{int(x)}"
    chart.xValueAxis.visibleGrid = 0
    chart.xValueAxis.strokeColor = colors.HexColor("#7A7A7A")

    chart.yValueAxis = YValueAxis()
    chart.yValueAxis.valueMin = 0
    chart.yValueAxis.valueMax = 27
    chart.yValueAxis.valueStep = 5
    chart.yValueAxis.visibleGrid = 1
    chart.yValueAxis.gridStrokeColor = colors.HexColor("#E3E8E6")
    chart.yValueAxis.strokeColor = colors.HexColor("#7A7A7A")

    drawing.add(chart)
    return drawing


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
    total_score = int(scoring_output.get("totalScore", 0))
    interpretation = _severity_interp(total_score)
    change_score = scoring_output.get("changeScore")
    trend_label = _trend_label(change_score if isinstance(change_score, int) else None)
    score_points = _build_score_history_points(assignment, spec, scoring_output)

    story = [
        _brand_header(styles),
        Spacer(1, 0.2 * cm),
        Table(
            [[""]],
            colWidths=[16.5 * cm],
            style=TableStyle([("LINEBELOW", (0, 0), (-1, -1), 1.2, colors.HexColor("#C9A960"))]),
        ),
        Spacer(1, 0.25 * cm),
        _p(spec.get("name", "Assessment"), styles["Heading2"]),
        _p(f"Assigned: {timezone.localtime(assignment.assigned_at).strftime('%Y-%m-%d %H:%M')}", styles["Normal"]),
        _p(f"Completed: {timezone.localtime(assignment.submitted_at).strftime('%Y-%m-%d %H:%M') if assignment.submitted_at else 'N/A'}", styles["Normal"]),
        Spacer(1, 0.25 * cm),
        _section_title("Metadata", styles),
    ]

    meta_rows = [
        ["Field", "Value"],
        ["Assessment", spec.get("name", "")],
        ["Abbreviation", spec.get("abbreviation", "")],
        ["Assessment ID", spec.get("id", "")],
        ["Domain", ", ".join(spec.get("domain", [])) if isinstance(spec.get("domain"), list) else str(spec.get("domain", ""))],
        ["Age range", spec.get("ageRange", "")],
        ["Completion time", spec.get("completionTime", "")],
        ["Scoring type", (spec.get("scoring") or {}).get("type", "")],
        ["Version", spec.get("version", "")],
        ["Scoring version", spec.get("scoringVersion", "")],
    ]
    story.append(_table(meta_rows, col_widths=[5.2 * cm, 11.3 * cm]))
    story.extend([
        Spacer(1, 0.3 * cm),
        _section_title("Score Summary", styles),
    ])

    summary_rows = [
        ["Field", "Value"],
        ["Total score", total_score],
        ["Score range", f"{(spec.get('scoring') or {}).get('range', {}).get('min', 0)}-{(spec.get('scoring') or {}).get('range', {}).get('max', 27)}"],
        ["Severity", scoring_output.get("severityLabel", "")],
        ["Severity level", scoring_output.get("severityNumericLevel", 0)],
        ["Immediate review", "Yes" if scoring_output.get("requiresImmediateReview") else "No"],
    ]
    story.append(_table(summary_rows, col_widths=[6.5 * cm, 10 * cm]))
    story.append(Spacer(1, 0.3 * cm))

    risk_flags = scoring_output.get("riskFlags") or []
    if risk_flags:
        story.append(_section_title("Risk Flags", styles))
        risk_rows = [["Flag", "Details"]]
        for flag in risk_flags:
            risk_rows.append(
                [
                    flag.get("label", "Risk flag"),
                    (
                        f"Urgency: {flag.get('urgency', 'high')} | "
                        f"Item {flag.get('itemIndex')} response={flag.get('responseValue')} | "
                        f"Action: {flag.get('action', '')}"
                    ),
                ]
            )
        story.append(_table(risk_rows, col_widths=[7 * cm, 9.5 * cm]))
        story.append(Spacer(1, 0.3 * cm))

    story.append(_section_title("Interpretation", styles))
    story.append(_p(f"{scoring_output.get('severityLabel', 'Unknown')} range.", styles["Normal"]))
    story.append(_p(interpretation.get("therapistInterpretation", ""), styles["Normal"]))
    story.append(_p(f"Follow-up: {interpretation.get('followUp', '')}", styles["Normal"]))
    story.append(_p(
        "Cutoff guidance: A score of 10 or higher is commonly used as a clinical cutoff suggesting increased likelihood of clinically significant depressive symptoms. "
        "This does not diagnose depression and must be interpreted in context.",
        styles["Normal"],
    ))
    story.append(_p(f"Disclaimer: {spec.get('disclaimer', '')}", styles["Normal"]))
    story.append(Spacer(1, 0.25 * cm))

    story.append(_section_title("Change / Progress", styles))
    change_rows = [
        ["Field", "Value"],
        ["Previous score", "N/A" if change_score is None else str(total_score - int(change_score))],
        ["Current score", str(total_score)],
        ["Change score", "N/A" if change_score is None else str(change_score)],
        [
            "Clinically significant change (>=5)",
            "N/A" if scoring_output.get("clinicallySignificantChange") is None else ("Yes" if scoring_output.get("clinicallySignificantChange") else "No"),
        ],
        ["Trend label", trend_label or "N/A"],
    ]
    story.append(_table(change_rows, col_widths=[7 * cm, 9.5 * cm]))
    story.append(Spacer(1, 0.25 * cm))

    story.append(_section_title("Score Trend Graph", styles))
    story.append(_p("PHQ-9 total score trajectory across completed assignments.", styles["Normal"]))
    story.append(_score_trend_chart(score_points))
    story.append(Spacer(1, 0.25 * cm))

    story.append(_section_title("Report Metadata", styles))
    report_meta_rows = [
        ["Field", "Value"],
        ["Assessment instance", str(getattr(assignment, "id", ""))],
        ["Client ID", str(getattr(assignment, "assigned_to_id", ""))],
        ["Therapist ID", str(getattr(assignment, "assigned_by_id", ""))],
        ["Assessment ID", spec.get("id", "")],
        ["Scored at", timezone.localtime(timezone.now()).strftime("%Y-%m-%d %H:%M")],
        ["Reviewed", "Yes" if assignment.status == getattr(assignment.Status, "REVIEWED", "reviewed") else "No"],
        ["Attribution", spec.get("attribution", "")],
    ]
    story.append(_table(report_meta_rows, col_widths=[4.7 * cm, 11.8 * cm]))
    story.append(Spacer(1, 0.35 * cm))

    # Required by product: response sheet always appended at end.
    story.append(_section_title("Client Response Sheet", styles))
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
