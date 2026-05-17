import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Camera,
  CheckCircle2,
  FileSignature,
  IdCard,
  Image as ImageIcon,
  Languages,
  Layers,
  Lock,
  Merge,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { TrustStrip } from "@/features/home/TrustStrip";
import { FaqSection } from "@/features/home/FaqSection";

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

const specializedTools = [
  {
    href: "/tools/nid-combine",
    title: "NID Combiner",
    description: "Front + back of NID on a single, print-ready A4 page.",
    icon: IdCard,
    gradient: "from-indigo-500 via-violet-500 to-fuchsia-500",
  },
  {
    href: "/tools/bangla-ocr",
    title: "Bangla OCR",
    description: "Pull Bangla text out of scanned PDFs with Tesseract.",
    icon: Languages,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
  {
    href: "/tools/bank-to-excel",
    title: "Bank → Excel",
    description: "Convert bank statement PDFs into clean Excel sheets.",
    icon: Banknote,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
  {
    href: "/tools/pdf-to-jpg",
    title: "PDF → JPG",
    description: "Export each PDF page as high-quality JPG or PNG images.",
    icon: ImageIcon,
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    badge: "NEW",
  },
  {
    href: "/tools/pdf-lock",
    title: "Lock / Unlock PDF",
    description: "Add or remove an AES-256 password on any PDF.",
    icon: Lock,
    gradient: "from-slate-700 via-slate-600 to-slate-500",
    badge: "NEW",
  },
  {
    href: "/tools/photo-to-pdf",
    title: "Passport Photo PDF",
    description:
      "Multiple copies of a passport photo on A4, perfect for print shops.",
    icon: Camera,
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
  },
  {
    href: "/tools/govt-forms",
    title: "Govt Forms",
    description: "Pre-loaded e-TIN, NID correction, birth certificate forms.",
    icon: FileSignature,
    gradient: "from-rose-500 via-pink-500 to-purple-500",
  },
  {
    href: "/workspace",
    title: "Merge & Compress",
    description:
      "Classic PDF workspace with drag-drop reorder and 3-level compression.",
    icon: Layers,
    gradient: "from-gray-700 via-gray-600 to-gray-500",
  },
];

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
            The <span className="gradient-text">PDF toolkit</span>
            <br className="hidden sm:block" /> you actually want to use.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Merge, compress, split, lock, convert and OCR PDFs in one polished workspace.
            Built for Bangladesh, free for everyone.
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
            🇧🇩 Built for Bangladesh
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">All our tools</h2>
          <p className="mt-2 text-muted-foreground">
            Eight focused utilities, from classic merge &amp; compress to BD-specific
            workflows like NID combine and Bangla OCR.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specializedTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="block group">
                <Card className="relative h-full overflow-hidden transition hover:shadow-md hover:-translate-y-0.5">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${tool.gradient}`} />
                  {tool.badge && (
                    <span className="absolute top-3 right-3 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {tool.badge}
                    </span>
                  )}
                  <CardContent className="space-y-3 pt-5">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow ${tool.gradient}`}
                    >
                      <Icon className="h-5 w-5" />
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
