import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/components/seo/SiteConfig";

const EFFECTIVE_DATE = "July 11, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    `How ${brand.name} handles your files and data: files are processed on our server and auto-deleted within one hour, no account is required, and we never sell your data.`,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `Privacy Policy · ${siteConfig.name}`,
    description:
      "Files auto-delete within one hour. No signup. We never sell your data.",
    url: `${siteConfig.url}/privacy`,
  },
};
import { brand } from "@/brand.config";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 py-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {EFFECTIVE_DATE}</p>
      </header>

      <p className="text-muted-foreground">
        {siteConfig.name} is a free online PDF toolkit. This policy explains what
        happens to the files you upload and the limited data we collect. In
        short: your files are processed to perform the task you asked for, then
        automatically deleted. We do not require an account and we do not sell
        your data.
      </p>

      <Section title="Files you upload">
        <p>
          When you use a tool, your file is sent to our server, processed to
          produce your result, and stored only temporarily. Both the upload and
          the generated result are <strong>automatically deleted within one
          hour</strong> by a scheduled cleanup process. We do not read, share,
          or use the contents of your documents for any purpose other than
          performing the operation you requested.
        </p>
        <p>
          Because files are deleted automatically, we cannot recover a result
          after it expires. Download your output promptly.
        </p>
      </Section>

      <Section title="Information we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>No account data.</strong> There is no signup, so we do not
            collect names or passwords. Any password you enter to lock or unlock
            a PDF is used only for that operation and is never logged or stored.
          </li>
          <li>
            <strong>Privacy-friendly analytics.</strong> We use aggregate,
            cookie-free analytics to understand which tools are used and how the
            site performs. This does not identify you personally.
          </li>
          <li>
            <strong>Server logs.</strong> Our servers keep short-lived technical
            logs (request path, status, timing) for reliability and abuse
            prevention. These do not include your file contents.
          </li>
          <li>
            <strong>Optional email.</strong> If you choose to subscribe to
            product updates, we store the email address you provide until you
            unsubscribe.
          </li>
        </ul>
      </Section>

      <Section title="Advertising cookies">
        <p>
          To keep {siteConfig.name} free, we may display ads via third-party
          providers such as Google AdSense. These providers may use cookies to
          serve and measure ads. You can manage ad personalization through{" "}
          <a
            href="https://myadcenter.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google&apos;s Ad Settings
          </a>{" "}
          and control cookies in your browser settings.
        </p>
      </Section>

      <Section title="Data sharing">
        <p>
          We do not sell your data. We share information only with the
          infrastructure and advertising providers needed to run the site (for
          hosting, and for the ad and analytics functions described above), and
          only to the extent required for those functions.
        </p>
      </Section>

      <Section title="Children">
        <p>
          {siteConfig.name} is a general-purpose utility and is not directed at
          children under 13. We do not knowingly collect personal information
          from children.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can use every tool without providing personal information. You may
          block cookies in your browser, opt out of ad personalization, and
          unsubscribe from emails at any time.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update this policy as the product evolves. Material changes will
          be reflected by the &quot;last updated&quot; date above.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy? Reach us via the{" "}
          <Link href="/about" className="text-primary hover:underline">
            about page
          </Link>
          .
        </p>
      </Section>

      <p className="border-t border-border pt-6 text-sm text-muted-foreground">
        See also our{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        .
      </p>
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
