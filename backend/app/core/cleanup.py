from __future__ import annotations

import asyncio
import contextlib
from concurrent.futures import ThreadPoolExecutor

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
    # Cap the default executor, which is what every `asyncio.to_thread` in the
    # routes uses. Python's default is min(32, cores+4) threads; a page render
    # peaks at ~240 MB (pixmap + PIL copy), so a handful of concurrent heavy
    # requests OOM-kill a 512 MB instance. Excess requests queue instead.
    executor = ThreadPoolExecutor(
        max_workers=settings.HEAVY_CONCURRENCY, thread_name_prefix="tool"
    )
    asyncio.get_running_loop().set_default_executor(executor)
    task = asyncio.create_task(_loop())
    try:
        yield
    finally:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task
        executor.shutdown(wait=False)
