from __future__ import annotations

import asyncio
import io
import re
import zipfile
from pathlib import Path
from typing import get_args

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile

from app.api.deps import temp_inputs
from fastapi.responses import FileResponse, JSONResponse
from app.models.schemas import (
    CompressQuickResponse,
    CompressTargetResponse,
    CompressionLevel,
    ExcelToPdfResponse,
    IdCardCombineResponse,
    OcrResponse,
    OcrStatusResponse,
    PdfDeletePagesResponse,
    PdfLockResponse,
    PdfRotateResponse,
    PdfSplitResponse,
    PdfTableExcelResponse,
    PdfToImagesResponse,
    PdfToWordResponse,
    PhotoToPdfResponse,
    WordToPdfResponse,
)
from app.services import (
    heic_service,
    id_card_service,
    ocr_service,
    pdf_edit_service,
    pdf_image_service,
    pdf_lock_service,
    pdf_pages_service,
    pdf_service,
    pdf_table_service,
    photo_service,
)
from app.services import excel_to_pdf_service, image_to_pdf_service, pdf_compress_target, pdf_to_word_service, sign_pdf_service, word_to_pdf_service
from app.utils.guards import GuardError, assert_zip_safe, is_image
from app.utils.storage import find_output, find_upload, new_file_id, upload_path

router = APIRouter(prefix="/tools")


# ---------- ID Card Combiner ---------- #


@router.post(
    "/id-card/combine",
    response_model=IdCardCombineResponse,
    tags=["tools-images"],
    summary="Combine ID card front + back onto A4",
    description=(
        "Accepts two image uploads (front, back of an ID card). Produces an A4 PDF "
        "with both faces placed on one page. `layout` controls placement: "
        "`a4_portrait` (default) stacks vertically, `a4_horizontal` places them side-by-side, "
        "`compact` shrinks to a small badge-style layout. `add_labels=true` prints 'FRONT'/'BACK' captions."
    ),
)
async def id_card_combine(
    front: UploadFile = File(...),
    back: UploadFile = File(...),
    layout: str = Form("a4_portrait"),
    add_labels: bool = Form(True),
):
    if layout not in id_card_service.VALID_LAYOUTS:
        raise HTTPException(400, "Invalid layout")
    front_bytes = await front.read()
    back_bytes = await back.read()
    if len(front_bytes) == 0 or len(back_bytes) == 0:
        raise HTTPException(400, "Both front and back files are required")

    def _img_or_pdf(b: bytes) -> bool:
        return is_image(b) or b[:4] == b"%PDF"

    if not _img_or_pdf(front_bytes) or not _img_or_pdf(back_bytes):
        raise HTTPException(400, "Front and back must be an image (JPG, PNG, WEBP, BMP, TIFF) or PDF.")

    try:
        output_id, out = await asyncio.to_thread(
            id_card_service.combine_id_card,
            front_bytes,
            back_bytes,
            front.content_type,
            back.content_type,
            layout,
            add_labels,
        )
    except id_card_service.IDCardError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "id-card.pdf",
        "size_bytes": out.stat().st_size,
    }


# ---------- Multilingual OCR ---------- #


@router.get(
    "/ocr/status",
    response_model=OcrStatusResponse,
    tags=["tools-ocr"],
    summary="Check Tesseract availability + installed language packs",
    description="Use this from the frontend before exposing OCR options - lets you greyout languages that aren't installed.",
)
async def ocr_status():
    return {
        "available": ocr_service.is_available(),
        "languages": ocr_service.list_languages(),
    }


# Validate against actually-installed packs rather than a hardcoded whitelist.
# Accepts standard 2-4 letter codes (eng, ben, spa) and underscore-codes
# used by Tesseract for traditional/vertical variants (chi_sim, chi_tra,
# chi_sim_vert, etc.). Up to 4 components joined with '+' for multi-lang OCR.
_OCR_CODE_RE = re.compile(r"^[a-z][a-z0-9_]{1,11}(\+[a-z][a-z0-9_]{1,11}){0,3}$")


