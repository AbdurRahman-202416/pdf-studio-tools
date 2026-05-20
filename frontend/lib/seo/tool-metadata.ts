import type { Metadata } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";
import { getTool } from "@/lib/seo/tool-registry";

/**
 * Build per-tool Metadata from the registry. Used by every clean-slug
 * tool layout so titles, descriptions, canonicals, OG, and Twitter are
 * generated identically from one source of truth.
 */
export function toolMetadata(slug: string): Metadata {
  const tool = getTool(slug);
  if (!tool) return {};
  const canonical = `${siteConfig.url}/${tool.slug}`;
  const ogImage = `${siteConfig.url}/og?title=${encodeURIComponent(
    tool.displayName,
  )}&subtitle=${encodeURIComponent(tool.primaryKeyword)}`;
  return {
    title: tool.primaryKeyword,
    description: tool.metaDescription,
    keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
    alternates: { canonical },
    openGraph: {
      title: `${tool.displayName} - ${siteConfig.name}`,
      description: tool.metaDescription,
      url: canonical,
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.displayName} - ${siteConfig.name}`,
      description: tool.metaDescription,
      images: [ogImage],
    },
  };
}
