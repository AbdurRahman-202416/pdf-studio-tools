from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import logger
from app.services.pdf_service import PDFError


def register_error_handlers(app) -> None:
    @app.exception_handler(PDFError)
    async def handle_pdf_error(request: Request, exc: PDFError):
        logger.warning("PDF error on %s: %s", request.url.path, exc)
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(FileNotFoundError)
    async def handle_not_found(request: Request, exc: FileNotFoundError):
        return JSONResponse(status_code=404, content={"detail": "File not found"})

    @app.exception_handler(StarletteHTTPException)
    async def handle_http(request: Request, exc: StarletteHTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception):
        logger.exception("Unexpected error on %s", request.url.path)
        return JSONResponse(
            status_code=500, content={"detail": "Internal server error"}
        )
