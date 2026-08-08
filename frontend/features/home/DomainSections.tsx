import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ToolCard } from "@/components/ui/ToolCard";
import { tools } from "@/lib/tools";
import { DOMAIN_HUBS } from "@/lib/tools/domains";

/**
 * The catalogue, grouped by domain.
 *
 * A server component on purpose: this is the complete listing, so every tool
 * must be a real anchor in the static HTML. Only the curated sliders above are
 * client-side.
 *
 * Each section shows a preview and links to the hub for the rest, which keeps
 * the homepage readable at 81 tools while still giving crawlers a path to
 * every hub.
 */
const PREVIEW_PER_DOMAIN = 6;

export function DomainSections() {
  const sections = DOMAIN_HUBS.map((hub) => ({
    hub,
    all: tools.filter((t) => t.domain === hub.domain),
  })).filter((s) => s.all.length > 0);

  return (
    <div className="space-y-16">
      {sections.map(({ hub, all }) => {
        // Lead with the curated picks, then fill from the rest.
        const ordered = [...all].sort(
          (a, b) => Number(!!b.trending) - Number(!!a.trending),
        );
        const preview = ordered.slice(0, PREVIEW_PER_DOMAIN);
        const remaining = all.length - preview.length;

        return (
          <section key={hub.segment} data-domain={hub.domain} aria-labelledby={`h-${hub.segment}`}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                  {all.length} {all.length === 1 ? "tool" : "tools"}
                </span>
                <h3
                  id={`h-${hub.segment}`}
                  className="font-display mt-1.5 text-2xl sm:text-3xl font-medium tracking-tight"
                >
                  {hub.title}
                </h3>
              </div>
              <Link
                href={`/${hub.segment}`}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                {remaining > 0 ? `All ${all.length}` : "Open hub"}
                <ArrowRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
