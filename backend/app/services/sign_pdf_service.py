"""Stamp a signature image onto a specific page of a PDF.

Used by /api/tools/sign-pdf. The frontend collects a hand-drawn PNG of
the user's signature plus a target page index and bounding rectangle (in
PDF coordinates, top-left origin, in points). We open the PDF with
PyMuPDF, paste the image into that rect, and save a flattened copy.
"""
from __future__ import annotations

import io
import math
from pathlib import Path

import fitz
from PIL import Image

from app.utils.storage import new_file_id, output_path


class SignPdfError(Exception):
    pass


def sign_pdf(
    file_path: Path,
    signature_png: bytes,
    page_index: int,
    x_pt: float,
    y_pt: float,
    width_pt: float,
    height_pt: float,
) -> tuple[str, Path]:
    if not signature_png:
        raise SignPdfError("Empty signature image")
    if width_pt <= 0 or height_pt <= 0:
        raise SignPdfError("Invalid signature size")

    # Validate image
    try:
        with Image.open(io.BytesIO(signature_png)) as im:
            if im.format != "PNG":
                raise SignPdfError("Signature must be PNG")
    except SignPdfError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise SignPdfError(f"Could not read signature image: {exc}") from exc

    output_id = new_file_id()
    out = output_path(output_id)

    try:
        with fitz.open(file_path) as doc:
            if page_index < 0 or page_index >= doc.page_count:
                raise SignPdfError("page_index out of range")
            page = doc.load_page(page_index)
            ph = page.rect.height
            # NaN coordinates build Rect(nan,...) whose is_empty is False, so
            # they sail past the outside-the-page guard below.
            if not all(math.isfinite(v) for v in (x_pt, y_pt, width_pt, height_pt)):
                raise SignPdfError("Signature position must be finite numbers")
            # Frontend sends (x, y) with top-left origin; PyMuPDF uses
            # top-left too for Rect, so we can place directly.
            rect = fitz.Rect(x_pt, y_pt, x_pt + width_pt, y_pt + height_pt)
            # Clamp inside page
            rect = rect & page.rect
            if rect.is_empty:
                raise SignPdfError("Signature is outside the page")
            page.insert_image(rect, stream=signature_png, keep_proportion=True)
            doc.save(out, deflate=True, garbage=4)
    except SignPdfError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise SignPdfError(f"Failed to sign PDF: {exc}") from exc

    return output_id, out
