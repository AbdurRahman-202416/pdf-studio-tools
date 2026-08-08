import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/components/seo/SiteConfig";
import { brand } from "@/brand.config";

const EFFECTIVE_DATE = "July 11, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    `The terms for using ${brand.name}'s free online PDF tools: acceptable use, no warranty, and your responsibility for the files you process.`,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `Terms of Service · ${siteConfig.name}`,
    description: `The terms for using ${brand.name}'s free online PDF tools.`,
    url: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 py-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: {EFFECTIVE_DATE}</p>
      </header>

      <p className="text-muted-foreground">
        By using {siteConfig.name}, you agree to these terms. They are meant to
        be simple and fair. If you do not agree, please do not use the service.
      </p>

      <Section title="The service">
        <p>
          {siteConfig.name} provides free online tools to process PDF and related
          document files (compress, merge, convert, OCR, sign, and similar). The
          service is provided free of charge, with no signup required. Files you
          upload are processed and then automatically deleted within one hour, as
          described in our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>You agree not to use the service to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>process content you do not have the legal right to process;</li>
          <li>upload malware, or attempt to disrupt, overload, or abuse the service;</li>
          <li>
            circumvent rate limits or use automated means to place an unreasonable
            load on our servers;
          </li>
          <li>violate any applicable law or the rights of others.</li>
        </ul>
        <p>
          We may rate-limit, block, or refuse requests that threaten the
          stability, security, or fair use of the service.
        </p>
      </Section>

      <Section title="Your files and content">
        <p>
          You retain all rights to the files you upload. You are solely
          responsible for the content you process and for keeping your own copies.
          Because files auto-delete within one hour, you must download your
          results promptly; we cannot recover expired files.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          The service is provided &quot;as is&quot; and &quot;as available&quot;,
          without warranties of any kind. We do not guarantee that processing will
          be error-free, that a result will meet a specific requirement (for
          example, an exact file size for a government portal), or that the service
          will be uninterrupted. Always verify your output before relying on it.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, {siteConfig.name} and its
          creator are not liable for any indirect, incidental, or consequential
          damages, or for any loss of data, arising from your use of the service.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms as the product evolves. Continued use after a
          change means you accept the updated terms. Material changes will be
          reflected by the &quot;last updated&quot; date above.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Reach us via the{" "}
          <Link href="/about" className="text-primary hover:underline">
            about page
          </Link>
          .
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
