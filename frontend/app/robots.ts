import type { MetadataRoute } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";

/**
 * Robots policy.
 *
 * Allow all public surfaces, disallow the API + widget embeds (they
 * exist for cross-origin embed only, not indexable content), and point
 * crawlers at the sitemap. Major engines get a slightly faster crawl
 * delay because our content is mostly tool pages with stable copy.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/widget/"],
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: "/",
        disallow: ["/api/", "/widget/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
