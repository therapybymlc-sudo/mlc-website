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
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.axes import XValueAxis, YValueAxis
from reportlab.graphics.widgets.markers import makeMarker
from reportlab.graphics.shapes import Rect, String, Line


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
    # Ensure long text wraps and rows auto-expand naturally.
    cell_styles = getSampleStyleSheet()
    wrapped_body = []
    for row_index, row in enumerate(data):
        if row_index == 0:
            wrapped_body.append(row)
            continue
        wrapped_row = []
        for cell in row:
            if isinstance(cell, str):
                wrapped_row.append(Paragraph(escape(cell), cell_styles["BodyText"]))
            else:
                wrapped_row.append(cell)
        wrapped_body.append(wrapped_row)

    tbl = Table(wrapped_body, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F9FAFB")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#6B7280")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("FONTSIZE", (0, 1), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#E5E7EB")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.white]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("WORDWRAP", (0, 0), (-1, -1), "LTR"),
            ]
        )
    )
    return tbl


def _section_title(text: str, styles):
    return Paragraph(
        f"<font color='#2B6B56' size='10'><b>{escape(str(text).upper())}</b></font>",
        styles["Heading3"],
    )


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

    left_html = (
        "<font color='#1A3636' size='9'><b>MLC Health &amp; Wellness Centre</b></font><br/>"
        "<font size='8' color='#6B7280'>A space to feel, to heal, to become.</font>"
    )
    right_html = (
        "<para align='right'>"
        "<font color='#2B6B56' size='8'><b>OFFICIAL RECORD</b></font><br/>"
        "<font size='16' color='#333333'><b>Patient Health Questionnaire-9 (PHQ-9)</b></font><br/>"
        "<font size='8' color='#6B7280'><b>Depression Assessment Report</b></font>"
        "</para>"
    )
    left_block = Paragraph(left_html, styles["Normal"])
    right_block = Paragraph(right_html, styles["Normal"])
    t = Table([[logo_cell, left_block, right_block]], colWidths=[3 * cm, 6.7 * cm, 6.8 * cm])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
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