@router.post(
    "/ocr/extract",
    response_model=OcrResponse,
    tags=["tools-ocr"],
    summary="Extract text from a PDF (OCR fallback for image-only pages)",
    description=(
        "If a page already has selectable text, returns it directly. Otherwise rasterizes "
        "the page and runs Tesseract with the given `lang` (use `+` for multi-language, e.g. `eng+ben`). "
        "Set `force_ocr=true` to skip the text-layer shortcut and OCR every page. "
        "Returns per-page text, a concatenated full-document text, and a summary of which "
        "method (text vs ocr) was used per page."
    ),
)
async def ocr_extract(
    file: UploadFile = File(...),
    lang: str = Form("eng"),
    force_ocr: bool = Form(False),
):
    if file.content_type not in ("application/pdf",) and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    if not _OCR_CODE_RE.match(lang):
        raise HTTPException(400, "Invalid language code format")
    installed = set(await asyncio.to_thread(ocr_service.list_languages))
    if not installed:
        if ocr_service.is_available():
            raise HTTPException(503, "OCR engine is installed but no language packs are available")
        # Tesseract entirely unavailable — extract_text will raise OCRError → 400 below
    else:
        for code in lang.split("+"):
            if code not in installed:
                raise HTTPException(400, f"Language '{code}' is not installed on the server")

    file_id = new_file_id()
    dest = upload_path(file_id)
    content = await file.read()
    if not content[:4] == b"%PDF":
        raise HTTPException(400, "Invalid PDF")
    dest.write_bytes(content)
    # OCR deliberately keeps its input (it returns file_id); TTL cleanup handles it.

    try:
        result = await asyncio.to_thread(
            ocr_service.extract_text, dest, lang, 320, 30, force_ocr
        )
    except ocr_service.OCRError as exc:
        raise HTTPException(400, str(exc))

    return {
        "file_id": file_id,
        "filename": file.filename,
        **result,
    }


# ---------- PDF Table → Excel ---------- #


@router.post(
    "/pdf-table/to-excel",
    response_model=PdfTableExcelResponse,
    tags=["tools-convert"],
    summary="Extract tables from a PDF into a styled XLSX",
    description=(
        "**Output shape:**\n"
        "- PDF with tables on **multiple pages** -> one Excel **tab per page** named `Page 1`, `Page 2`, ...\n"
        "- PDF with tables on **a single page** (or only one page has tables) -> one tab named `Tables` "
        "with each detected table rendered as a labeled block (`Table 1`, `Table 2`...) with spacer rows between.\n\n"
        "Headers are detected heuristically (33-keyword vocabulary + structural fallback). Every sheet "
        "gets a styled header band, zebra rows, borders, autofit columns, and frozen panes."
    ),
)
async def pdf_table_to_excel(
    _cleanup: list[Path] = Depends(temp_inputs),file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)
    _cleanup.append(dest)

    try:
        output_id, out, stats = await asyncio.to_thread(
            pdf_table_service.convert_pdf_table,
            dest,
            "extracted-tables.xlsx",
        )
    except pdf_table_service.PDFTableError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "extracted-tables.xlsx",
        "size_bytes": out.stat().st_size,
        "rows": stats["rows"],
        "columns": stats["columns"],
        "sheets": stats["sheets"],
        "tables": stats["tables"],
    }


# ---------- Excel → PDF (table renderer) ---------- #


@router.post(
    "/excel/to-pdf",
    response_model=ExcelToPdfResponse,
    tags=["tools-convert"],
    summary="Render every sheet of an XLSX as a one-page-per-sheet PDF",
    description=(
        "Each non-empty sheet becomes a PDF page (or several, if it overflows). The sheet name "
        "is shown as a heading above the table; the first row is treated as a header (bold + colored band). "
        "Wide sheets (more than 6 columns or >80 avg-chars/row) auto-flip the whole document to landscape."
    ),
)
async def excel_to_pdf(
    _cleanup: list[Path] = Depends(temp_inputs),file: UploadFile = File(...)):
    name = (file.filename or "").lower()
    if not (name.endswith(".xlsx") or name.endswith(".xlsm")):
        raise HTTPException(415, "Only .xlsx or .xlsm files are accepted")
    content = await file.read()
    if content[:2] != b"PK":
        raise HTTPException(400, "Invalid Excel file")
    try:
        assert_zip_safe(content)
    except GuardError as exc:
        raise HTTPException(400, str(exc))

    file_id = new_file_id()
    dest = upload_path(file_id).with_suffix(".xlsx")
    dest.write_bytes(content)
    _cleanup.append(dest)

    try:
        output_id, out, stats = await asyncio.to_thread(
            excel_to_pdf_service.convert_excel_to_pdf,
            dest,
            "spreadsheet.pdf",
        )
    except excel_to_pdf_service.ExcelToPDFError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "spreadsheet.pdf",
        "size_bytes": out.stat().st_size,
        "sheets": stats["sheets"],
        "rows": stats["rows"],
        "orientation": stats["orientation"],
    }


# ---------- Photo to PDF (passport size) ---------- #


