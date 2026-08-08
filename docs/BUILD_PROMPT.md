# Build Prompt — All-in-One Tools Platform

> Copy everything below the line into a fresh Claude Code session opened at
> `/Users/user/Project/pdf-tool`. Nothing above the line is part of the prompt.

---

You are working in an existing, shipping product at `/Users/user/Project/pdf-tool` — a Next.js 16 (App Router, Tailwind v4, no config file) frontend and a FastAPI backend with 20 PDF tool endpoints. It works. **Do not rewrite it, do not scaffold a new project, do not migrate frameworks.** You are extending and re-skinning it.

Read `docs/product-strategy-2026.md` and `CLAUDE.md` first. There is also an architecture blueprint in this repo proposing a 6-phase, 26-week platform build. **That blueprint is over-scoped for a solo developer with no revenue. Follow the scope in this prompt instead** — it takes the blueprint's good ideas (runtime split, two-axis taxonomy, pSEO discipline) and drops the parts that require a funded team (Redis workers, object storage, job queues, SSO, EU data residency, video/audio, LibreOffice containers, 500-tool target).

## Goal

Turn a PDF-only tool site into a **colourful, distinctly-designed, animated all-in-one tools platform** aimed at a US/UK audience, monetised by Google AdSense. Ship ~35 tools total. Every architectural decision is judged by one question: *does this add traffic or reduce cost?* If neither, don't build it.

---

## Task A — Architecture (do this first, ~1 week)

The current tool model hardcodes two assumptions that block everything else: every tool is a PDF tool, and every tool needs a server.

**A1. Fix the real bundle leak.** Three client components import the registry at module scope, pulling all 21 tools' FAQ prose into their bundles:

```
app/tools/id-card-to-pdf/page.tsx
app/tools/pdf-to-excel-converter/page.tsx
app/tools/pdf-ocr-online-free/page.tsx
```

Each does `"use client"` + `const tool = getTool("...")`. Split each into a server `page.tsx` (reads the registry, passes the tool object as a prop) and a client `*Client.tsx`. Then add `import "server-only"` to the SEO-prose module so this can never regress. Note: `ToolPageShell.tsx` and `app/page.tsx` are already server components and are **not** leaking — verify before you "fix" them.

**A2. Split the registry into two modules.**
- `lib/tools/index.ts` — slim: `id, slug, domain, operation, runtime, surface, icon, status, cardTitle, cardBlurb`. Safe for client import.
- `lib/tools/content/<domain>/<slug>.ts` — heavy: `metaDescription, faqs, howTo, seoCopy, relatedKeywords`. Marked `server-only`.

**A3. Add the fields the current model lacks.**
```ts
type Domain    = 'pdf'|'image'|'text'|'data'|'code'|'color'|'convert'|'security';
type Operation = 'convert'|'optimize'|'edit'|'organize'|'secure'|'extract'|'generate'|'format';
type Runtime   = 'client' | 'server';
type Surface   = 'drop' | 'text' | 'form';
```
Make `backendEndpoint` **optional** — it is currently `backendEndpoint: string` (required), which makes client-only tools impossible to express. Add a declarative `options: OptionSchema[]` (`{kind: 'select'|'number'|'toggle'|'color'|'text', key, label, default, min, max, choices, showIf}`) so one `<ToolOptionsPanel>` renders every tool's controls. Bespoke views stay possible via the existing `customComponent` escape hatch.

**A4. Collapse per-tool route folders** into `app/(tools)/[slug]/page.tsx` with `generateStaticParams()` + `generateMetadata()` from the registry. Tools stay at **root** slugs (`/compress-pdf`, not `/pdf/compress-pdf`) — this is already correct, keep it. Add a `RESERVED_SLUGS` constant (`blog`, `about`, `vs`, `guides`, `widget`, `privacy`, `terms`, `tools`) plus a registry unit test that fails if any tool claims one. Keep every existing `legacySlug` 301 in `proxy.ts` working — **no indexed URL may break.**

**A5. Migrate all 21 existing tools to the new shape.** Acceptance: every tool behaves identically to before, and adding a new tool touches exactly two files.

**Do not** refactor the backend into a decorator registry, and do not add Redis, a job queue, or object storage. 20 endpoints is not yet painful.

---

## Task B — 15 client-side tools (~2 weeks)

These run entirely in the browser: **zero server cost, zero cold start, sub-100ms results, and the best Core Web Vitals on the site.** They are how the tool count grows without an infrastructure bill.

