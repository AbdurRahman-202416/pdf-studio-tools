# PDF Studio

The all-in-one PDF toolkit. Free, fast, watermark-free.
Compress, merge, convert, sign, lock, OCR — 9 tools, no signup, no daily limit, files auto-delete in 1 hour.

- **Frontend**, Next.js 16 (App Router), TypeScript, Tailwind v4, Zustand, Framer Motion, React Dropzone, @dnd-kit, sonner, lucide-react
- **Backend**, Python 3, FastAPI, PyMuPDF (`fitz`), pypdf, Pillow, pytesseract, openpyxl, pdfplumber
- **Branding**, dynamic favicon + Apple touch icon generated via `next/og` `ImageResponse`, custom `<Logo>` SVG component
- **Growth**, MDX blog, `/vs/{competitor}` comparison pages, public roadmap, embeddable `/widget/*` routes, OG image generator, Plausible analytics, email capture, UTM-attribution proxy, WhatsApp/Twitter/Facebook share buttons
- **Testing**, Playwright E2E (frontend)
- **Deploy**, see [DEPLOY.md](./DEPLOY.md) for VPS / nginx / Vercel+Fly options
- **Deep dives**, [frontend/README.md](./frontend/README.md) and [backend/README.md](./backend/README.md)

## Tools

| Tool | Route | What it does |
|---|---|---|
| Compress PDF | `/tools/compress-pdf-without-losing-quality` | Three compression presets, preserves quality |
| Merge PDF | `/tools/merge-large-pdf-files-online` | Combine PDFs with drag-reorder across files |
| PDF → JPG / PNG | `/tools/pdf-to-jpg-high-quality` | Export pages at 150 / 220 / 300 DPI |
| Password Protect PDF | `/tools/password-protect-pdf-online` | Add AES-256 encryption |
| Unlock PDF | `/tools/unlock-pdf-with-password-online` | Remove a known password |
| PDF OCR | `/tools/pdf-ocr-online-free` | Extract text in 100+ languages (Tesseract) |
| ID Card to PDF | `/tools/id-card-to-pdf` | Combine two-sided IDs onto A4 |
| Passport Photo to PDF | `/tools/passport-photo-to-pdf` | Auto-arrange passport/visa photos |
| PDF Table to Excel | `/tools/pdf-to-excel-converter` | Extract tables to XLSX |

## Features

- Drag & drop multi-file PDF upload
- Per-page selection + drag-reorder across files
- 3-level compression (Light / Balanced / Maximum)
- AES-256 lock / unlock
- 100+ language OCR with text-layer fallback
- Result previews (PDF / JPG / PNG / ZIP / XLSX)
- Files auto-expire in 1 hour
- No watermark, no signup, no daily limit
- Dark mode, mobile-responsive
- SEO-ready: per-page meta, sitemap, robots, manifest, FAQ schema, JSON-LD
- Recent output history (localStorage)
- **Result preview** for every tool: PDFs render as paginated images, JPG/PNG show inline, ZIPs preview their first image, XLSX previews show a scrollable table with the first 10 rows
- **Dynamic favicon** + Apple touch icon (`/icon`, `/apple-icon`) generated server-side
- WhatsApp / Twitter / Facebook share buttons on every result
- Footer email capture with optional Google Sheets webhook
- UTM-attribution cookies (30 days) via Next.js `proxy.ts`

## Local development

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env             # optional — edit for production
uvicorn app.main:app --reload --port 8000
```

The OpenAPI explorer is at <http://localhost:8000/docs>.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local       # adjust if backend is remote
npm run dev
```

Open <http://localhost:3000>.

## Docker

```bash
docker compose up --build
```

Frontend at <http://localhost:3000>, backend at <http://localhost:8000>.

For production, see [DEPLOY.md](./DEPLOY.md).

## API surface

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Upload one PDF (multipart) |
| GET | `/api/files/{id}/metadata` | Metadata + page sizes |
| GET | `/api/files/{id}/thumbnail/{page}` | PNG thumbnail (`?w=`) |
| GET | `/api/files/{id}/raw` | Raw PDF stream |
| DELETE | `/api/files/{id}` | Delete uploaded file |
| POST | `/api/merge` | Merge selected pages |
| POST | `/api/compress` | Compress at `low / medium / high` |
| POST | `/api/rotate` | Rotate specific pages |
| POST | `/api/split` | Extract page ranges |
| GET | `/api/download/{output_id}` | Download processed PDF |
| POST | `/api/tools/pdf-to-jpg` | Convert PDF pages to JPG / PNG |
| POST | `/api/tools/pdf/lock` | Lock with AES-256 password |
| POST | `/api/tools/pdf/unlock` | Remove password |
| POST | `/api/tools/id-card/combine` | ID card front + back → A4 |
| GET | `/api/tools/ocr/status` | OCR engine readiness |
| POST | `/api/tools/ocr/extract` | OCR extract text |
| POST | `/api/tools/pdf-table/to-excel` | PDF table → XLSX |
| POST | `/api/tools/photo/to-pdf` | Photo → A4 PDF |
| GET | `/api/tools/download/{output_id}` | Download any tool output (pdf/xlsx/zip/jpg/png) |
| GET | `/api/tools/preview/{output_id}` | Preview a generated result: PNG for PDF/JPG/PNG/ZIP, JSON for XLSX. Supports `?page=N&w=900`; returns `X-Page-Count` header for PDFs |

## Testing

```bash
cd frontend
npx playwright install --with-deps    # first time only
npm run test:e2e
```

Tests start the dev servers automatically (`playwright.config.ts > webServer`).

## Security

- Strict MIME + magic-byte validation on every upload
- Filename sanitization on download
- Configurable max upload (default 100 MB)
- Temporary storage with TTL-based background cleanup (15-minute cadence)
- CORS allowlist via `CORS_ORIGINS_RAW` env var; refuses to start in production with empty allowlist
- PDF lock uses AES-256 (pypdf 5.x)

## Performance & SEO

- Next.js standalone output → small Docker image
- Per-page meta + canonical + OG + Twitter cards
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` auto-generated
- JSON-LD: WebApplication + Organization on home, FAQPage on home FAQ
- All tool pages target long-tail keywords with per-page meta + canonical
- Files auto-delete from storage after 1 hour
# pdf-studio-tools