@router.post(
    "/photo/to-pdf",
    response_model=PhotoToPdfResponse,
    tags=["tools-images"],
    summary="Tile a portrait photo into an A4 grid (passport / stamp / visa)",
    description=(
        "`size` picks the photo dimensions: `passport` (35x45mm), `stamp` (20x25mm), `visa_us` (51x51mm), "
        "or `custom` (requires `width_mm` + `height_mm`). `layout` controls how many copies fit per A4 sheet: "
        "`single`, `grid_4`, or `grid_8`. `background` is the wash color around each photo."
    ),
)
async def photo_to_pdf(
    file: UploadFile = File(...),
    size: str = Form("passport"),
    layout: str = Form("grid_8"),
    background: str = Form("white"),
    width_mm: float | None = Form(None),
    height_mm: float | None = Form(None),
):
    if size not in ("passport", "stamp", "visa_us", "custom"):
        raise HTTPException(400, "Invalid size")
    if layout not in ("single", "grid_4", "grid_8"):
        raise HTTPException(400, "Invalid layout")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(400, "Empty image")
    if not is_image(image_bytes):
        raise HTTPException(400, "File is not a valid image (JPG, PNG, WEBP, BMP, TIFF).")

    custom = None
    if size == "custom":
        if not width_mm or not height_mm:
            raise HTTPException(400, "Custom size requires width_mm and height_mm")
        # Bound to plausible photo sizes. Unchecked, width_mm=99999 asked
        # Pillow for a ~1.4e12-pixel canvas - instant OOM from a 2 KB upload
        # (the decompression-bomb guard only covers decode, not construction).
        if not (10 <= float(width_mm) <= 300 and 10 <= float(height_mm) <= 300):
            raise HTTPException(400, "Custom sizes must be between 10 and 300 mm.")
        custom = (float(width_mm), float(height_mm))

    # Pillow's colour parser accepts names and #RRGGBB; anything else raises a
    # bare ValueError deep inside the service, which surfaced as a 500.
    if not re.fullmatch(r"[a-zA-Z]{3,25}|#[0-9a-fA-F]{6}", background):
        raise HTTPException(400, "background must be a colour name or #RRGGBB.")

    try:
        output_id, out, info = await asyncio.to_thread(
            photo_service.make_passport_pdf,
            image_bytes,
            size,
            layout,
            custom,
            background,
        )
    except photo_service.PhotoError as exc:
        raise HTTPException(400, str(exc))
    except ValueError as exc:
        raise HTTPException(400, f"Could not build that sheet: {exc}")

    return {
        "output_id": output_id,
        "filename": f"photo-{size}.pdf",
        "size_bytes": out.stat().st_size,
        "info": info,
    }


# ---------- PDF → JPG/PNG ---------- #


@router.post(
    "/pdf-to-jpg",
    response_model=PdfToImagesResponse,
    tags=["tools-convert"],
    summary="Convert PDF pages to JPG or PNG images",
    description=(
        "`dpi` controls resolution (150 / 220 / 300 are the common presets in the UI). "
        "`pages` is `all` or a range string like `1-3,5,7-9` (1-based). "
        "`fmt` is `jpg` or `png`. Single-page output is the raw image; multi-page is bundled as a ZIP."
    ),
)
async def pdf_to_jpg(
    _cleanup: list[Path] = Depends(temp_inputs),
    file: UploadFile = File(...),
    dpi: int = Form(200),
    pages: str = Form("all"),
    fmt: str = Form("jpg"),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)
    _cleanup.append(dest)

    try:
        output_id, out, count = await asyncio.to_thread(
            pdf_image_service.pdf_to_images, dest, int(dpi), pages, fmt,
        )
    except pdf_image_service.PDFImageError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": out.name,
        "size_bytes": out.stat().st_size,
        "count": count,
        "ext": out.suffix.lstrip("."),
    }


# ---------- Split / Rotate / Delete pages ---------- #


async def _read_pdf_upload(file: UploadFile) -> Path:
    """Shared validation for direct-upload PDF tools: extension + magic bytes, then persist."""
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")
    dest = upload_path(new_file_id())
    dest.write_bytes(content)
    # Callers register `dest` with temp_inputs for cleanup (they hold the dep).
    return dest


@router.post(
    "/pdf/split",
    response_model=PdfSplitResponse,
    tags=["tools-organize"],
    summary="Split a PDF - extract pages into one PDF, or one PDF per page (ZIP)",
    description=(
        "`pages` is `all` or a 1-based range string like `1-3,5`. "
        "`mode=extract` (default) returns the selected pages as a single PDF; "
        "`mode=each` returns a ZIP with one single-page PDF per selected page."
    ),
)
async def pdf_split(
    _cleanup: list[Path] = Depends(temp_inputs),
    file: UploadFile = File(...),
    pages: str = Form("all"),
    mode: str = Form("extract"),
):
    if mode not in pdf_pages_service.SPLIT_MODES:
        raise HTTPException(400, "mode must be 'extract' or 'each'")
    dest = await _read_pdf_upload(file)
    _cleanup.append(dest)
    try:
        output_id, out, count = await asyncio.to_thread(
            pdf_pages_service.split_pdf, dest, pages, mode,
        )
    except pdf_pages_service.PDFPagesError as exc:
        raise HTTPException(400, str(exc))
    return {
        "output_id": output_id,
        "filename": out.name,
        "size_bytes": out.stat().st_size,
        "pages": count,
        "ext": out.suffix.lstrip("."),
    }


