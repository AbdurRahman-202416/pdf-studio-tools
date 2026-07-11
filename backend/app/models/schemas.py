from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

CompressionLevel = Literal["low", "medium", "high"]


class PageInfo(BaseModel):
    index: int
    width: float
    height: float


class PDFMetadata(BaseModel):
    file_id: str
    filename: str
    size_bytes: int
    page_count: int
    pages: list[PageInfo]


class UploadResponse(BaseModel):
    file: PDFMetadata


class PageSelector(BaseModel):
    file_id: str
    page_indexes: list[int] = Field(default_factory=list)


class MergeRequest(BaseModel):
    items: list[PageSelector]
    filename: str = "merged.pdf"


class CompressRequest(BaseModel):
    file_id: str
    level: CompressionLevel = "medium"
    filename: str | None = None


class ProcessedFile(BaseModel):
    output_id: str
    filename: str
    size_bytes: int
    original_size_bytes: int | None = None
    reduction_percent: float | None = None
    page_count: int


class RotatePagesRequest(BaseModel):
    file_id: str
    rotations: dict[int, int]  # page index -> degrees (90, 180, 270)
    filename: str | None = None


class SplitRequest(BaseModel):
    file_id: str
    ranges: list[list[int]]  # list of [start, end] inclusive 0-based page indexes
    filename: str | None = None


class ErrorResponse(BaseModel):
    detail: str


# ---------- Tool response models (used by /api/tools/* routes) ---------- #


class ToolDownloadable(BaseModel):
    """Base shape returned by every tool that produces a single file the
    caller should fetch via GET /api/tools/download/{output_id}."""

    output_id: str = Field(..., description="UUID-style id; pass to /api/tools/download/{output_id} to retrieve the file.")
    filename: str = Field(..., description="Suggested filename for the download (server-sanitized).")
    size_bytes: int = Field(..., description="Size of the produced file in bytes.")


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    version: str


class DeleteResponse(BaseModel):
    deleted: bool


class OcrStatusResponse(BaseModel):
    available: bool = Field(..., description="True if the Tesseract binary is installed.")
    languages: list[str] = Field(..., description="ISO-639 codes of installed language packs (eng, ben, spa, ...).")


class OcrPage(BaseModel):
    index: int
    text: str
    method: Literal["text", "ocr"]


class OcrResponse(BaseModel):
    file_id: str
    filename: str
    pages: list[OcrPage]
    text: str
    language: str
    page_count: int
    method_summary: dict[str, int]


class PdfTableExcelResponse(ToolDownloadable):
    rows: int = Field(..., description="Total data rows extracted across all sheets, excluding headers.")
    columns: int = Field(..., description="Widest column count seen across all extracted tables.")
    sheets: int = Field(..., description="Number of sheets in the output workbook (one per PDF page when multi-page).")
    tables: int = Field(..., description="Number of distinct tables detected across the PDF.")


class ExcelToPdfResponse(ToolDownloadable):
    sheets: int = Field(..., description="Number of source sheets rendered into the PDF.")
    rows: int = Field(..., description="Total data rows rendered, excluding headers.")
    orientation: Literal["portrait", "landscape"]


class CompressTargetResponse(ToolDownloadable):
    original_size_bytes: int
    target: str = Field(..., description="The size preset that was requested, e.g. '100kb', '5mb'.")
    target_bytes: int
    final_bytes: int
    dpi: int = Field(..., description="DPI used by the final iteration of the rasterize ladder.")
    jpeg_quality: int = Field(..., description="JPEG quality (1-100) used by the final iteration.")
    iterations: int = Field(..., description="How many ladder steps were tried before reaching the target (or bottoming out).")
    reached_target: bool = Field(..., description="False if the smallest possible output is still larger than the requested target.")


class CompressQuickResponse(ToolDownloadable):
    original_size_bytes: int
    level: CompressionLevel


class PdfToImagesResponse(ToolDownloadable):
    count: int = Field(..., description="Number of images produced (one per converted page).")
    ext: Literal["jpg", "png", "zip"]


class PdfLockResponse(ToolDownloadable):
    pass


class PdfSplitResponse(ToolDownloadable):
    pages: int = Field(..., description="Number of pages in the output (extract) or number of single-page PDFs (each).")
    ext: Literal["pdf", "zip"]


class PdfRotateResponse(ToolDownloadable):
    rotated: int = Field(..., description="Number of pages that were rotated.")


class PdfDeletePagesResponse(ToolDownloadable):
    removed: int
    remaining: int


class PdfToWordResponse(ToolDownloadable):
    pages: int
    characters: int
    images: int


class WordToPdfResponse(ToolDownloadable):
    blocks: int
    images: int


class IdCardCombineResponse(ToolDownloadable):
    pass


class PhotoToPdfResponse(ToolDownloadable):
    info: dict
