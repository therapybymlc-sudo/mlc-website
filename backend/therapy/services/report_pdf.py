"""
Render admin report payloads to PDF (ReportLab).
Keeps output compact: title, period, KPI-style dicts, and limited tabular rows.
"""
from __future__ import annotations

from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

MAX_SCALAR_ROWS = 45
MAX_LIST_ROWS = 28


def _p(text, style):
    return Paragraph(escape(str(text)), style)


def _table(data, col_widths=None):
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#5FA093")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7faf9")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return t


def _scalar_table_from_dict(d: dict, max_rows: int = MAX_SCALAR_ROWS):
    rows = [["Field", "Value"]]
    for k in sorted(d.keys()):
        v = d[k]
        if isinstance(v, (dict, list)):
            continue
        rows.append([str(k).replace("_", " "), str(v)])
        if len(rows) > max_rows:
            break
    return rows if len(rows) > 1 else None


def _rows_to_table(rows: list[dict], max_rows: int = MAX_LIST_ROWS):
    if not rows:
        return None
    keys = list(rows[0].keys())
    data = [[str(k).replace("_", " ") for k in keys]]
    for r in rows[:max_rows]:
        data.append([str(r.get(k, ""))[:120] for k in keys])
    return data


def build_report_pdf_bytes(payload: dict) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="MLC report",
    )
    styles = getSampleStyleSheet()
    story = [
        _p("MLC Therapy — Business report export", styles["Title"]),
        Spacer(1, 0.4 * cm),
    ]

    title = payload.get("title") or payload.get("report_key") or "Report"
    story.append(_p(title, styles["Heading2"]))
    period = payload.get("period") or {}
    story.append(
        _p(
            f"Window: {period.get('label', '')} — {period.get('start', '')} to {period.get('end', '')}",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 0.35 * cm))

    if "kpis" in payload and isinstance(payload["kpis"], dict):
        tbl = _scalar_table_from_dict(payload["kpis"])
        if tbl:
            story.append(_p("Key metrics", styles["Heading3"]))
            story.append(_table(tbl, col_widths=[6.5 * cm, 10 * cm]))
            story.append(Spacer(1, 0.3 * cm))

    if "kpis_prior_period" in payload and isinstance(payload["kpis_prior_period"], dict):
        tbl = _scalar_table_from_dict(payload["kpis_prior_period"], max_rows=20)
        if tbl:
            story.append(_p("Prior period (comparison)", styles["Heading3"]))
            story.append(_table(tbl, col_widths=[6.5 * cm, 10 * cm]))
            story.append(Spacer(1, 0.3 * cm))

    if "kpis_delta" in payload and isinstance(payload["kpis_delta"], dict):
        tbl = _scalar_table_from_dict(payload["kpis_delta"], max_rows=20)
        if tbl:
            story.append(_p("Change (current − prior)", styles["Heading3"]))
            story.append(_table(tbl, col_widths=[6.5 * cm, 10 * cm]))
            story.append(Spacer(1, 0.3 * cm))

    sections = payload.get("sections")
    if isinstance(sections, dict):
        for _sid, block in sections.items():
            if not isinstance(block, dict):
                continue
            st = block.get("title") or _sid.replace("_", " ").title()
            story.append(_p(st, styles["Heading3"]))
            if block.get("description"):
                story.append(_p(block["description"], styles["Italic"]))
            tbl = _scalar_table_from_dict(block)
            if tbl:
                story.append(_table(tbl, col_widths=[6.5 * cm, 10 * cm]))
            if isinstance(block.get("counts"), dict) and block["counts"]:
                inner = [["Key", "Value"]] + [
                    [str(a), str(b)] for a, b in list(block["counts"].items())[:MAX_SCALAR_ROWS]
                ]
                story.append(_table(inner, col_widths=[6.5 * cm, 10 * cm]))
            for key in ("rows", "by_therapist", "by_status", "by_category", "status_counts"):
                if key in block and isinstance(block[key], list) and block[key]:
                    rt = _rows_to_table(block[key])
                    if rt:
                        w = 16.5 * cm / max(len(rt[0]), 1)
                        story.append(_table(rt, col_widths=[w] * len(rt[0])))
                elif key in block and isinstance(block[key], dict):
                    inner = [["Key", "Value"]] + [
                        [str(a), str(b)] for a, b in list(block[key].items())[:MAX_SCALAR_ROWS]
                    ]
                    if len(inner) > 1:
                        story.append(_table(inner, col_widths=[6.5 * cm, 10 * cm]))
            story.append(Spacer(1, 0.25 * cm))

    # Legacy overview: therapist_performance / series (minimal)
    tp = payload.get("therapist_performance")
    if isinstance(tp, dict):
        for label, key in (
            ("Therapist revenue", "revenue_by_therapist"),
            ("Sessions per therapist", "sessions_per_therapist"),
            ("Client funnel", "client_funnel"),
        ):
            rows = tp.get(key)
            if isinstance(rows, list) and rows:
                story.append(_p(label, styles["Heading3"]))
                rt = _rows_to_table(rows)
                if rt:
                    w = 16.5 * cm / max(len(rt[0]), 1)
                    story.append(_table(rt, col_widths=[w] * len(rt[0])))
                story.append(Spacer(1, 0.2 * cm))

    doc.build(story)
    return buf.getvalue()