def _severity_bar_chart(total_score: int) -> Drawing:
    drawing = Drawing(16 * cm, 2.4 * cm)
    x0 = 0.6 * cm
    y0 = 0.95 * cm
    w = 14.8 * cm
    h = 0.55 * cm
    bands = [
        (0, 4, colors.HexColor("#D7DCE0")),   # minimal
        (5, 9, colors.HexColor("#E8D79A")),   # mild
        (10, 14, colors.HexColor("#E7B86D")), # moderate
        (15, 19, colors.HexColor("#D9865B")), # mod severe
        (20, 27, colors.HexColor("#C95A5A")), # severe
    ]
    full_range = 27
    for bmin, bmax, col in bands:
        bx = x0 + (bmin / full_range) * w
        bw = ((bmax - bmin + 1) / (full_range + 1)) * w
        drawing.add(Rect(bx, y0, bw, h, fillColor=col, strokeColor=colors.white, strokeWidth=0.3))

    marker_x = x0 + (max(0, min(total_score, full_range)) / full_range) * w
    drawing.add(Line(marker_x, y0 - 0.2 * cm, marker_x, y0 + h + 0.28 * cm, strokeColor=colors.HexColor("#1F3D2B"), strokeWidth=1.4))
    drawing.add(String(marker_x - 0.35 * cm, y0 + h + 0.35 * cm, f"{total_score}", fontSize=8, fillColor=colors.HexColor("#1F3D2B")))
    drawing.add(String(x0, y0 - 0.45 * cm, "0", fontSize=7, fillColor=colors.HexColor("#4A5568")))
    drawing.add(String(x0 + w - 0.45 * cm, y0 - 0.45 * cm, "27", fontSize=7, fillColor=colors.HexColor("#4A5568")))
    drawing.add(String(x0, 0.2 * cm, "Severity Bar (PHQ-9)", fontSize=8, fillColor=colors.HexColor("#4A5568")))
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
    prev_score = (total_score - int(change_score)) if isinstance(change_score, int) else None
    submitted_at = timezone.localtime(assignment.submitted_at) if assignment.submitted_at else None
    assigned_at = timezone.localtime(assignment.assigned_at) if assignment.assigned_at else None
    client = getattr(assignment, "assigned_to", None)
    therapist = getattr(assignment, "assigned_by", None)
    dob = getattr(client, "date_of_birth", None)
    age_display = ""
    if dob:
        try:
            now_date = timezone.localdate()
            age = now_date.year - dob.year - ((now_date.month, now_date.day) < (dob.month, dob.day))
            age_display = str(age)
        except Exception:
            age_display = ""
    time_taken = ""
    if assigned_at and submitted_at:
        delta = submitted_at - assigned_at
        secs = int(delta.total_seconds())
        if secs < 60:
            time_taken = f"{secs}s"
        else:
            time_taken = f"{secs // 60}m {secs % 60}s"

    story = [
        # PAGE 1 - Summary
        _brand_header(styles),
        Spacer(1, 0.2 * cm),
        Table([[""]], colWidths=[16.5 * cm], style=TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.9, colors.HexColor("#E5E7EB"))])),
        Spacer(1, 0.25 * cm),
        _section_title("Client Information", styles),
    ]
    client_rows = [
        ["Name", getattr(client, "name", "") or ""],
        ["Date of Birth", str(dob or "N/A")],
        ["Age", age_display or "N/A"],
        ["Assessor", getattr(therapist, "name", "") or ""],
        ["Date Administered", submitted_at.strftime("%Y-%m-%d %H:%M") if submitted_at else "N/A"],
        ["Time Taken", time_taken or "N/A"],
    ]
    story.append(_table(client_rows, col_widths=[5.2 * cm, 11.3 * cm]))
    story.extend([Spacer(1, 0.3 * cm), _section_title("Results Summary", styles)])
    summary_rows = [
        ["Total Score", "Range", "Severity", "Level"],
        [str(total_score), "0-27", scoring_output.get("severityLabel", ""), str(scoring_output.get("severityNumericLevel", 0))],
    ]
    story.append(_table(summary_rows, col_widths=[3 * cm, 2.2 * cm, 8.3 * cm, 3 * cm]))
    story.extend([Spacer(1, 0.22 * cm), _section_title("Score Visualization", styles), _severity_bar_chart(total_score), Spacer(1, 0.2 * cm)])

    risk_flags = scoring_output.get("riskFlags") or []
    if scoring_output.get("requiresImmediateReview") and risk_flags:
        alert = Table(
            [[f"Immediate Review Required: {risk_flags[0].get('label', 'Risk flag triggered.')}"]],
            colWidths=[16.5 * cm],
        )
        alert.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
                    ("BOX", (0, 0), (-1, -1), 1.0, colors.HexColor("#EF4444")),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#B91C1C")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        story.append(alert)
        story.append(Spacer(1, 0.2 * cm))

    story.append(_section_title("Clinical Interpretation", styles))
    story.append(_p(f"{scoring_output.get('severityLabel', 'Unknown')} range. {interpretation.get('therapistInterpretation', '')}", styles["Normal"]))

    # PAGE 2 - Clinical context
    story.append(PageBreak())
    story.append(_brand_header(styles))
    story.append(Spacer(1, 0.2 * cm))
    story.append(_section_title("Scoring and Interpretation Information", styles))
    story.append(_p("The PHQ-9 total score ranges from 0 to 27, reflecting the severity of depressive symptoms.", styles["Normal"]))
    story.append(_p("Scores of 5, 10, 15, and 20 represent thresholds for mild, moderate, moderately severe, and severe depression respectively. A cutoff score of 10 or higher is commonly used to identify clinically significant depressive symptoms.", styles["Normal"]))
    story.append(_p("Changes of 5 points or more are considered clinically meaningful.", styles["Normal"]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(_section_title("Severity Band Explanations", styles))
    band_rows = [["Range", "Severity", "Interpretation", "Follow-up"]]
    for band in spec.get("severityBands", []):
        sample_interp = _severity_interp(int(band.get("max", 0)))
        band_rows.append([
            f"{band.get('min', 0)}-{band.get('max', 0)}",
            band.get("label", ""),
            sample_interp.get("therapistInterpretation", ""),
            sample_interp.get("followUp", ""),
        ])
    story.append(_table(band_rows, col_widths=[1.5 * cm, 4.5 * cm, 5.1 * cm, 5.4 * cm]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(_section_title("Expanded Context", styles))
    story.append(_p("Cutoff >=10 suggests increased likelihood of clinically significant depressive symptoms. This is a screening and progress-monitoring tool and not a standalone diagnostic instrument.", styles["Normal"]))
    story.append(_p("Reliable change threshold: 5 points.", styles["Normal"]))

    # Progress section only when previous score exists.
    if prev_score is not None:
        story.append(Spacer(1, 0.2 * cm))
        story.append(_section_title("Progress Over Time", styles))
        progress_rows = [
            ["Previous", "Current", "Change", "Clinically Significant"],
            [
                str(prev_score),
                str(total_score),
                str(change_score),
                "Yes" if scoring_output.get("clinicallySignificantChange") else "No",
            ],
        ]
        story.append(_table(progress_rows, col_widths=[3.8 * cm, 3.8 * cm, 3.8 * cm, 5.1 * cm]))

    # PAGE 3 - Response matrix
    story.append(PageBreak())
    story.append(_brand_header(styles))
    story.append(Spacer(1, 0.2 * cm))
    story.append(_section_title("Client Responses", styles))
    item_by_index = {item.get("itemIndex"): item for item in spec.get("items", [])}
    response_rows = [[
        "#",
        "Item",
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
    ]]
    for response in sorted(responses, key=lambda r: r.get("itemIndex", 0)):
        idx = response.get("itemIndex")
        question = item_by_index.get(idx, {}).get("itemText", f"Item {idx}")
        value = response.get("value")
        row = [str((idx or 0) + 1), question, "", "", "", ""]
        if isinstance(value, int) and 0 <= value <= 3:
            row[2 + value] = "✓"
        response_rows.append(row)
    response_tbl = _table(response_rows, col_widths=[0.9 * cm, 8.6 * cm, 1.7 * cm, 1.7 * cm, 2.2 * cm, 1.9 * cm])
    response_style = TableStyle([])
    for r_i, response in enumerate(sorted(responses, key=lambda r: r.get("itemIndex", 0)), start=1):
        idx = response.get("itemIndex")
        value = response.get("value")
        if idx == 8 and isinstance(value, int) and value > 0:
            response_style.add("BACKGROUND", (0, r_i), (-1, r_i), colors.HexColor("#FEF2F2"))
        if isinstance(value, int) and 0 <= value <= 3:
            col = 2 + value
            response_style.add("BACKGROUND", (col, r_i), (col, r_i), colors.HexColor("#D1FAE5"))
            response_style.add("TEXTCOLOR", (col, r_i), (col, r_i), colors.HexColor("#059669"))
            response_style.add("FONTNAME", (col, r_i), (col, r_i), "Helvetica-Bold")
    response_tbl.setStyle(response_style)
    story.append(response_tbl)

    doc.build(story)
    return buf.getvalue()
