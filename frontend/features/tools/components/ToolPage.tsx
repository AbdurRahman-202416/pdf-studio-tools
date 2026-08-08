
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { relatedTools, tools as allTools } from "@/lib/tools";
import { getHubForDomain } from "@/lib/tools/domains";
import { ToolCard } from "@/components/ui/ToolCard";
import { ToolView } from "@/lib/tools/views";
import type { ToolContent, ToolMeta } from "@/lib/tools/types";

interface ToolPageProps {
  meta: ToolMeta;
  content: ToolContent;
}

/**
 * Generic tool page: interactive surface + HowTo / FAQ / SEO copy / related
 * tools, plus Breadcrumb / SoftwareApplication / FAQPage / HowTo JSON-LD.
 *
 * Rendered by the single `/[slug]` route for every tool in the registry.
 */
const toolCount = allTools.length;

export function ToolPage({ meta, content }: ToolPageProps) {
  const canonical = `${siteConfig.url}/${meta.slug}`;
  const related = relatedTools(meta.slug, 6);
  const hub = getHubForDomain(meta.domain);

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
              ...(hub
                ? [{
                    "@type": "ListItem",
                    position: 3,
                    name: hub.title,
                    item: `${siteConfig.url}/${hub.segment}`,
                  }]
                : []),
              {
                "@type": "ListItem",
                position: hub ? 4 : 3,
                name: meta.cardTitle,
                item: canonical,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: `${meta.cardTitle} - ${siteConfig.name}`,
            applicationCategory: "ProductivityApplication",
            operatingSystem: "Web",
            url: canonical,
            description: content.metaDescription,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: content.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to use ${meta.cardTitle}`,
            description: content.metaDescription,
            step: content.howTo.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.name,
              text: s.text,
            })),
          },
        ]}
      />

      {/* Every --primary/--ring/--accent below this node resolves to the
          domain's hue (see the [data-domain] rules in globals.css), so a tool
          page is accented by what it operates on without any per-page styling. */}
      <div className="space-y-16" data-domain={meta.domain}>
        <ToolView
          slug={meta.slug}
          title={meta.cardTitle}
          subtitle={content.metaDescription}
        />

        <HowToSection meta={meta} content={content} />
        {/* Between the guide and the FAQ: well clear of the interactive
            surface (accidental-click policy) and of the results area. */}
        <AdSlot placement="tool" />
        <FaqSection meta={meta} content={content} />
        <SeoCopyBlock content={content} />
        <RelatedTools tools={related} />
      </div>
    </>
  );
}

function HowToSection({ meta, content }: { meta: ToolMeta; content: ToolContent }) {
  return (
    <section className="space-y-6">
      <div>
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Quick guide
        </span>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl font-medium tracking-tight">
          How to {meta.cardTitle.toLowerCase()}
        </h2>
      </div>
      <ol className="grid gap-4 sm:grid-cols-3">
        {content.howTo.map((step, i) => (
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

function FaqSection({ meta, content }: { meta: ToolMeta; content: ToolContent }) {
  return (
    <section className="space-y-6">
      <div>
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          FAQ
        </span>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl font-medium tracking-tight">
          {meta.cardTitle} - questions, answered
        </h2>
      </div>
      <ul className="space-y-3">
        {content.faqs.map((f) => (
          <li key={f.q} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeoCopyBlock({ content }: { content: ToolContent }) {
  return (
    <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-10">
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
        {content.seoCopy}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {content.relatedKeywords.slice(0, 6).map((kw) => (
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

function RelatedTools({ tools }: { tools: ToolMeta[] }) {
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
        <p className="mt-2 text-sm text-muted-foreground">
          The last couple are from other categories - there are {toolCount} tools here in total.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </section>
  );
}
