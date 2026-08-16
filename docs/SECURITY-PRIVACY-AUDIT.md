# Security & Privacy Audit — PDF Studio

_Audit date: 2026-08-16. Scope: `frontend/` (Next.js 16) + `backend/` (FastAPI). Method: source review with `file:line` evidence, plus live probing of a locally-running backend (`:8000`/`:8001`) and the production domain. Safe payloads only — no destructive testing._

Severity: **P0** critical · **P1** high · **P2** medium · **P3** low.
Status: **CONFIRMED** (verified in code or by probe) · **LIKELY** · **NEEDS-DATA**.

---

## 0. The privacy promise — verified TRUE ✅

> "29 tools run entirely in your browser and never upload anything."

**CONFIRMED true.** Two independent checks agree:

1. **Static:** every `runtime: "client"` tool's view was grepped for `fetch(`, `XMLHttpRequest`, `API_BASE`, `sendBeacon`, `axios`, `new Image().src`. The only network calls found map to `runtime: "server"` tools. The single `new Image()` in `BarcodeGeneratorView.tsx:93` points at an in-memory `data:` URL, not the network.
2. **Runtime (this audit's E2E):** `tests/e2e/security/privacy.spec.ts` records every outbound POST/PUT while a client tool actually processes real input (image convert, JSON format, QR encode, password generate) and asserts **zero** requests reach the API host and no request body contains the secret/password/payload.

Telemetry (`lib/track.ts`) posts only to `window.plausible` and carries `{ tool, size_bytes, target, mode, count, lang }` — **never a filename, file content, hash, generated password, decoded JWT, or QR payload.** This is a genuine, defensible differentiator and is implemented correctly.

**Caveat worth communicating (P3, UX/trust):** every tool page — including the privacy-marketed local ones — loads Google AdSense, Plausible and Vercel Analytics (`features/tools/components/ToolPage.tsx:106`, `app/layout.tsx`). No file data reaches them, but "nothing leaves your device" copy renders on a page simultaneously loading third-party ad script. Consider not loading AdSense on `runtime:"client"` tool routes, or softening the copy.

---

## 1. The domain is parked on a marketplace — P0, CONFIRMED

**This is the single most consequential finding and may explain the traffic loss.**

- `brand.config.ts:24` sets `DOMAIN = "pdfstudio.app"`; the entire SEO layer (canonicals, sitemap, OG, `DEPLOY.md`, nginx config) is built around `https://pdfstudio.app`.
- **Live probe (2026-08-16):**
  - `https://pdfstudio.app/` → **302** → `https://www.fortune.domains/name/PdfStudio.app` (a domain-sale listing).
  - `https://pdfstudio.app/compress-pdf` and `/robots.txt` → generic **404** parking page (`server: openresty`).
  - `api.pdfstudio.app` → does not resolve/respond.
  - **DNS nameservers: `ns1.squadhelp.com` / `ns2.squadhelp.com`** — Squadhelp/Atom is a brandable-domain marketplace. A record `52.20.84.62` is the parking host.
- No `vercel.json` or `CNAME` in the repo points at an alternate live host.

**Interpretation:** the canonical domain the product is built around is currently controlled by a domain broker and serves a for-sale page, not the app. If Googlebot crawls `https://pdfstudio.app/*` today it gets 404s/redirects to a parking page — which deindexes the entire site. Whether this is the cause of the reported traffic drop cannot be proven without GSC/registrar data, but it is the highest-probability explanation on the table and must be resolved before any other SEO work matters.

**Action:** confirm domain ownership at the registrar immediately. If lapsed, recover it. If the app lives on another domain, update `brand.config.ts` + all env (`NEXT_PUBLIC_SITE_URL`) so canonicals/sitemap match the served domain, and 301 the old domain to the new one.

---

## 2. Backend denial-of-service surface — P1

The backend has had a prior hardening pass (pixel bombs, zip bombs, NaN coords, range materialization, CSV-formula injection are all handled — credit where due). But several DoS vectors remain, all **CONFIRMED in code**:

| ID | Finding | Evidence | Sev |
|---|---|---|---|
| SEC-DoS-1 | **`MAX_PDF_PAGES` (500) is enforced in only 2 of ~20 PDF paths** (`pdf_edit_service.py:34`, `pdf_image_service.py:66`). Upload/metadata, compress, pdf-to-word, pdf-table, split/rotate/delete, sign, OCR do **not** check it. A few-KB PDF declaring a huge shared page tree drives them all. | multiple services | P1 |
| SEC-DoS-2 | **`compress/target-size` rasterizes every page up to 10× with no page cap** (`pdf_compress_target.py:29-40,79-85`). One request can hold a worker for minutes→hours. Measured locally: 20-page text PDF = 3.4s; scales linearly with pages × content. | `pdf_compress_target.py` | P1 |
| SEC-DoS-3 | **`sign-pdf` decompression bomb.** `sign_pdf_service.py:40-42` opens the signature PNG only to read `im.format` — `Image.open` is lazy and never decodes, so Pillow's `MAX_IMAGE_PIXELS` guard never fires; the raw bytes go to MuPDF (`:68`) which decodes them. A ~50 KB 30000×30000 PNG expands to GBs. **Clearest concrete missing-guard bug.** | `sign_pdf_service.py:40-68` | P1 |
| SEC-DoS-4 | **No global concurrency cap / no timeout.** Only a 4-thread default executor (`cleanup.py:30-33`); `to_thread` submissions queue unbounded with no 503-when-busy. 4 slow requests starve the instance. | `cleanup.py`, no `Semaphore` anywhere | P1 |
| SEC-DoS-5 | **Whole-file-into-RAM on every tool route** (`await file.read()`), and the `len(data)` size check happens *after* the read. `pdf/compare` holds two 100 MB blobs at once. | `tools_routes.py` (many) | P2 |
| SEC-DoS-6 | **Disk exhaustion:** every tool persists its input to `storage/uploads` and output to `storage/output`; nothing deletes the temp input after processing — only the 15-min TTL sweep does. No free-space check. A single IP can park 100+ GB before the first sweep. | `tools_routes.py:164,206,…`; `cleanup.py` | P1 |

`RATE_LIMIT_ENABLED` defaults **False** (`config.py:52`); `render.yaml` sets it `true` in prod (good), but the rate-limit key trusts the rightmost `X-Forwarded-For` unconditionally (`security.py:153-157`) and `_HITS` is an unbounded, never-evicted process dict — a slow OOM driven by header values when exposed without a normalizing proxy.

---

## 3. Error handling & information exposure — P2

- **SEC-500-CORS (P2, CONFIRMED-by-analysis):** the catch-all `Exception→500` handler is bound to Starlette's `ServerErrorMiddleware`, which sits **outside** CORS and the security-header middleware. So a 500 ships with **no `Access-Control-Allow-Origin` and no security headers**, and the browser shows the frontend an opaque network error instead of the 500 body. The 400/413/429 paths were already fixed for this (`main.py:122-126`); 500 still has it. _My probe confirmed the 400 path is clean (CORS + CSP + nosniff all present); I could not trigger a 500 with safe input, so this rests on the middleware-ordering analysis._
- **SEC-PATH-LEAK (P3, CONFIRMED):** several handlers interpolate raw exception text (`f"Preview failed: {exc}"`, `pdf_table_service.py:192`, `tools_routes.py:1216/1227/1240/1251`). Library exceptions frequently embed the on-disk path `/…/storage/uploads/<uuid>.pdf`, leaking internal layout + a live file id in a 400/500 body.

---

## 4. Access control & download safety — P2/P3

- **No authorization on outputs/uploads.** Every download/preview is bearer-of-the-128-bit-uuid for 1 hour. `GET /api/files/{id}/raw` will also serve files uploaded via `/api/tools/ocr/extract` (which returns a `file_id`). Decrypted PDFs from `/pdf/unlock` and OCR'd source docs sit unencrypted on disk for the full TTL. Acceptable for a no-account tool, but should be a conscious decision. (P2)
- **`DELETE /api/files/{id}`** is unauthenticated, unvalidated, and always returns `deleted: true`. (P3)
- **`/pdf/unlock` is an unthrottled password-guessing oracle** when rate limiting is off. (P2)
- **Path traversal: not exploitable** (CONFIRMED by probe): `download/..%2f..%2fapp%2fmain.py` → 404. Router single-segment matching + suffix-existence requirement + `_ID_RE` (on preview) block it. **But** `tools_download` (`tools_routes.py:1083-1093`) skips the `_ID_RE` validation its sibling `_resolve_output` applies — a defense-in-depth inconsistency to close. (P3)
- **`output_id` is not URL-encoded** in the frontend download URL (`services/tools-api.ts:63` encodes `name` but not `output_id`) — latent, not currently exploitable. (P3)

---

## 5. Headers / CSP — P2

- **Frontend has no Content-Security-Policy on non-widget routes.** `next.config.ts:26-37` sets `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` — but **no CSP**. For a product whose core claim is client-side processing, a `connect-src` allowlist would be the strongest mechanical proof a client tool cannot exfiltrate. Any CSP must include `worker-src blob:` (RegexTester builds a Worker from a `blob:` URL) and `img-src data:` (barcode). (P2, CONFIRMED)
- **Backend API CSP is strict and correct** (`default-src 'none'`), but not applied to 500s (see §3), and lacks `Cross-Origin-Resource-Policy`.
- **Widget routes** intentionally set `frame-ancestors *`; note `X-Frame-Options: ALLOWALL` is not a valid directive (browsers ignore it) — only the CSP applies. The 5 widget tools accept file uploads inside arbitrary third-party frames — acceptable for server tools, but be deliberate. (P3)

---

## 6. Dependencies

Backend pins are late-2024 (`PyMuPDF==1.24.10`, `Pillow==11.3.0`, `pdfplumber==0.11.4`) — the two libraries parsing hostile input (PyMuPDF, Pillow) warrant a CVE re-check before a marketing push. Dev/prod interpreter mismatch: `pyproject.toml` targets 3.9, CI runs pytest on 3.12, Dockerfile builds on `python:3.12-slim` — different typing paths exercised.

**Frontend supply-chain note:** `js-yaml@5.2.3` was flagged during audit as suspicious (training-era knowledge says js-yaml is 3.x/4.x). **Verified against the live npm registry: it is legitimate** — js-yaml's current `latest` is 5.3.0, maintained by the real nodeca maintainer; 5.2.3 is a normal release. No action needed. (Recorded here so it isn't re-flagged.)

---

## 7. Priority fix list (security/privacy)

1. **P0** — Resolve the `pdfstudio.app` domain ownership (§1). Nothing else matters if the canonical domain serves a parking page.
2. **P1** — Wire `assert_page_count` into every PDF path; add a page cap to `compress/target-size` (§2 SEC-DoS-1/2).
3. **P1** — Decode-guard the `sign-pdf` signature image (validate dimensions before handing bytes to MuPDF) (§2 SEC-DoS-3).
4. **P1** — Delete tool inputs immediately after processing; add a disk free-space check (§2 SEC-DoS-6).
5. **P1** — Add a global concurrency semaphore with a 503-when-busy path and a per-request time budget (§2 SEC-DoS-4).
6. **P2** — Move the CORS + security-header middleware outside the 500 boundary, or add headers in the exception handler (§3).
7. **P2** — Add a frontend CSP with `connect-src`/`worker-src blob:`/`img-src data:` (§5).
8. **P2** — Stop interpolating raw exception text into client error bodies (§3 SEC-PATH-LEAK).
