import type { MetadataRoute } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";

/**
 * Robots policy.
 *
 * Allow all public surfaces, disallow the API, and point crawlers at the
 * sitemap. Widget embeds are deliberately NOT disallowed here: they carry a
 * noindex meta tag, and a crawler blocked by robots.txt would never see it.
 * Major engines get a slightly faster crawl delay because our content is
 * mostly tool pages with stable copy.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
