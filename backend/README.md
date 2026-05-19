# PDF Studio, Backend

FastAPI service that powers every PDF Studio tool.

## Stack

- **FastAPI** with an async lifespan (background cleanup task)
- **Python 3.9+** (`from __future__ import annotations` everywhere for PEP 604 union syntax on 3.9)
- **PyMuPDF** (`fitz`) for rendering, page extraction, thumbnails, compression
- **pypdf** 5.x for AES-256 lock / unlock
- **Pillow** for image handling
- **pytesseract** + Tesseract for 100+ language OCR
- **openpyxl** + **pdfplumber** for bank statement extraction
- **uvicorn** for serving

## Quick start

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

OpenAPI explorer at <http://localhost:8000/docs>.

## System deps

Tesseract + language data must be installed at the OS level:

```bash
# macOS (includes all language packs)
brew install tesseract tesseract-lang

# Debian/Ubuntu / Docker base image (add packs as needed, e.g. eng spa fra deu)
apt-get install -y tesseract-ocr tesseract-ocr-eng tesseract-ocr-spa tesseract-ocr-fra
```

The bundled `Dockerfile` installs 15 common language packs.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `ENVIRONMENT` | `development` | Set to `production` to require `CORS_ORIGINS_RAW` at startup |
| `HOST` | `0.0.0.0` | Bind host |
| `PORT` | `8000` | Bind port |
| `MAX_UPLOAD_MB` | `100` | Per-file upload limit |
| `FILE_TTL_SECONDS` | `3600` | Files purged after this many seconds |
| `CLEANUP_INTERVAL_SECONDS` | `900` | How often the background cleanup runs |
| `CORS_ORIGINS_RAW` | `""` | Comma-separated allowlist. **Required in production** (process refuses to start otherwise) |
| `STORAGE_DIR` | `./storage` | Where uploads/output land |

## Project layout

```
app/
  main.py                     create_app(), CORS, middleware, routers, lifespan
  core/
    config.py                 pydantic-settings, env loading, CORS guard
    logging.py                setup_logging() + AccessLogMiddleware
    cleanup.py                async lifespan, runs cleanup_expired() every 15 min
  api/
    routes.py                 workspace endpoints (/upload, /merge, /compress, ...)
    tools_routes.py           tool endpoints + preview endpoint
  middleware/errors.py        global exception handlers
  services/
    pdf_service.py            merge, compress, rotate, split, thumbnails
    pdf_image_service.py      pdf -> jpg / png / zip
    pdf_lock_service.py       AES-256 lock / unlock
    id_card_service.py        ID card front+back -> A4
    pdf_table_service.py      PDF table -> xlsx
    ocr_service.py            100+ language OCR
    photo_service.py          passport / stamp photo -> A4
    filename_registry.py      file_id -> original filename map (thread-safe)
  utils/storage.py            id generation, upload/output paths, find_*()
  models/schemas.py           pydantic request/response models
storage/
  uploads/                    incoming PDFs, TTL'd
  output/                     generated files, TTL'd
```

## HTTP surface

Mounted under `/api`. See the root README for the full table. Highlights:

- `POST /api/upload`, streams to disk in 1 MB chunks (workspace path)
- Tool endpoints (`/api/tools/*`) buffer in memory then dispatch to thread pool via `asyncio.to_thread`
- `GET /api/tools/preview/{output_id}`, content-type aware:
  - `.pdf` -> `image/png`, `?page=N&w=900`, returns `X-Page-Count` header (browser reads it via CORS `expose_headers`)
  - `.jpg`/`.jpeg`/`.png` -> `image/png` (resized to width)
  - `.zip` -> `image/png` of the first image inside
  - `.xlsx` -> `application/json` with columns + first 10 rows + total row count
  - `Cache-Control: public, max-age=300`

## Safety / hardening

- **Upload validation**: MIME check + PDF magic-byte (`%PDF`) check on every endpoint that accepts files
- **Size cap**: streamed upload aborts and unlinks the file once it crosses `MAX_UPLOAD_MB`
- **Filename sanitization** on download (forbids `/` and `\\`); UUID-style validator on `output_id` before any filesystem lookup
- **TTL cleanup**: `cleanup_lifespan` runs `cleanup_expired()` every 15 min during the app lifetime
- **CORS guard**: production startup raises `SystemExit(2)` if `CORS_ORIGINS_RAW` is empty (see `core/config.py`)
- **Lock service**: AES-256 via pypdf 5.x
- **Encrypted preview skipped**: locked PDFs never go through the preview rasterizer (frontend gates it)

## Concurrency notes

Tool routes call `asyncio.to_thread(...)` so PyMuPDF / Pillow / Tesseract / pdfplumber run on the default thread pool without blocking the event loop. There is no global concurrency cap yet, see "production-hardening" TODO in the root README.

## Production checklist

- Set `ENVIRONMENT=production`
- Set `CORS_ORIGINS_RAW=https://yourdomain.com,https://www.yourdomain.com`
- Reduce `MAX_UPLOAD_MB` from 100 to ~25 for public deployments
- Put nginx or Cloudflare in front of the FastAPI process
- Mount `storage/` on a writable volume that survives container restarts
- Run behind a process manager (systemd, supervisord) or use the Docker image with `--restart unless-stopped`

See [DEPLOY.md](../DEPLOY.md) for the full deployment guide.
