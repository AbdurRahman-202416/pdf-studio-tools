from __future__ import annotations

import io
from pathlib import Path
from typing import Literal

import fitz
from PIL import Image, ImageOps

from app.utils.storage import new_file_id, output_path

PhotoSize = Literal["passport", "stamp", "visa_us", "custom"]
Layout = Literal["single", "grid_4", "grid_8"]

# Standard sizes in mm; PIL works in pixels at 300 DPI for print
SIZES_MM: dict[str, tuple[float, float]] = {
    "passport": (45.0, 35.0),       # Bangladesh passport: 45 x 35 mm
    "stamp": (25.4, 25.4),          # 1 x 1 inch stamp size
    "visa_us": (50.8, 50.8),        # US visa: 2 x 2 inch
}

DPI = 300
A4_MM = (210.0, 297.0)


class PhotoError(Exception):
    pass


def _mm_to_px(mm: float) -> int:
    return int(round(mm / 25.4 * DPI))


def _fit_image(img: Image.Image, size_px: tuple[int, int], background: str = "white") -> Image.Image:
    """Fit and crop image to target size, keeping subject centered."""
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, background)
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    return ImageOps.fit(img, size_px, method=Image.LANCZOS, centering=(0.5, 0.45))


def make_passport_pdf(
    image_bytes: bytes,
    size: PhotoSize = "passport",
    layout: Layout = "grid_8",
    custom_mm: tuple[float, float] | None = None,
    background: str = "white",
) -> tuple[str, Path, dict]:
    try:
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as exc:  # noqa: BLE001
        raise PhotoError(f"Cannot read image: {exc}") from exc

    if size == "custom":
        if not custom_mm:
            raise PhotoError("Custom size requires width and height in mm")
        w_mm, h_mm = custom_mm
    else:
        w_mm, h_mm = SIZES_MM[size]

    target_px = (_mm_to_px(w_mm), _mm_to_px(h_mm))
    fitted = _fit_image(img, target_px, background=background)

    # A4 canvas
    a4_px = (_mm_to_px(A4_MM[0]), _mm_to_px(A4_MM[1]))
    canvas = Image.new("RGB", a4_px, "white")

    cols, rows = {"single": (1, 1), "grid_4": (2, 2), "grid_8": (2, 4)}[layout]

    margin_mm = 10.0
    gap_mm = 4.0
    margin_px = _mm_to_px(margin_mm)
    gap_px = _mm_to_px(gap_mm)

    grid_w = cols * target_px[0] + (cols - 1) * gap_px
    grid_h = rows * target_px[1] + (rows - 1) * gap_px

    if grid_w > a4_px[0] - 2 * margin_px or grid_h > a4_px[1] - 2 * margin_px:
        # scale down gap if it doesn't fit
        gap_px = max(0, _mm_to_px(1.0))
        grid_w = cols * target_px[0] + (cols - 1) * gap_px
        grid_h = rows * target_px[1] + (rows - 1) * gap_px

    start_x = max(margin_px, (a4_px[0] - grid_w) // 2)
    start_y = max(margin_px, (a4_px[1] - grid_h) // 2)

    placed = 0
    for r in range(rows):
        for c in range(cols):
            x = start_x + c * (target_px[0] + gap_px)
            y = start_y + r * (target_px[1] + gap_px)
            canvas.paste(fitted, (x, y))
            placed += 1

    # Save canvas to JPEG, embed in PDF
    canvas_bytes = io.BytesIO()
    canvas.save(canvas_bytes, format="JPEG", quality=94, optimize=True)
    canvas_bytes.seek(0)

    output_id = new_file_id()
    out = output_path(output_id)

    doc = fitz.open()
    a4_pts = (595.0, 842.0)
    page = doc.new_page(width=a4_pts[0], height=a4_pts[1])
    page.insert_image(fitz.Rect(0, 0, a4_pts[0], a4_pts[1]), stream=canvas_bytes.getvalue())
    doc.save(out, deflate=True, garbage=4)
    doc.close()

    info = {
        "width_mm": w_mm,
        "height_mm": h_mm,
        "copies": placed,
        "layout": layout,
        "size": size,
    }
    return output_id, out, info