JSON formatter/validator · Base64 encode/decode · Hash generator (MD5/SHA-1/SHA-256 via WebCrypto) · Password generator · UUID generator · Case converter · Word & character counter · Lorem ipsum generator · Color converter (HEX↔RGB↔HSL) · Contrast checker (real WCAG 2.2 pass/fail, not a toy) · Timestamp/epoch converter · Unit converter · Text diff checker · Regex tester · QR code generator.

Each tool's `execute` is a dynamic import — a visitor to `/compress-pdf` must never download the JSON parser. Every one of these gets a "Runs entirely in your browser — nothing is uploaded" badge, because it's true and provable, and it's a claim server-based competitors cannot make.

---

## Task C — Visual identity & motion

This is where the product stops looking like every other free-tools site. Read the design direction below and follow it exactly.

### The thesis

The subject of this product is **transformation**: something goes in, something measurably different comes out. Every design decision should serve that, and nothing on the page should be decoration that could be lifted onto an unrelated site.

### Colour is taxonomy, not decoration

The site is colourful because **each tool domain owns a hue**, and that hue is the only place saturated colour appears on a page. Users learn the taxonomy by colour. This is a structural device that encodes something true, and it is what makes "colourful" defensible rather than arbitrary.

Assign one hue per domain (PDF, Image, Text, Data, Code, Color, Convert, Security) and derive each tool page's accent from its domain. Everything else — surfaces, borders, text — stays neutral and quiet. Define these as semantic tokens in `@theme` (Tailwind v4, no config file): `--surface`, `--surface-raised`, `--border`, `--text-primary`, `--text-muted`, `--accent`, `--accent-soft`. Only `--accent*` changes between domains.

Both light and dark themes must be first-class. Verify 4.5:1 contrast in both.

### Typography

Do not use Inter or Geist as the display face — they are the default on every AI-built site and carry no personality.

- **Display:** a variable grotesque with real character — **Bricolage Grotesque** is a strong fit (engineered but warm, variable width and weight, free, self-hostable). Use it with restraint: headlines and the signature element only.
- **Body:** a clean neutral — **Public Sans** or **Satoshi**.
- **Mono:** **JetBrains Mono**, used for every number that represents data — file sizes, byte counts, dimensions, hashes, timings. Data should look like data.

Self-host via `next/font`, `display: swap`, subset. Headings at weight 500–600 with tight tracking (`-0.02em`). Avoid 700+ — heavy weights read cheap.

### The signature element

Build one memorable thing and keep everything around it quiet: **a live transform strip on the hero.** A real file visibly moving through the operation — the page thumbnail on the left, the result on the right, and between them a mono-set counter ticking the actual byte count down (`2.4 MB → 186 KB`) as it runs. Not a stock illustration, not a gradient blob, not a 3D shape. It shows the product's actual value proposition in the product's own vocabulary, and no competitor's homepage does this.

Reuse the same strip, at small scale, as the result panel on every file tool — so the hero is a genuine preview of the experience rather than marketing.

### Motion

One orchestrated page-load sequence beats scattered effects. Scattered micro-animations are the clearest tell of an AI-generated design.

- Page load: a single staggered reveal that ends on the transform strip starting its run.
- Scroll: one reveal treatment on the tool grid, not per-element confetti.
- Hover on a tool card: the card previews its own transformation in miniature (a page compressing, a colour converting, text reformatting). Motion that *demonstrates the tool* rather than just moving.
- Processing: real progress — bytes done, pages done. Never a fake indeterminate spinner.

Durations 150/200/300ms, standard ease `cubic-bezier(0.32, 0.72, 0, 1)`. Framer Motion is already installed. **`prefers-reduced-motion` must disable all of it** — including the hero strip, which should render its final state.

### What to avoid

Do not produce any of the three looks that AI design defaults to: cream background + high-contrast serif + terracotta accent; near-black + a single acid-green accent; or broadsheet hairline rules with zero border-radius. Also avoid 3D blobs, Corporate Memphis illustration, and gradient-mesh hero backgrounds.

Keep what already works in this codebase — tinted shadows keyed to the accent rather than grey, `rounded-2xl`/`3xl`, uppercase letter-spaced eyebrow labels, the custom `ToolIcon` wrapper. That vocabulary is already coherent; extend it rather than replacing it.

### Components to build

