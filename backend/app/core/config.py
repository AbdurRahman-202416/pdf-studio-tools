from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

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
