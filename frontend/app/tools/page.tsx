import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import type React from "react";

import { Card, CardContent } from "@/components/ui/Card";
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

// Gradient palette cycled over the registry entries
const GRADIENTS = [
  "from-indigo-500 via-violet-500 to-fuchsia-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-sky-500 via-blue-500 to-indigo-500",
  "from-pink-500 via-rose-500 to-orange-500",
  "from-slate-700 via-slate-600 to-slate-500",
  "from-gray-700 via-gray-600 to-gray-500",
  "from-green-500 via-emerald-500 to-teal-500",
  "from-purple-500 via-fuchsia-500 to-pink-500",
];

const tools = toolRegistry.map((t, i) => ({
  href: `/tools/${t.slug}`,
  title: t.displayName,
  description: t.relatedKeywords[0],
  iconName: t.iconName,
  gradient: GRADIENTS[i % GRADIENTS.length],
}));

export default function ToolsIndexPage() {
  return (
    <div className="space-y-10">
      <header className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          No signup. No daily limit. No watermark.
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          PDF tools that <span className="gradient-text">actually fit your workflow</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Nine focused utilities for compressing, merging, converting, securing, and extracting from PDFs.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.iconName];
          return (
            <Link
              key={tool.href}
              href={tool.href}
              data-testid={`tool-${tool.href.split("/").pop()}`}
              className="block group"
            >
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 overflow-hidden">
                <div
                  className={cn(
                    "h-1.5 w-full bg-gradient-to-r",
                    tool.gradient,
                  )}
                />
                <CardContent className="space-y-3 pt-5">
                  <div
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow",
                      tool.gradient,
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{tool.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition">
                    Open <ArrowRight className="h-3.5 w-3.5" />
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
