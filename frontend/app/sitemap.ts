import type { MetadataRoute } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";
import { toolRegistry } from "@/lib/seo/tool-registry";
import { listSlugs as listBlogSlugs } from "@/lib/blog";

const STATIC_ROUTES = ["", "tools", "workspace", "settings", "blog", "roadmap", "about"];
const COMPETITORS = ["smallpdf", "ilovepdf", "adobe-acrobat"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const tools = toolRegistry.map((t) => `tools/${t.slug}`);
  const blog = listBlogSlugs().map((s) => `blog/${s}`);
  const vs = COMPETITORS.map((c) => `vs/${c}`);
  return [...STATIC_ROUTES, ...tools, ...blog, ...vs].map((p) => {
    const url = p ? `${siteConfig.url}/${p}` : siteConfig.url;
    return {
      url,
      lastModified: now,
      changeFrequency: p === "" ? "weekly" : "monthly",
      priority: p === "" ? 1 : p.startsWith("tools/") ? 0.8 : 0.6,
    };
  });
}
