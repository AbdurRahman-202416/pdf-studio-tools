# PDF Studio — Master QA Audit

_Audit date: 2026-08-16 · Auditor role: combined CTO / Staff Eng / SQA / SEO / Growth · Method: full source review (4 parallel deep-dive passes) + a new real-browser Playwright E2E suite run against the actual frontend + backend + live production-domain probing. Evidence-first: every finding carries a `file:line` or a reproduction._

Companion reports: [`TOOL-TEST-MATRIX.md`](./TOOL-TEST-MATRIX.md) · [`SEO-AUDIT.md`](./SEO-AUDIT.md) · [`PERFORMANCE-AUDIT.md`](./PERFORMANCE-AUDIT.md) · [`SECURITY-PRIVACY-AUDIT.md`](./SECURITY-PRIVACY-AUDIT.md)

---

## 1. Executive summary

PDF Studio is a **well-architected** product with a genuinely clean core: one registry (`lib/tools/index.ts`) drives 81 tools through one dynamic route, code-splitting is disciplined (80/80 views lazy-loaded), the client/server runtime split is real, and — importantly — **the headline privacy claim holds: every one of the 50 client-runtime tools processes files locally and never uploads, verified both statically and by network-recording E2E tests.** The backend shows a prior hardening pass (pixel/zip/formula-injection guards).

But it is **not yet ready for a marketing push**, for three reasons that sit above everything else:

1. **P0 — the canonical domain `pdfstudio.app` currently serves a domain-sale parking page** (302 → fortune.domains; DNS on squadhelp.com nameservers). The whole SEO layer hard-codes this domain. This is the most probable explanation for the reported traffic loss and must be resolved before any other work.
2. **P1 — the product ships thin, near-duplicate pages that multiplied as the catalogue grew from ~58 to 81 tools** (compress-to-100/200/500/1MB variants share one view and 55%+ of their text). This is the classic pattern that depresses *sitewide* rankings after an expansion.
3. **P1 — real functional/robustness gaps**: no client-side file-size enforcement despite 12 "Max 100 MB" promises; wrong-file-type drops fail **silently**; no upload timeout/cancel/progress on any of 31 server tools; and backend DoS vectors (uncapped compress rasterization, sign-pdf decode bomb, no concurrency cap).

None of these are architectural dead-ends — they are fixable in a focused sprint. The engineering foundation is good; the productization and SEO hygiene are behind it.

**Correction to the brief's premises** (both matter): the app has **81 tools, not 58** (README/homepage copy is stale), and the `surface`/`OptionSchema`/`backendEndpoint` "declarative options" abstraction described in the types is **unimplemented dead code** — every tool uses a bespoke view.

---

## 2. Architecture summary

- **Frontend** (Next.js 16, React 19, TS strict, Tailwind v4): `app/(tools)/[slug]` serves tools + hubs; `generateStaticParams` runs `validateRegistry()` so a bad registry **fails the build**. `dynamicParams=false` → unknown slugs 404. Views dispatched via `lib/tools/views.tsx` through `next/dynamic`. Three de-facto surfaces: `FileDrop` (server tools), `TextToolView` (13 dev/text tools), `CalculatorView` (calculators). Client logic in `lib/tools/client/{text,calc,image,color,secret}.ts`, all dynamically imported.
- **Backend** (FastAPI, Python 3.9): two routers under `/api`; ~41 endpoints. `asyncio.to_thread` for all heavy work over a **single 4-thread executor** (the only concurrency cap). TTL cleanup every 15 min. CORS fail-closed in prod. Strict API CSP.
- **Single source of truth:** the registry owns id/slug/domain/operation/runtime/surface/endpoint/accepts; SEO prose lives server-only in `lib/tools/content/**` (100% coverage, build-enforced). Redirects in `lib/redirects.ts` (21, chain-free).

---

## 3. Tool inventory

81 live tools: **PDF 30, calc 16, image 14, code 8, text 5, security 3, color 2, data 2, convert 1.** Runtime split **50 client / 31 server** (README says "29/29" — stale). Full per-tool detail in [`TOOL-TEST-MATRIX.md`](./TOOL-TEST-MATRIX.md).

---

## 4. Test coverage (this audit)

A new registry-driven E2E suite was added under `frontend/tests/e2e/`, with programmatic + committed fixtures and real output validation (PDF page counts via pdf-lib, image magic bytes, known hash vectors, JSON/CSV/YAML parsing, network-recording for privacy). Run against the real frontend + backend.

