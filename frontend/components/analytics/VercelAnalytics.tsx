import { Analytics } from "@vercel/analytics/next";

import { siteConfig } from "@/components/seo/SiteConfig";

/**
 * Vercel Web Analytics, but only when the app is actually served by Vercel (or
 * explicitly enabled). Off-Vercel, `<Analytics/>` requests
 * `/_vercel/insights/script.js`, which the host returns as a 404 HTML page —
 * producing a console error and a MIME-type warning on EVERY page. Gating it
 * keeps self-hosted deployments (Docker/Render/VPS) console-clean.
 */
export function VercelAnalytics() {
  if (!siteConfig.vercelAnalytics) return null;
  return <Analytics />;
}