@router.post(
    "/pdf/rotate",
    response_model=PdfRotateResponse,
    tags=["tools-organize"],
    summary="Rotate PDF pages by 90 / 180 / 270 degrees",
    description="`angle` is added to each selected page's existing rotation. `pages` is `all` or `1-3,5`.",
)
async def pdf_rotate(
    _cleanup: list[Path] = Depends(temp_inputs),
    file: UploadFile = File(...),
    angle: int = Form(90),
    pages: str = Form("all"),
):
    if angle not in pdf_pages_service.VALID_ANGLES:
        raise HTTPException(400, "angle must be 90, 180 or 270")
    dest = await _read_pdf_upload(file)
    _cleanup.append(dest)
    try:
        output_id, out, rotated = await asyncio.to_thread(
            pdf_pages_service.rotate_pdf, dest, int(angle), pages,
        )
    except pdf_pages_service.PDFPagesError as exc:
        raise HTTPException(400, str(exc))
    return {
        "output_id": output_id,
        "filename": "rotated.pdf",
        "size_bytes": out.stat().st_size,
        "rotated": rotated,
    }


@router.post(
    "/pdf/delete-pages",
    response_model=PdfDeletePagesResponse,
    tags=["tools-organize"],
    summary="Delete pages from a PDF",
    description="`pages` is a required 1-based range string like `2` or `2,4-6`. At least one page must remain.",
)
async def pdf_delete_pages(
    _cleanup: list[Path] = Depends(temp_inputs),
    file: UploadFile = File(...),
    pages: str = Form(...),
):
    dest = await _read_pdf_upload(file)
    _cleanup.append(dest)
    try:
        output_id, out, removed, remaining = await asyncio.to_thread(
            pdf_pages_service.delete_pages, dest, pages,
        )
    except pdf_pages_service.PDFPagesError as exc:
        raise HTTPException(400, str(exc))
    return {
        "output_id": output_id,
        "filename": "pages-removed.pdf",
        "size_bytes": out.stat().st_size,
        "removed": removed,
        "remaining": remaining,
    }


# ---------- PDF Lock / Unlock ---------- #


@router.post(
    "/pdf/lock",
    response_model=PdfLockResponse,
    tags=["tools-security"],
    summary="Encrypt a PDF with a password (AES-256)",
    description="Uses pypdf 5.x for AES-256 encryption. The user/owner password is the same; existing encryption is overwritten.",
)
async def pdf_lock(
    _cleanup: list[Path] = Depends(temp_inputs),file: UploadFile = File(...), password: str = Form(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)
    _cleanup.append(dest)

    try:
        output_id, out = await asyncio.to_thread(
            pdf_lock_service.lock_pdf, dest, password,
        )
    except pdf_lock_service.PDFLockError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "locked.pdf",
        "size_bytes": out.stat().st_size,
    }


@router.post(
    "/pdf/unlock",
    response_model=PdfLockResponse,
    tags=["tools-security"],
    summary="Remove password protection from a PDF",
    description="Requires the user password. Returns 400 if the password is wrong.",
)
async def pdf_unlock(
    _cleanup: list[Path] = Depends(temp_inputs),file: UploadFile = File(...), password: str = Form(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)
    _cleanup.append(dest)

    try:
        output_id, out = await asyncio.to_thread(
            pdf_lock_service.unlock_pdf, dest, password,
        )
    except pdf_lock_service.PDFLockError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "unlocked.pdf",
        "size_bytes": out.stat().st_size,
    }


# ---------- Compress PDF to target size (e.g. 100KB) ---------- #


_TARGET_SIZES_BYTES = {
    "50kb": 50 * 1024,
    "100kb": 100 * 1024,
    "200kb": 200 * 1024,
    "500kb": 500 * 1024,
    "1mb": 1024 * 1024,
    "2mb": 2 * 1024 * 1024,
    "5mb": 5 * 1024 * 1024,
    "10mb": 10 * 1024 * 1024,
    "16mb": 16 * 1024 * 1024,
}


@router.post(
    "/compress/target-size",
    response_model=CompressTargetResponse,
    tags=["tools-compress"],
    summary="Compress a PDF to fit a specific file-size cap",
    description=(
        "Iteratively rasterizes pages at progressively lower DPI + JPEG quality until the output "
        "fits within the target. `target` is one of the named presets: "
        "`50kb`, `100kb`, `200kb`, `500kb`, `1mb`, `2mb`, `5mb`, `10mb`, `16mb`. "
        "If the smallest ladder step is still too big, returns the smallest possible result with "
        "`reached_target=false` so the caller can warn the user."
    ),
)
async def compress_target_size(
    _cleanup: list[Path] = Depends(temp_inputs),
    file: UploadFile = File(...),
    target: str = Form("100kb"),
):
    if target not in _TARGET_SIZES_BYTES:
        raise HTTPException(400, f"target must be one of: {', '.join(_TARGET_SIZES_BYTES)}")
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)
    _cleanup.append(dest)

    target_bytes = _TARGET_SIZES_BYTES[target]
    try:
        output_id, out, stats = await asyncio.to_thread(
            pdf_compress_target.compress_to_target, dest, target_bytes,
        )
    except pdf_compress_target.CompressTargetError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": f"compressed-{target}.pdf",
        "size_bytes": out.stat().st_size,
        "original_size_bytes": len(content),
        "target": target,
        **stats,
    }


