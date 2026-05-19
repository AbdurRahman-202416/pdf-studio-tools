import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { ToolIcon } from "@/components/brand/ToolIcon";
import { cn } from "@/lib/utils";
import { toolRegistry } from "@/lib/seo/tool-registry";

export const metadata: Metadata = {
  title: "All PDF tools",
  description:
    "Browse every PDF Studio tool: merge, compress, PDF to JPG, lock/unlock PDF, OCR, ID card combiner, PDF table to Excel, passport photo PDF.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "All PDF tools · PDF Studio",
    description:
      "Nine free PDF utilities: merge, compress, PDF→JPG, lock/unlock, OCR, ID card, table-to-Excel, and more.",
  },
};

const tools = toolRegistry.map((t) => ({
  slug: t.slug,
  href: `/tools/${t.slug}`,
  title: t.displayName,
  description: t.relatedKeywords[0],
  iconName: t.iconName,
}));

export default function ToolsIndexPage() {
  return (
    <div className="space-y-12">
      <header className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          No signup · no daily limit · no watermark
        </span>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.05]">
          PDF tools that{" "}
          <em className="italic font-normal gradient-text">actually fit</em>
          <br className="hidden sm:block" /> your workflow
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Nine focused utilities for compressing, merging, converting, securing, and extracting from PDFs.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[tool.iconName];
          return (
            <Link
              key={tool.href}
              href={tool.href}
              data-testid={`tool-${tool.href.split("/").pop()}`}
              className="block group"
            >
              <Card className={cn(
                "relative h-full overflow-hidden transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgb(var(--primary)/0.25)] hover:border-primary/30",
              )}>
                <span className="absolute inset-x-6 top-0 h-px rule-ink" aria-hidden />
                <span className="absolute inset-x-6 top-0 h-px rule-amber opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden />
                <CardContent className="pt-7 space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    {Icon && (
                      <ToolIcon
                        slug={tool.slug}
                        icon={Icon}
                        size={64}
                        className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
                      />
                    )}
                    <ArrowRight className="mt-3 h-4 w-4 text-muted-foreground -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary transition" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-medium tracking-tight">
                      {tool.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