`AppShell` · `CommandPalette` (⌘K, fuzzy over name, keywords and file extensions — at 35+ tools search *is* the navigation, so this ships in this pass, not later) · `ToolCard` · `ToolGrid` · `DropSurface` (one component, states: idle → dragover → uploading → processing → done → error) · `ToolOptionsPanel` (schema-driven) · `ResultPanel` (the transform strip) · `Skeleton` set · `EmptyState` · domain hub pages (`/pdf`, `/image`, `/developer`, …).

---

## Constraints — all of these are acceptance criteria

**AdSense.** This site is monetised by ads, so design for them now rather than bolting them on:
- Reserve ad slots with fixed `min-height` at every breakpoint so ads cannot cause layout shift. CLS budget is 0.05 and ads are the most likely cause of blowing it.
- Never place an ad adjacent to the upload or download button. Accidental clicks are invalid traffic and get accounts banned.
- Ad placements: below the fold on hubs, in the sidebar, and on the result panel after a job completes (highest RPM, lowest annoyance).
- The site needs `/about` and `/contact` pages with a real name and a working contact route — AdSense rejects tool sites as "low value content" without them.

**Performance.** JS budget: **<120 KB on a client-only tool page, <180 KB on a server tool page**. Add a CI check that fails the build on regression. Targets: LCP <1.5s, INP <200ms, CLS <0.05 on a mid-tier Android over 4G. Every tool page is statically generated. Do **not** virtualise the tool grid — virtualised lists hide links from crawlers and would break internal linking; server-render and paginate instead.

**SEO.** Compute related-tool links from a scoring function (same domain, inverse operation, shared MIME type) rather than the hand-maintained `relatedSlugs` array. Extend the existing `BreadcrumbList` JSON-LD to include the domain hub level. Keep FAQPage/HowTo markup but invest nothing further in it — Google restricted FAQ rich results in 2023 and removed HowTo. Extend `tool-registry.test.ts` to fail the build on duplicate meta descriptions, fewer than 4 FAQs, or `seoCopy` under 300 characters.

**Programmatic SEO.** Do not mass-generate pages in this pass. Google's scaled-content-abuse policy penalises the whole site, not the page. When pSEO does start, it ships in waves of ~50 with genuinely unique substance per page.

**Region.** `features/home/MadeForBangladesh.tsx` is currently rendered unconditionally on the homepage while the target audience is US/UK. Convert it to `<RegionalModule region={...}>` driven by locale/geo, and add a `regions?: ('global'|'BD'|'IN'|'US'|'EU')[]` field so regional tools (NID Combine, Bangla OCR) surface only where they're relevant. Do not delete them — that traffic is real and it funds the rest. Move BD-specific copy (BPSC/BCS references) out of global tools' FAQs onto dedicated preset pages.

**Accessibility.** WCAG 2.2 AA, non-negotiable. Semantic landmarks, visible focus rings, keyboard-accessible drag-and-drop with a documented alternative, `aria-live` on async results, real labels on every input. Add `axe-core` to the existing Playwright suite.

**Copy.** Write labels from the user's side of the screen. An action keeps its name through the whole flow — a button that says "Compress" produces a toast that says "Compressed". Errors state what happened and what to do next, and never dead-end: always offer a retry or a relevant alternative tool. Empty states invite an action.

Generalise the one genuinely original idea already in this product: `compress-pdf` offers outcome buttons (Gmail / WhatsApp / portal) instead of "Light / Balanced / Maximum". **Every tool should do this** — resize-image offers "LinkedIn banner / passport photo / email attachment", not just a pixel field.

---

## How to work

1. Before writing code, produce a short design plan: 5–6 named hex values (neutrals + the domain hue set), the three typefaces with their roles, an ASCII wireframe of the homepage and of a tool page, and one sentence on the signature element. Check it against the "what to avoid" list, revise anything that reads like a default, and say what you changed. Show me the plan and wait for approval before building.
2. Then Task A, and confirm all 21 existing tools still work before moving on.
3. Then Task C's design system, applied to the existing tools.
4. Then Task B's 15 new tools using the new system.
5. Run `npm run lint`, `npm run build`, `npm run test` (Playwright) and `pytest` before claiming anything is done. Report actual output. If something fails, say so.

Do not add tools beyond the 15 listed. Do not touch billing, accounts, or the backend architecture. Ask before installing any dependency over 50 KB.