# ---------- Quick compression by quality level (one-shot) ---------- #


_QUICK_LEVELS = frozenset(get_args(CompressionLevel))


@router.post(
    "/compress/quick",
    response_model=CompressQuickResponse,
    tags=["tools-compress"],
    summary="One-shot level-based PDF compression (file + level)",
    description=(
        "Use this when you don't have a size target - the 'Best quality' button in the frontend wires here. "
        "`level=low` is the lightest compression (preserves most fidelity); `medium` and `high` trade more "
        "image quality for smaller output. For the workspace-style flow (upload first, then compress by file_id) "
        "use `POST /api/compress` instead."
    ),
)
async def compress_quick(
    _cleanup: list[Path] = Depends(temp_inputs),
    file: UploadFile = File(...),
    level: str = Form("low"),
):
    if level not in _QUICK_LEVELS:
        raise HTTPException(400, f"level must be one of: {', '.join(sorted(_QUICK_LEVELS))}")
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)
    _cleanup.append(dest)

    output_id, out = await asyncio.to_thread(pdf_service.compress_pdf, dest, level)

    return {
        "output_id": output_id,
        "filename": f"compressed-{level}.pdf",
        "size_bytes": out.stat().st_size,
        "original_size_bytes": len(content),
        "level": level,
    }


# ---------- Image (JPG/PNG/WebP) → PDF ---------- #


@router.post(
    "/jpg-to-pdf",
    tags=["tools-convert"],
    summary="Convert one or more images into a single PDF",
    description=(
        "Accepts up to 50 JPG/PNG/WebP files in one POST. `page_size`: "
        "`a4_portrait`, `a4_landscape`, `letter_portrait`, `letter_landscape`, or `fit_image` "
        "(page is sized to the image). `margin_mm` is the white border around each image."
    ),
)
async def jpg_to_pdf(
    files: list[UploadFile] = File(...),
    page_size: str = Form("a4_portrait"),
    margin_mm: float = Form(10.0),
):
    if not files:
        raise HTTPException(400, "No images provided")
    if len(files) > 50:
        raise HTTPException(400, "Max 50 images per conversion")
    # An oversized margin inverts the drawable rect (ValueError -> 500).
    margin_mm = max(0.0, min(50.0, margin_mm))

    images_bytes: list[bytes] = []
    for f in files:
        data = await f.read()
        if not data:
            continue
        images_bytes.append(data)
    if not images_bytes:
        raise HTTPException(400, "All uploads were empty")

    try:
        output_id, out, info = await asyncio.to_thread(
            image_to_pdf_service.images_to_pdf, images_bytes, page_size, margin_mm,
        )
    except image_to_pdf_service.ImageToPdfError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "images.pdf",
        "size_bytes": out.stat().st_size,
        **info,
    }



# ---------- HEIC → JPG ---------- #


@router.post(
    "/heic-to-jpg",
    tags=["tools-convert"],
    summary="Convert an Apple HEIC/HEIF photo to JPEG",
    description=(
        "The one image tool that runs server-side: no browser outside Safari can "
        "decode HEIC, and the JavaScript decoder is ~1 MB. Resolution is preserved "
        "and EXIF is carried through. Output is deleted after the usual TTL."
    ),
)
async def heic_to_jpg(file: UploadFile = File(...), quality: int = Form(92)):
    from app.core.config import settings

    data = await file.read()
    if not data:
        raise HTTPException(400, "The uploaded file was empty.")
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(413, f"Upload exceeds the {settings.MAX_UPLOAD_MB} MB limit.")
    if not heic_service.looks_like_heif(data):
        raise HTTPException(400, "That file is not a HEIC or HEIF image.")

    quality = max(40, min(100, quality))
    try:
        output_id, filename, size = await asyncio.to_thread(
            heic_service.convert_to_jpeg, data, quality,
        )
    except heic_service.HeicError as exc:
        raise HTTPException(400, str(exc))

    return {"output_id": output_id, "filename": filename, "size_bytes": size}



# ---------- PDF editing: watermark / numbers / crop / flatten / organize ---------- #


def _read_pdf(data: bytes) -> None:
    from app.core.config import settings

    if not data:
        raise HTTPException(400, "The uploaded file was empty.")
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(413, f"Upload exceeds the {settings.MAX_UPLOAD_MB} MB limit.")
    if not data.startswith(b"%PDF"):
        raise HTTPException(400, "That file is not a PDF.")


