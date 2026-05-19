"""Convert a Microsoft Word .docx into a PDF.

Used by /api/tools/word-to-pdf. To avoid a heavy LibreOffice dependency
we extract paragraphs and tables from the .docx and render them into a
PDF via reportlab. Headings, lists, bold/italic, tables and inline
images are supported; complex layout (textboxes, columns, equations)
will fall back to plain text.
"""
from __future__ import annotations

import io
from pathlib import Path

from docx import Document
from docx.document import Document as DocxDocument
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image as RLImage,
    PageBreak,
    Paragraph as RLParagraph,
    SimpleDocTemplate,
    Spacer,
    Table as RLTable,
    TableStyle,
)
from reportlab.lib import colors

from app.utils.storage import new_file_id


class WordToPdfError(Exception):
    pass


_STYLE_MAP = {
    "Heading 1": ("h1", 22),
    "Heading 2": ("h2", 18),
    "Heading 3": ("h3", 14),
    "Heading 4": ("h4", 12),
    "Title": ("title", 28),
}


def _iter_block_items(parent):
    """Iterate paragraphs and tables in document order."""
    if isinstance(parent, DocxDocument):
        parent_elm = parent.element.body
    else:
        parent_elm = parent._element  # noqa: SLF001
    for child in parent_elm.iterchildren():
        if child.tag == qn("w:p"):
            yield Paragraph(child, parent)
        elif child.tag == qn("w:tbl"):
            yield Table(child, parent)


def _escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _paragraph_to_html(p: Paragraph) -> str:
    parts: list[str] = []
    for run in p.runs:
        chunk = _escape(run.text or "")
        if not chunk:
            continue
        if run.bold:
            chunk = f"<b>{chunk}</b>"
        if run.italic:
            chunk = f"<i>{chunk}</i>"
        if run.underline:
            chunk = f"<u>{chunk}</u>"
        parts.append(chunk)
    return "".join(parts)


def _extract_inline_images(p: Paragraph) -> list[bytes]:
    images: list[bytes] = []
    for run in p.runs:
        for drawing in run._element.findall(".//" + qn("w:drawing")):  # noqa: SLF001
            blip = drawing.find(".//" + qn("a:blip"))  # type: ignore[arg-type]
            if blip is None:
                continue
            rId = blip.get(qn("r:embed"))
            if not rId:
                continue
            try:
                part = p.part.related_parts[rId]
                images.append(part.blob)
            except Exception:
                continue
    return images


def docx_to_pdf(docx_path: Path) -> tuple[str, Path, dict]:
    output_id = new_file_id()
    out = docx_path.parent.parent / "output" / f"{output_id}.pdf"
    out.parent.mkdir(parents=True, exist_ok=True)

    try:
        doc = Document(str(docx_path))
    except Exception as exc:  # noqa: BLE001
        raise WordToPdfError(f"Invalid .docx file: {exc}") from exc

    styles = getSampleStyleSheet()
    body = ParagraphStyle("body", parent=styles["BodyText"], fontSize=11, leading=15)
    heading_styles = {
        "h1": ParagraphStyle("h1", parent=styles["Heading1"], fontSize=22, leading=26, spaceBefore=10, spaceAfter=6),
        "h2": ParagraphStyle("h2", parent=styles["Heading2"], fontSize=18, leading=22, spaceBefore=8, spaceAfter=4),
        "h3": ParagraphStyle("h3", parent=styles["Heading3"], fontSize=14, leading=18, spaceBefore=6, spaceAfter=3),
        "h4": ParagraphStyle("h4", parent=styles["Heading4"], fontSize=12, leading=16, spaceBefore=4, spaceAfter=2),
        "title": ParagraphStyle("title", parent=styles["Title"], fontSize=28, leading=34, spaceAfter=10),
    }

    flow: list = []
    blocks_total = 0
    images_total = 0

    for block in _iter_block_items(doc):
        if isinstance(block, Paragraph):
            html = _paragraph_to_html(block)
            style_key, _ = _STYLE_MAP.get(block.style.name, ("body", 11))
            if style_key in heading_styles:
                flow.append(RLParagraph(html or "&nbsp;", heading_styles[style_key]))
            elif html.strip():
                flow.append(RLParagraph(html, body))
            else:
                flow.append(Spacer(1, 6))
            for img_bytes in _extract_inline_images(block):
                try:
                    im = Image.open(io.BytesIO(img_bytes))
                    buf = io.BytesIO()
                    if im.mode not in ("RGB", "L"):
                        im = im.convert("RGB")
                    im.save(buf, format="PNG", optimize=True)
                    buf.seek(0)
                    width_pt = min(480.0, im.width * 0.75)
                    ratio = width_pt / im.width
                    flow.append(RLImage(buf, width=width_pt, height=im.height * ratio))
                    flow.append(Spacer(1, 6))
                    images_total += 1
                except Exception:
                    continue
            blocks_total += 1
        elif isinstance(block, Table):
            data = []
            for row in block.rows:
                data.append([cell.text for cell in row.cells])
            if not data:
                continue
            tbl = RLTable(data, hAlign="LEFT")
            tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f3f4f6")),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d1d5db")),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            flow.append(tbl)
            flow.append(Spacer(1, 8))
            blocks_total += 1

    if not flow:
        flow.append(RLParagraph("(empty document)", body))

    rlpdf = SimpleDocTemplate(
        str(out),
        pagesize=A4,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
    )
    try:
        rlpdf.build(flow)
    except Exception as exc:  # noqa: BLE001
        raise WordToPdfError(f"Render failed: {exc}") from exc

    return output_id, out, {"blocks": blocks_total, "images": images_total}
