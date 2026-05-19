"""Convert one or more images (JPG/PNG/WebP) into a single PDF.

Used by /api/tools/jpg-to-pdf. Auto-orients via EXIF and respects the
selected page size (A4 portrait/landscape, US Letter, or fit-to-image).
"""
from __future__ import annotations

import io
from pathlib import Path

import fitz
from PIL import Image, ImageOps

from app.utils.storage import new_file_id, output_path


class ImageToPdfError(Exception):
    pass


# Page sizes in PDF points (1 pt = 1/72 inch).
_PAGE_SIZES = {
    "a4_portrait": (595.0, 842.0),
    "a4_landscape": (842.0, 595.0),
    "letter_portrait": (612.0, 792.0),
    "letter_landscape": (792.0, 612.0),
}

_ALLOWED_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}


def images_to_pdf(
    images: list[bytes],
    page_size: str = "a4_portrait",
    margin_mm: float = 10.0,
) -> tuple[str, Path, dict]:
    if not images:
        raise ImageToPdfError("No images provided")
    if len(images) > 50:
        raise ImageToPdfError("Maximum 50 images per conversion")
    if page_size not in _PAGE_SIZES and page_size != "fit_image":
        raise ImageToPdfError("Unknown page size")

    margin_pt = max(0.0, margin_mm) * 2.83465  # mm → pt

    output_id = new_file_id()
    out = output_path(output_id)
    doc = fitz.open()

    try:
        for raw in images:
            try:
                pil = Image.open(io.BytesIO(raw))
            except Exception as exc:  # noqa: BLE001
                raise ImageToPdfError(f"Unsupported image format: {exc}") from exc
            fmt = (pil.format or "").upper()
            if fmt not in _ALLOWED_FORMATS:
                raise ImageToPdfError(f"Unsupported image format: {fmt}")

            pil = ImageOps.exif_transpose(pil)
            if pil.mode not in ("RGB", "L"):
                pil = pil.convert("RGB")

            buf = io.BytesIO()
            pil.save(buf, format="JPEG", quality=92, optimize=True)
            jpeg = buf.getvalue()

            if page_size == "fit_image":
                # Page exactly the image size at 72dpi.
                width_pt = pil.width * 72 / max(pil.info.get("dpi", (72, 72))[0], 72)
                height_pt = pil.height * 72 / max(pil.info.get("dpi", (72, 72))[1], 72)
            else:
                width_pt, height_pt = _PAGE_SIZES[page_size]

            page = doc.new_page(width=width_pt, height=height_pt)
            # Center the image inside the printable area.
            avail_w = width_pt - 2 * margin_pt
            avail_h = height_pt - 2 * margin_pt
            ratio = min(avail_w / pil.width, avail_h / pil.height)
            draw_w = pil.width * ratio
            draw_h = pil.height * ratio
            x0 = (width_pt - draw_w) / 2
            y0 = (height_pt - draw_h) / 2
            rect = fitz.Rect(x0, y0, x0 + draw_w, y0 + draw_h)
            page.insert_image(rect, stream=jpeg)

        doc.save(out, deflate=True, garbage=4)
    finally:
        doc.close()

    return output_id, out, {"pages": len(images), "page_size": page_size}