@router.post("/pdf/watermark", tags=["tools-edit"], summary="Stamp text across every page")
async def pdf_watermark(
    file: UploadFile = File(...),
    text: str = Form(...),
    opacity: float = Form(0.25),
    rotation: int = Form(45),
    font_size: int = Form(42),
    tile: bool = Form(True),
    pages: str = Form("all"),
):
    data = await file.read()
    _read_pdf(data)
    try:
        output_id, size = await asyncio.to_thread(
            pdf_edit_service.watermark, data, text,
            opacity=opacity, rotation=rotation, font_size=font_size, tile=tile, pages=pages,
        )
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))
    return {"output_id": output_id, "filename": "watermarked.pdf", "size_bytes": size}


@router.post("/pdf/page-numbers", tags=["tools-edit"], summary="Add page numbers")
async def pdf_page_numbers(
    file: UploadFile = File(...),
    position: str = Form("bottom-center"),
    start_at: int = Form(1),
    fmt: str = Form("{n}"),
    font_size: int = Form(11),
    skip_first: bool = Form(False),
):
    data = await file.read()
    _read_pdf(data)
    try:
        output_id, size = await asyncio.to_thread(
            pdf_edit_service.page_numbers, data,
            position=position, start_at=start_at, fmt=fmt,
            font_size=font_size, skip_first=skip_first,
        )
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))
    return {"output_id": output_id, "filename": "numbered.pdf", "size_bytes": size}


@router.post("/pdf/crop", tags=["tools-edit"], summary="Trim page margins")
async def pdf_crop(
    file: UploadFile = File(...),
    top: float = Form(0),
    right: float = Form(0),
    bottom: float = Form(0),
    left: float = Form(0),
    pages: str = Form("all"),
):
    data = await file.read()
    _read_pdf(data)
    try:
        output_id, size = await asyncio.to_thread(
            pdf_edit_service.crop, data,
            top=top, right=right, bottom=bottom, left=left, pages=pages,
        )
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))
    return {"output_id": output_id, "filename": "cropped.pdf", "size_bytes": size}


@router.post("/pdf/flatten", tags=["tools-edit"], summary="Bake forms and annotations into the page")
async def pdf_flatten(file: UploadFile = File(...)):
    data = await file.read()
    _read_pdf(data)
    try:
        output_id, size = await asyncio.to_thread(pdf_edit_service.flatten, data)
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))
    return {"output_id": output_id, "filename": "flattened.pdf", "size_bytes": size}


@router.post("/pdf/organize", tags=["tools-organize"], summary="Reorder or subset pages")
async def pdf_organize(file: UploadFile = File(...), order: str = Form(...)):
    data = await file.read()
    _read_pdf(data)
    try:
        output_id, size = await asyncio.to_thread(pdf_edit_service.organize, data, order)
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))
    return {"output_id": output_id, "filename": "organized.pdf", "size_bytes": size}


@router.post("/pdf/redact", tags=["tools-secure"], summary="Permanently remove matching text")
async def pdf_redact(
    file: UploadFile = File(...),
    terms: str = Form(...),
    case_sensitive: bool = Form(False),
):
    data = await file.read()
    _read_pdf(data)
    # The form field itself is unbounded; refuse pathological payloads before
    # splitting (the service additionally caps term count and length).
    if len(terms) > 30_000:
        raise HTTPException(400, "The redaction term list is too long.")
    try:
        output_id, size, hits = await asyncio.to_thread(
            pdf_edit_service.redact, data,
            [t for t in terms.split("\n")], case_sensitive=case_sensitive,
        )
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))
    return {"output_id": output_id, "filename": "redacted.pdf", "size_bytes": size, "removed": hits}


@router.post("/pdf/repair", tags=["tools-edit"], summary="Rebuild a damaged PDF")
async def pdf_repair(file: UploadFile = File(...)):
    data = await file.read()
    # Damaged PDFs keep their %PDF header in practice; without this check the
    # recovery parser - MuPDF's most fragile mode - ran on arbitrary bytes of
    # any size.
    _read_pdf(data)
    try:
        output_id, size, note = await asyncio.to_thread(pdf_edit_service.repair, data)
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))
    return {"output_id": output_id, "filename": "repaired.pdf", "size_bytes": size, "note": note}



@router.post("/pdf/to-text", tags=["tools-convert"], summary="Extract the text layer from a PDF")
async def pdf_to_text(file: UploadFile = File(...), layout: bool = Form(False)):
    data = await file.read()
    _read_pdf(data)
    try:
        text, pages, chars = await asyncio.to_thread(pdf_edit_service.extract_text, data, layout)
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))
    return {
        "text": text,
        "pages": pages,
        "characters": chars,
        # An empty result almost always means a scan, so say so rather than
        # returning a blank box with no explanation.
        "note": None if chars else "No text layer found - this looks like a scan. Run PDF OCR instead.",
    }


@router.post("/pdf/compare", tags=["tools-edit"], summary="Compare the text of two PDFs")
async def pdf_compare(file_a: UploadFile = File(...), file_b: UploadFile = File(...)):
    a = await file_a.read()
    b = await file_b.read()
    _read_pdf(a)
    _read_pdf(b)
    try:
        return await asyncio.to_thread(pdf_edit_service.compare, a, b)
    except pdf_edit_service.PdfEditError as exc:
        raise HTTPException(400, str(exc))


