from __future__ import annotations

import io
from pathlib import Path
from typing import Iterable

import fitz  # PyMuPDF
from PIL import Image
from pypdf import PdfReader, PdfWriter

from app.models.schemas import (
    CompressionLevel,
    PageInfo,
    PDFMetadata,
)
from app.utils.guards import safe_zoom
from app.utils.storage import find_upload, new_file_id, output_path


class PDFError(Exception):
    """Raised for PDF-specific failures."""


def read_metadata(file_id: str, filename: str, file_path: Path) -> PDFMetadata:
    try:
        with fitz.open(file_path) as doc:
            pages = [
                PageInfo(index=i, width=p.rect.width, height=p.rect.height)
                for i, p in enumerate(doc)
            ]
            return PDFMetadata(
                file_id=file_id,
                filename=filename,
                size_bytes=file_path.stat().st_size,
                page_count=doc.page_count,
                pages=pages,
            )
    except Exception as exc:  # noqa: BLE001
        raise PDFError(f"Could not read PDF: {exc}") from exc


def render_thumbnail(file_id: str, page_index: int, width: int = 200) -> bytes:
    path = find_upload(file_id)
    try:
        with fitz.open(path) as doc:
            if page_index < 0 or page_index >= doc.page_count:
                raise PDFError("Page index out of range")
            page = doc.load_page(page_index)
            zoom = max(0.2, width / max(page.rect.width, 1))
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
            return pix.tobytes("png")
    except PDFError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise PDFError(f"Thumbnail generation failed: {exc}") from exc


def merge_pdfs(items: Iterable[tuple[Path, list[int]]], filename: str) -> tuple[str, Path]:
    """Merge selected page indexes from each file into one PDF."""
    writer = PdfWriter()
    for path, indexes in items:
        try:
            reader = PdfReader(str(path))
            total = len(reader.pages)
            if not indexes:
                indexes = list(range(total))
            for i in indexes:
                if 0 <= i < total:
                    writer.add_page(reader.pages[i])
        except Exception as exc:  # noqa: BLE001
            raise PDFError(f"Failed to read {path.name}: {exc}") from exc

    if len(writer.pages) == 0:
        raise PDFError("No pages selected to merge")

    output_id = new_file_id()
    out = output_path(output_id)
    with open(out, "wb") as f:
        writer.write(f)
    return output_id, out


_COMPRESSION_PRESETS: dict[CompressionLevel, dict] = {
    "low": {"dpi": 200, "jpeg_quality": 85},
    "medium": {"dpi": 144, "jpeg_quality": 70},
    "high": {"dpi": 96, "jpeg_quality": 50},
}


def compress_pdf(file_path: Path, level: CompressionLevel) -> tuple[str, Path]:
    """Compress by re-rasterizing pages to JPEG at a target DPI/quality."""
    preset = _COMPRESSION_PRESETS[level]
    dpi = preset["dpi"]
    quality = preset["jpeg_quality"]

    output_id = new_file_id()
    out = output_path(output_id)

    try:
        with fitz.open(file_path) as src, fitz.open() as dst:
            for page in src:
                zoom = safe_zoom(page.rect.width, page.rect.height, dpi)
                pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
                img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=quality, optimize=True)
                buf.seek(0)
                rect = fitz.Rect(0, 0, page.rect.width, page.rect.height)
                new_page = dst.new_page(width=rect.width, height=rect.height)
                new_page.insert_image(rect, stream=buf.getvalue())
            dst.save(out, deflate=True, garbage=4)
    except Exception as exc:  # noqa: BLE001
        raise PDFError(f"Compression failed: {exc}") from exc

    return output_id, out


def rotate_pages(file_path: Path, rotations: dict[int, int]) -> tuple[str, Path]:
    output_id = new_file_id()
    out = output_path(output_id)
    try:
        reader = PdfReader(str(file_path))
        writer = PdfWriter()
        for i, page in enumerate(reader.pages):
            deg = int(rotations.get(i, 0)) % 360
            if deg:
                page.rotate(deg)
            writer.add_page(page)
        with open(out, "wb") as f:
            writer.write(f)
    except Exception as exc:  # noqa: BLE001
        raise PDFError(f"Rotate failed: {exc}") from exc
    return output_id, out


def split_pdf(file_path: Path, ranges: list[list[int]]) -> tuple[str, Path]:
    """Extract specified inclusive ranges into a single PDF."""
    output_id = new_file_id()
    out = output_path(output_id)
    try:
        reader = PdfReader(str(file_path))
        writer = PdfWriter()
        total = len(reader.pages)
        for rng in ranges:
            if len(rng) != 2:
                raise PDFError("Each range must have [start, end]")
            start, end = rng
            for i in range(max(0, start), min(total - 1, end) + 1):
                writer.add_page(reader.pages[i])
        if len(writer.pages) == 0:
            raise PDFError("Empty split selection")
        with open(out, "wb") as f:
            writer.write(f)
    except PDFError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise PDFError(f"Split failed: {exc}") from exc
    return output_id, out


def count_pages(path: Path) -> int:
    try:
        with fitz.open(path) as doc:
            return doc.page_count
    except Exception:  # noqa: BLE001
        return 0
