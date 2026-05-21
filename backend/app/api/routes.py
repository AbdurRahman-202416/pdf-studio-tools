from __future__ import annotations

import asyncio
from pathlib import Path

# pyrefly: ignore [untyped-import]
import aiofiles
from fastapi import APIRouter, File, HTTPException, Response, UploadFile
from fastapi.responses import FileResponse

from app.core.config import settings
from app.models.schemas import (
    CompressRequest,
    DeleteResponse,
    HealthResponse,
    MergeRequest,
    PDFMetadata,
    ProcessedFile,
    RotatePagesRequest,
    SplitRequest,
    UploadResponse,
)
from app.services import filename_registry, pdf_service
from app.utils.storage import (
    find_output,
    find_upload,
    new_file_id,
    upload_path,
)

router = APIRouter(tags=["workspace"])


def _safe_filename(name: str | None, default: str) -> str:
    if not name:
        return default
    name = name.strip().replace("/", "_").replace("\\", "_")
    if not name.lower().endswith(".pdf"):
        name = f"{name}.pdf"
    return name or default


@router.get(
    "/health",
    tags=["system"],
    summary="Health check",
    description="Returns `{status: ok, version}`. Use this for uptime probes (UptimeRobot etc).",
    response_model=HealthResponse,
)
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}


