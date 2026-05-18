import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Lock,
  Merge,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import * as Icons from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { TrustStrip } from "@/features/home/TrustStrip";
import { FaqSection } from "@/features/home/FaqSection";
import { toolRegistry } from "@/lib/seo/tool-registry";

const features = [
  {
    icon: Merge,
    title: "Merge PDFs",
    description:
      "Combine multiple PDFs into one, picking exactly the pages you need.",
  },
  {
    icon: Wand2,
    title: "Smart compression",
    description:
      "Three presets, Light, Balanced, and Maximum, to fit any sharing scenario.",
  },
  {
    icon: Layers,
    title: "Page-level control",
    description:
      "Preview, select, reorder, and rotate pages with smooth drag & drop.",
  },
  {
    icon: Zap,
    title: "Blazing fast",
    description:
      "FastAPI + PyMuPDF backend processes documents in seconds.",
  },
  {
    icon: Lock,
    title: "Private by default",
    description: "Files auto-expire after one hour. No accounts, no tracking.",
  },
  {
    icon: Sparkles,
    title: "Beautiful UI",
    description:
      "Dark mode, animations, keyboard accessibility, production-grade UX.",
  },
];

// Gradient palette cycled over the registry entries
const GRADIENTS = [
  "from-indigo-500 via-violet-500 to-fuchsia-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-pink-500 via-rose-500 to-orange-500",
  "from-slate-700 via-slate-600 to-slate-500",
  "from-sky-500 via-blue-500 to-indigo-500",
  "from-gray-700 via-gray-600 to-gray-500",
  "from-green-500 via-emerald-500 to-teal-500",
  "from-purple-500 via-fuchsia-500 to-pink-500",
];

const specializedTools = toolRegistry.map((t, i) => ({
  href: `/tools/${t.slug}`,
  title: t.displayName,
  description: t.relatedKeywords[0],
  iconName: t.iconName,
  gradient: GRADIENTS[i % GRADIENTS.length],
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgb(99_102_241/0.18),transparent_70%)]" />
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Free PDF tools, no signup
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            All-in-one PDF toolkit.<br className="hidden sm:block" />
            <span className="gradient-text">Free, fast, watermark-free.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Twelve focused PDF utilities — converters, optimizers, OCR, security, and more. No signup. No daily limit. Files auto-delete in 1 hour.
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

      <section id="features" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="mt-2 text-muted-foreground">
            From quick merges to fine-grained page control, all in one workspace.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="transition hover:shadow-md hover:-translate-y-0.5"
              >
                <CardContent className="space-y-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="tools" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            Files auto-delete in 1 hour. No accounts.
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">All our tools</h2>
          <p className="mt-2 text-muted-foreground">
            Nine focused PDF utilities — converters, optimizers, OCR, security, and more.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specializedTools.map((tool) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.iconName];
            return (
              <Link key={tool.href} href={tool.href} className="block group">
                <Card className="relative h-full overflow-hidden transition hover:shadow-md hover:-translate-y-0.5">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${tool.gradient}`} />
                  <CardContent className="space-y-3 pt-5">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow ${tool.gradient}`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <h3 className="font-semibold">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <FaqSection />

      <section className="rounded-3xl border border-border bg-gradient-to-br from-indigo-50 via-card to-fuchsia-50 dark:from-indigo-950/40 dark:via-card dark:to-fuchsia-950/30 p-8 sm:p-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Ready when you are.</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Open the workspace and drop your first PDF, no signup, no nonsense.
        </p>
        <div className="mt-6">
          <Link href="/workspace">
            <Button size="lg">
              Open workspace <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
