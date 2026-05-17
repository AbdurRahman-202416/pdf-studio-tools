# PDF Studio, Frontend

Next.js 16 (App Router) frontend for the PDF Studio toolkit.

## Stack

- **Next.js 16** with Turbopack and App Router
- **React 19**, TypeScript strict mode
- **Tailwind CSS v4** (no `tailwind.config.js`, theme via `@theme` in `globals.css`)
- **Zustand** for the workspace state (`store/pdfStore.ts`)
- **Framer Motion** for entry animations
- **React Dropzone** + **@dnd-kit** for upload and reorder
- **sonner** for toasts
- **lucide-react** for icons
- **next-mdx-remote/rsc** + **gray-matter** for the MDX blog
- **Plausible** analytics (loaded only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set)

## Quick start

```bash
npm install
cp .env.example .env.local      # adjust API base URL if needed
npm run dev                     # http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`react-hooks/set-state-in-effect` enforced) |
| `npm run test:e2e` | Playwright E2E tests |

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8000/api` | FastAPI base URL |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Used for canonical URLs, sitemap, OG, JSON-LD |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | (unset) | Enables Plausible script when set |
| `LEADS_WEBHOOK_URL` | (unset) | Email-capture POST destination (e.g., Google Apps Script). Falls back to "captured locally" if unset |

## Project layout

```
app/
  page.tsx               home with hero, tool grid, FAQ
  layout.tsx             root layout, head metadata, theme bootstrap
  icon.tsx               dynamic 64x64 PNG favicon via ImageResponse
  apple-icon.tsx         dynamic 180x180 Apple touch icon
  manifest.ts            PWA manifest
  sitemap.ts             dynamic sitemap (tools + blog + vs pages)
  robots.ts
  og/route.tsx           OG image generator (1200x630)
  blog/[slug]/page.tsx   MDX blog
  vs/[competitor]/page.tsx  comparison pages
  widget/[tool]/page.tsx    embeddable tool widgets (no chrome)
  roadmap/page.tsx
  api/leads/route.ts     email-capture endpoint
  tools/                 one route per tool
  workspace/             merge / compress / split / rotate
components/
  brand/Logo.tsx         <LogoMark> + <Logo> with gradient "P" mark
  layout/                Navbar, Sidebar, Footer, AppShell, MobileNav
  share/ShareButtons.tsx Copy / Twitter / WhatsApp / Facebook
  email/EmailCapture.tsx Footer email form
  analytics/Plausible.tsx
  seo/                   SiteConfig, JsonLd, helpers
features/
  tools/
    components/
      ToolShell.tsx      shared tool layout (title, badge, side card)
      ToolResult.tsx     post-process success card with download + preview
      ResultPreview.tsx  PDF / image / ZIP / XLSX preview, content-type aware
    views/               PdfToJpgView, PdfLockView
  pdf/                   workspace components (upload, reorder, compress)
  home/                  TrustStrip, FaqSection
services/
  api.ts                 workspace API client
  tools-api.ts           tool routes API client
store/pdfStore.ts        Zustand workspace store
content/
  blog/*.mdx
  competitors.ts
  roadmap.ts
proxy.ts                 Next 16 proxy (UTM cookies, was middleware.ts in older Next)
```

## Notable patterns

- **AppShell** wraps the root layout and removes Navbar/Sidebar/Footer for any path starting with `/widget` (`components/layout/AppShell.tsx`). That lets widget routes render bare for iframe embedding.
- **`proxy.ts`** runs on every non-static request and stamps UTM params into cookies (30-day TTL) for attribution. In Next 16 the file is named `proxy.ts` with exported function `proxy`. The old `middleware.ts` name is deprecated.
- **Result preview** is a single component (`features/tools/components/ResultPreview.tsx`) that inspects the response `Content-Type` from `/api/tools/preview/{id}` and dispatches to image / paginated PDF / spreadsheet table renderers, with always-visible thin scrollbars via the `.preview-scroll` utility in `globals.css`.
- **State after a key change** uses the React 19 "set state in render" pattern (see `MobileNav` and `ResultPreview`), so the ESLint `react-hooks/set-state-in-effect` rule stays clean.
- **Logo** is a pure SVG component (`components/brand/Logo.tsx`) with a gradient rounded square and a hand-drawn bold "P" path (no font dependency, scales to any size). The favicon and Apple icon use the same gradient via `next/og` `ImageResponse`.

## Production build

```bash
npm run build           # produces .next/standalone + .next/static
npm run start           # or: node .next/standalone/server.js
```

The build emits 27 routes (mix of static SSG and dynamic edge). `output: "standalone"` in `next.config.ts` keeps the Docker image small.

## CSP / framing

- `/widget/*` allows third-party iframe embedding (`frame-ancestors *`)
- Every other route is `SAMEORIGIN`

## SEO

- `metadataBase` set from `NEXT_PUBLIC_SITE_URL`
- Per-route `generateMetadata` for tool / vs / blog pages
- Auto sitemap including blog slugs and competitor slugs (widgets are excluded, `noindex`)
- JSON-LD: `WebApplication` + `Organization` on home, `FAQPage` on FAQ, `BlogPosting` per blog post, `Article` on `/vs/*`
- Open Graph + Twitter cards on every page, pointing at `/og?title=...&subtitle=...`

## Testing

```bash
npx playwright install --with-deps
npm run test:e2e
```

Playwright starts the dev servers via `playwright.config.ts > webServer`.
