from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path

import fitz

from app.utils.storage import new_file_id, output_path


class FormError(Exception):
    pass


@dataclass(frozen=True)
class FormField:
    key: str
    label: str
    type: str = "text"  # text | textarea | date | number
    required: bool = False
    placeholder: str = ""
    width: int = 12  # 1-12 grid units


@dataclass(frozen=True)
class FormTemplate:
    id: str
    title: str
    title_bn: str
    description: str
    icon: str
    fields: tuple[FormField, ...]


FORMS: dict[str, FormTemplate] = {
    "etin-info": FormTemplate(
        id="etin-info",
        title="e-TIN Information Sheet",
        title_bn="ই-টিন তথ্য পত্র",
        description="Print-ready e-TIN information document for filing.",
        icon="receipt",
        fields=(
            FormField("name", "Full name", required=True, width=12),
            FormField("father_name", "Father's name", required=True, width=6),
            FormField("mother_name", "Mother's name", required=True, width=6),
            FormField("dob", "Date of birth", type="date", required=True, width=6),
            FormField("nid", "NID number", required=True, width=6),
            FormField("address", "Present address", type="textarea", required=True, width=12),
            FormField("phone", "Mobile number", required=True, width=6),
            FormField("email", "Email", width=6),
        ),
    ),
    "nid-correction": FormTemplate(
        id="nid-correction",
        title="NID Correction Request",
        title_bn="এনআইডি সংশোধনের আবেদন",
        description="Format for NID correction submission to Election Commission.",
        icon="id-card",
        fields=(
            FormField("name", "Current name on NID", required=True, width=12),
            FormField("nid", "NID number", required=True, width=6),
            FormField("dob", "Date of birth", type="date", required=True, width=6),
            FormField("field_to_correct", "Field to correct (Name / DOB / Address)", required=True, width=12),
            FormField("correct_value", "Correct value", required=True, width=12),
            FormField("reason", "Reason for correction", type="textarea", required=True, width=12),
            FormField("phone", "Contact number", required=True, width=12),
        ),
    ),
    "birth-cert": FormTemplate(
        id="birth-cert",
        title="Birth Certificate Application",
        title_bn="জন্ম নিবন্ধন আবেদন",
        description="Information sheet for birth certificate registration.",
        icon="baby",
        fields=(
            FormField("child_name", "Child's full name", required=True, width=12),
            FormField("dob", "Date of birth", type="date", required=True, width=6),
            FormField("place_of_birth", "Place of birth", required=True, width=6),
            FormField("father_name", "Father's name", required=True, width=6),
            FormField("father_nid", "Father's NID", width=6),
            FormField("mother_name", "Mother's name", required=True, width=6),
            FormField("mother_nid", "Mother's NID", width=6),
            FormField("permanent_address", "Permanent address", type="textarea", required=True, width=12),
        ),
    ),
    "police-clearance": FormTemplate(
        id="police-clearance",
        title="Police Clearance Certificate",
        title_bn="পুলিশ ক্লিয়ারেন্স আবেদন",
        description="Application for Police Clearance Certificate.",
        icon="shield-check",
        fields=(
            FormField("name", "Full name", required=True, width=12),
            FormField("father_name", "Father's name", required=True, width=6),
            FormField("nid", "NID number", required=True, width=6),
            FormField("dob", "Date of birth", type="date", required=True, width=6),
            FormField("passport", "Passport number (if any)", width=6),
            FormField("purpose", "Purpose (Job / Travel / Visa)", required=True, width=12),
            FormField("destination", "Country / destination", width=12),
            FormField("permanent_address", "Permanent address", type="textarea", required=True, width=12),
        ),
    ),
}


def list_forms() -> list[dict]:
    return [
        {
            "id": f.id,
            "title": f.title,
            "title_bn": f.title_bn,
            "description": f.description,
            "icon": f.icon,
            "field_count": len(f.fields),
        }
        for f in FORMS.values()
    ]


def get_form(form_id: str) -> dict:
    f = FORMS.get(form_id)
    if not f:
        raise FormError(f"Unknown form: {form_id}")
    return {
        "id": f.id,
        "title": f.title,
        "title_bn": f.title_bn,
        "description": f.description,
        "icon": f.icon,
        "fields": [
            {
                "key": fld.key,
                "label": fld.label,
                "type": fld.type,
                "required": fld.required,
                "placeholder": fld.placeholder,
                "width": fld.width,
            }
            for fld in f.fields
        ],
    }


