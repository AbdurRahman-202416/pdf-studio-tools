import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

import { ToolIcon } from "@/components/brand/ToolIcon";
import { cn } from "@/lib/utils";
import { getToolIcon } from "@/lib/seo/tool-icons";
import type { ToolMeta } from "@/lib/tools/types";

/**
 * The one tool card.
 *
 * Previously duplicated in four places with slightly different markup each
 * time. It is a plain server component with a real <Link>, so every card is an
 * indexable anchor in the static HTML - which is why the full catalogue grids
 * use this rather than anything client-rendered.
 *
 * `data-domain` on the root makes --primary resolve to the tool's own domain
 * hue, so a mixed grid stays colour-coded per card rather than per page.
 */
export function ToolCard({
  tool,
  size = "default",
  className,
}: {
  tool: ToolMeta;
  size?: "default" | "compact";
  className?: string;
}) {
  const Icon = getToolIcon(tool.iconName);
  const compact = size === "compact";

  return (
    <Link
      href={`/${tool.slug}`}
      data-domain={tool.domain}
      data-testid={`tool-${tool.slug}`}
      className={cn("group block h-full", className)}
    >
      <article
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border border-border bg-card",
          "pl-[calc(0.75rem+3px)] transition-all duration-300",
          "hover:-translate-y-0.5 hover:border-primary/30",
          "hover:shadow-[0_8px_30px_-12px_rgb(var(--primary)/0.30)]",
          compact ? "p-4" : "p-5",
        )}
      >
        {/* Domain accent rail. */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-primary opacity-70 transition-opacity group-hover:opacity-100"
        />

        <div className="flex items-start justify-between gap-3">
          {Icon && (
            <ToolIcon
              domain={tool.domain}
              icon={Icon}
              size={compact ? 40 : 48}
              className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
            />
          )}
          <ArrowRight
            aria-hidden
            className="mt-2 h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100"
          />
        </div>

        <h3
          className={cn(
            "font-display mt-3 font-medium tracking-tight",
            compact ? "text-base" : "text-lg",
          )}
        >
          {tool.cardTitle}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {tool.cardBlurb}
        </p>

        {tool.runtime === "client" && (
          <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[rgb(var(--primary)/0.10)] px-2 py-0.5 text-[10px] font-medium text-[rgb(var(--primary))]">
            <Zap aria-hidden className="h-2.5 w-2.5" /> Never uploaded
          </span>
        )}
      </article>
    </Link>
  );
}
