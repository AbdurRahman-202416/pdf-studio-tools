from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.tools_routes import router as tools_router
from app.core.cleanup import cleanup_lifespan
from app.core.config import settings
from app.core.logging import AccessLogMiddleware, setup_logging
from app.middleware.errors import register_error_handlers
from app.middleware.security import (
    BodySizeLimitMiddleware,
    ConcurrencyLimitMiddleware,
    RateLimitMiddleware,
    SecurityHeadersMiddleware,
)


def _scrub_sensitive(event, _hint):
    """Sentry before_send: never ship password form fields or raw request bodies."""
    with_request = event.get("request")
    if isinstance(with_request, dict):
        with_request.pop("data", None)
        with_request.pop("cookies", None)
    return event


def create_app() -> FastAPI:
    setup_logging()
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk  # type: ignore[import-not-found]

            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                environment=settings.ENVIRONMENT,
                traces_sample_rate=0.1,
                send_default_pii=False,
                before_send=_scrub_sensitive,
                # Frame locals include `password` and raw document bytes on any
                # 500 in the lock/unlock/edit paths - never ship them.
                include_local_variables=False,
            )
        except ImportError:  # pragma: no cover — sentry is optional
            pass
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        summary="Stateless PDF toolkit: merge, compress, OCR, sign, convert PDF <-> Word/Excel/Image, lock/unlock, ID cards, passport photos.",
        description=(
            "All operations are stateless from the caller's perspective: upload, "
            "process, download, done. Files auto-delete from the server after "
            "`FILE_TTL_SECONDS` (default 1 hour) via the cleanup lifespan task; "
            "no signup, no auth.\n\n"
            "### Two URL families\n"
            "- **`/api/*` (workspace)** - upload a PDF once, then operate on its "
            "`file_id` (metadata, thumbnails, merge, split, rotate, compress).\n"
            "- **`/api/tools/*` (one-shot tools)** - upload a file *with* the operation "
            "in a single POST, get back an `output_id` for download.\n\n"
            "### Downloading results\n"
            "Workspace results: `GET /api/download/{output_id}` (PDF only).\n"
            "Tool results (PDF, XLSX, DOCX, ZIP, JPG, PNG): "
            "`GET /api/tools/download/{output_id}?name=<suggested>`.\n\n"
            "### Previewing results without downloading\n"
            "`GET /api/tools/preview/{output_id}` is content-type aware: PDFs render to PNG "
            "(supports `?page=N&w=900`, exposes `X-Page-Count` header); XLSX returns JSON "
            "with the first 10 rows; ZIP renders the first image inside.\n\n"
            "### Limits\n"
            "Max upload `MAX_UPLOAD_MB` (default 100 MB). Rate limits applied per-IP when "
            "`RATE_LIMIT_ENABLED=true`."
        ),
        openapi_tags=[
            {
                "name": "workspace",
                "description": "Upload-once workflow. Operate on a PDF by `file_id` across multiple calls before downloading.",
            },
            {
                "name": "tools-convert",
                "description": "One-shot format conversions: PDF <-> JPG / PNG / Word / Excel.",
            },
            {
                "name": "tools-compress",
                "description": "PDF size reduction: by quality level or to a target file size.",
            },
            {
                "name": "tools-security",
                "description": "Add or remove a password on a PDF (AES-256).",
            },
            {
                "name": "tools-ocr",
                "description": "Tesseract-backed OCR for scanned PDFs. 100+ language packs supported.",
            },
            {
                "name": "tools-images",
                "description": "Image-to-PDF helpers: ID card front+back, passport photos.",
            },
            {
                "name": "tools-sign",
                "description": "Place a drawn signature image onto a PDF page.",
            },
            {
                "name": "tools-system",
                "description": "Download and preview endpoints shared by every tool.",
            },
            {
                "name": "system",
                "description": "Health check and root.",
            },
        ],
        lifespan=cleanup_lifespan,
    )

    app.add_middleware(AccessLogMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(BodySizeLimitMiddleware, max_bytes=settings.max_upload_bytes)
    app.add_middleware(ConcurrencyLimitMiddleware, max_inflight=settings.MAX_HEAVY_INFLIGHT)
    if settings.RATE_LIMIT_ENABLED:
        app.add_middleware(
            RateLimitMiddleware,
            default_per_minute=settings.RATE_LIMIT_DEFAULT_PER_MIN,
            heavy_per_minute=settings.RATE_LIMIT_HEAVY_PER_MIN,
        )
    # Added LAST so it is the OUTERMOST layer. Starlette wraps in reverse
    # order; with CORS innermost, the 413/429 responses from the size and
    # rate-limit middleware carried no Access-Control-Allow-Origin, so the
    # browser hid them and the frontend saw an opaque network error instead
    # of "file too large".
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition", "X-Page-Count"],
    )

    register_error_handlers(app)
    app.include_router(api_router, prefix="/api")
    app.include_router(tools_router, prefix="/api")

    @app.get("/", tags=["system"], summary="Root", description="Returns the app name and version. Useful for uptime checks.")
    async def root():
        return {"app": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()
