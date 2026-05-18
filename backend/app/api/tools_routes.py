from __future__ import annotations

import asyncio
import io
import re
import zipfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.services import (
    forms_service,
    id_card_service,
    ocr_service,
    pdf_image_service,
    pdf_lock_service,
    pdf_table_service,
    photo_service,
)
from app.utils.storage import find_output, find_upload, new_file_id, upload_path

router = APIRouter(prefix="/tools", tags=["tools"])


# ---------- ID Card Combiner ---------- #


@router.post("/id-card/combine")
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


@router.get("/ocr/status")
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


@router.post("/ocr/extract")
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


@router.post("/pdf-table/to-excel")
async def pdf_table_to_excel(file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)

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
    }


# ---------- Photo to PDF (passport size) ---------- #


@router.post("/photo/to-pdf")
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

    custom = None
    if size == "custom":
        if not width_mm or not height_mm:
            raise HTTPException(400, "Custom size requires width_mm and height_mm")
        custom = (float(width_mm), float(height_mm))

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

    return {
        "output_id": output_id,
        "filename": f"photo-{size}.pdf",
        "size_bytes": out.stat().st_size,
        "info": info,
    }


# ---------- Govt Forms ---------- #


class RenderFormRequest(BaseModel):
    form_id: str
    values: dict[str, str]


@router.get("/forms")
async def list_forms():
    return {"forms": forms_service.list_forms()}


@router.get("/forms/{form_id}")
async def get_form(form_id: str):
    try:
        return forms_service.get_form(form_id)
    except forms_service.FormError as exc:
        raise HTTPException(404, str(exc))


@router.post("/forms/render")
async def render_form(req: RenderFormRequest):
    try:
        output_id, out = await asyncio.to_thread(
            forms_service.render_form, req.form_id, req.values
        )
    except forms_service.FormError as exc:
        raise HTTPException(400, str(exc))
    return {
        "output_id": output_id,
        "filename": f"{req.form_id}.pdf",
        "size_bytes": out.stat().st_size,
    }


# ---------- PDF → JPG/PNG ---------- #


@router.post("/pdf-to-jpg")
async def pdf_to_jpg(
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


# ---------- PDF Lock / Unlock ---------- #


@router.post("/pdf/lock")
async def pdf_lock(file: UploadFile = File(...), password: str = Form(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)

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


@router.post("/pdf/unlock")
async def pdf_unlock(file: UploadFile = File(...), password: str = Form(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are accepted")
    content = await file.read()
    if content[:4] != b"%PDF":
        raise HTTPException(400, "Invalid PDF")

    file_id = new_file_id()
    dest = upload_path(file_id)
    dest.write_bytes(content)

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


# ---------- Generic download alias for outputs ---------- #

_SUFFIX_TO_MIME = {
    ".pdf": "application/pdf",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".zip": "application/zip",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}


@router.get("/download/{output_id}")
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


@router.get("/preview/{output_id}")
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
