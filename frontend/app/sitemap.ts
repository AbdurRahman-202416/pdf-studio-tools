import type { MetadataRoute } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";
import { listSlugs as listBlogSlugs } from "@/lib/blog";

const STATIC_ROUTES = [
  "",
  "tools",
  "workspace",
  "settings",
  "blog",
  "roadmap",
  "tools/nid-combine",
  "tools/bangla-ocr",
  "tools/bank-to-excel",
  "tools/photo-to-pdf",
  "tools/govt-forms",
  "tools/pdf-to-jpg",
  "tools/pdf-lock",
];

const COMPETITORS = ["smallpdf", "ilovepdf", "adobe-acrobat"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blog = listBlogSlugs().map((s) => `blog/${s}`);
  const vs = COMPETITORS.map((c) => `vs/${c}`);
  return [...STATIC_ROUTES, ...blog, ...vs].map((p) => {
    const url = p ? `${siteConfig.url}/${p}` : siteConfig.url;
    return {
      url,
      lastModified: now,
      changeFrequency: p === "" ? "weekly" : "monthly",
      priority: p === "" ? 1 : p.startsWith("tools/") ? 0.8 : 0.6,
    };
  });
}
