import type { MetadataRoute } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";
import { toolRegistry } from "@/lib/seo/tool-registry";
import { listPosts, listSlugs as listBlogSlugs } from "@/lib/blog";
import { listCompetitorSlugs } from "@/content/competitors";

const STATIC_ROUTES = [
  "",
  "tools",
  "workspace",
  "blog",
  "roadmap",
  "about",
  "privacy",
  "terms",
];

/**
 * Stable "content last changed" date for non-blog routes. Bump this on
 * meaningful releases. Using a fixed date (rather than `new Date()` on every
 * request) avoids the perma-fresh lastmod that makes Google ignore the signal.
 */
const SITE_LAST_UPDATED = new Date("2026-07-11");

export default function sitemap(): MetadataRoute.Sitemap {
  // Clean canonical routes - these are the URLs we want indexed.
  const tools = toolRegistry.map((t) => t.slug);
  const blog = listBlogSlugs().map((s) => `blog/${s}`);
  const vs = listCompetitorSlugs().map((c) => `vs/${c}`);
  const toolSlugs = new Set(toolRegistry.map((t) => t.slug));

  // Real per-post dates from blog frontmatter.
  const blogDates = new Map(
    listPosts().map((p) => [`blog/${p.slug}`, new Date(p.date)]),
  );

  return [...STATIC_ROUTES, ...tools, ...blog, ...vs].map((p) => {
    const url = p ? `${siteConfig.url}/${p}` : siteConfig.url;
    const isTool = toolSlugs.has(p);
    const isBlog = p.startsWith("blog/");
    return {
      url,
      lastModified: blogDates.get(p) ?? SITE_LAST_UPDATED,
      changeFrequency:
        p === ""
          ? "weekly"
          : isBlog
            ? "monthly"
            : isTool
              ? "weekly"
              : "monthly",
      priority: p === "" ? 1 : isTool ? 0.9 : isBlog ? 0.7 : 0.6,
    };
  });
}
