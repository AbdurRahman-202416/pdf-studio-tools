from __future__ import annotations

import io
from pathlib import Path
from typing import Literal

import fitz
from PIL import Image

from app.utils.guards import safe_zoom
from app.utils.storage import new_file_id, output_path

LayoutMode = Literal["a4_portrait", "a4_horizontal", "compact"]

VALID_LAYOUTS = ("a4_portrait", "a4_horizontal", "compact")

A4_W, A4_H = 595.0, 842.0  # PDF points

# Standard ID card dimensions: 85.6 x 53.98 mm → at 72 DPI: 242.5 x 153 pts
CARD_W, CARD_H = 242.5, 153.0


class IDCardError(Exception):
    pass


def _load_image_from_bytes(data: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(data))
    img.load()
    if img.mode not in ("RGB", "RGBA", "L"):
        img = img.convert("RGB")
    return img


def _load_first_page_as_image(pdf_bytes: bytes, dpi: int = 220) -> Image.Image:
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        if doc.page_count == 0:
            raise IDCardError("PDF has no pages")
        page = doc.load_page(0)
        zoom = safe_zoom(page.rect.width, page.rect.height, dpi)
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def _to_image(file_bytes: bytes, content_type: str | None) -> Image.Image:
    ct = (content_type or "").lower()
    if "pdf" in ct or file_bytes[:4] == b"%PDF":
        return _load_first_page_as_image(file_bytes)
    return _load_image_from_bytes(file_bytes).convert("RGB")


def combine_id_card(
    front_bytes: bytes,
    back_bytes: bytes,
    front_ct: str | None,
    back_ct: str | None,
    layout: LayoutMode = "a4_portrait",
    add_labels: bool = True,
) -> tuple[str, Path]:
    """Combine ID card front + back into a clean layout PDF."""
    front_img = _to_image(front_bytes, front_ct)
    back_img = _to_image(back_bytes, back_ct)

    output_id = new_file_id()
    out = output_path(output_id)

    page_w, page_h = (A4_W, A4_H) if layout != "a4_horizontal" else (A4_H, A4_W)

    doc = fitz.open()
    page = doc.new_page(width=page_w, height=page_h)

    # Calculate card placement
    gap = 24.0
    total_h = CARD_H * 2 + gap
    top = (page_h - total_h) / 2

    front_rect = fitz.Rect(
        (page_w - CARD_W) / 2,
        top,
        (page_w + CARD_W) / 2,
        top + CARD_H,
    )
    back_rect = fitz.Rect(
        (page_w - CARD_W) / 2,
        top + CARD_H + gap,
        (page_w + CARD_W) / 2,
        top + CARD_H * 2 + gap,
    )

    def img_to_bytes(img: Image.Image) -> bytes:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=92, optimize=True)
        return buf.getvalue()

    page.insert_image(front_rect, stream=img_to_bytes(front_img))
    page.insert_image(back_rect, stream=img_to_bytes(back_img))

    if add_labels:
        try:
            page.insert_text(
                (front_rect.x0, front_rect.y0 - 6),
                "Front",
                fontsize=9,
                color=(0.4, 0.4, 0.45),
            )
            page.insert_text(
                (back_rect.x0, back_rect.y0 - 6),
                "Back",
                fontsize=9,
                color=(0.4, 0.4, 0.45),
            )
            # Thin border around cards
            for rect in (front_rect, back_rect):
                page.draw_rect(rect, color=(0.78, 0.78, 0.82), width=0.6)
        except Exception:
            pass

    doc.save(out, deflate=True, garbage=4)
    doc.close()
    return output_id, out
