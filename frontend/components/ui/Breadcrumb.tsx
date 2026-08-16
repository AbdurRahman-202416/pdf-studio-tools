import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Visible breadcrumb trail. Mirrors the BreadcrumbList JSON-LD so the structured
 * data has an on-page counterpart (Google increasingly ignores breadcrumb markup
 * with no visible equivalent), and gives every tool a contextual link up to its
 * category hub — the topical link that was previously schema-only.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link href={c.href} className="hover:text-foreground transition">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-foreground" : ""}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight aria-hidden className="h-3 w-3 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