# ---------- PDF → Word (.docx) ---------- #


@router.post(
    "/pdf-to-word",
    response_model=PdfToWordResponse,
    tags=["tools-convert"],
    summary="Convert a PDF to an editable Word (.docx) document",
    description="Preserves text, paragraph breaks, and inline images. Complex layouts (multi-column, floating elements) may need manual cleanup.",
)
async def pdf_to_word(
    _cleanup: list[Path] = Depends(temp_inputs),file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")
    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)
    _cleanup.append(dest)

    try:
        output_id, out, stats = await asyncio.to_thread(
            pdf_to_word_service.pdf_to_docx, dest,
        )
    except pdf_to_word_service.PdfToWordError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "converted.docx",
        "size_bytes": out.stat().st_size,
        **stats,
    }


# ---------- Word (.docx) → PDF ---------- #


@router.post(
    "/word-to-pdf",
    response_model=WordToPdfResponse,
    tags=["tools-convert"],
    summary="Convert a Word (.docx) document to PDF",
    description="Reads the .docx with python-docx and renders it to PDF. Best for resumes, reports, and assignments; advanced layout features may not survive exactly.",
)
async def word_to_pdf(
    _cleanup: list[Path] = Depends(temp_inputs),file: UploadFile = File(...)):
    name = (file.filename or "").lower()
    if not name.endswith(".docx"):
        raise HTTPException(415, "Only .docx files are accepted")
    content = await file.read()
    if not content:
        raise HTTPException(400, "Empty file")
    # docx is a zip — must start with PK
    if content[:2] != b"PK":
        raise HTTPException(400, "Invalid .docx file")
    try:
        assert_zip_safe(content)
    except GuardError as exc:
        raise HTTPException(400, str(exc))
    file_id = new_file_id()
    dest = upload_path(file_id).with_suffix(".docx")
    dest.write_bytes(content)
    _cleanup.append(dest)

    try:
        output_id, out, stats = await asyncio.to_thread(
            word_to_pdf_service.docx_to_pdf, dest,
        )
    except word_to_pdf_service.WordToPdfError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "converted.pdf",
        "size_bytes": out.stat().st_size,
        **stats,
    }


# ---------- Sign PDF ---------- #