**Results (this audit's suite, ~158 tests):**

| Suite | Green | Notes |
|---|---|---|
| smoke (all 81 tools) | 83/83 | render, unique H1, canonical, title, **zero console errors**, discoverable |
| developer/text/data | 14/14 | JSON semantic-equality, base64 round-trip, SHA vectors, JWT claims, YAML/CSV parse |
| image (client) | 7/7 | format magic-byte verification of real conversions |
| calculators | 20/20 | known arithmetic (15%×200=30, BMI 22.9), divide-by-zero safe, all 16 render |
| pdf (server) | 6/6 | split→3pp, delete→8pp, rotation written, compress preserves 12pp, lock encrypts, pdf→jpg image |
| security/privacy | 5/5 | **network-recorded proof no client tool uploads** the file/secret/password |
| failure/fallback | 5/6 | 500/offline/413/slow/spoofed handled; **1 red-by-design** = B3 silent-drop |
| seo | 8/9 | canonical/sitemap/redirects/robots/JSON-LD; **1 red-by-design** = 404 double-robots |
| a11y (axe wcag2a/2aa) | 2/8 | keyboard ops pass; **6 red-by-design** = serious color-contrast on all 6 pages |

**150 green · 8 red-by-design (documenting 3 confirmed product findings: PS-4 silent drop, SEO-404 double-robots, A11Y-1 color-contrast) · 0 skipped · 0 weakened assertions.** The red-by-design tests fail *because the product is broken* — per the audit mandate, they are left failing as living documentation, not softened to green.

Before this audit: 2 spec files, 20 tests, ~5 tools functionally exercised, **no output-byte validation anywhere**, E2E **not run in CI**. After: registry sweep over all 81 + deep output-validated suites per category + SEO/a11y/failure/privacy, wired into CI (`.github/workflows/ci.yml`).

---

## 5. Critical bugs (P0/P1)

| ID | Sev | Cat | Tool/Area | Summary |
|---|---|---|---|---|
| PS-1 | P0 | PRODUCT/SEO | whole site | Canonical domain `pdfstudio.app` serves a domain-sale parking page; app not reachable there. |
| PS-2 | P1 | SEO | compress-* / mirrors | Near-duplicate sibling pages (55%+ text overlap) added during expansion → cannibalization / sitewide thinness. |
| PS-3 | P1 | BUG/UX | all FileDrop tools | No client file-size limit despite 12 "Max 100 MB" hints; full upload then backend rejection, no progress. |
| PS-4 | P1 | BUG/UX | all FileDrop tools | Wrong file type dropped → **silently swallowed** (no `onDropRejected` in `FileDrop.tsx:38-43`). |
| PS-5 | P1 | SECURITY | sign-pdf | Signature PNG bypasses Pillow bomb guard → MuPDF decodes a 30000² PNG (`sign_pdf_service.py:40-68`). |
| PS-6 | P1 | SECURITY/PERF | compress + ~18 PDF paths | `MAX_PDF_PAGES` unenforced; compress rasterizes whole doc ×10 uncapped → CPU DoS. |
| PS-7 | P1 | SECURITY | backend | No global concurrency cap / no request timeout; 4 slow requests starve the instance. |
| PS-8 | P1 | SECURITY | backend storage | Tool inputs persisted, never deleted post-processing (only 15-min TTL) → disk exhaustion. |
| PS-9 | P1 | BUG/UX | 31 server tools | No timeout / cancel / progress on any `fetch` upload; stalled backend spins forever. |

---

## 6. Validation findings (P2)

- **Extension-only / no magic-byte checks anywhere on the client** — a renamed `.exe→.pdf` passes the browser filter (backend `%PDF` check catches it, verified). HEIC path accepts `application/octet-stream` by extension alone.
- **`ResultPreview` never resets its `page` index across results** (`ResultPreview.tsx:25-36`) → run a 1-page job after paging to page 5 of a prior result → permanent "Preview unavailable". (B1)
- **`res.json()` unguarded on success path** in all 17 `tools-api.ts` functions → a 200 with an HTML body surfaces `SyntaxError: Unexpected token <` verbatim. (B7)
- **`markdownToHtml` does not sanitize** (`text.ts:262`) — safe today (output isn't `dangerouslySetInnerHTML`'d), but a loaded gun for any future consumer.
- Registry drift is unenforceable for `accepts`/`surface`/`options`/`backendEndpoint` — 4 declared contracts, 0 runtime consumers.

---

## 7. Corner cases

- `watermark()` (`image.ts:243`) **infinite-loops on empty/whitespace text** (`stepX≈0`); masked only by a UI disabled-button. (B4)
- `dateDifference()` walks one Date per day, unbounded (year 1→9999 ≈ 3.65M iterations, main thread). (B11)
- `palette()` walks a full-res ImageData with no downsampling (~24M iters on a 24 MP photo). (B12)
- `?? file.type` fallback is dead code (`File.type` is `""` not `undefined`) → `toBlob("")` silently yields PNG. (B5)
- `/widget/pdf-lock` can only lock, never unlock (static import passes no `mode` prop). (B13)

---

## 8. Fallback findings

Failure-mode E2E (`tests/e2e/failure/`) intercepts the backend to simulate 500 / offline / 413 / slow. Findings: error messages **are** surfaced and buttons re-enable (good), no stack traces leak to the browser on the 400 path (verified). **But** there is no request timeout, so a genuinely hung backend (not a 500) leaves the UI spinning — the "slow backend" test documents this. Backend 500 responses ship without CORS/security headers (middleware ordering), so the browser sees an opaque error instead of the message.

---

## 9. Security findings

See [`SECURITY-PRIVACY-AUDIT.md`](./SECURITY-PRIVACY-AUDIT.md). Headline: PS-5/6/7/8 above, plus 500-bypasses-CORS, internal-path leakage in error bodies, unthrottled unlock password oracle, no frontend CSP. Path traversal **not** exploitable (verified). `js-yaml@5.2.3` verified **legitimate** (not a supply-chain issue).

## 10. Privacy findings

**The core claim holds — verified.** All 50 client tools are local; telemetry carries no file data/filenames/secrets. Residual: AdSense/analytics load on privacy-marketed pages; UTM cookies are non-`httpOnly`; `heic-to-jpg`/`pdf-to-text`/`compare-pdf` are server tools sitting near local ones (correctly badged).

## 11. Performance findings

See [`PERFORMANCE-AUDIT.md`](./PERFORMANCE-AUDIT.md). Compress is the dominant risk (uncapped rasterization); code-splitting is good; framer-motion on the critical path and main-thread image/color/csv processing are the frontend hotspots; no upload progress.

## 12. Accessibility findings

Automated axe (wcag2a/2aa) sweep over home, `/tools`, a server drop tool (compress-pdf), a text tool (json-formatter), a form tool (mortgage), and the `/pdf` hub, plus keyboard-operability checks.

- **A11Y-1 (P2, CONFIRMED):** **serious `color-contrast` violations on all six sampled pages** ("Elements must meet minimum color contrast ratio thresholds"). Consistent with the recent dark-theme-by-default change — muted-foreground text on the dark surface falls below WCAG AA 4.5:1. This is the top a11y fix: raise the muted text token's contrast.
- Keyboard operability of the text-tool input path passes (focus → type → output). Structural gaps: no visible breadcrumb component anywhere; confirm focus-visible styling on the drop zones.

The a11y project asserts zero serious/critical violations, so it currently **fails by design** until contrast is fixed — the failure is the finding, not a flaky test.

## 13. SEO findings

See [`SEO-AUDIT.md`](./SEO-AUDIT.md) incl. the full traffic-drop investigation with CONFIRMED/LIKELY/POSSIBLE/NEEDS-GSC labels.

## 14. Keyword opportunities

The catalogue targets strong head + long-tail intents (compress pdf, merge pdf, pdf to word/excel, heic to jpg, json formatter, jwt decoder, calculators). The **risk is cannibalization, not gaps**: consolidate the compress-size variants and split tool↔blog intent rather than adding more near-duplicate pages. High-RPM calculators (mortgage/loan) are correctly present and are the best monetization surface.

## 15. Internal linking issues

`/vs/*` orphans (6), no tool→hub links, no visible breadcrumbs, 43 tools never get a cross-domain inbound link, 69 tools have no blog link. `/tools` keeps every tool ≤2 clicks deep (good).

## 16. UX findings

Silent wrong-type drops (PS-4), no upload progress/timeout (PS-9), preview page-leak (B1), inconsistent empty-file error copy across views, "Max 100 MB" promises unenforced (PS-3). Result/download flows otherwise work and produce correct files (verified end-to-end).

## 17. Business / product findings

Differentiators (free, watermark-free, no signup, no limits, browser-local privacy, 81 tools) are real and — for privacy — **true**, but under-communicated: the privacy proof isn't surfaced, "58 tools" undercounts, `/vs` competitor pages are unreachable, and no analytics measures whether any of it converts. Fix the domain + measurement before spend.

## 18. Analytics gaps

Plausible domain unset → all 11 events are no-ops; Vercel Analytics gets no custom events; GSC/Bing verification unset. **You currently cannot measure tool completions or correlate them with organic traffic.** Turn this on first.

## 19. Regression test plan

Playwright projects: `smoke` (all 81 render, unique H1, canonical, no console errors), `client` (deep output-validated dev/image/calc/color/security + privacy), `server` (PDF output validation + failure), `seo`, `a11y`, `mobile`, `legacy`. Scripts: `npm run test:e2e:{smoke,client,server,seo,a11y,mobile}`. CI job added (`.github/workflows/ci.yml`) running smoke+seo+a11y+client with report artifacts. Fixtures: `tests/e2e/test-data/generate-binary-fixtures.py` (deterministic) + `helpers/files.ts` (programmatic).

## 20. Recommended priorities

1. **Confirm/repair the domain** (PS-1) and verify GSC on the served domain. _Nothing else matters first._
2. **Turn on analytics** (§18) so the rest is measurable.
3. **De-duplicate + deepen** the thin/near-duplicate pages (PS-2, SEO §A2/A3).
4. **Fix the silent-drop + size-limit + timeout UX** (PS-3/4/9).
5. **Close the backend DoS vectors** (PS-5/6/7/8).
6. **Then** internal linking, breadcrumbs, `/vs` links — and only after all that, add more tools or start marketing.
