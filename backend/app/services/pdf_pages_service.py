from __future__ import annotations

import io
import re
import zipfile
from pathlib import Path

import fitz  # PyMuPDF

from app.core.config import settings
from app.utils.storage import new_file_id


class PDFPagesError(Exception):
    """Raised for split / rotate / delete-pages failures."""


VALID_ANGLES = (90, 180, 270)
SPLIT_MODES = ("extract", "each")


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
                raise PDFPagesError(f"Invalid range: {part}")
            out.extend(range(a - 1, min(b, total)))
        elif part.isdigit():
            i = int(part) - 1
            if 0 <= i < total:
                out.append(i)
        else:
            raise PDFPagesError(f"Invalid token: {part}")
    if not out:
        raise PDFPagesError("No valid pages selected")
    seen: set[int] = set()
    ordered: list[int] = []
    for i in out:
        if i not in seen:
            seen.add(i)
            ordered.append(i)
    return ordered


def split_pdf(file_path: Path, pages_spec: str = "all", mode: str = "extract") -> tuple[str, Path, int]:
    """Split a PDF.

    mode="extract": selected pages become ONE new PDF (page order follows the spec).
    mode="each": every selected page becomes its own single-page PDF, bundled as a ZIP.
    """
    if mode not in SPLIT_MODES:
        raise PDFPagesError("mode must be 'extract' or 'each'")

    output_id = new_file_id()
    try:
        with fitz.open(file_path) as doc:
            indexes = _parse_range(pages_spec, doc.page_count)

            if mode == "extract":
                out = settings.OUTPUT_DIR / f"{output_id}.pdf"
                new = fitz.open()
                try:
                    for i in indexes:
                        new.insert_pdf(doc, from_page=i, to_page=i)
                    new.save(out, garbage=3, deflate=True)
                finally:
                    new.close()
                return output_id, out, len(indexes)

            out = settings.OUTPUT_DIR / f"{output_id}.zip"
            with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for i in indexes:
                    single = fitz.open()
                    try:
                        single.insert_pdf(doc, from_page=i, to_page=i)
                        zf.writestr(f"page-{i + 1:03d}.pdf", single.tobytes(garbage=3, deflate=True))
                    finally:
                        single.close()
            return output_id, out, len(indexes)
    except PDFPagesError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise PDFPagesError(f"Split failed: {exc}") from exc


def rotate_pdf(file_path: Path, angle: int, pages_spec: str = "all") -> tuple[str, Path, int]:
    """Rotate selected pages by 90 / 180 / 270 degrees (added to existing rotation)."""
    if angle not in VALID_ANGLES:
        raise PDFPagesError("angle must be 90, 180 or 270")

    output_id = new_file_id()
    try:
        with fitz.open(file_path) as doc:
            indexes = _parse_range(pages_spec, doc.page_count)
            for i in indexes:
                page = doc.load_page(i)
                page.set_rotation((page.rotation + angle) % 360)
            out = settings.OUTPUT_DIR / f"{output_id}.pdf"
            doc.save(out, garbage=3, deflate=True)
        return output_id, out, len(indexes)
    except PDFPagesError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise PDFPagesError(f"Rotate failed: {exc}") from exc


def delete_pages(file_path: Path, pages_spec: str) -> tuple[str, Path, int, int]:
    """Remove the selected pages. At least one page must remain."""
    if not pages_spec or pages_spec.strip().lower() == "all":
        raise PDFPagesError("Cannot delete all pages - specify pages like '2' or '2,4-6'")

    output_id = new_file_id()
    try:
        with fitz.open(file_path) as doc:
            total = doc.page_count
            indexes = _parse_range(pages_spec, total)
            if len(indexes) >= total:
                raise PDFPagesError("Cannot delete all pages - at least one page must remain")
            doc.delete_pages(indexes)
            out = settings.OUTPUT_DIR / f"{output_id}.pdf"
            doc.save(out, garbage=3, deflate=True)
            remaining = doc.page_count
        return output_id, out, len(indexes), remaining
    except PDFPagesError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise PDFPagesError(f"Delete pages failed: {exc}") from exc