def _find_bangla_font() -> str | None:
    """Return a path to an installed font that supports Bangla."""
    import os

    candidates = [
        # macOS
        "/System/Library/Fonts/Bangla MN.ttc",
        "/System/Library/Fonts/Supplemental/Bangla MN.ttc",
        "/System/Library/Fonts/Bangla Sangam MN.ttc",
        # Linux (Noto)
        "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansBengali-Regular.otf",
        "/usr/share/fonts/truetype/lohit-bengali/Lohit-Bengali.ttf",
        # Windows
        "C:\\Windows\\Fonts\\Nirmala.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None


_BANGLA_FONT_PATH = _find_bangla_font()


def _has_bangla(text: str) -> bool:
    return any("ঀ" <= ch <= "৿" for ch in text)


def render_form(form_id: str, values: dict[str, str]) -> tuple[str, Path]:
    form = FORMS.get(form_id)
    if not form:
        raise FormError(f"Unknown form: {form_id}")

    output_id = new_file_id()
    out = output_path(output_id)

    doc = fitz.open()
    page_w, page_h = 595.0, 842.0
    page = doc.new_page(width=page_w, height=page_h)

    bn_font_alias = "bangla"
    has_bn_font = False
    if _BANGLA_FONT_PATH:
        try:
            page.insert_font(fontname=bn_font_alias, fontfile=_BANGLA_FONT_PATH)
            has_bn_font = True
        except Exception:
            has_bn_font = False

    def pick_font(text: str) -> str:
        return bn_font_alias if has_bn_font and _has_bangla(text) else "helv"

    def insert_text(point, text, fontsize, color):
        page.insert_text(point, text, fontsize=fontsize, color=color, fontname=pick_font(text))

    def insert_textbox(rect, text, fontsize, color):
        try:
            page.insert_textbox(
                rect, text, fontsize=fontsize, color=color, align=0, fontname=pick_font(text)
            )
        except Exception:
            page.insert_text((rect.x0, rect.y0 + fontsize + 2), text, fontsize=fontsize, color=color)

    margin = 56.0
    y = margin

    # Title, English always renders; Bangla only if a font is available
    insert_text((margin, y), form.title, 20, (0.07, 0.07, 0.11))
    y += 26
    if has_bn_font:
        insert_text((margin, y), form.title_bn, 12, (0.35, 0.35, 0.45))
        y += 18
    page.draw_line(
        fitz.Point(margin, y),
        fitz.Point(page_w - margin, y),
        color=(0.85, 0.85, 0.9),
        width=0.6,
    )
    y += 22

    label_color = (0.4, 0.4, 0.45)
    value_color = (0.07, 0.07, 0.11)
    line_color = (0.86, 0.86, 0.9)

    for fld in form.fields:
        if y > page_h - margin - 60:
            page = doc.new_page(width=page_w, height=page_h)  # noqa: PLW2901
            if has_bn_font and _BANGLA_FONT_PATH:
                try:
                    page.insert_font(fontname=bn_font_alias, fontfile=_BANGLA_FONT_PATH)
                except Exception:
                    pass
            y = margin

        page.insert_text((margin, y), fld.label.upper(), fontsize=8, color=label_color, fontname="helv")
        y += 12
        value = (values.get(fld.key) or "").strip() or ""
        rect = fitz.Rect(margin, y, page_w - margin, y + (44 if fld.type == "textarea" else 22))
        insert_textbox(rect, value, 11, value_color)
        y += rect.height + 4
        page.draw_line(
            fitz.Point(margin, y),
            fitz.Point(page_w - margin, y),
            color=line_color,
            width=0.5,
        )
        y += 14

    page.insert_text(
        (margin, page_h - 36),
        "Signature: ____________________________     Date: __________________",
        fontsize=10,
        color=(0.3, 0.3, 0.36),
        fontname="helv",
    )

    doc.save(out, deflate=True, garbage=4)
    doc.close()

    return output_id, out
