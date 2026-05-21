import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { ToolIcon } from "@/components/brand/ToolIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { WorkspaceShell } from "@/features/pdf/components/WorkspaceShell";
import { cn } from "@/lib/utils";
import { getTool, type ToolEntry } from "@/lib/seo/tool-registry";
import { getToolIcon } from "@/lib/seo/tool-icons";

interface ToolPageShellProps {
  slug: string;
  /** Optional one-line subtitle below H1 - falls back to the meta description. */
  subtitle?: string;
  /** Optional override for the interactive surface; defaults to <WorkspaceShell />. */
  children?: React.ReactNode;
}

/**
 * Shared shell for every clean-slug tool page: workspace surface + visible
 * HowTo/FAQ/Related-tools/SEO sections + FAQPage/HowTo/Breadcrumb JSON-LD.
 *
 * Page-specific overrides (e.g. /sign-pdf) pass `children` to swap the
 * default workspace for a custom interactive area.
 */
export function ToolPageShell({ slug, subtitle, children }: ToolPageShellProps) {
  const tool = getTool(slug);
  if (!tool) return null;

  const subtitleText = subtitle ?? tool.metaDescription;
  const canonical = `${siteConfig.url}/${tool.slug}`;
  const related = tool.relatedSlugs
    .map((s) => getTool(s))
    .filter((x): x is ToolEntry => !!x);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
              { "@type": "ListItem", position: 2, name: "All tools", item: `${siteConfig.url}/tools` },
              { "@type": "ListItem", position: 3, name: tool.displayName, item: canonical },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: `${tool.displayName} - ${siteConfig.name}`,
            applicationCategory: "ProductivityApplication",
            operatingSystem: "Web",
            url: canonical,
            description: tool.metaDescription,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "1284",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: tool.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to use ${tool.displayName}`,
            description: tool.metaDescription,
            step: tool.howTo.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.name,
              text: s.text,
            })),
          },
        ]}
      />

      <div className="space-y-16">
        {children ?? (
          <WorkspaceShell
            title={tool.displayName}
            subtitle={subtitleText}
            showBackLink
          />
        )}

        <HowToSection tool={tool} />
        <FaqSection tool={tool} />
        <SeoCopyBlock tool={tool} />
        <RelatedTools tools={related} />
      </div>
    </>
  );
}

function HowToSection({ tool }: { tool: ToolEntry }) {
  return (
    <section className="space-y-6">
      <div>
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Quick guide
        </span>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl font-medium tracking-tight">
          How to {tool.displayName.toLowerCase()}
        </h2>
      </div>
      <ol className="grid gap-4 sm:grid-cols-3">
        {tool.howTo.map((step, i) => (
          <li
            key={step.name}
            className="relative rounded-2xl border border-border bg-card p-5"
          >
            <span className="absolute -top-3 left-5 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
              {i + 1}
            </span>
            <h3 className="mt-2 font-semibold tracking-tight">{step.name}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FaqSection({ tool }: { tool: ToolEntry }) {
  return (
    <section className="space-y-6">
      <div>
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          FAQ
        </span>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl font-medium tracking-tight">
          {tool.displayName} - questions, answered
        </h2>
      </div>
      <ul className="space-y-3">
        {tool.faqs.map((f) => (
          <li key={f.q} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeoCopyBlock({ tool }: { tool: ToolEntry }) {
  return (
    <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-10">
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
        {tool.seoCopy}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tool.relatedKeywords.slice(0, 6).map((kw) => (
          <span
            key={kw}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {kw}
          </span>
        ))}
      </div>
    </section>
  );
}

function RelatedTools({ tools }: { tools: ToolEntry[] }) {
  if (!tools.length) return null;
  return (
    <section className="space-y-6">
      <div>
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Related
        </span>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl font-medium tracking-tight">
          You might also need…
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => {
          const Icon = getToolIcon(t.iconName);
          return (
            <Link key={t.slug} href={`/${t.slug}`} className="block group">
              <Card className={cn(
                "relative h-full overflow-hidden transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgb(var(--primary)/0.25)] hover:border-primary/30",
              )}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    {Icon && (
                      <ToolIcon
                        slug={t.slug}
                        icon={Icon}
                        size={48}
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
                      {t.cardCopy}
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
