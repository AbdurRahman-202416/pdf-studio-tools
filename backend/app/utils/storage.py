from __future__ import annotations

import time
import uuid
from pathlib import Path

from app.core.config import settings


def new_file_id() -> str:
    return uuid.uuid4().hex


def upload_path(file_id: str) -> Path:
    return settings.UPLOAD_DIR / f"{file_id}.pdf"


def output_path(output_id: str) -> Path:
    return settings.OUTPUT_DIR / f"{output_id}.pdf"


def find_upload(file_id: str) -> Path:
    p = upload_path(file_id)
    if not p.exists():
        raise FileNotFoundError(file_id)
    return p


def find_output(output_id: str) -> Path:
    p = output_path(output_id)
    if not p.exists():
        raise FileNotFoundError(output_id)
    return p


def cleanup_expired() -> int:
    """Delete files older than the TTL. Returns number removed."""
    cutoff = time.time() - settings.FILE_TTL_SECONDS
    removed = 0
    for directory in (settings.UPLOAD_DIR, settings.OUTPUT_DIR):
        # Sweep every produced artifact (pdf/xlsx/docx/zip/jpg/png/…), not just
        # PDFs — otherwise non-PDF outputs never expire and disk grows unbounded.
        for f in directory.iterdir():
            if not f.is_file():
                continue
            try:
                if f.stat().st_mtime < cutoff:
                    f.unlink(missing_ok=True)
                    removed += 1
            except OSError:
                continue
    return removed
