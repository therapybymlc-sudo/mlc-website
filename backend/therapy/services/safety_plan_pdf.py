from datetime import date
from io import BytesIO
import re

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


SAFETY_PLAN_FIELDS = [
    (
        "warning_signs",
        "1. Warning Signs",
        "Thoughts, images, mood, or behaviors that indicate this plan should be used.",
    ),
    (
        "coping_strategies",
        "2. Internal Coping Strategies",
        "Things I can do on my own before contacting anyone else.",
    ),
    (
        "social_distractions",
        "3. Social Distractions",
        "People, places, or activities that help distract me from distress.",
    ),
    (
        "social_supports",
        "4. Social Supports",
        "People I can contact directly for help and support.",
    ),
    (
        "professional_supports",
        "5. Professionals and Agencies",
        "Professional services, crisis lines, or emergency supports I can contact.",
    ),
    (
        "environment_safety",
        "6. Making the Environment Safe",
        "Steps to reduce access to means of harm and increase immediate safety.",
    ),
    (
        "reason_for_living",
        "7. One Thing Important to Me",
        "A reason to keep going and reconnect with hope.",
    ),
]


def _calculate_age(dob):
    if not dob:
        return "—"
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _split_emergency_contact(raw_value):
    raw = (raw_value or "").strip()
    if not raw:
        return "—", "—"
    parts = [part.strip() for part in re.split(r"[|,;/]", raw) if part.strip()]
    if len(parts) >= 2:
        return parts[0], " ".join(parts[1:])
    if any(ch.isdigit() for ch in raw):
        return "—", raw
    return raw, "—"


def build_safety_plan_pdf_bytes(*, client, plan, saved_at=None):
    saved_at = saved_at or timezone.now()
    emergency_name, emergency_number = _split_emergency_contact(getattr(client, "emergency_contact", ""))

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "SafetyTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1F4D57"),
        spaceAfter=8,
    )
    section_title_style = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading3"],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#1F4D57"),
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1F2937"),
    )
    muted_style = ParagraphStyle(
        "Muted",
        parent=body_style,
        textColor=colors.HexColor("#6B7280"),
        fontSize=9,
    )
    table_label_style = ParagraphStyle(
        "TableLabel",
        parent=body_style,
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        wordWrap="CJK",
    )
    table_value_style = ParagraphStyle(
        "TableValue",
        parent=body_style,
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        wordWrap="CJK",
    )

    story = []
    story.append(Paragraph("Personal Safety Plan", title_style))
    story.append(
        Paragraph(
            "This document summarizes the client’s personalized safety plan and support steps.",
            muted_style,
        )
    )
    story.append(Spacer(1, 10))

    profile_rows = [
        [
            Paragraph("Client Name", table_label_style),
            Paragraph(str(getattr(client, "name", "") or "—"), table_value_style),
            Paragraph("Date Saved", table_label_style),
            Paragraph(saved_at.strftime("%d %b %Y, %I:%M %p"), table_value_style),
        ],
        [
            Paragraph("Age", table_label_style),
            Paragraph(str(_calculate_age(getattr(client, "date_of_birth", None))), table_value_style),
            Paragraph("Sex", table_label_style),
            Paragraph(str(getattr(client, "sex", "") or "—"), table_value_style),
        ],
        [
            Paragraph("Contact Number", table_label_style),
            Paragraph(str(getattr(client, "phone_number", "") or "—"), table_value_style),
            Paragraph("Email", table_label_style),
            Paragraph(str(getattr(client, "email", "") or "—"), table_value_style),
        ],
        [
            Paragraph("Emergency Contact Name", table_label_style),
            Paragraph(str(emergency_name), table_value_style),
            Paragraph("Emergency Contact Number", table_label_style),
            Paragraph(str(emergency_number), table_value_style),
        ],
    ]
    profile_table = Table(profile_rows, colWidths=[1.45 * inch, 1.95 * inch, 1.6 * inch, 2.3 * inch])
    profile_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7FAFC")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#D1D5DB")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E5E7EB")),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(profile_table)
    story.append(Spacer(1, 12))

    for key, question, description in SAFETY_PLAN_FIELDS:
        answer = (getattr(plan, key, "") or "").strip() or "—"
        story.append(Paragraph(question, section_title_style))
        story.append(Paragraph(description, muted_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(answer.replace("\n", "<br/>"), body_style))
        story.append(Spacer(1, 10))

    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            "Gentle reminder: safety plans work best when reviewed early, before a crisis escalates. "
            "Use this plan as soon as warning signs appear, and reach out for support immediately if safety is at risk.",
            body_style,
        )
    )

    doc.build(story)
    return buffer.getvalue()
