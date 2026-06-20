# PDF Studio

**The all-in-one PDF toolkit. Free, fast, watermark-free.**
Compress, merge, convert, sign, lock, and OCR — **18 tools**, no signup, no daily limit, files auto-delete in 1 hour. Works with English, Bangla, Arabic, CJK, and 100+ languages.

🌐 Frontend `:3000` · API `:8000` · OpenAPI docs at `/docs`

---

## Overview

PDF Studio is a two-service monorepo. All PDF processing happens **server-side**; the browser only handles upload, drag/reorder, and previews.

| Layer | Stack |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind v4, Zustand, Framer Motion, React Dropzone, @dnd-kit, sonner, lucide-react |
| **Backend** | Python 3.9, FastAPI, PyMuPDF (`fitz`), pypdf, Pillow, pytesseract (Tesseract), openpyxl, pdfplumber |
| **Branding** | Dynamic favicon + Apple touch icon via `next/og` `ImageResponse`; shared gradient `<Logo>` |
| **Growth** | MDX blog, **6** `/vs/{competitor}` comparison pages, public roadmap, embeddable `/widget/*` routes, dynamic OG image generator, Plausible analytics, email capture, UTM-attribution proxy, social share buttons |
| **Testing** | Playwright E2E (frontend) + pytest service tests (backend) |
| **Deploy** | VPS / nginx / Vercel / Fly.io / Railway — see [DEPLOY.md](./DEPLOY.md) |

**Deep dives:** [frontend/README.md](./frontend/README.md) · [backend/README.md](./backend/README.md) · agent notes in [CLAUDE.md](./CLAUDE.md) and [frontend/AGENTS.md](./frontend/AGENTS.md).

> ⚠️ **Next.js 16 note:** this repo uses `proxy.ts` (not `middleware.ts`) and per-route CSP via `headers()` in `next.config.ts`. See [CLAUDE.md](./CLAUDE.md) before editing Next internals.

---

## Tools

Each tool lives at a clean, keyword-led slug (e.g. `/compress-pdf`). Legacy `/tools/<old-slug>` URLs still resolve for backwards compatibility. The full catalog is registry-driven from [`frontend/lib/seo/tool-registry.ts`](./frontend/lib/seo/tool-registry.ts) — the single source of truth for routes, metadata, FAQs, HowTo steps, and JSON-LD.

| Tool | Route | What it does |
|---|---|---|
| Compress PDF | `/compress-pdf` | Outcome-based compression (email / WhatsApp / govt portal / best quality) |
| Compress PDF to 100KB | `/compress-pdf-to-100kb` | Exact target size for govt forms & strict portals |
| Compress PDF to 200KB | `/compress-pdf-to-200kb` | Target size that keeps scans legible |
| Compress PDF to 500KB | `/compress-pdf-to-500kb` | Shrink heavy/image PDFs under 500KB |
| Compress PDF to 1MB | `/compress-pdf-to-1mb` | Get any PDF under 1MB, near-original quality |
| Merge PDF | `/merge-pdf` | Combine PDFs with drag-reorder across files |
| PDF → JPG / PNG | `/pdf-to-jpg` | Export pages at 150 / 220 / 300 DPI |
| JPG → PDF | `/jpg-to-pdf` | Turn images into a single shareable PDF |
| Password Protect PDF | `/lock-pdf` | Add AES-256 encryption |
| Unlock PDF | `/unlock-pdf` | Remove a known password |
| PDF OCR | `/pdf-ocr` | Extract text in 100+ languages (Tesseract) |
| ID Combine | `/nid-combine` | Combine two-sided ID onto one A4 page |
| Passport Photo PDF | `/passport-photo-pdf` | Tile passport/visa photos onto A4 |
| PDF → Excel | `/pdf-to-excel` | Extract tables to formatted XLSX |
| Excel → PDF | `/excel-to-pdf` | Render every sheet of an `.xlsx` to PDF |
| PDF → Word | `/pdf-to-word` | Convert a PDF to editable `.docx` |
| Word → PDF | `/word-to-pdf` | Convert `.docx` to PDF, formatting preserved |
| Sign PDF | `/sign-pdf` | Draw a signature and place it on any page |

**Workspace** (`/workspace`) is a multi-file canvas for merge / compress / split / rotate with per-page selection and drag-reorder across documents.

---

## Features

- Drag & drop multi-file upload; per-page selection + drag-reorder across files
- Outcome-based **and** exact target-size PDF compression (50KB → 2MB)
- AES-256 lock / unlock
- 100+ language OCR with text-layer fallback
- Result previews for every tool — PDFs render as paginated images, JPG/PNG inline, ZIPs preview their first image, XLSX shows a scrollable table of the first 10 rows
- Files auto-expire 1 hour after upload
- **No watermark, no signup, no daily limit**
- Dark mode, fully mobile-responsive
- Recent-output history (localStorage)
- Dynamic favicon + Apple touch icon (`/icon`, `/apple-icon`), generated server-side
- WhatsApp / Twitter / Facebook share buttons on every result
- Footer email capture with optional Google Sheets webhook
- UTM-attribution cookies (30 days) via Next.js `proxy.ts`
- Embeddable bare-chrome tool widgets at `/widget/*` for third-party iframes

---

## Local development

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt   # pytest, etc. (optional)
cp .env.example .env                  # optional — edit for production
uvicorn app.main:app --reload --port 8000
# or: ./run.sh   (creates venv + installs + runs in one shot)
```

OpenAPI explorer: <http://localhost:8000/docs>.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local            # adjust if backend is remote
npm run dev                           # Turbopack dev server on :3000
```

Open <http://localhost:3000>.

### Docker (full stack)

```bash
docker compose up --build
```

