# Domain Go-Live Checklist — PDF Studio

_The production domain `pdfstudio.app` is currently parked on a broker (Squadhelp/Atom) and 302-redirects to a for-sale page. It will be purchased/repointed separately. **Do not** treat production SEO as fixed until every box below is checked against the served domain._

The application is already **single-config for the domain**: everything canonical/sitemap/OG/robots derives from `NEXT_PUBLIC_SITE_URL` (falling back to `https://${DOMAIN}` from `frontend/brand.config.ts`). Changing the live domain is one env var + one deploy — no code changes.

## Where the domain comes from (verified single source)

| Concern | Source | Notes |
|---|---|---|
| Canonicals | `siteConfig.url` → `NEXT_PUBLIC_SITE_URL` \|\| `https://pdfstudio.app` | Baked at **build** time (SSG). A rebuild is required after changing it. |
| Sitemap / robots | `app/sitemap.ts`, `app/robots.ts` (use `siteConfig.url`) | |
| OG images | `/og?...` absolute URLs from `siteConfig.url` | |
| Brand name/domain | `frontend/brand.config.ts` (`DOMAIN = "pdfstudio.app"`) | Change here only if the brand domain itself changes. |
| Backend CORS | `CORS_ORIGINS_RAW` (backend env) | Must list the live frontend origin. |

## Checklist (run in order, after the domain is in hand)

1. **Domain purchased / recovered** — confirm ownership at the registrar; move off the Squadhelp nameservers (`ns1/ns2.squadhelp.com`).
2. **DNS configured** — A/AAAA/CNAME to the host (Vercel/Render/VPS). `dig +short <domain>` resolves to your host, not `52.20.84.62`.
3. **HTTPS verified** — valid cert, `https://<domain>` loads the app (not a 302 to a parking page). `curl -I https://<domain>` → `200`.
4. **`NEXT_PUBLIC_SITE_URL` set** to `https://<domain>` in the frontend deploy env (Vercel project / Docker `.env` / Render). If the brand domain changed, also update `brand.config.ts`.
5. **`CORS_ORIGINS_RAW`** (backend) set to the live frontend origin(s). Backend refuses to boot in production with this empty (intentional).
6. **Rebuild + deploy** the frontend (canonicals are build-time). Confirm the deploy used the new env.
7. **Canonical verified** — `curl -s https://<domain>/compress-pdf | grep canonical` → `href="https://<domain>/compress-pdf"` (not localhost, not the old domain).
8. **Sitemap verified** — `https://<domain>/sitemap.xml` returns 200, lists all 81 tool slugs with `https://<domain>/...`, excludes `/widget/*` and legacy `/tools/*` slugs.
9. **robots.txt verified** — `https://<domain>/robots.txt` disallows `/api/`, points `Sitemap:` at `https://<domain>/sitemap.xml`.
10. **OpenGraph verified** — `/og?...` images render (test a tool URL in a link-preview debugger). Note: the OG route is `runtime="edge"`; confirm it works on the chosen host (a known friction point for standalone Node/self-host — smoke-test it).
11. **Structured data verified** — Rich Results Test on a tool URL shows FAQPage + BreadcrumbList + SoftwareApplication with no errors.
12. **301 redirects verified** — legacy `/tools/<old-slug>` → clean slug returns 301/308 with the correct `Location`. Aliases `/compress`,`/merge`,`/ocr`,`/sign` resolve.
13. **404 verified** — an unknown slug returns HTTP 404 with a single `noindex` (no `index,follow`, no homepage canonical). Fixed in this branch; re-confirm on prod.
14. **GSC property added** — add `https://<domain>` (or the Domain property) in Google Search Console; verify via the `NEXT_PUBLIC_GOOGLE_VERIFICATION` meta tag (set the env) or DNS TXT.
15. **Sitemap submitted to GSC** — submit `https://<domain>/sitemap.xml`; watch Coverage.
16. **Analytics verified** — set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (or wire GA4) so `trackEvent` stops being a no-op; confirm `tool_view` / `tool_completed` events arrive. On Vercel, Web Analytics auto-enables; off-Vercel it stays gated (no console 404 — fixed in this branch).
17. **Old / parked domain behavior** — once live, 301 the parked domain (if retained) to the new one; otherwise confirm it no longer serves conflicting content Google might index.
18. **Post-launch indexing monitor** — GSC "Pages" report for Indexed vs Duplicate vs Crawled-not-indexed over the following 2–4 weeks; this is where the pre-existing traffic diagnosis gets confirmed or ruled out.

## Explicitly NOT done in this branch (needs the domain / external access)

- DNS / registrar changes.
- Setting the production `NEXT_PUBLIC_SITE_URL`.
- Adding/verifying the GSC property and submitting the sitemap.
- Confirming causation of the historical traffic drop (needs GSC + Analytics data).
