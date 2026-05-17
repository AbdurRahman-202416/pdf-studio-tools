from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.tools_routes import router as tools_router
from app.core.cleanup import cleanup_lifespan
from app.core.config import settings
from app.core.logging import AccessLogMiddleware, setup_logging
from app.middleware.errors import register_error_handlers


def create_app() -> FastAPI:
    setup_logging()
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=cleanup_lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition", "X-Page-Count"],
    )
    app.add_middleware(AccessLogMiddleware)

    register_error_handlers(app)
    app.include_router(api_router, prefix="/api")
    app.include_router(tools_router, prefix="/api")

    @app.get("/")
    async def root():
        return {"app": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()
