from __future__ import annotations

import asyncio
import contextlib

from app.core.config import settings
from app.core.logging import logger
from app.utils.storage import cleanup_expired


async def _loop() -> None:
    interval = settings.CLEANUP_INTERVAL_SECONDS
    while True:
        try:
            removed = await asyncio.to_thread(cleanup_expired)
            if removed:
                logger.info("cleanup: removed %d expired files", removed)
        except Exception:  # noqa: BLE001
            logger.exception("cleanup: tick failed")
        await asyncio.sleep(interval)


@contextlib.asynccontextmanager
async def cleanup_lifespan(_app):
    task = asyncio.create_task(_loop())
    try:
        yield
    finally:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task
