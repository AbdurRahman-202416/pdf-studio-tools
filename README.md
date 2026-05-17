# PDF Studio

A production-ready PDF toolkit web app: merge, compress, convert, lock, OCR.
Built for Bangladesh, free for everyone.

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
| Merge & Compress | `/workspace` | Drag, drop, reorder, merge selected pages, compress at 3 levels |
| PDF → JPG / PNG | `/tools/pdf-to-jpg` | Export pages as JPG/PNG (single image or ZIP) at 150 / 220 / 300 dpi |
| Lock / Unlock PDF | `/tools/pdf-lock` | Add or remove AES-256 password protection |
| NID Combiner | `/tools/nid-combine` | Front + back of Bangladesh NID on a single A4 print-ready PDF |
| Bangla OCR | `/tools/bangla-ocr` | Extract Bangla + English text from scanned PDFs (Tesseract) |
| Bank Statement → Excel | `/tools/bank-to-excel` | Convert BD bank statement PDFs into XLSX |
| Passport Photo PDF | `/tools/photo-to-pdf` | Auto-arrange passport / visa photos on A4 |
| Govt Forms | `/tools/govt-forms` | Pre-loaded e-TIN / NID correction / birth-cert / police-clearance templates |

## Features

- Drag & drop multi-file PDF upload with progress
- Page thumbnails with lazy loading
- Per-page selection (individual / all / clear)
- Drag-and-drop reorder across files
- 3-level compression (Light / Balanced / Maximum)
- AES-256 password lock / unlock
- PDF to high-quality JPG / PNG (ZIP for multi-page)
- Bangla & English OCR with smart text-layer fallback
- Bank statement → Excel
- Light / Dark / System theme with no flash
- Mobile-responsive with drawer nav
- SEO-ready: per-page meta, sitemap, robots, manifest, FAQ schema, JSON-LD
- Recent output history (localStorage)
- Files auto-expire after 1 hour (periodic background cleanup)
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
| POST | `/api/tools/nid/combine` | NID front + back → A4 |
| GET | `/api/tools/ocr/status` | OCR engine readiness |
| POST | `/api/tools/ocr/extract` | OCR extract text |
| POST | `/api/tools/bank/to-excel` | Bank PDF → XLSX |
| POST | `/api/tools/photo/to-pdf` | Photo → A4 PDF |
| GET | `/api/tools/forms` | List form templates |
| GET | `/api/tools/forms/{id}` | Form fields detail |
| POST | `/api/tools/forms/render` | Fill and render a form |
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
- All tool pages target BD-specific keywords in English + Bangla
- Files auto-delete from storage after 1 hour
