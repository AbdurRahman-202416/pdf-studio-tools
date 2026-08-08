# PDF Studio

**Every file tool you need. Free, fast, watermark-free.**

**58 tools** for PDFs, images, colours, data and code — no signup, no daily limit, no watermark.
**29 of them run entirely in your browser** and never upload anything at all.

🌐 Frontend `:3000` · API `:8000` · OpenAPI docs at `http://127.0.0.1:8000/docs`

> The product name lives in exactly one file — [`frontend/brand.config.ts`](./frontend/brand.config.ts).
> Change it there and it updates everywhere. See [Renaming the product](#renaming-the-product).

---

## Table of contents

- [What this is](#what-this-is)
- [The tool catalogue](#the-tool-catalogue)
- [Quick start](#quick-start)
- [Running with Docker](#running-with-docker)
- [Architecture](#architecture)
- [Adding a new tool](#adding-a-new-tool)
- [Renaming the product](#renaming-the-product)
- [Libraries used, and why](#libraries-used-and-why)
- [API reference](#api-reference)
- [Environment variables](#environment-variables)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Deployment](#deployment)

---

## What this is

A two-service monorepo:

| Layer | Stack |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind v4 |
| **Backend** | Python 3.9, FastAPI, PyMuPDF, Pillow, Tesseract, pdfplumber |
| **Deploy** | Vercel / Render / Docker Compose / any VPS — see [DEPLOY.md](./DEPLOY.md) |

The defining architectural idea is the **runtime split**. Every tool declares whether it runs on the
client or the server:

- **`runtime: "client"`** — Canvas, WebCrypto and pure JS. The file never leaves the device, the
  tool works offline once loaded, and it costs nothing to run. 29 tools.
- **`runtime: "server"`** — posts to FastAPI. Used only where the browser genuinely cannot do the
  job: PDF manipulation, OCR, Office conversion, HEIC decoding. 29 tools.

Server-side uploads and their results are deleted **one hour** after processing by a background
cleanup task. Nothing is stored permanently, and there are no accounts.

**Deep dives:** [frontend/README.md](./frontend/README.md) · [backend/README.md](./backend/README.md) ·
agent conventions in [CLAUDE.md](./CLAUDE.md) and [frontend/AGENTS.md](./frontend/AGENTS.md) ·
strategy and architecture in [docs/](./docs).

> ⚠️ **Next.js 16 note:** this repo uses `proxy.ts` (not `middleware.ts`) and per-route CSP via
> `headers()` in `next.config.ts`. Read [CLAUDE.md](./CLAUDE.md) before touching Next internals.

---

## The tool catalogue

Every tool lives at a clean root slug (`/compress-pdf`). Legacy `/tools/<old-slug>` URLs still
308-redirect. Domain hubs group them: `/pdf`, `/image`, `/developer`, `/text`, `/data`, `/color`,
`/security`, `/convert`. Press <kbd>⌘K</kbd> (or <kbd>/</kbd>) anywhere to search all 58.

### 📄 PDF — 28 tools (server)

| Tool | Route | What it does |
|---|---|---|
| Compress PDF | `/compress-pdf` | Pick the destination (Gmail / WhatsApp / portal), not a vague quality level |
| Compress to 100KB · 200KB · 500KB · 1MB | `/compress-pdf-to-*` | Exact target sizes for strict upload limits |
| Merge PDF | `/merge-pdf` | Combine files with drag-reorder across documents |
| Split PDF | `/split-pdf` | Extract a range, or burst into one file per page |
| Rotate PDF | `/rotate-pdf` | Written into the file, so it stays upright in every reader |
| Delete PDF Pages | `/delete-pdf-pages` | Drop pages by number, in one pass |
| **Organize PDF** | `/organize-pdf` | Reorder, subset, duplicate or reverse (`3,1,2` · `2,4` · `10-1`) |
| **Watermark PDF** | `/watermark-pdf` | Tiled or centred, with opacity and angle |
| **Add Page Numbers** | `/add-page-numbers` | Six positions, custom format `Page {n} of {total}`, skip cover |
| **Crop PDF** | `/crop-pdf` | Trims the CropBox — nothing re-rendered, text stays selectable |
| **Flatten PDF** | `/flatten-pdf` | Bakes forms and annotations into the page |
| **Redact PDF** | `/redact-pdf` | **Deletes** the characters — not a black box over them |
| **Repair PDF** | `/repair-pdf` | Rebuilds a broken cross-reference table |
| PDF ↔ JPG/PNG | `/pdf-to-jpg` · `/jpg-to-pdf` | DPI control, ZIP output for multi-page |
| PDF ↔ Word | `/pdf-to-word` · `/word-to-pdf` | Paragraphs, tables and inline images preserved |
| PDF ↔ Excel | `/pdf-to-excel` · `/excel-to-pdf` | Table detection into `.xlsx`, and back |
| PDF OCR | `/pdf-ocr` | Tesseract 5, 100+ languages; pages with real text are read directly |
| Password Protect / Unlock | `/lock-pdf` · `/unlock-pdf` | AES-256 |
| Sign PDF | `/sign-pdf` | Draw, place and flatten a signature |
| ID Combine · Passport Photo | `/nid-combine` · `/passport-photo-pdf` | Region-specific (BD/IN), surfaced by locale |

### 🖼 Image — 12 tools (11 client, 1 server)

`/compress-image` · `/resize-image` · `/crop-image` · `/watermark-image` · `/jpg-to-png` ·
`/png-to-jpg` · `/webp-converter` · `/image-to-ico` · `/qr-code-generator` · `/barcode-generator` ·
`/qr-scanner` · `/heic-to-jpg`

All Canvas-based and local, **except HEIC→JPG** — no browser outside Safari can decode HEIC and the
JS decoder is ~1 MB, so that one runs on the server.

Notable: `image-to-ico` writes a genuine multi-resolution `.ico` (16/32/48/256 in one file), and the
barcode generator validates live and computes EAN/UPC check digits.

### 💻 Developer — 8 tools (client)

`/json-formatter` · `/base64-encode-decode` · `/jwt-decoder` · `/uuid-generator` · `/regex-tester` ·
`/url-encoder-decoder` · `/cron-expression-generator` · `/sql-formatter`

Nothing is transmitted, so pasting real API payloads, tokens or production SQL is safe.

### 📝 Text · 🗂 Data · 🎨 Colour · 🔐 Security · 🔁 Convert — 10 tools (client)

`/word-counter` · `/diff-checker` · `/markdown-to-html` · `/yaml-to-json` · `/csv-to-json` ·
`/color-picker` · `/color-converter` · `/password-generator` · `/hash-generator` ·
`/timestamp-converter`

---

## Quick start

### Prerequisites

| Requirement | Version | Needed for |
|---|---|---|
| **Node.js** | 20+ | Frontend |
| **Python** | 3.9+ | Backend |
| **Tesseract OCR** | 5.x | The `/pdf-ocr` tool only — everything else runs without it |

```bash
# macOS
brew install tesseract tesseract-lang

# Debian / Ubuntu
sudo apt-get install -y tesseract-ocr tesseract-ocr-ben tesseract-ocr-hin
```

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # only if you want to run tests

uvicorn app.main:app --reload --port 8000
```

Or in one shot: `./run.sh` (creates the venv, installs, runs).

✅ Check: <http://127.0.0.1:8000/api/health> → `{"status":"ok"}`
📖 Interactive API docs: <http://127.0.0.1:8000/docs>

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Open <http://localhost:3000>

Create `frontend/.env.local` if your backend isn't on the default port:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api   # note: includes /api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> The **29 client-side tools work with the backend completely stopped.** Only PDF, OCR, Office and
> HEIC tools need it.

### All commands

```bash
# frontend/
npm run dev             # Turbopack dev server, port 3000
npm run build           # production build (runs the brand check first)
npm run start           # serve the production build
npm run lint            # ESLint
npm run check:brand     # fail if the product name is hardcoded anywhere
npm run test:e2e        # Playwright — spins up its own backend+frontend on 8001/3100
npm run test:e2e:headed # ...with a visible browser
npx playwright install --with-deps   # first run only

# backend/
uvicorn app.main:app --reload --port 8000
pytest                              # 81 tests
pytest tests/test_heic_route.py -v  # a single file
pyrefly check                       # type check
```

---

## Running with Docker

```bash
docker compose up --build
```

Frontend `:3000`, backend `:8000`, with a named volume for backend storage. The backend image
installs Tesseract, so OCR works out of the box.

---

## Architecture

### Tool registry — one entry, everything derived

Adding a tool touches **two files**. Routes, metadata, sitemap, JSON-LD, hub membership, search
index, related-tool links and the accent colour all derive from the registry.

```
frontend/lib/tools/
├── types.ts          Domain · Operation · Runtime · Surface · OptionSchema
├── index.ts          SLIM registry — client-safe. Identity, taxonomy, card copy
├── content/          HEAVY SEO prose. `import "server-only"` — never reaches a browser
│   ├── pdf/<slug>.ts     metaDescription, faqs, howTo, seoCopy, keywords
│   ├── image/ code/ text/ data/ color/ security/ convert/
│   └── index.ts          async loaders, one chunk per tool
├── views.tsx         slug → interactive view, via next/dynamic (one chunk per view)
├── search.ts         ⌘K index — matches names, blurbs, domains AND file extensions
├── domains.ts        the 8 domain hubs
├── validate.ts       build-time invariants (see below)
└── client/           browser executors: image.ts · color.ts · secret.ts · text.ts
```

**Why slim/heavy are split:** the old single registry was 45 KB for 21 tools and was imported by
client components. At 500 tools that would be ~1 MB of FAQ prose shipped to every browser. The prose
now sits behind `server-only`, so it is physically unreachable from client code.

### One route for everything

`app/(tools)/[slug]/page.tsx` serves **all 58 tools and all 8 hubs** — it replaced 42 hand-written
route files. `generateStaticParams` prerenders every slug; `dynamicParams = false` means anything
unknown is a static 404.

### Build-time validation

`lib/tools/validate.ts` runs inside `generateStaticParams`, so a violation **fails `next build`**
and therefore CI. It enforces:

- URL-safe, unique slugs; no collision with `RESERVED_SLUGS` (real pages *and* hub segments)
- server tools have a `backendEndpoint`; client tools must not
- every tool has a content module
- meta descriptions ≤160 chars **and unique across the catalogue**
- ≥4 FAQs, ≥3 HowTo steps, ≥300 chars of SEO copy, 3–8 related keywords

### Colour as taxonomy

Each domain owns a hue, generated in OKLCH at fixed chroma then tuned per-hue until it clears
**4.5:1 on both the page surface and cards, in both themes**. A tool page sets `data-domain`, and
every `--primary` / `--ring` / `--accent` beneath resolves to that domain's colour. The tool grid
becomes a colour-coded map instead of a rainbow.

### Other notable pieces

| Piece | Where | Note |
|---|---|---|
| Command palette | `components/layout/CommandPalette.tsx` | ⌘K / `/`, fuzzy + extension-aware |
| Regional gating | `components/layout/RegionalModule.tsx` | Timezone-based, so the homepage stays **static** |
| TTL cleanup | `backend/app/core/cleanup.py` | Runs in the FastAPI lifespan; no cron needed |
| Fail-closed CORS | `backend/app/core/config.py` | `SystemExit(2)` in production if `CORS_ORIGINS_RAW` is empty |
| Upload validation | every file endpoint | MIME **and** magic bytes (`%PDF`, HEIF `ftyp`) |
| Widget embeds | `app/widget/[tool]` | Bare-chrome iframes, `frame-ancestors *`, `noindex` |

---

## Adding a new tool

**Client tool** — 2 files:

1. Add an entry to `lib/tools/index.ts` (`runtime: "client"`, no `backendEndpoint`)
2. Add `lib/tools/content/<domain>/<slug>.ts`

Then map the slug to a view in `lib/tools/views.tsx` (most reuse `TextToolView`, `ImageToolView` or
`PdfEditView`, so this is one entry — not a new component).

**Server tool** — additionally:

3. `backend/app/services/<name>_service.py` — the pure logic
4. A route in `backend/app/api/tools_routes.py`
5. Set `runtime: "server"` and `backendEndpoint` in the registry

`npm run build` tells you immediately if anything is missing or below the content thresholds.

---

## Renaming the product

The name is defined **once**:

```ts
// frontend/brand.config.ts
const NAME   = "PDF Studio";
const DOMAIN = "pdfstudio.app";
```

Change those two lines and everything follows: page titles, meta tags, footer, logo, OG images,
JSON-LD, PWA manifest, comparison pages, tool copy and **blog prose** (posts use a `{{brand}}`
token that `lib/blog.ts` substitutes at read time).

`npm run build` runs `scripts/check-brand.mjs` first and **fails the build** if the name is
hardcoded anywhere else — that's what stops it drifting back across 40 files.

```bash
npm run check:brand
# ✓ Brand name "PDF Studio" is defined only in brand.config.ts.
```

The backend's `APP_NAME` is a separate service and only appears in the OpenAPI docs title — set the
`APP_NAME` env var to match.

---

## Libraries used, and why

### Frontend runtime

| Package | Version | Used for |
|---|---|---|
| `next` | 16.2.6 | App Router, Turbopack, SSG, metadata, OG image generation |
| `react` / `react-dom` | 19.2.4 | UI; uses React 19 set-state-in-render (see CLAUDE.md) |
| `tailwindcss` | v4 | Styling. **No config file** — theme lives in `@theme` in `globals.css` |
| `framer-motion` | 12.x | Page and component motion |
| `zustand` | 5.x | Workspace state (uploaded files, page selection, reorder) |
| `@dnd-kit/*` | 6.x / 10.x | Accessible drag-and-drop page reordering |
| `react-dropzone` | 15.x | Drop targets with proper keyboard/file-type handling |
| `lucide-react` | 0.460 | Icons — imported individually, not `import *` (saves ~150 KB) |
| `sonner` | 2.x | Toasts |
| `clsx` + `tailwind-merge` | — | Conditional classes without duplicate-utility conflicts |
| `class-variance-authority` | 0.7 | Typed component variants |
| `next-mdx-remote` + `gray-matter` | — | MDX blog with frontmatter |
| `@vercel/analytics` | 2.x | Page analytics |

### Frontend — tool-specific (each loaded only on its own page, via dynamic import)

| Package | Powers | Why not hand-rolled |
|---|---|---|
| `qrcode` | QR Code Generator | QR spec means Reed–Solomon ECC + mask evaluation |
| `jsbarcode` | Barcode Generator | 8 symbologies with their own check-digit rules |
| `jsqr` | QR Scanner | Finder-pattern detection and perspective correction |
| `js-yaml` | YAML ↔ JSON | YAML's spec is genuinely large |
| `sql-formatter` | SQL Formatter | Five SQL dialect grammars |
| `marked` | Markdown → HTML | GitHub-flavoured markdown |

**Written by hand instead of adding a dependency:** the LCS diff (`DiffCheckerView`), the ICO binary
container writer, the RFC-4180 CSV parser, all colour conversion including OKLCH, cron description,
and password/passphrase generation.

### Frontend dev

`typescript` 5 · `eslint` 9 + `eslint-config-next` (enforces `react-hooks/set-state-in-effect`) ·
`@playwright/test` · `@tailwindcss/postcss` · `pdf-lib` (test fixtures only)

### Backend

| Package | Version | Used for |
|---|---|---|
| `fastapi` | 0.115.0 | API framework, auto OpenAPI |
| `uvicorn[standard]` | 0.30.6 | ASGI server |
| `PyMuPDF` (`fitz`) | 1.24.10 | The workhorse — compress, render, split, rotate, watermark, page numbers, crop, flatten, organize, **redact**, repair |
| `pypdf` | 5.0.1 | Merge and lightweight page ops |
| `Pillow` | 11.3.0 | Image processing, photo sheets, ID layouts |
| `pillow-heif` | 1.1.1 | HEIC/HEIF decoding (requires Pillow 11) |
| `pytesseract` | 0.3.13 | Tesseract bindings for OCR |
| `pdfplumber` | 0.11.4 | Table extraction for PDF → Excel |
| `openpyxl` | 3.1.5 | `.xlsx` read/write |
| `python-docx` | 1.1.2 | `.docx` generation for PDF → Word |
| `reportlab` | 4.2.5 | PDF generation for Word/Excel → PDF |
| `pydantic` / `pydantic-settings` | 2.9 / 2.5 | Schemas and env-driven settings |
| `python-multipart` | 0.0.12 | Multipart upload parsing |
| `aiofiles` | 24.1.0 | Async file I/O |
| `sentry-sdk[fastapi]` | 2.14.0 | Error reporting (optional, needs `SENTRY_DSN`) |
| `eval_type_backport` | 0.2.0 | Makes PEP-604 `X \| Y` unions work on Python 3.9 |

Dev: `pytest` · `httpx` (required by `fastapi.testclient`)

> **Python 3.9 baseline:** every backend module starts with `from __future__ import annotations`.
> Keep that when adding modules.

---

## API reference

39 endpoints, all under `/api`. Full interactive docs at `/docs`.

### Workspace

```
POST   /api/upload                              stream-validated upload
GET    /api/files/{id}/metadata                 page count, dimensions
GET    /api/files/{id}/thumbnail/{page}         page preview
GET    /api/files/{id}/raw                      original bytes
DELETE /api/files/{id}
POST   /api/merge · /api/split · /api/rotate · /api/compress
GET    /api/download/{output_id}
GET    /api/health
```

### Tools

```
POST /api/tools/compress/target-size            exact KB/MB target
POST /api/tools/compress/quick                  preset levels
POST /api/tools/pdf/split · rotate · delete-pages · lock · unlock
POST /api/tools/pdf/watermark                   text, opacity, angle, tile, page range
POST /api/tools/pdf/page-numbers                position, format, start_at, skip_first
POST /api/tools/pdf/crop                        percentage trim per edge
POST /api/tools/pdf/flatten
POST /api/tools/pdf/organize                    order spec: "3,1,2" · "2,4" · "10-1"
POST /api/tools/pdf/redact                      terms (one per line) → permanent deletion
POST /api/tools/pdf/repair
POST /api/tools/pdf-to-jpg · jpg-to-pdf
POST /api/tools/pdf-to-word · word-to-pdf
POST /api/tools/pdf-table/to-excel · excel/to-pdf
POST /api/tools/ocr/extract   ·  GET /api/tools/ocr/status
POST /api/tools/heic-to-jpg
POST /api/tools/sign-pdf · id-card/combine · photo/to-pdf
GET  /api/tools/preview/{output_id}             content-type aware preview
GET  /api/tools/download/{output_id}?name=…
```

**Preview endpoint** is content-type aware: PDFs → PNG with `?page=N&w=900` plus an `X-Page-Count`
header (exposed via CORS — don't remove it), JPG/PNG → resized PNG, ZIP → first image, XLSX → JSON
of columns and the first 10 rows.

---

## Environment variables

### Frontend

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8000/api` | Backend base — **includes `/api`** |
| `NEXT_PUBLIC_SITE_URL` | `https://<brand.domain>` | Canonicals, OG, sitemap |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `hello@<brand.domain>` | Shown on `/contact` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | — | Enables Plausible when set |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` / `_BING_` | — | Search Console verification |
| `LEADS_WEBHOOK_URL` | — | Where the contact form and email capture POST |
| `BUILD_STANDALONE` | — | `true` produces `.next/standalone/` (Docker only; Vercel leaves it unset) |

### Backend

| Variable | Default | Purpose |
|---|---|---|
| `ENVIRONMENT` | `development` | `production` turns on the fail-closed CORS guard |
| `CORS_ORIGINS_RAW` | — | **Required in production** — comma-separated allowlist |
| `APP_NAME` | `PDF Studio API` | OpenAPI docs title |
| `PORT` / `HOST` | `8000` / `0.0.0.0` | |
| `MAX_UPLOAD_MB` | `100` | Rejected by `Content-Length` before the body is read |
| `FILE_TTL_SECONDS` | `3600` | How long outputs survive |
| `CLEANUP_INTERVAL_SECONDS` | `900` | Sweep frequency |
| `MAX_PDF_PAGES` | `500` | Decompression-bomb guard |
| `MAX_RENDER_PIXELS` | `40000000` | ~40 MP ceiling per rasterised page |
| `MAX_ZIP_RATIO` / `MAX_ZIP_UNCOMPRESSED_MB` | `200` / `400` | Office-XML zip-bomb guards |
| `RATE_LIMIT_ENABLED` | `false` | Per-IP sliding window; enable in production |
| `RATE_LIMIT_DEFAULT_PER_MIN` / `_HEAVY_` | `120` / `30` | |
| `SENTRY_DSN` | — | Enables error reporting |

---

## Testing

```bash
cd backend  && pytest              # 81 tests
cd frontend && npm run test:e2e    # 20 Playwright tests
cd frontend && npm run lint && npm run build
```

**Backend (81):** service-level tests for OCR, ID card, PDF tables, page ops, guards, HEIC and the
PDF edit suite, plus **route-level** tests via `fastapi.testclient`. Both layers exist deliberately —
a service test alone once missed a `NameError` in a route and a JPEG being written with a `.pdf`
extension.

**Frontend (20):** Playwright drives real uploads against a real backend on ports 8001/3100, so it
never collides with your dev servers. It activates `backend/.venv`, so create that first.

**Build-time:** `npm run build` runs the brand check and the registry validator — both fail the
build, which is what CI actually gates on.

---

## Project structure

```
.
├── frontend/
│   ├── brand.config.ts          ← the product name lives HERE, and only here
│   ├── app/
│   │   ├── (tools)/[slug]/      one route: all 58 tools + all 8 hubs
│   │   ├── blog/ vs/ widget/    MDX blog · competitor pages · embeddable iframes
│   │   ├── contact/ about/ privacy/ terms/ roadmap/ settings/
│   │   ├── og/ icon.tsx         dynamic OG images and favicon via next/og
│   │   └── sitemap.ts robots.ts
│   ├── components/  layout · ui · brand · seo · share · analytics
│   ├── features/    tools/views (the interactive surfaces) · pdf · home · hubs · contact
│   ├── lib/tools/   the registry, content, views, search, domains, validation, client executors
│   ├── content/     blog MDX + competitor data
│   ├── scripts/     check-brand.mjs
│   └── tests/       Playwright
├── backend/
│   ├── app/
│   │   ├── main.py            create_app(): CORS, middleware, routers, cleanup lifespan
│   │   ├── api/               routes.py (workspace) · tools_routes.py (tools)
│   │   ├── services/          one module per capability
│   │   ├── core/              config · cleanup · logging
│   │   ├── middleware/        security headers, rate limit, body-size cap, errors
│   │   └── utils/             storage · guards
│   └── tests/
├── docs/            strategy + architecture blueprints
├── docker-compose.yml · render.yaml
└── CLAUDE.md        conventions for AI agents working in this repo
```

---

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for the full guide. In short:

- **Frontend → Vercel.** Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL`. Leave
  `BUILD_STANDALONE` unset.
- **Backend → Render / Fly / any Docker host.** `render.yaml` is included. You **must** set
  `CORS_ORIGINS_RAW` — the app deliberately refuses to boot in production without it.
- **Self-hosted →** `docker compose up --build` behind nginx.

CI (`.github/workflows/ci.yml`) runs backend pytest and a frontend lint + build on every push and PR
to `main`.

---

## License & credits

Built by **Abdur Rahman** — see the `/about` page on the running site.

Standing on: [PyMuPDF](https://pymupdf.readthedocs.io) · [Tesseract](https://github.com/tesseract-ocr/tesseract) ·
[FastAPI](https://fastapi.tiangolo.com) · [Next.js](https://nextjs.org) · [Pillow](https://python-pillow.org).
