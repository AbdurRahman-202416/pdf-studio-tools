from __future__ import annotations

import io
import re
import zipfile
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

from app.core.config import settings
from app.utils.storage import new_file_id


class PDFImageError(Exception):
    """Raised for PDF-to-image conversion failures."""


def _parse_range(spec: str, total: int) -> list[int]:
    """Parse a user-facing 1-based page selector ('all', '1,3-5') to 0-based indexes."""
    if not spec or spec.strip().lower() == "all":
        return list(range(total))
    out: list[int] = []
    for raw in spec.split(","):
        part = raw.strip()
        if not part:
            continue
        m = re.fullmatch(r"(\d+)\s*-\s*(\d+)", part)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            if a < 1 or b < a:
                raise PDFImageError(f"Invalid range: {part}")
            out.extend(range(a - 1, min(b, total)))
        elif part.isdigit():
            i = int(part) - 1
            if 0 <= i < total:
                out.append(i)
        else:
            raise PDFImageError(f"Invalid token: {part}")
    if not out:
        raise PDFImageError("No valid pages selected")
    seen: set[int] = set()
    ordered: list[int] = []
    for i in out:
        if i not in seen:
            seen.add(i)
            ordered.append(i)
    return ordered


def pdf_to_images(
    file_path: Path,
    dpi: int = 200,
    pages_spec: str = "all",
    fmt: str = "jpg",
) -> tuple[str, Path, int]:
    if fmt not in ("jpg", "png"):
        raise PDFImageError("fmt must be jpg or png")
    if dpi < 72 or dpi > 600:
        raise PDFImageError("dpi must be between 72 and 600")

    output_id = new_file_id()
    try:
        with fitz.open(file_path) as doc:
            indexes = _parse_range(pages_spec, doc.page_count)
            zoom = dpi / 72
            mat = fitz.Matrix(zoom, zoom)

            if len(indexes) == 1:
                i = indexes[0]
                pix = doc.load_page(i).get_pixmap(matrix=mat, alpha=False)
                img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                out = settings.OUTPUT_DIR / f"{output_id}.{fmt}"
                if fmt == "jpg":
                    img.save(out, format="JPEG", quality=92, optimize=True)
                else:
                    img.save(out, format="PNG", optimize=True)
                return output_id, out, 1

            out = settings.OUTPUT_DIR / f"{output_id}.zip"
            with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for n, i in enumerate(indexes, start=1):
                    pix = doc.load_page(i).get_pixmap(matrix=mat, alpha=False)
                    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                    buf = io.BytesIO()
                    if fmt == "jpg":
                        img.save(buf, format="JPEG", quality=92, optimize=True)
                    else:
                        img.save(buf, format="PNG", optimize=True)
                    zf.writestr(f"page-{n:03d}.{fmt}", buf.getvalue())
            return output_id, out, len(indexes)
    except PDFImageError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise PDFImageError(f"PDF→image failed: {exc}") from exc
