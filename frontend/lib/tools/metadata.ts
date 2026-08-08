import type { Metadata } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";
import { getTool } from "@/lib/tools";
import { getToolContent } from "@/lib/tools/content";
import { toSeoTitle } from "@/lib/tools/seo-title";

/**
 * Per-tool Metadata, built from the slim registry plus the server-only content
 * module. One source of truth for titles, descriptions, canonicals, OG and
 * Twitter across every tool page.
 */
export async function toolMetadata(slug: string): Promise<Metadata> {
  const meta = getTool(slug);
  if (!meta) return {};
  const content = await getToolContent(meta.slug);
  if (!content) return {};

  const canonical = `${siteConfig.url}/${meta.slug}`;
  const ogImage = `${siteConfig.url}/og?title=${encodeURIComponent(
    meta.cardTitle,
  )}&subtitle=${encodeURIComponent(content.primaryKeyword)}`;

  return {
    // The <title> is the target keyword, properly cased. primaryKeyword is
    // stored lowercase (it is the literal query); rendered verbatim it made
    // every SERP title lowercase, which reads as unfinished and costs clicks.
    title: toSeoTitle(content.primaryKeyword),
    description: content.metaDescription,
    keywords: [content.primaryKeyword, ...content.relatedKeywords],
    alternates: { canonical },
    openGraph: {
      title: `${meta.cardTitle} - ${siteConfig.name}`,
      description: content.metaDescription,
      url: canonical,
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.cardTitle} - ${siteConfig.name}`,
      description: content.metaDescription,
      images: [ogImage],
    },
  };
}
