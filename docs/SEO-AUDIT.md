# SEO Audit — PDF Studio

_Audit date: 2026-08-16. 81 tools served at clean root slugs via `app/(tools)/[slug]`. Findings verified against source and the prerendered `.next/server/app/` output; the production domain was probed live. Labels: **CONFIRMED** (verified) · **LIKELY** · **POSSIBLE** · **NEEDS-GSC** (needs Search Console / Analytics to prove)._

> **Note on tool count:** README and homepage copy say "58 tools"; the registry (`lib/tools/index.ts`) actually contains **81** live tools. The copy is stale. This matters: the site grew from ~58 to 81 tools, which is the "added new tools" event the traffic question refers to.

---

## A. TRAFFIC-DROP INVESTIGATION (the headline question)

**Do not conclude "new tools caused the drop."** Here is what the evidence actually supports, ranked by probability, with honest labels.

### A1 — Canonical domain is parked on a marketplace — CONFIRMED (observation), LIKELY (cause)
`pdfstudio.app` currently **302-redirects to a domain-sale page** (`fortune.domains`), serves 404s for tool routes, and its DNS is on `ns1/ns2.squadhelp.com` (a domain broker). The entire SEO layer hard-codes `https://pdfstudio.app` as canonical/sitemap base. If this is the domain Google indexed, the whole site is being deindexed right now. **This is the most likely single cause of a traffic collapse** and dwarfs every on-page issue below. Cannot be *proven* the cause without GSC, but it is the first thing to verify. → see SECURITY-PRIVACY-AUDIT §1.

### A2 — Near-duplicate sibling pages multiplied as the catalogue grew — CONFIRMED (similarity), LIKELY (cause)
Adding tools added **near-duplicate pages** that compete with each other:
- `compress-pdf-to-200kb` ↔ `500kb` = **56.7%** rendered-text similarity; `500kb` ↔ `1mb` = **55.0%** (boilerplate floor is 39.4%). All four `compress-pdf-to-*` variants render the identical `CompressToTargetView` with the **same 6-target selector** (a "compress to 500KB" page visibly offers 100KB and 1MB too).
- `jpg-to-png` ↔ `png-to-jpg` = 49.2%; `coin-flip` ↔ `dice-roller` = 52.6% (shared views).

**Mechanism that matches the symptom:** as you add thin, near-duplicate pages, Google can (a) fold variants under "Duplicate, Google chose a different canonical," and (b) lower the **sitewide** quality assessment, which can depress rankings of *existing, previously-ranking* pages — i.e. traffic drops *after* an expansion even though the old pages didn't change. This is the classic "expanded with thin pages → sitewide demotion" pattern. LIKELY contributor; NEEDS-GSC to confirm ("Duplicate" / "Crawled – not indexed" counts).

### A3 — Every tool page is thin — CONFIRMED
All 81 tool pages carry only ~250–300 words of unique copy and sit **at the enforced minimum** (validator floors: ≥4 FAQs, ≥3 HowTo, seoCopy ≥300 chars — `lib/tools/validate.ts:110-119`). The floor became the ceiling. Median `seoCopy` = 81 words. Against established competitors on head terms ("compress pdf online free"), this is not competitive depth. Adding 23 more thin pages amplified the sitewide thinness. LIKELY contributor.

### A4 — Tool pages cannibalize blog posts — CONFIRMED
`/compress-pdf-to-100kb` vs `/blog/how-to-compress-pdf-to-100kb`; `/passport-photo-pdf` vs `/blog/create-passport-photo-pdf-online`; `/pdf-to-word` vs `/blog/convert-pdf-to-word-online-free`; plus two blog posts on the same NID intent. 4 of 8 posts collide with a tool page for the same query.

### A5 — Things that are NOT broken (ruled out)
- Sitemap includes **all 81** tool slugs, excludes widgets, excludes legacy slugs — CONFIRMED correct.
- Redirects: 21 entries, **no chains, no loops** — CONFIRMED.
- 100% content coverage with a build-failing validator — CONFIRMED.
- Widget `noindex` correct; FAQ/HowTo schema single-sourced with visible DOM.

### A6 — Cannot be assessed from the repo — NEEDS-GSC / NEEDS-ANALYTICS
Algorithm updates, seasonality, normal variance, actual impressions/clicks/positions, and whether analytics was even recording. **No conversion analytics is running** (see F) — so the owner may be seeing Vercel Analytics pageviews only, with no tool-completion data.

**Verdict:** the drop is most plausibly **A1 (parked domain)** and/or **A2+A3 (thin near-duplicate expansion → sitewide demotion)**, not "new tools" per se. Fix the domain first, then thin/duplicate content. Confirm with GSC "Pages" report (Indexed vs Duplicate vs Crawled-not-indexed) and the "Performance" report date range around the expansion.

---

## B. Metadata pipeline

`lib/tools/metadata.ts` builds title (`toSeoTitle(primaryKeyword)` + `%s · PDF Studio`), description (`metaDescription`, ≤160 enforced), self-referencing canonical, OG/Twitter. **No duplicate titles or descriptions** across all 81 (verified). **BUT:**

