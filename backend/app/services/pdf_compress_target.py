"""Iterative target-size PDF compressor.

Used by /api/tools/compress/target-size — repeatedly rasterizes pages at
progressively lower DPI / JPEG quality until the output fits within the
chosen size cap (e.g. 100 KB for govt-portal uploads).

Built on the same rasterize pipeline as `pdf_service.compress_pdf`, but
loops through a tuned ladder of (dpi, jpeg_quality) presets instead of
exposing only Light/Balanced/Maximum.
"""
from __future__ import annotations

import io
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

from app.utils.storage import new_file_id, output_path


class CompressTargetError(Exception):
    """Raised when target compression fails or input is invalid."""


# (dpi, jpeg_quality). Ladder ordered from highest fidelity to lowest.
# Empirically tuned so most A4 documents converge by step 5–6.
_LADDER: list[tuple[int, int]] = [
    (200, 80),
    (170, 70),
    (140, 60),
    (120, 50),
    (100, 45),
    (90, 38),
    (80, 32),
    (72, 28),
    (60, 22),
    (48, 18),
]


def _rasterize(file_path: Path, dpi: int, quality: int, out: Path) -> int:
    with fitz.open(file_path) as src, fitz.open() as dst:
        for page in src:
            zoom = dpi / 72
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=quality, optimize=True)
            buf.seek(0)
            rect = fitz.Rect(0, 0, page.rect.width, page.rect.height)
            new_page = dst.new_page(width=rect.width, height=rect.height)
            new_page.insert_image(rect, stream=buf.getvalue())
        dst.save(out, deflate=True, garbage=4)
    return out.stat().st_size


def compress_to_target(
    file_path: Path,
    target_bytes: int,
) -> tuple[str, Path, dict]:
    """Compress until size ≤ target_bytes. Returns (id, path, stats).

    Stats include: target_bytes, final_bytes, dpi, jpeg_quality, iterations,
    reached_target (bool). If the ladder bottoms out before reaching target,
    we still return the smallest result and flag reached_target=False.
    """
    if target_bytes < 50 * 1024:
        raise CompressTargetError("Target must be at least 50 KB")
    if target_bytes > 20 * 1024 * 1024:
        raise CompressTargetError("Target must be at most 20 MB")

    output_id = new_file_id()
    out = output_path(output_id)

    best_size = None
    best_step = None
    for i, (dpi, quality) in enumerate(_LADDER, start=1):
        try:
            size = _rasterize(file_path, dpi, quality, out)
        except Exception as exc:  # noqa: BLE001
            raise CompressTargetError(f"Compression failed: {exc}") from exc
        best_size = size
        best_step = (dpi, quality, i)
        if size <= target_bytes:
            return output_id, out, {
                "target_bytes": target_bytes,
                "final_bytes": size,
                "dpi": dpi,
                "jpeg_quality": quality,
                "iterations": i,
                "reached_target": True,
            }

    dpi, quality, iters = best_step  # type: ignore[misc]
    return output_id, out, {
        "target_bytes": target_bytes,
        "final_bytes": best_size or 0,
        "dpi": dpi,
        "jpeg_quality": quality,
        "iterations": iters,
        "reached_target": False,
    }