@router.post(
    "/upload",
    response_model=UploadResponse,
    summary="Upload a PDF",
    description=(
        "Streams the upload to disk in 1 MB chunks, aborting and unlinking if it crosses "
        "`MAX_UPLOAD_MB`. Validates MIME and `%PDF` magic bytes. Returns the new `file_id` "
        "plus page metadata you can use for thumbnails, splits, merges, etc."
    ),
    responses={
        413: {"description": "File larger than MAX_UPLOAD_MB"},
        415: {"description": "Wrong MIME type (not application/pdf)"},
        400: {"description": "Bytes don't start with %PDF magic"},
    },
)
async def upload(file: UploadFile = File(...)):
    if file.content_type not in settings.ALLOWED_MIME:
        raise HTTPException(415, "Only PDF files are accepted")

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    file_id = new_file_id()
    dest = upload_path(file_id)

    bytes_written = 0
    async with aiofiles.open(dest, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            bytes_written += len(chunk)
            if bytes_written > max_bytes:
                await out.close()
                dest.unlink(missing_ok=True)
                raise HTTPException(
                    413, f"File too large; max {settings.MAX_UPLOAD_MB} MB"
                )
            await out.write(chunk)

    # Basic PDF signature check
    with open(dest, "rb") as fh:
        head = fh.read(5)
    if head[:4] != b"%PDF":
        dest.unlink(missing_ok=True)
        raise HTTPException(400, "File is not a valid PDF")

    original_name = file.filename or "document.pdf"
    filename_registry.remember(file_id, original_name)
    meta = pdf_service.read_metadata(file_id, original_name, dest)
    return UploadResponse(file=meta)


@router.get(
    "/files/{file_id}/metadata",
    response_model=PDFMetadata,
    summary="Get metadata for an uploaded PDF",
    description="Returns the original filename, byte size, page count, and per-page dimensions.",
)
async def get_metadata(file_id: str):
    path = find_upload(file_id)
    name = filename_registry.lookup(file_id, path.name)
    return pdf_service.read_metadata(file_id, name, path)


@router.get(
    "/files/{file_id}/thumbnail/{page_index}",
    summary="Render a thumbnail of one page",
    description="Returns a PNG rendered at width `w` (default 220px). 5-minute cache header.",
    responses={200: {"content": {"image/png": {}}}},
)
async def get_thumbnail(file_id: str, page_index: int, w: int = 220):
    find_upload(file_id)
    png = await asyncio.to_thread(pdf_service.render_thumbnail, file_id, page_index, w)
    return Response(content=png, media_type="image/png", headers={"Cache-Control": "public, max-age=300"})


@router.get(
    "/files/{file_id}/raw",
    summary="Stream the raw uploaded PDF",
    description="Returns the original PDF bytes. Used by the frontend for in-browser preview.",
    responses={200: {"content": {"application/pdf": {}}}},
)
async def get_raw(file_id: str):
    path = find_upload(file_id)
    return FileResponse(path, media_type="application/pdf")


@router.delete(
    "/files/{file_id}",
    response_model=DeleteResponse,
    summary="Delete an uploaded PDF",
    description="Removes the file immediately instead of waiting for the TTL sweep.",
)
async def delete_file(file_id: str):
    path = upload_path(file_id)
    path.unlink(missing_ok=True)
    filename_registry.forget(file_id)
    return {"deleted": True}


@router.post(
    "/merge",
    response_model=ProcessedFile,
    summary="Merge selected pages from one or more uploaded PDFs",
    description=(
        "Each item picks pages from a previously uploaded `file_id`. Pages are concatenated "
        "in the order given. The output is downloadable via `GET /api/download/{output_id}`."
    ),
)
async def merge(req: MergeRequest):
    if not req.items:
        raise HTTPException(400, "No items to merge")
    files: list[tuple[Path, list[int]]] = []
    for item in req.items:
        path = find_upload(item.file_id)
        files.append((path, item.page_indexes))

    output_id, out = await asyncio.to_thread(pdf_service.merge_pdfs, files, req.filename)
    return ProcessedFile(
        output_id=output_id,
        filename=_safe_filename(req.filename, "merged.pdf"),
        size_bytes=out.stat().st_size,
        page_count=pdf_service.count_pages(out),
    )


@router.post(
    "/compress",
    response_model=ProcessedFile,
    summary="Compress an uploaded PDF (level-based)",
    description=(
        "Takes a `file_id` plus a level (`low` / `medium` / `high`) and returns a smaller PDF. "
        "For the outcome-first compress UI used by the frontend, see `POST /api/tools/compress/quick` "
        "(file + level in one POST) or `POST /api/tools/compress/target-size` (compress to fit a size cap)."
    ),
)
async def compress(req: CompressRequest):
    path = find_upload(req.file_id)
    original = path.stat().st_size
    output_id, out = await asyncio.to_thread(pdf_service.compress_pdf, path, req.level)
    new_size = out.stat().st_size
    reduction = ((original - new_size) / original * 100) if original else 0.0
    return ProcessedFile(
        output_id=output_id,
        filename=_safe_filename(req.filename or f"compressed-{req.level}.pdf", "compressed.pdf"),
        size_bytes=new_size,
        original_size_bytes=original,
        reduction_percent=round(reduction, 2),
        page_count=pdf_service.count_pages(out),
    )


@router.post(
    "/rotate",
    response_model=ProcessedFile,
    summary="Rotate selected pages",
    description="`rotations` maps page index -> degrees (90/180/270). Pages not in the map keep their original orientation.",
)
async def rotate(req: RotatePagesRequest):
    path = find_upload(req.file_id)
    output_id, out = await asyncio.to_thread(pdf_service.rotate_pages, path, req.rotations)
    return ProcessedFile(
        output_id=output_id,
        filename=_safe_filename(req.filename or "rotated.pdf", "rotated.pdf"),
        size_bytes=out.stat().st_size,
        page_count=pdf_service.count_pages(out),
    )


@router.post(
    "/split",
    response_model=ProcessedFile,
    summary="Extract page ranges into a new PDF",
    description="`ranges` is a list of `[start, end]` pairs (inclusive, 0-based). All matching pages are concatenated into one output PDF.",
)
async def split(req: SplitRequest):
    path = find_upload(req.file_id)
    output_id, out = await asyncio.to_thread(pdf_service.split_pdf, path, req.ranges)
    return ProcessedFile(
        output_id=output_id,
        filename=_safe_filename(req.filename or "split.pdf", "split.pdf"),
        size_bytes=out.stat().st_size,
        page_count=pdf_service.count_pages(out),
    )


@router.get(
    "/download/{output_id}",
    summary="Download a workspace result (PDF)",
    description=(
        "Returns the produced PDF as an attachment using the suggested `name`. "
        "Workspace outputs are always PDFs - for tool outputs (XLSX/DOCX/ZIP/JPG/PNG too) use "
        "`GET /api/tools/download/{output_id}` instead."
    ),
    responses={200: {"content": {"application/pdf": {}}}, 404: {"description": "Output not found or expired"}},
)
async def download(output_id: str, name: str = "document.pdf"):
    path = find_output(output_id)
    filename = _safe_filename(name, "document.pdf")
    return FileResponse(path, media_type="application/pdf", filename=filename)
