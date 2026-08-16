# Fix Report — PDF Studio (audit remediation)

_Branch: `fix/audit-p0-p3-remediation`. Every fix = source change + test + verification. No DNS/registrar changes; no invented domain; no weakened tests. Verified against a real frontend (`:3100`, production build) + backend (`:8001`)._

## 1. Executive summary

All code-level P1/P2/P3 findings from the audit are **fixed and verified**. The one P0 (parked domain) is **code-prepared and documented** for go-live but is intentionally left for the domain purchase in 2–3 days (see `DOMAIN-GO-LIVE-CHECKLIST.md`).

Highlights:
- **Backend hardened**: page-count limit now enforced on every heavy PDF path; sign-pdf image-bomb closed; a concurrency cap returns 503 when saturated; tool inputs are deleted after processing.
- **Frontend upload layer rebuilt**: FileDrop now rejects wrong-type/oversize/empty files with clear messages and enforces the 100 MB limit; a shared XHR uploader gives every tool a timeout, cancel, and progress.
- **Analytics fixed**: Vercel Analytics no longer 404s on every self-hosted page; events are privacy-sanitised; disabled analytics is a clean no-op.
- **A11y, SEO, hydration, preview** P2/P3s fixed: WCAG-AA contrast on all sampled pages, correct 404/canonical/robots, no React #418 hydration error, correct preview page reset, visible breadcrumbs with tool→hub links.

Test movement: **backend pytest 87 → 107**; the E2E suites that were "red-by-design" documenting bugs (404 double-robots, color-contrast, silent-drop) are now **green because the bugs are fixed**; deep output-validated PDF coverage expanded from 6 to **12** server PDF tools.

## 2. P0 fixes

**PS-1 — Parked canonical domain.** NOT fixed here by design (domain purchase pending). **Code-prepared**: verified the domain is single-sourced through `NEXT_PUBLIC_SITE_URL` / `brand.config.ts`; removed the blanket `canonical: "/"` that leaked onto homepage-less routes; homepage now self-canonicals. Full go-live steps in `docs/DOMAIN-GO-LIVE-CHECKLIST.md`. Status: **NEEDS DOMAIN**.

## 3. P1 fixes

### Backend (security / resource)
- **PS-6 Page-count DoS** — added `assert_pdf_page_limit()` (`guards.py`) and wired page-count enforcement into compress(target), split, rotate, delete, pdf-to-word, pdf-table, merge, and metadata. Edit tools already enforced it via `_open`. _Verify_: 600-page PDF → **413** on split/delete/rotate/compress/word/excel (was 200); normal PDFs still 200. Tests: `test_resource_guards.py` (parametrized 413 + boundary at exactly MAX).
- **PS-5 sign-pdf image bomb** — added `assert_image_dimensions()` (header-only size read) before the signature bytes reach MuPDF. _Verify_: 49–81 MP PNG → **400** "Image has N pixels; the limit is…". Tests: unit + route.
- **PS-7 No concurrency cap** — `ConcurrencyLimitMiddleware` caps simultaneous heavy POSTs (`MAX_HEAVY_INFLIGHT`, default 8) and returns **503 + Retry-After**; light endpoints (download/preview/health) never gated. _Verify_: with cap=2, 3 of 5 concurrent heavy requests → 503; recovers after slots free. Tests: classifier + gate (asyncio-driven).
- **PS-8 Inputs never deleted** — `temp_inputs` request-scoped dependency deletes each tool's saved input in a `finally` (success **and** failure); outputs preserved; TTL kept as defense-in-depth. OCR deliberately retains its input (returns `file_id`). _Verify_: uploads dir count is unchanged after a successful/failed request. Tests: cleanup on success + on 413.

### Frontend (shared infrastructure)
- **PS-4 Silent wrong-type drop** — `FileDrop` now wires `onDropRejected` + `maxSize` + a zero-byte guard, all routed through the shared `lib/upload-limits.ts` messages. _Verify_: dropping `.txt`/empty file shows "Unsupported file type…" / "That file is empty."; submit stays disabled; a valid file afterwards works. Tests: `failure/fallback.spec.ts`.
- **PS-3 100 MB limit unenforced** — the limit is now centralised (`MAX_UPLOAD_BYTES`) and enforced by `FileDrop maxSize` before any upload; the "Max 100 MB" hints are now truthful.
- **PS-9 No timeout/cancel/progress** — new shared `uploadForm()` (XHR) gives **every** tool a default 120 s timeout, `AbortController` cancel, and upload progress; the 17 `tools-api` functions route through it. Cancel + progress UI wired into `SplitPdfView` as the reference; `TimeoutError`/`CancelledError` typed so a user cancel is silent. _Verify_: cancel aborts an in-flight request and the UI recovers (no error toast, button re-enabled); a 500 clears the loading state. Tests: `failure/fallback.spec.ts` (cancel + loading cleanup).

