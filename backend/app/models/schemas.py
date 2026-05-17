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