@router.post(
    "/sign-pdf",
    tags=["tools-sign"],
    summary="Place a drawn signature image onto a PDF page",
    description=(
        "Stamps a PNG signature at the given position on the chosen page. Coordinates are in PDF points "
        "(72 per inch); origin is bottom-left of the page. The signature image is typically a transparent PNG "
        "produced by a frontend canvas."
    ),
)
async def sign_pdf(
    _cleanup: list[Path] = Depends(temp_inputs),
    file: UploadFile = File(...),
    signature: UploadFile = File(...),
    page_index: int = Form(0),
    x_pt: float = Form(...),
    y_pt: float = Form(...),
    width_pt: float = Form(...),
    height_pt: float = Form(...),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    pdf_bytes = await file.read()
    if pdf_bytes[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")
    sig_bytes = await signature.read()
    if not sig_bytes:
        raise HTTPException(400, "Empty signature image")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(pdf_bytes)
    _cleanup.append(dest)

    try:
        output_id, out = await asyncio.to_thread(
            sign_pdf_service.sign_pdf,
            dest, sig_bytes, page_index, x_pt, y_pt, width_pt, height_pt,
        )
    except sign_pdf_service.SignPdfError as exc:
        raise HTTPException(400, str(exc))

    return {
        "output_id": output_id,
        "filename": "signed.pdf",
        "size_bytes": out.stat().st_size,
    }


# ---------- Generic download alias for outputs ---------- #

_SUFFIX_TO_MIME = {
    ".pdf": "application/pdf",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".zip": "application/zip",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}


@router.get(
    "/download/{output_id}",
    tags=["tools-system"],
    summary="Download any tool result by output_id",
    description=(
        "Content-type and extension are auto-detected from disk (pdf / xlsx / docx / zip / jpg / png). "
        "`name` is the suggested attachment filename and is sanitized server-side. "
        "Returns 404 if the output expired (`FILE_TTL_SECONDS`)."
    ),
    responses={
        200: {"content": {"application/pdf": {}, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {}, "application/zip": {}, "image/jpeg": {}, "image/png": {}}},
        404: {"description": "Output not found or expired"},
    },
)
async def tools_download(output_id: str, name: str = "file"):
    from app.core.config import settings

    for suffix, media in _SUFFIX_TO_MIME.items():
        candidate = settings.OUTPUT_DIR / f"{output_id}{suffix}"
        if candidate.exists():
            safe = name.replace("/", "_").replace("\\", "_") or f"file{suffix}"
            if not safe.lower().endswith(suffix):
                safe = f"{safe}{suffix}"
            return FileResponse(candidate, media_type=media, filename=safe)
    raise HTTPException(404, "Output not found")


# ---------- Result Preview ---------- #

_ID_RE = re.compile(r"^[A-Za-z0-9_-]{8,64}$")


def _resolve_output(output_id: str) -> Path:
    from app.core.config import settings

    if not _ID_RE.match(output_id):
        raise HTTPException(400, "Invalid output id")
    for suffix in _SUFFIX_TO_MIME:
        candidate = settings.OUTPUT_DIR / f"{output_id}{suffix}"
        if candidate.exists():
            return candidate
    raise HTTPException(404, "Output not found")


def _render_pdf_page(path: Path, page: int, width: int) -> tuple[bytes, int]:
    import fitz  # PyMuPDF

    with fitz.open(path) as doc:
        total = doc.page_count
        if total == 0:
            raise ValueError("Empty PDF")
        idx = max(0, min(page, total - 1))
        p = doc.load_page(idx)
        zoom = max(0.4, min(2.5, width / max(p.rect.width, 1)))
        pix = p.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        return pix.tobytes("png"), total


def _resize_image_to_png(path: Path, width: int) -> bytes:
    from PIL import Image

    with Image.open(path) as img:
        img = img.convert("RGB")
        if img.width > width:
            ratio = width / img.width
            img = img.resize((width, int(img.height * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()


def _first_image_in_zip(path: Path, width: int) -> bytes:
    from PIL import Image

    with zipfile.ZipFile(path) as zf:
        names = sorted(
            n for n in zf.namelist()
            if n.lower().endswith((".jpg", ".jpeg", ".png")) and not n.endswith("/")
        )
        if not names:
            raise FileNotFoundError("No images in archive")
        with zf.open(names[0]) as fh:
            data = fh.read()
    with Image.open(io.BytesIO(data)) as img:
        img = img.convert("RGB")
        if img.width > width:
            ratio = width / img.width
            img = img.resize((width, int(img.height * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()


def _xlsx_preview(path: Path, max_rows: int) -> dict:
    import openpyxl

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    try:
        ws = wb.active
        if ws is None:
            return {"columns": [], "rows": [], "total_rows": 0}
        rows_iter = ws.iter_rows(values_only=True)
        try:
            header = next(rows_iter)
        except StopIteration:
            return {"columns": [], "rows": [], "total_rows": 0}
        columns = [("" if c is None else str(c)) for c in header]
        sample: list[list[str]] = []
        total = 0
        for row in rows_iter:
            total += 1
            if len(sample) < max_rows:
                sample.append([("" if v is None else str(v)) for v in row])
        return {"columns": columns, "rows": sample, "total_rows": total}
    finally:
        wb.close()


@router.get(
    "/preview/{output_id}",
    tags=["tools-system"],
    summary="Content-aware preview for any tool result",
    description=(
        "Returns a representation suitable for inline preview in the browser:\n"
        "- **PDF** -> PNG render of page `?page=N` at width `?w=900`. Page count exposed via the `X-Page-Count` response header.\n"
        "- **JPG / PNG** -> resized PNG\n"
        "- **ZIP** -> PNG of the first image inside the archive\n"
        "- **XLSX** -> JSON with columns + first 10 rows + total row count\n\n"
        "5-minute cache header. Locked PDFs are skipped (the frontend gates these client-side)."
    ),
    responses={
        200: {"content": {"image/png": {}, "application/json": {}}},
        404: {"description": "Output not found or expired"},
    },
)
async def preview(output_id: str, page: int = 0, w: int = 900):
    path = _resolve_output(output_id)
    suffix = path.suffix.lower()
    width = max(200, min(1400, int(w)))
    page = max(0, int(page))

    cache_headers = {"Cache-Control": "public, max-age=300"}

    if suffix == ".pdf":
        try:
            png, total = await asyncio.to_thread(_render_pdf_page, path, page, width)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(400, f"Preview failed: {exc}")
        return Response(
            content=png,
            media_type="image/png",
            headers={**cache_headers, "X-Page-Count": str(total)},
        )

    if suffix in (".jpg", ".jpeg", ".png"):
        try:
            png = await asyncio.to_thread(_resize_image_to_png, path, width)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(400, f"Preview failed: {exc}")
        return Response(
            content=png,
            media_type="image/png",
            headers={**cache_headers, "X-Page-Count": "1"},
        )

    if suffix == ".zip":
        try:
            png = await asyncio.to_thread(_first_image_in_zip, path, width)
        except FileNotFoundError:
            raise HTTPException(404, "No previewable images in archive")
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(400, f"Preview failed: {exc}")
        return Response(
            content=png,
            media_type="image/png",
            headers={**cache_headers, "X-Page-Count": "1"},
        )

    if suffix == ".xlsx":
        try:
            data = await asyncio.to_thread(_xlsx_preview, path, 10)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(400, f"Preview failed: {exc}")
        return JSONResponse(content=data, headers=cache_headers)

    raise HTTPException(415, "Preview not supported for this file type")
