import type { Metadata } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";
import { tools as toolRegistry } from "@/lib/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import { brand } from "@/brand.config";

const ogImage = `${siteConfig.url}/og?title=${encodeURIComponent(
  "All tools",
)}&subtitle=${encodeURIComponent("free online tools, no signup")}`;

export const metadata: Metadata = {
  title: "All tools - free, no signup",
  description:
    `Every ${brand.name} tool: PDF, image, developer, text, colour, security, calculator and converter utilities. Free, no signup, no watermark.`,
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
    title: `All tools · ${brand.name}`,
    description: `${toolRegistry.length} free online tools - PDF, image, developer, text, calculators, and more. No signup, no watermark.`,
    url: `${siteConfig.url}/tools`,
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
};

export default function ToolsIndexPage() {
  return (
    <div className="space-y-12">
      <header className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          No signup · no daily limit · no watermark
        </span>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.05]">
          Every tool that{" "}
          <em className="italic font-normal gradient-text">actually fits</em>
          <br className="hidden sm:block" /> your workflow
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          {toolRegistry.length} focused utilities across PDF, image, calculator, developer, text, colour and
          security - compress, convert, OCR in 100+ languages, resize, sign, generate. No signup, no watermark,
          files auto-delete in an hour.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {toolRegistry.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
