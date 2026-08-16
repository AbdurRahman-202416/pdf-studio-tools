"""Shared request-scoped dependencies for tool routes."""
from __future__ import annotations

from pathlib import Path
from typing import AsyncIterator

from app.core.logging import logger


async def temp_inputs() -> AsyncIterator[list[Path]]:
    """Track uploaded input files that should be deleted once the request ends.

    A route appends the path it saved to `storage/uploads/`; this dependency's
    finally deletes them after the response is produced, on BOTH the success and
    error paths. Outputs (in `storage/output/`) are never registered here — they
    must survive for the download/TTL window. The 15-minute TTL sweep remains as
    defense-in-depth for anything that slips through.
    """
    files: list[Path] = []
    try:
        yield files
    finally:
        for f in files:
            try:
                f.unlink(missing_ok=True)
            except OSError as exc:  # cleanup must never mask the real error
                logger.warning("temp input cleanup failed for %s: %s", f, exc)