Frontend at <http://localhost:3000>, backend at <http://localhost:8000>. For production, see [DEPLOY.md](./DEPLOY.md).

---

## Frontend ↔ backend contract

- The backend mounts everything under `/api`. `NEXT_PUBLIC_API_BASE_URL` **includes** `/api` (default `http://127.0.0.1:8000/api`), so frontend service code uses bare paths like `/upload`, `/tools/pdf-to-jpg`.
- The browser reads the `X-Page-Count` response header on preview requests — it **must** stay in the backend CORS `expose_headers` for cross-origin pagination.

## API surface

Everything is mounted under `/api`. Workspace endpoints live in `app/api/routes.py`; tool endpoints (prefix `/api/tools`) in `app/api/tools_routes.py`.

### Workspace & files

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Upload one PDF (multipart, streamed, size-capped) |
| GET | `/api/files/{id}/metadata` | Metadata + page sizes |
| GET | `/api/files/{id}/thumbnail/{page}` | PNG thumbnail (`?w=`) |
| GET | `/api/files/{id}/raw` | Raw PDF stream |
| DELETE | `/api/files/{id}` | Delete uploaded file |
| POST | `/api/merge` | Merge selected pages |
| POST | `/api/compress` | Compress at `low / medium / high` |
| POST | `/api/rotate` | Rotate specific pages |
| POST | `/api/split` | Extract page ranges |
| GET | `/api/download/{output_id}` | Download processed PDF |

### Tools (`/api/tools`)

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/tools/compress/target-size` | Compress to an exact size target (50KB–2MB) |
| POST | `/api/tools/compress/quick` | Quick single-pass compression |
| POST | `/api/tools/pdf-to-jpg` | Convert PDF pages to JPG / PNG |
| POST | `/api/tools/jpg-to-pdf` | Images → single PDF |
| POST | `/api/tools/pdf/lock` | Lock with AES-256 password |
| POST | `/api/tools/pdf/unlock` | Remove a known password |
| POST | `/api/tools/id-card/combine` | ID card front + back → A4 |
| POST | `/api/tools/photo/to-pdf` | Passport/visa photo → A4 PDF |
| GET | `/api/tools/ocr/status` | OCR engine readiness |
| POST | `/api/tools/ocr/extract` | OCR extract text (100+ languages) |
| POST | `/api/tools/pdf-table/to-excel` | PDF table → XLSX |
| POST | `/api/tools/excel/to-pdf` | XLSX → PDF |
| POST | `/api/tools/pdf-to-word` | PDF → editable `.docx` |
| POST | `/api/tools/word-to-pdf` | `.docx` → PDF |
| POST | `/api/tools/sign-pdf` | Place a drawn signature onto a page |
| GET | `/api/tools/download/{output_id}` | Download any tool output (pdf/xlsx/zip/jpg/png) |
| GET | `/api/tools/preview/{output_id}` | Preview a result: PNG for PDF/JPG/PNG/ZIP, JSON for XLSX. Supports `?page=N&w=900`; returns `X-Page-Count` for PDFs |

---

## Testing

```bash
# Frontend E2E (spins up its own backend :8001 + frontend :3100)
cd frontend
npx playwright install --with-deps     # first time only
npm run test:e2e

# Backend service tests
cd backend && source .venv/bin/activate
pytest
```

Playwright starts the servers automatically (`playwright.config.ts > webServer`); its web server activates `backend/.venv`, so the venv must exist first.

---

## Security

- Strict MIME **and** `%PDF` magic-byte validation on every upload
- Streamed `/api/upload` aborts and unlinks once it crosses `MAX_UPLOAD_MB` (default 100 MB)
- `output_id` is UUID-validated before any filesystem lookup; download filenames are sanitized (no `/` or `\`)
- Temporary storage with TTL-based background cleanup (default 15-min cadence, 1-hour file TTL) inside the FastAPI lifespan — no external cron
- CORS allowlist via `CORS_ORIGINS_RAW`; the backend **refuses to start in production with an empty allowlist** (intentional fail-closed guard)
- PDF lock uses AES-256 (pypdf 5.x)
- Heavy CPU work (PyMuPDF / Pillow / Tesseract / pdfplumber) runs via `asyncio.to_thread` so it never blocks the event loop

---

## Performance & SEO

- Next.js standalone output (`BUILD_STANDALONE=true`) → small Docker image
- **Registry-driven SEO:** per-page `<title>` / meta / canonical / OG / Twitter cards generated from the tool registry
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` auto-generated; new tools and `/vs` pages self-index
- **JSON-LD:** WebApplication + Organization (home), SoftwareApplication + FAQPage + HowTo + BreadcrumbList (tool pages), BlogPosting + BreadcrumbList (blog), Article + BreadcrumbList (`/vs` pages)
- Dynamic OG images (1200×630) generated on the fly at `/og`
- All tool pages target long-tail keywords; competitor comparison pages target commercial-investigation intent (Smallpdf, iLovePDF, Adobe Acrobat, PDF24, Sejda, Nitro)
- Files auto-delete from storage 1 hour after upload

---

## Environment variables

See [README env notes in CLAUDE.md](./CLAUDE.md) and [DEPLOY.md](./DEPLOY.md). Most likely to bite locally:

- Backend won't start in production without `CORS_ORIGINS_RAW` (intentional).
- `NEXT_PUBLIC_API_BASE_URL` must include `/api`.
- `BUILD_STANDALONE=true` is required for the Docker image to emit `.next/standalone/`; Vercel builds leave it off.
- `NEXT_PUBLIC_SITE_URL` drives `metadataBase`, canonicals, sitemap, and OG image URLs.

---

_Built by [Abdur Rahman](https://github.com/AbdurRahman-202416). Free, fast, private PDF tools — for everyone, everywhere._