- **B1 (CONFIRMED):** `validateRegistry` enforces `metaDescription` uniqueness but **not `primaryKeyword`/title uniqueness** (`validate.ts:104-108`). Titles are unique today by luck; tool #82 could ship a dup `<title>` and the build would pass. → add a title-uniqueness check.
- **B2 (CONFIRMED):** OG/Twitter title (`${cardTitle} - PDF Studio`) differs from `<title>` on every tool page — social previews lose the keyword. Cosmetic.
- **B3 (CONFIRMED):** hub pages set no `twitter` block; `/tools` (links all 81) emits **no JSON-LD** at all.

---

## C. 404 / robots correctness — CONFIRMED bugs

- **C1:** the 404 page emits **two contradictory `robots` metas** — Next's own `noindex` **and** an inherited `index, follow` from `app/layout.tsx:74-83` — plus a canonical to the homepage. Contradictory directives + homepage canonical on every 404 is a textbook soft-404 signal. Guarded by `tests/e2e/seo/seo.spec.ts` ("404 does not emit contradictory robots").
- **C2:** the same inherited-canonical bug points `/widget/*` at the homepage (noindex wins, but it's wrong).
- **C3:** `/settings` and `/workspace` are indexable and in the sitemap — no search value, dilutes crawl budget.

---

## D. Structured data

Tool pages emit `BreadcrumbList` + `SoftwareApplication` + `FAQPage` + `HowTo`; hubs emit `ItemList`; home emits `WebApplication`/`WebSite`/`Organization`/`FAQPage`. FAQ/HowTo schema is single-sourced with the visible DOM (cannot drift) — **good**. Gaps: `HowTo` rich results were deprecated by Google (2023, harmless); `SoftwareApplication` has no `aggregateRating` (no star rich result); `Organization` `@id` not linked across blog/vs `publisher` nodes; `/tools` has no `ItemList`/`CollectionPage`.

---

## E. Internal linking — CONFIRMED gaps

- **E1:** all **6 `/vs/*` competitor pages are orphans** — in the sitemap, **zero** internal links anywhere (grepped across app/components/features/content). High-intent commercial pages getting no link equity.
- **E2:** tool pages **never link to their own hub** — the 4-level breadcrumb exists only in JSON-LD (`ToolPage.tsx:31,43-50`); the only visible nav is `← All tools`. No visible breadcrumb component exists on the site.
- **E3:** cross-domain related picks are drawn only from the 38 featured/trending tools, so **43 tools never receive a cross-domain internal link**.
- **E4:** blog links only ~12 of 81 tools; 69 tools have no blog link.

Positive: `/tools` lists all 81, so max crawl depth to any tool is **2 clicks** — no orphaned *tools*.

---

## F. Analytics — CONFIRMED: nothing is recording conversions

Three stacks load, but: **Plausible domain env is unset** → all 11 `trackEvent` calls (`tool_started/completed/failed`, `download_clicked`, …) are **silent no-ops**. Vercel Analytics loads but receives **no custom events**. **There is no way to correlate organic landings with tool completions.** Google/Bing verification env tags are also unset. → set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (or GA4) and confirm GSC is verified for the *served* domain before diagnosing traffic further.

Also: homepage FAQ says "we don't show ads" (`FaqSection.tsx:7`) while AdSense is wired into every tool/hub page — if `NEXT_PUBLIC_ADSENSE_CLIENT` is set in prod, that becomes a **false statement inside FAQPage structured data**. (CONFIRMED text / POSSIBLE impact)

---

## G. Priority SEO fixes

| # | Fix | Impact | Effort | Label |
|---|---|---|---|---|
| 1 | Resolve/repoint the canonical domain; 301 old→new | Critical | M | CONFIRMED |
| 2 | Verify GSC on the served domain; read Pages + Performance reports | Critical (diagnosis) | S | NEEDS-GSC |
| 3 | De-duplicate the compress-*/mirror pages: differentiate copy, or consolidate variants under one canonical with anchors | High | M | CONFIRMED |
| 4 | Deepen the top ~15 head-term tool pages well past the minimum (unique use-cases, limits, examples) | High | L | CONFIRMED |
| 5 | Fix the 404 double-robots + homepage-canonical inheritance | High | S | CONFIRMED |
| 6 | Turn on analytics (Plausible domain / GA4) so conversions are measurable | High | S | CONFIRMED |
| 7 | Add visible breadcrumbs + tool→hub links; link the 6 `/vs` pages | Medium | M | CONFIRMED |
| 8 | Resolve tool↔blog cannibalization (canonical or intent split) | Medium | M | CONFIRMED |
| 9 | Add title-uniqueness to `validateRegistry`; noindex `/settings`,`/workspace` | Low | S | CONFIRMED |
| 10 | Fix "58 tools" stale copy → 81; fix "no ads" FAQ vs AdSense | Low | S | CONFIRMED |
