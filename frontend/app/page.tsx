import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type React from "react";


import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { TrustStrip } from "@/features/home/TrustStrip";
import { FaqSection } from "@/features/home/FaqSection";
import { FeaturesAccordion } from "@/features/home/FeaturesAccordion";
import { MadeForBangladesh } from "@/features/home/MadeForBangladesh";
import { DomainSections } from "@/features/home/DomainSections";
import { CategoryGrid } from "@/features/home/CategoryGrid";
import { CommandPaletteHeroTrigger } from "@/components/layout/CommandPalette";
import { ToolSlider } from "@/components/ui/ToolSlider";
import { RegionalModule } from "@/components/layout/RegionalModule";
import { featuredTools, tools as toolRegistry } from "@/lib/tools";
import { DOMAIN_HUBS } from "@/lib/tools/domains";

const toolCount = toolRegistry.length;
const categoryCount = DOMAIN_HUBS.filter((h) =>
  toolRegistry.some((t) => t.domain === h.domain),
).length;

export default function Home() {
  const featured = featuredTools();

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

          {/*
            The H1 used to say "Free PDF tools" while the page title said
            "every file tool" - a direct contradiction, and false to a
            catalogue that is only 37% PDF. Counts come from the registry so
            they cannot drift out of date.
          */}
          <h1 className="font-display mt-7 text-5xl sm:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-tight">
            Every file &amp; everyday
            <br className="hidden sm:block" />{" "}
            <em className="italic font-normal gradient-text">tool&nbsp;you&nbsp;need</em>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {`${toolCount} free tools across ${categoryCount} categories \u2014 PDF, images, calculators, developer utilities, text, QR & barcodes, colour, data and security. No signup, no daily limits, no watermarks.`}
          </p>

          {/* Search-first: the fastest route to any of 81 tools. */}
          <div className="mt-8 max-w-xl mx-auto">
            <CommandPaletteHeroTrigger />
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/tools" data-testid="cta-tools">
              <Button size="lg">
                Browse all {toolCount} tools <ArrowRight className="h-4 w-4" />
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
      </section>

      {/* Breadth, proven in one viewport rather than after nine scrolled sections. */}
      <section aria-labelledby="categories-heading" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            Browse by category
          </span>
          <h2
            id="categories-heading"
            className="font-display mt-3 text-3xl sm:text-4xl font-medium tracking-tight"
          >
            {categoryCount} categories, {toolCount} tools
          </h2>
        </div>
        <CategoryGrid />
      </section>

      <FeaturesAccordion />

      <section aria-labelledby="popular-heading" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            Most used
          </span>
          <h2
            id="popular-heading"
            className="font-display mt-3 text-4xl sm:text-5xl font-medium tracking-tight"
          >
            Popular tools
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            A cross-section of the catalogue - the ones people reach for most.
          </p>
        </div>
        {/* The only client island on this page; everything below is static HTML. */}
        <ToolSlider tools={featured} label="Popular tools" />
      </section>

      <section id="tools" className="space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            The collection
          </span>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl font-medium tracking-tight">
            {toolRegistry.length} tools, grouped by what they do
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            PDFs, images, calculators, developer utilities and more. Most run entirely in your
            browser.
          </p>
        </div>
        <DomainSections />
      </section>

      {/* Regional tools stay in the catalogue; the regional framing is shown
          only where it means something. See components/layout/RegionalModule. */}
      <RegionalModule regions={["BD", "IN"]}>
        <MadeForBangladesh />
      </RegionalModule>

      <FaqSection />

      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-16 text-center">
        <div className="absolute inset-0 bg-wash" aria-hidden />
        <div className="relative">
          <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">
            Ready when you are.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Open the workspace and drop your first PDF - no signup, no nonsense.
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
