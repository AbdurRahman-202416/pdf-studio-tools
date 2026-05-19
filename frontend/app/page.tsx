import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ToolIcon } from "@/components/brand/ToolIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { TrustStrip } from "@/features/home/TrustStrip";
import { FaqSection } from "@/features/home/FaqSection";
import { FeaturesAccordion } from "@/features/home/FeaturesAccordion";
import { toolRegistry } from "@/lib/seo/tool-registry";

const specializedTools = toolRegistry.map((t) => ({
  slug: t.slug,
  href: `/tools/${t.slug}`,
  title: t.displayName,
  description: t.relatedKeywords[0],
  iconName: t.iconName,
}));

export default function Home() {
  return (
    <div className="space-y-20">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: siteConfig.name,
            url: siteConfig.url,
            applicationCategory: "ProductivityApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: siteConfig.description,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            description: siteConfig.description,
          },
        ]}
      />

      <section className="relative pt-6 sm:pt-12">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-wash" />
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Free · no signup · no watermark
          </span>
          <h1 className="font-display mt-7 text-5xl sm:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-tight">
            An all-in-one
            <br className="hidden sm:block" />{" "}
            <em className="italic font-normal gradient-text">PDF&nbsp;atelier</em>
            <span className="block mt-2 text-2xl sm:text-3xl lg:text-4xl font-normal text-muted-foreground tracking-normal">
              free, fast, watermark-free.
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Nine focused utilities — converters, optimizers, OCR, security, and more. No signup. No daily limit. Files auto-delete in one hour.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/tools" data-testid="cta-tools">
              <Button size="lg">
                Explore tools <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/workspace" data-testid="cta-workspace">
              <Button size="lg" variant="outline">
                Open workspace
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          <TrustStrip />
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-sm">
          {[
            "Drag & drop multiple PDFs",
            "Reorder pages visually",
            "Download in seconds",
          ].map((line) => (
            <div
              key={line}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
            >
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>{line}</span>
            </div>
          ))}
        </div>
      </section>

      <FeaturesAccordion />

      <section id="tools" className="space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            The collection
          </span>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl font-medium tracking-tight">
            All our tools
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Nine focused PDF utilities — converters, optimizers, OCR, security, and more.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specializedTools.map((tool) => {
            const Icon = (Icons as unknown as Record<string, LucideIcon>)[tool.iconName];
            return (
              <Link key={tool.href} href={tool.href} className="block group">
                <Card className="relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgb(var(--primary)/0.25)]">
                  <span className="absolute inset-x-6 top-0 h-px rule-ink" aria-hidden />
                  <span className="absolute inset-x-6 top-0 h-px rule-amber opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden />
                  <CardContent className="pt-7 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      {Icon && (
                        <ToolIcon
                          slug={tool.slug}
                          icon={Icon}
                          size={60}
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
      </section>

      <FaqSection />

      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-16 text-center">
        <div className="absolute inset-0 bg-wash" aria-hidden />
        <div className="relative">
          <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">
            Ready when you are.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Open the workspace and drop your first PDF — no signup, no nonsense.
          </p>
          <div className="mt-8">
            <Link href="/workspace">
              <Button size="lg">
                Open workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
