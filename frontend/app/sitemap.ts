import type { MetadataRoute } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";
import { toolRegistry } from "@/lib/seo/tool-registry";
import { listSlugs as listBlogSlugs } from "@/lib/blog";

const STATIC_ROUTES = ["", "tools", "workspace", "settings", "blog", "roadmap", "about"];
const COMPETITORS = ["smallpdf", "ilovepdf", "adobe-acrobat"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Clean canonical routes - these are the URLs we want indexed.
  const tools = toolRegistry.map((t) => t.slug);
  const blog = listBlogSlugs().map((s) => `blog/${s}`);
  const vs = COMPETITORS.map((c) => `vs/${c}`);
  const toolSlugs = new Set(toolRegistry.map((t) => t.slug));

  return [...STATIC_ROUTES, ...tools, ...blog, ...vs].map((p) => {
    const url = p ? `${siteConfig.url}/${p}` : siteConfig.url;
    const isTool = toolSlugs.has(p);
    const isBlog = p.startsWith("blog/");
    return {
      url,
      lastModified: now,
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
