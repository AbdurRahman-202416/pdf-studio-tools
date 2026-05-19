import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { ToolIcon } from "@/components/brand/ToolIcon";
import { cn } from "@/lib/utils";
import { toolRegistry } from "@/lib/seo/tool-registry";
import { getToolIcon } from "@/lib/seo/tool-icons";

export const metadata: Metadata = {
  title: "All PDF tools — free, no signup",
  description:
    "Every PDF Studio tool: compress, merge, PDF to JPG, JPG to PDF, lock/unlock, OCR (100+ languages), PDF to Word, PDF to Excel, sign PDF, and more.",
  keywords: [
    "free pdf tools",
    "online pdf editor",
    "pdf converter free",
    "compress pdf online",
    "merge pdf online",
    "pdf to word",
    "pdf to excel",
    "sign pdf online",
  ],
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "All PDF tools · PDF Studio",
    description:
      "Fourteen free PDF utilities — compress, merge, convert, OCR, lock, unlock, sign, and more. No signup, no watermark.",
  },
};

const tools = toolRegistry.map((t) => ({
  slug: t.slug,
  href: `/${t.slug}`,
  title: t.displayName,
  description: t.metaDescription,
  primary: t.primaryKeyword,
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
          Free PDF tools that{" "}
          <em className="italic font-normal gradient-text">actually fit</em>
          <br className="hidden sm:block" /> your workflow
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Fourteen focused utilities: compress, merge, convert, OCR in 100+ languages, lock/unlock, sign, and more.
          No signup, no watermark, files auto-delete in an hour.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = getToolIcon(tool.iconName);
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
                    <h2 className="font-display text-xl font-medium tracking-tight">
                      {tool.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {tool.primary}
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
