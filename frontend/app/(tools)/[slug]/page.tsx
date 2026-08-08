import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { HubPage } from "@/features/hubs/HubPage";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { siteConfig } from "@/components/seo/SiteConfig";
import { getTool, tools } from "@/lib/tools";
import { getToolContent } from "@/lib/tools/content";
import { DOMAIN_HUBS, getHubBySegment } from "@/lib/tools/domains";
import { toolMetadata } from "@/lib/tools/metadata";
import { validateRegistry } from "@/lib/tools/validate";

/**
 * One root route for every tool AND every domain hub.
 *
 * Both live at root slugs - tools because root slugs rank better, hubs because
 * `/image` reads better than `/category/image` - and Next allows only one
 * dynamic segment per level, so this route dispatches between them.
 * RESERVED_SLUGS keeps a tool from ever claiming a hub segment.
 *
 * Static segments (/about, /blog, /tools, ...) resolve before this one.
 */
export async function generateStaticParams() {
  // Runs once per build. Throwing here fails `next build`, which is the only
  // gate CI actually has (lint + build - there is no test runner).
  await validateRegistry();

  // Only emit a hub that actually has tools; an empty hub is a thin page.
  const hubs = DOMAIN_HUBS.filter((h) => tools.some((t) => t.domain === h.domain)).map((h) => ({
    slug: h.segment,
  }));

  return [...hubs, ...tools.map((t) => ({ slug: t.slug }))];
}

/** Only known slugs exist; anything else 404s rather than rendering dynamically. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const hub = getHubBySegment(slug);
  if (hub) {
    const canonical = `${siteConfig.url}/${hub.segment}`;
    const ogImage = `${siteConfig.url}/og?title=${encodeURIComponent(
      hub.title,
    )}&subtitle=${encodeURIComponent(hub.heading)}`;
    return {
      title: hub.title,
      description: hub.metaDescription,
      alternates: { canonical },
      openGraph: {
        title: `${hub.title} - ${siteConfig.name}`,
        description: hub.metaDescription,
        url: canonical,
        type: "website",
        siteName: siteConfig.name,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
    };
  }

  return toolMetadata(slug);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const hub = getHubBySegment(slug);
  if (hub) return <HubPage hub={hub} />;

  const meta = getTool(slug);
  if (!meta) notFound();

  // Defensive: next.config.ts already 308s legacy slugs, but if one ever reaches
  // the route we still send it to the canonical URL rather than serving a duplicate.
  if (meta.slug !== slug) permanentRedirect(`/${meta.slug}`);

  const content = await getToolContent(meta.slug);
  if (!content) notFound();

  return <ToolPage meta={meta} content={content} />;
}
