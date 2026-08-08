import Link from "next/link";

import { AdSlot } from "@/components/ads/AdSlot";
import { ToolCard } from "@/components/ui/ToolCard";
import { ToolSlider } from "@/components/ui/ToolSlider";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { tools, trendingTools } from "@/lib/tools";
import { DOMAIN_HUBS, type DomainHub } from "@/lib/tools/domains";
import { groupsForDomain, toolsInGroup } from "@/lib/tools/groups";

/**
 * Domain hub (/pdf, /image, /developer, ...).
 *
 * A component rather than its own route: hubs and tools both live at root
 * slugs, and Next allows only one dynamic segment per level, so the `/[slug]`
 * route dispatches between them. RESERVED_SLUGS stops a tool claiming a hub
 * segment, and the registry test enforces it.
 *
 * Structure is deliberate:
 *   - a small curated "Trending" slider (client, and skipped entirely for
 *     domains with fewer than five tools - a carousel over two items is worse
 *     than no carousel)
 *   - the COMPLETE listing below as plain server-rendered links, grouped by
 *     job. Every tool in the domain appears here, so crawlers index all of
 *     them and nothing depends on JavaScript running.
 */
export function HubPage({ hub }: { hub: DomainHub }) {
  const list = tools.filter((t) => t.domain === hub.domain);
  if (!list.length) return null;

  const trending = trendingTools(hub.domain);
  const groups = groupsForDomain(hub.domain);
  const clientCount = list.filter((t) => t.runtime === "client").length;
  const canonical = `${siteConfig.url}/${hub.segment}`;

  return (
    <div className="space-y-14" data-domain={hub.domain}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
              { "@type": "ListItem", position: 2, name: "All tools", item: `${siteConfig.url}/tools` },
              { "@type": "ListItem", position: 3, name: hub.title, item: canonical },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: hub.title,
            numberOfItems: list.length,
            itemListElement: list.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: t.cardTitle,
              url: `${siteConfig.url}/${t.slug}`,
            })),
          },
        ]}
      />

      <header className="max-w-2xl space-y-3">
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          {list.length} {list.length === 1 ? "tool" : "tools"}
          {clientCount > 0 && ` · ${clientCount} run in your browser`}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.05]">
          {hub.heading}
        </h1>
        <p className="text-muted-foreground leading-relaxed">{hub.intro}</p>
      </header>

      {trending.length > 0 && (
        <section aria-labelledby="trending-heading" className="space-y-5">
          <h2
            id="trending-heading"
            className="font-display text-xl font-medium tracking-tight"
          >
            Trending in {hub.title.replace(/ Tools?$/i, "")}
          </h2>
          <ToolSlider tools={trending} label={`Trending ${hub.title}`} interval={5200} />
        </section>
      )}

      {/* Complete listing. Server-rendered anchors - no client dependency. */}
      <div className="space-y-12">
        {groups.map((group, gi) => {
          const groupTools = toolsInGroup(group);
          if (!groupTools.length) return null;
          const headingId = `g-${hub.segment}-${gi}`;
          return (
            <section key={group.title || gi} aria-labelledby={group.title ? headingId : undefined}>
              {group.title && (
                <h2
                  id={headingId}
                  className="font-display mb-5 flex items-baseline gap-2.5 text-xl font-medium tracking-tight"
                >
                  {group.title}
                  <span className="text-sm font-normal text-muted-foreground">
                    {groupTools.length}
                  </span>
                </h2>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupTools.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <AdSlot placement="hub" />

      <nav aria-label="Other categories" className="space-y-4 border-t border-border pt-10">
        <h2 className="font-display text-2xl font-medium tracking-tight">Other categories</h2>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_HUBS.filter(
            (h) => h.domain !== hub.domain && tools.some((t) => t.domain === h.domain),
          ).map((h) => (
            <Link
              key={h.segment}
              href={`/${h.segment}`}
              data-domain={h.domain}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition hover:border-primary/40 hover:text-primary"
            >
              {h.title}
            </Link>
          ))}
          <Link
            href="/tools"
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition hover:border-primary/40 hover:text-primary"
          >
            All {tools.length} tools →
          </Link>
        </div>
      </nav>
    </div>
  );
}
