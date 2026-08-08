import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getToolIcon } from "@/lib/seo/tool-icons";
import { tools } from "@/lib/tools";
import { DOMAIN_HUBS } from "@/lib/tools/domains";

/**
 * All nine categories, in one viewport.
 *
 * This is the section that answers "what is this site?" for someone who
 * arrived from a single-tool search. Competitors (10015, TinyWow, iLovePDF)
 * all prove breadth above the fold; we previously buried it under nine
 * six-card preview sections, so a visitor had to scroll a long way before the
 * scope registered.
 *
 * Server-rendered: every category is a real anchor, and each card carries its
 * own `data-domain` so the accent rail is that category's colour.
 */
const REPRESENTATIVE_ICON: Record<string, string> = {
  pdf: "FileText",
  image: "Image",
  calc: "Percent",
  code: "Braces",
  text: "Type",
  security: "KeyRound",
  color: "Palette",
  data: "Table2",
  convert: "Clock",
};

export function CategoryGrid() {
  const cats = DOMAIN_HUBS.map((hub) => ({
    hub,
    count: tools.filter((t) => t.domain === hub.domain).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cats.map(({ hub, count }) => {
        const Icon = getToolIcon(REPRESENTATIVE_ICON[hub.domain] ?? "FileText");
        return (
          <li key={hub.segment} data-domain={hub.domain}>
            <Link
              href={`/${hub.segment}`}
              data-testid={`cat-${hub.segment}`}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 pl-[calc(1rem+3px)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_rgb(var(--primary)/0.30)]"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] bg-primary opacity-70 transition-opacity group-hover:opacity-100"
              />
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))]">
                {Icon && <Icon aria-hidden className="h-4 w-4" />}
              </span>
              <span className="mt-3">
                <span className="block text-sm font-semibold tracking-tight">{hub.title}</span>
                <span className="tabular mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  {count} {count === 1 ? "tool" : "tools"}
                  <ArrowRight
                    aria-hidden
                    className="h-3 w-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
