from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Brand name. The frontend's brand.config.ts is the source of truth; this
    # only surfaces in the OpenAPI docs title. Override with APP_NAME so a
    # rename does not need a code change here.
    APP_NAME: str = "PDF Studio API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"  # development | production

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    STORAGE_DIR: Path = Path(__file__).resolve().parent.parent.parent / "storage"
    UPLOAD_DIR: Path = STORAGE_DIR / "uploads"
    OUTPUT_DIR: Path = STORAGE_DIR / "output"

    MAX_UPLOAD_MB: int = 100
    ALLOWED_MIME: tuple[str, ...] = ("application/pdf",)
    FILE_TTL_SECONDS: int = 60 * 60
    CLEANUP_INTERVAL_SECONDS: int = 15 * 60

    # Resource-exhaustion guards (PDF / decompression bombs).
    # A single crafted file can otherwise allocate multi-GB pixmaps or expand
    # a few KB of zip into gigabytes of XML. These cap the blast radius.
    MAX_PDF_PAGES: int = 500          # reject documents with more pages than this
    MAX_RENDER_PIXELS: int = 40_000_000  # ~40 MP ceiling per rasterized page
    # Size of the shared thread pool all blocking tool work runs in. Each
    # rasterizing request can peak at ~240 MB, so this is effectively the
    # instance's memory budget divided by that.
    HEAVY_CONCURRENCY: int = 4
    MAX_ZIP_RATIO: int = 200         # max uncompressed/compressed ratio for docx/xlsx
    MAX_ZIP_UNCOMPRESSED_MB: int = 400   # absolute cap on decompressed office-XML size

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_MB * 1024 * 1024

    @property
    def max_zip_uncompressed_bytes(self) -> int:
        return self.MAX_ZIP_UNCOMPRESSED_MB * 1024 * 1024

    # Per-IP sliding-window rate limit. Disabled in dev for tests; turn on
    # via env in production: RATE_LIMIT_ENABLED=true.
    RATE_LIMIT_ENABLED: bool = False
    RATE_LIMIT_DEFAULT_PER_MIN: int = 120
    RATE_LIMIT_HEAVY_PER_MIN: int = 30

    # Optional Sentry DSN — when set, errors are reported.
    SENTRY_DSN: str = ""

    # Comma-separated production allowlist, e.g.
    #   "https://pdfstudio.app,https://www.pdfstudio.app"
    CORS_ORIGINS_RAW: str = ""

    @property
    def cors_origins(self) -> list[str]:
        if self.CORS_ORIGINS_RAW:
            return [o.strip() for o in self.CORS_ORIGINS_RAW.split(",") if o.strip()]
        # Development fallback only.
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3100",
            "http://127.0.0.1:3100",
        ]

    @property
    def cors_origin_regex(self) -> str | None:
        if self.ENVIRONMENT == "production":
            return None
        return r"https?://(localhost|127\.0\.0\.1)(:\d+)?"


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

if settings.ENVIRONMENT == "production" and not settings.CORS_ORIGINS_RAW:
    import sys

    print(
        "FATAL: ENVIRONMENT=production but CORS_ORIGINS_RAW is empty. "
        "Set it to a comma-separated allowlist (or run behind a same-origin reverse proxy and set it to that origin).",
        file=sys.stderr,
    )
    raise SystemExit(2)
