import Link from "next/link";

import { tools } from "@/lib/tools";
import { DOMAIN_HUBS } from "@/lib/tools/domains";

/**
 * Full category sitemap in the footer.
 *
 * The footer previously carried 11 links and three tools, which meant a
 * visitor two clicks deep had no cheap route back to the rest of the
 * catalogue, and crawlers had no site-wide path to the hubs. This puts every
 * category plus its most-used tools on every page.
 *
 * Server-rendered anchors, so it counts for crawl depth as well as for humans.
 * Deliberately not every tool - 81 links in a footer is noise. Each column
 * ends with a link to the hub, which does carry the complete list.
 */
const TOOLS_PER_COLUMN = 5;

export function FooterSitemap() {
  const columns = DOMAIN_HUBS.map((hub) => {
    const inDomain = tools.filter((t) => t.domain === hub.domain);
    // Lead with the curated picks; they are the ones worth the footer slot.
    const ordered = [...inDomain].sort(
      (a, b) =>
        Number(!!b.featured) - Number(!!a.featured) ||
        Number(!!b.trending) - Number(!!a.trending),
    );
    return { hub, total: inDomain.length, top: ordered.slice(0, TOOLS_PER_COLUMN) };
  }).filter((c) => c.total > 0);

  return (
    <nav aria-label="All tool categories" className="border-t border-border pt-10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {columns.map(({ hub, total, top }) => (
          <div key={hub.segment} data-domain={hub.domain}>
            <Link
              href={`/${hub.segment}`}
              className="group flex items-baseline gap-1.5 text-sm font-semibold hover:text-primary"
            >
              <span className="h-3 w-[3px] shrink-0 rounded-full bg-primary" aria-hidden />
              {hub.title}
              <span className="text-xs font-normal text-muted-foreground">{total}</span>
            </Link>
            <ul className="mt-2.5 space-y-1.5 text-sm text-muted-foreground">
              {top.map((t) => (
                <li key={t.slug}>
                  <Link href={`/${t.slug}`} className="hover:text-foreground">
                    {t.cardTitle}
                  </Link>
                </li>
              ))}
              {total > top.length && (
                <li>
                  <Link href={`/${hub.segment}`} className="text-primary hover:underline">
                    All {total} →
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
