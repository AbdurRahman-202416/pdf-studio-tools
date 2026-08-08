import type { Metadata } from "next";
import { Mail, MessageSquareWarning, ShieldCheck } from "lucide-react";

import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/components/seo/SiteConfig";
import { ContactForm } from "@/features/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch about a bug, a tool request, a privacy question, or a partnership. We reply to everything.",
  alternates: { canonical: "/contact" },
};

const CONTACT_EMAIL = siteConfig.contactEmail;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: `Contact ${siteConfig.name}`,
          url: `${siteConfig.url}/contact`,
          mainEntity: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            email: CONTACT_EMAIL,
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: CONTACT_EMAIL,
              availableLanguage: ["English"],
            },
          },
        }}
      />

      <header className="space-y-3">
        <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Contact
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">
          Talk to a human
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          A bug, a tool you wish existed, a question about how your files are handled, or a
          partnership - it all reaches the same inbox, and we answer every message.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          icon={<MessageSquareWarning className="h-4 w-4" />}
          title="Something broke"
          body="Tell us the tool and the file type. A screenshot of the error helps us fix it far faster."
        />
        <Card
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Privacy & data"
          body="Questions about retention, GDPR, or a deletion request. Uploaded files are removed an hour after processing."
        />
        <Card
          icon={<Mail className="h-4 w-4" />}
          title="Prefer email?"
          body={CONTACT_EMAIL}
        />
      </div>

      <ContactForm />

      <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8 space-y-3">
        <h2 className="font-display text-2xl font-medium tracking-tight">Who runs this</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {siteConfig.name} is built and maintained by Abdur Rahman. It is a small, independent
          project - not a company with a support department - which is why replies come from a
          person rather than a ticket system, and usually within a couple of days.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Most tools here run entirely inside your browser and never upload anything. The ones that
          do use a server (PDF processing, OCR, HEIC conversion) delete both the upload and the
          result one hour after the job finishes.
        </p>
      </section>
    </div>
  );
}

function Card({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))]">
        {icon}
      </span>
      <h2 className="mt-3 text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed break-words">{body}</p>
    </div>
  );
}
