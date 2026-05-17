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

router = APIRouter()


def _safe_filename(name: str | None, default: str) -> str:
    if not name:
        return default
    name = name.strip().replace("/", "_").replace("\\", "_")
    if not name.lower().endswith(".pdf"):
        name = f"{name}.pdf"
    return name or default


@router.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}


@router.post("/upload", response_model=UploadResponse)
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


@router.get("/files/{file_id}/metadata", response_model=PDFMetadata)
async def get_metadata(file_id: str):
    path = find_upload(file_id)
    name = filename_registry.lookup(file_id, path.name)
    return pdf_service.read_metadata(file_id, name, path)


@router.get("/files/{file_id}/thumbnail/{page_index}")
async def get_thumbnail(file_id: str, page_index: int, w: int = 220):
    # validate file exists
    find_upload(file_id)
    png = await asyncio.to_thread(pdf_service.render_thumbnail, file_id, page_index, w)
    return Response(content=png, media_type="image/png", headers={"Cache-Control": "public, max-age=300"})


@router.get("/files/{file_id}/raw")
async def get_raw(file_id: str):
    path = find_upload(file_id)
    return FileResponse(path, media_type="application/pdf")


@router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    path = upload_path(file_id)
    path.unlink(missing_ok=True)
    filename_registry.forget(file_id)
    return {"deleted": True}


@router.post("/merge", response_model=ProcessedFile)
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


@router.post("/compress", response_model=ProcessedFile)
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


@router.post("/rotate", response_model=ProcessedFile)
async def rotate(req: RotatePagesRequest):
    path = find_upload(req.file_id)
    output_id, out = await asyncio.to_thread(pdf_service.rotate_pages, path, req.rotations)
    return ProcessedFile(
        output_id=output_id,
        filename=_safe_filename(req.filename or "rotated.pdf", "rotated.pdf"),
        size_bytes=out.stat().st_size,
        page_count=pdf_service.count_pages(out),
    )


@router.post("/split", response_model=ProcessedFile)
async def split(req: SplitRequest):
    path = find_upload(req.file_id)
    output_id, out = await asyncio.to_thread(pdf_service.split_pdf, path, req.ranges)
    return ProcessedFile(
        output_id=output_id,
        filename=_safe_filename(req.filename or "split.pdf", "split.pdf"),
        size_bytes=out.stat().st_size,
        page_count=pdf_service.count_pages(out),
    )


@router.get("/download/{output_id}")
async def download(output_id: str, name: str = "document.pdf"):
    path = find_output(output_id)
    filename = _safe_filename(name, "document.pdf")
    return FileResponse(path, media_type="application/pdf", filename=filename)
