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

# Per-IP request log: deque of timestamps for sliding-window math.
_HITS: dict[str, deque[float]] = {}
_LOCK = asyncio.Lock()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Append a tight default header set to every response."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        response = await call_next(request)
        # Defensive defaults — frontend renders API responses, never UIs,
        # so no inline JS/CSS is required on the API itself.
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

        ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
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
