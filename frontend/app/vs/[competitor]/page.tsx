import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { brand } from "@/brand.config";
import {
  findCompetitor,
  listCompetitorSlugs,
} from "@/content/competitors";

export function generateStaticParams() {
  return listCompetitorSlugs().map((slug) => ({ competitor: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const c = findCompetitor(competitor);
  if (!c) return {};
  const title = `${brand.name} vs ${c.name} - Free, no-watermark PDF tools`;
  const description = `Comparing ${brand.name} with ${c.name}: features, pricing, OCR support, no-signup policy, and daily limits.`;
  return {
    title,
    description,
    alternates: { canonical: `/vs/${competitor}` },
    openGraph: {
      title,
      description,
      url: `/vs/${competitor}`,
      images: [
        {
          url: `/og?title=${encodeURIComponent(`${brand.name} vs ${c.name}`)}&subtitle=${encodeURIComponent("Free PDF tools. No signup, no watermark, no daily limit.")}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  const c = findCompetitor(competitor);
  if (!c) notFound();

  return (
    <div className="space-y-8 max-w-4xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${brand.name} vs ${c.name}`,
          description: c.shortPitch,
          author: { "@type": "Organization", name: siteConfig.name },
          publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
          },
          mainEntityOfPage: `${siteConfig.url}/vs/${competitor}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            {
              "@type": "ListItem",
              position: 2,
              name: `${brand.name} vs ${c.name}`,
              item: `${siteConfig.url}/vs/${competitor}`,
            },
          ],
        }}
      />
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {brand.name} vs {c.name}
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">{c.shortPitch}</p>
      </header>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-3 font-medium">Feature</th>
                <th className="text-left p-3 font-medium">{brand.name}</th>
                <th className="text-left p-3 font-medium">{c.name}</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row) => (
                <tr key={row.feature} className="border-b border-border/60 last:border-0">
                  <td className="p-3 font-medium align-top">{row.feature}</td>
                  <td className="p-3 align-top">
                    <span className="inline-flex items-start gap-2 text-success">
                      <Check className="h-4 w-4 mt-0.5 shrink-0" /> {row.pdfStudio}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    <span className="inline-flex items-start gap-2 text-muted-foreground">
                      <X className="h-4 w-4 mt-0.5 shrink-0" /> {row.competitor}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">The takeaway</h2>
        <p className="mt-2 text-sm text-muted-foreground">{c.takeaway}</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          <Link href="/tools">
            <Button variant="primary">Browse {brand.name} tools</Button>
          </Link>
          <Link href="/workspace">
            <Button variant="outline">Open workspace</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
