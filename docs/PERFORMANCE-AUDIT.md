# Performance Audit — PDF Studio

_Audit date: 2026-08-16. Backend timings measured against a local uvicorn (`:8001`) with deterministic fixtures. Frontend bundle observations from source. Not a production load test — localhost only, per the brief._

---

## 1. Backend processing timings (measured)

| Tool / endpoint | Input | Time | Notes |
|---|---|---|---|
| `pdf/split` (extract 1–3) | 10-pg text PDF | ~0.3s | fast |
| `compress/target-size` → 100KB | 6-pg text PDF (2.5 KB) | **0.9s** | rasterizes every page |
| `compress/target-size` → 100KB | 20-pg text PDF (7.6 KB) | **3.4s** | ~linear in pages |
| `pdf/split` corrupted/fake PDF | 9 B | <0.1s | correct 400 `Invalid PDF` |
| download round-trip | 1.1 KB PDF | <0.1s | valid `%PDF`, correct `Content-Type` |

**Extrapolation & the key risk:** `compress/target-size` scales ~linearly with (pages × content), and it re-rasterizes the **whole document up to 10 times** with no page cap (`pdf_compress_target.py:29-40`). During this audit a 40-page fixture drove a single compress request past **10 minutes** wall-clock in the test harness. On an image-heavy 100 MB / 500-page upload this is minutes-to-hours of CPU on one of only **4 worker threads** — the dominant performance and DoS risk. See SECURITY-PRIVACY §2 (SEC-DoS-2).

Expensive endpoints, worst first: `compress/target-size` > `ocr/extract` (≤30 pages × up to 120s Tesseract each) > `pdf-to-jpg` @600 dpi over many pages > `pdf-table/to-excel` (pdfplumber, superlinear in vector ops) > `pdf-to-word`.

**Recommendations:** (1) cap pages for compress and short-circuit when a page is already small; (2) add a global concurrency semaphore + per-request time budget; (3) stream uploads instead of `await file.read()` into RAM; (4) run uvicorn with `--workers` > 1 in the Dockerfile (currently single process).

---

## 2. Frontend bundle & runtime

**Code-splitting is genuinely good.** `lib/tools/views.tsx` forces all 80 slug→view mappings through `next/dynamic` (deliberately *not* `ssr:false`, so the H1 stays prerendered). `qrcode`, `jsqr`, `jsbarcode`, `marked`, `js-yaml`, `sql-formatter`, `pdf-lib` have **zero static top-level imports** — each loads only on its tool page. Verified.

**Remaining bundle risks:**
| Item | Concern |
|---|---|
| `framer-motion ^12` in 11 files incl. `WorkspaceShell`, `UploadZone`, `ToolResult`, `FileDrop` | ~60 KB gz on the critical path of every workspace + every server-tool page, for entry animations only. Prime `LazyMotion`/CSS candidate. |
| `marked` imported in `components/ui/ToolSlider.tsx` | risks landing in a shared chunk for one tool (`markdown-to-html`). |
| `@dnd-kit/*` | workspace-only; confirm it's not in the shared chunk. |

**Main-thread hazards in client tools (CONFIRMED in code):** all image work is synchronous on the main thread (no `OffscreenCanvas`/Worker) — a 50 MP watermark tile visibly freezes the tab; `color.ts palette()` walks a full-res `ImageData` (~24 M iterations on a 24 MP photo) with no downsampling; `calc.ts dateDifference()` walks one `Date` per day (unbounded); `text.ts parseCsv()` is synchronous with no size cap. Good exceptions: `RegexTesterView` runs matching in a terminable Worker with a 2s watchdog; `DiffCheckerView` caps LCS at 2000 lines.

**No upload progress / timeout / cancel** on any of the 31 server tools (all bare `fetch`) — a large upload shows no progress and a stalled backend spins forever. UX + perceived-perf issue.

---

## 3. Core Web Vitals — POSSIBLE risks (need field data)

- `/og` image route is `runtime="edge"` + `force-dynamic` while prod builds `output:"standalone"` Node — if it fails, **every** OG image (all 114 URLs) breaks. Needs a prod smoke test.
- LCP on tool pages should be fine (H1 prerendered), but AdSense on every tool page is a CLS/INP risk worth measuring with real CrUX/Lighthouse data.