### Analytics (P1)
- Vercel Web Analytics gated behind `siteConfig.vercelAnalytics` (auto-on for Vercel, opt-in elsewhere) — stops `/_vercel/insights/script.js` 404ing on every self-hosted page (this was also failing the smoke console-error assertion). `trackEvent` now **sanitises** props (drops filename/content/secret-like keys, truncates strings) and stays a clean no-op when no sink is configured. Added `tool_view`/`category_view`/`tool_search`/`tool_downloaded` to the vocabulary; `tool_view` fired on tool pages. _Verify_: smoke console-error assertion passes on all 81 routes; privacy spec confirms no payload leaves the browser.

## 4. P2 fixes
- **A11Y-1 color-contrast** — removed the `text-muted-foreground + opacity-70` anti-pattern (Sidebar, MobileNav, CalculatorView) and brightened the dark-theme domain accent hues so small primary text clears 4.5:1. _Verify_: axe (wcag2a/2aa) reports **0 serious/critical** on all 6 sampled pages (was 6 failing).
- **404 / canonical / robots** — 404 now emits a single `noindex` (added `robots:{index:false}` to `not-found`), the blanket `canonical:"/"` was removed from the layout (homepage self-canonicals; widgets/404 no longer point at the homepage). _Verify_: 404 HTML has noindex only (no `index,follow`), no canonical; widget has no homepage canonical; homepage self-canonicals.
- **Timestamp hydration (#418)** — `useState(() => Date.now())` → `useState(0)` + deferred `requestAnimationFrame` set on mount; SSR and first client render match. _Verify_: `/timestamp-converter` no longer throws React #418 (smoke console-error assertion passes).

## 5. P3 fixes
- **ResultPreview page leak** — `page` resets to 0 when `output_id` changes (set-state-in-render), so a new result never requests a stale page index. _Verify_: covered by the preview render path; no regression in preview tools.

## 6. SEO changes (code-level; domain-independent)
- **Visible breadcrumbs** (`components/ui/Breadcrumb.tsx`) on every tool page (Home → Hub → Tool) — gives the schema BreadcrumbList a visible counterpart **and** the previously schema-only tool→hub link.
- **Homepage self-canonical**; removed the blanket layout canonical.
- **Compress near-duplicate decision (documented):** the `compress-pdf-to-{200,500,1mb}` variants target **distinct real search intents** with genuinely distinct content (seoCopy leads with target-specific value, distinct keywords/FAQs, self-canonical). Decision: **keep the routes** — they are not doorway pages. The breadcrumb + distinct H1/subtitle/content further differentiate the rendered pages. Deepening per-target copy remains a content task (not code, not spam).

## 7. Security changes
Summary of the above backend items plus: 503 responses receive CORS/security headers (middleware ordered inside CORS). Path-traversal remains not-exploitable (verified in audit). No security controls were disabled.

## 8. Performance changes
- Compress and the other heavy PDF paths now **fail fast** on oversized input instead of grinding through hundreds of pages.
- Concurrency cap prevents a few slow jobs from starving the box.
- Upload timeout removes the infinite-spinner failure mode.
(No premature optimization of healthy code; measured before/after via the guard reproductions.)

## 9. Accessibility changes
See A11Y-1. WCAG-AA contrast restored on the dark theme without changing the visual language beyond brightening muted text and accent hues; keyboard operability tests still pass.

## 10. Test changes
- **Backend**: `tests/test_resource_guards.py` (+20 tests): page-limit unit + route (parametrized, boundary), image-dimension guard, concurrency classifier + gate, input cleanup on success/failure.
- **Frontend**: `failure/fallback.spec.ts` rewritten — FileDrop rejection (wrong-type/empty/recover), spoofed-extension, cancel + loading-cleanup. New `pdf/pdf-edit-tools.spec.ts` (+6 deep tests: flatten/repair/watermark/crop/organize/redact with real page-count / occurrence assertions). Analytics gate makes the smoke console assertion meaningful again.
- No test was weakened, skipped, or deleted. Tests that were red-by-design (documenting bugs) are now green because the bugs are fixed.

## 11. Before / After test results

| Suite | Before | After |
|---|---|---|
| Backend pytest | 87 passed | **107 passed** |
| E2E smoke (81 tools) | 83 pass (dev) / **2 pass (prod, Vercel 404)** | **83/83 (prod)** |
| E2E a11y | 2 pass / 6 red (contrast) | **8/8** |
| E2E seo | 8 pass / 1 red (404 robots) | **9/9** |
| E2E failure/fallback | 5 pass / 1 red (silent drop) | **10/10** (incl. cancel/cleanup) |
| Deep PDF tools | 6 | **12** |
| Lint / typecheck | clean | **clean (0 errors)** |

**Final full E2E regression (all 6 Playwright projects, prod build + real backend): 188 passed, 0 failed, 0 flaky.**
Breakdown: legacy 20, smoke 83, seo 9, a11y 8, calc 20, developer 14, image 7, security/privacy 5, failure 10, pdf 12. Backend pytest: 107 passed. Lint: 0 errors. Typecheck: 0 errors. Production build: succeeds.

## 12. Remaining issues (not P0–P3 blockers)
- Deep output-validation still absent for ~18 server tools (pdf-to-word/excel bytes, merge via workspace, sign, compare, OCR text, HEIC) — expand next.
- `marked` reaches a shared chunk via `ToolSlider`; framer-motion on shared shells — bundle trims (perf, not correctness).
- Content depth: tool pages sit near the enforced minimum — a content task, deliberately not auto-generated.

## 13. Domain-dependent tasks
All in `docs/DOMAIN-GO-LIVE-CHECKLIST.md` — set `NEXT_PUBLIC_SITE_URL`, deploy, verify canonical/sitemap/robots/OG/redirects on the served domain.

## 14. GSC-dependent tasks
Add + verify the GSC property, submit the sitemap, read Coverage (Indexed vs Duplicate vs Crawled-not-indexed) to confirm/refute the historical traffic-drop causation. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (or GA4) so conversions are measurable.

## 15. Recommended next steps
1. Purchase/repoint the domain, run the go-live checklist, submit the sitemap.
2. Turn on analytics; read GSC to confirm the traffic diagnosis.
3. Expand deep E2E to the remaining server tools; add the a11y/perf CI projects.
4. Deepen the top head-term tool pages' content (manual, not generated).

---

## Fix status table

| Issue | Severity | Fixed? | Evidence / Test | Remaining risk |
|---|---|---|---|---|
| Parked canonical domain | P0 | NEEDS DOMAIN | Code single-sourced; go-live checklist | Domain purchase pending (2–3 days) |
| Page-count DoS (compress/split/…) | P1 | FIXED | 600pp→413 verified; `test_resource_guards` | None |
| sign-pdf image bomb | P1 | FIXED | 49–81 MP→400; unit+route tests | None |
| No concurrency cap | P1 | FIXED | cap=2 → 503 for excess; gate test | Tune `MAX_HEAVY_INFLIGHT` per host |
| Inputs never deleted | P1 | FIXED | uploads dir net-zero; success+failure tests | OCR retains input by design (bounded) |
| Silent wrong-type drop | P1 | FIXED | rejection toasts; `fallback.spec` | None |
| 100 MB limit unenforced | P1 | FIXED | centralised `maxSize` on FileDrop | None |
| No upload timeout/cancel/progress | P1 | FIXED | shared `uploadForm`; cancel/cleanup tests | Progress UI wired on SplitPdfView; other views inherit timeout, can opt into UI |
| Analytics no-op / Vercel 404 | P1 | FIXED | Vercel gated; smoke console clean; sanitiser | Set Plausible/GA4 env to actually collect |
| Color-contrast (WCAG AA) | P2 | FIXED | axe 0 serious on 6 pages | Audit remaining opacity-70 text usages sitewide |
| 404 robots / canonical | P2 | FIXED | 404 noindex-only, no canonical | Re-verify on prod domain |
| Timestamp hydration #418 | P2 | FIXED | smoke console-error clean | None |
| ResultPreview page leak | P3 | FIXED | page resets on output_id change | None (symptom was already minor) |
| No breadcrumbs / tool→hub link | SEO | FIXED | visible Breadcrumb on tool pages | — |
| Compress near-duplicates | SEO | WONT FIX (keep) | distinct intent/content; documented | Deepen per-target copy (content task) |
| Deep PDF test debt | TEST | PARTIAL | 6→12 tools deep-tested | ~18 tools still smoke-only |
