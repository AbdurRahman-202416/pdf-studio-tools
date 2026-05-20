import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { ToolIcon } from "@/components/brand/ToolIcon";
import { toolsByRegion } from "@/lib/seo/tool-registry";
import { getToolIcon } from "@/lib/seo/tool-icons";

const HIGHLIGHTS = [
  "ID front + back combine - NID, student, employee, license",
  "Compress to 100KB for govt portals",
  "Bangla OCR (Tesseract 5)",
  "Passport-size photo PDF (35×45mm)",
];

/**
 * Visible "Made for Bangladesh" homepage section. Surfaces the region-flagged
 * tools (NID combine, passport photo PDF, 100KB compressor) plus the Bangla
 * OCR positioning. Keeps surrounding theme (Document Atelier) untouched.
 */
export function MadeForBangladesh() {
  const tools = toolsByRegion("BD");
  if (!tools.length) return null;

  return (
    <section className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Made for Bangladesh
        </span>
        <h2 className="font-display mt-3 text-4xl sm:text-5xl font-medium tracking-tight">
          Built for{" "}
          <em className="italic font-normal gradient-text">government forms</em>
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          NID, passport, BPSC, BCS, university admissions - every portal with strict file-size limits
          or specific photo formats. PDF Studio handles them out of the box.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 max-w-3xl mx-auto">
        {HIGHLIGHTS.map((h) => (
          <li
            key={h}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">
              ✓
            </span>
            <span className="font-medium">{h}</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 sm:grid-cols-3">
        {tools.map((t) => {
          const Icon = getToolIcon(t.iconName);
          return (
            <Link key={t.slug} href={`/${t.slug}`} className="block group">
              <Card className="relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgb(var(--primary)/0.25)] hover:border-primary/30">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    {Icon && (
                      <ToolIcon
                        slug={t.slug}
                        icon={Icon}
                        size={52}
                        className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
                      />
                    )}
                    <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary transition" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-medium tracking-tight">
                      {t.displayName}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {t.primaryKeyword}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
