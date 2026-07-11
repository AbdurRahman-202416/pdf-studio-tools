"""Security headers + lightweight in-memory rate limiter.

Adds CSP/X-Frame/Referrer/HSTS-like response headers, and a per-IP
sliding-window rate limit (no external Redis required). For production
scale-out, swap the in-memory backend for Redis via slowapi.
"""
from __future__ import annotations

import asyncio
import time
from collections import deque
from typing import Awaitable, Callable

from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

# Per-IP request log: deque of timestamps for sliding-window math.
_HITS: dict[str, deque[float]] = {}
_LOCK = asyncio.Lock()


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject over-sized uploads by their declared Content-Length *before* the
    body is read into memory. This is the cheap global guard that stops a few
    parallel multi-GB POSTs to any tool endpoint from OOM-killing the box.

    Note: a hostile client can omit Content-Length and stream chunked; the
    per-endpoint capped read is the backstop for that. Standard browsers and
    HTTP clients always send Content-Length on multipart uploads.
    """

    def __init__(self, app: FastAPI, *, max_bytes: int):
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        cl = request.headers.get("content-length")
        if cl is not None:
            try:
                if int(cl) > self.max_bytes:
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={"detail": f"Upload exceeds the {settings.MAX_UPLOAD_MB} MB limit."},
                    )
            except ValueError:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"detail": "Invalid Content-Length header."},
                )
        return await call_next(request)


_DOCS_PATHS = ("/docs", "/redoc", "/openapi.json")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Append a tight default header set to every response.

    The `/docs` and `/redoc` pages are served with a relaxed CSP that allows
    Swagger UI / ReDoc to load their assets from the CDN; everything else
    keeps the locked-down `default-src 'none'`.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=63072000; includeSubDomains",
        )
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=()",
        )
        path = request.url.path
        if path in _DOCS_PATHS or path.startswith("/docs/") or path.startswith("/redoc/"):
            response.headers.setdefault(
                "Content-Security-Policy",
                # Swagger UI / ReDoc need: their bundled JS+CSS from jsdelivr,
                # FastAPI's favicon, inline init script, fetched openapi.json,
                # and a couple of inline styles. Same-origin assets stay allowed.
                "default-src 'self'; "
                "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
                "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
                "img-src 'self' data: https://fastapi.tiangolo.com; "
                "font-src 'self' https://cdn.jsdelivr.net data:; "
                "connect-src 'self'; "
                "frame-ancestors 'none'; "
                "base-uri 'self'",
            )
        else:
            response.headers.setdefault(
                "Content-Security-Policy",
                "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
            )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window per-IP rate limit.

    Defaults: 60 req / minute for non-tool endpoints, 20 req / minute for
    /tools and /upload (more expensive). Tunable via constructor.
    """

    def __init__(
        self,
        app: FastAPI,
        *,
        default_per_minute: int = 120,
        heavy_per_minute: int = 30,
        window_seconds: float = 60.0,
        heavy_prefixes: tuple[str, ...] = ("/api/tools", "/api/upload", "/api/compress", "/api/merge"),
    ):
        super().__init__(app)
        self.default = default_per_minute
        self.heavy = heavy_per_minute
        self.window = window_seconds
        self.heavy_prefixes = heavy_prefixes

    def _limit_for(self, path: str) -> int:
        for prefix in self.heavy_prefixes:
            if path.startswith(prefix):
                return self.heavy
        return self.default

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        # Always allow health.
        if request.url.path.endswith("/health") or request.method == "OPTIONS":
            return await call_next(request)

        # Use the RIGHTMOST X-Forwarded-For entry (the address our own proxy
        # observed and appended) rather than the leftmost, which is
        # client-supplied and trivially spoofable to evade the limit.
        xff = request.headers.get("X-Forwarded-For", "")
        ip = (
            xff.split(",")[-1].strip()
            or (request.client.host if request.client else "anon")
        )
        limit = self._limit_for(request.url.path)
        now = time.monotonic()
        cutoff = now - self.window

        async with _LOCK:
            hits = _HITS.setdefault(ip, deque())
            while hits and hits[0] < cutoff:
                hits.popleft()
            if len(hits) >= limit:
                retry_after = max(1, int(self.window - (now - hits[0])))
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": f"Rate limit exceeded; retry in {retry_after}s"},
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)

        return await call_next(request)
