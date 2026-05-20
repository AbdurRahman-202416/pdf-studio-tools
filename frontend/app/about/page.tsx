import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";

import { siteConfig } from "@/components/seo/SiteConfig";

const developer = {
  name: "Abdur Rahman",
  title: "Front-End Engineer",
  email: "abdurrahman19011@gmail.com",
  location: "Dhaka",
  portfolio: "https://my-portfolio-lovat-zeta-22.vercel.app/",
  linkedin: "https://www.linkedin.com/in/abdur-rahman-cse2024/",
};

export const metadata: Metadata = {
  title: "About the Developer",
  description: `${developer.name}, Front-End Engineer based in Dhaka. The developer behind PDF Studio.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${developer.name}`,
    description: `Front-End Engineer based in ${developer.location}. The developer behind ${siteConfig.name}.`,
    url: `${siteConfig.url}/about`,
    images: [
      {
        url: `/og?title=${encodeURIComponent(developer.name)}&subtitle=${encodeURIComponent(developer.title + ", " + developer.location)}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to PDF Studio
      </Link>

      {/* Hero */}
      <section className="flex flex-wrap items-center gap-5 sm:gap-6">
        <div
          className="grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center rounded-2xl bg-foreground text-background"
          aria-hidden="true"
        >
          <span className="font-display text-3xl sm:text-4xl font-medium tracking-tight">
            AR
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            About the developer
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {developer.name}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            {developer.title}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {developer.location}
          </p>
        </div>
      </section>

      {/* Short intro */}
      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
        We built PDF Studio because the best free PDF tools all have catches - watermarks, daily limits, signup walls. We removed every one.
      </p>

      {/* Contact tiles, labels only (URLs hidden, links still work) */}
      <section className="grid gap-2 sm:grid-cols-3">
        <a
          href={developer.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open portfolio in a new tab"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:shadow-sm"
        >
          <ExternalLink className="h-4 w-4 text-primary" />
          Portfolio
        </a>
        <a
          href={developer.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open LinkedIn profile in a new tab"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:shadow-sm"
        >
          <Linkedin className="h-4 w-4 text-blue-500" />
          LinkedIn
        </a>
        <a
          href={`mailto:${developer.email}`}
          aria-label={`Email ${developer.name}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:shadow-sm"
        >
          <Mail className="h-4 w-4 text-rose-500" />
          Email
        </a>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 text-center"><div className="absolute inset-0 bg-wash" aria-hidden /><div className="relative">
        <p className="text-sm text-muted-foreground">
          Have feedback or want to collaborate on{" "}
          <Link href="/" className="text-primary hover:underline">
            PDF Studio
          </Link>
          ?
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
          <a
            href={`mailto:${developer.email}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-primary-foreground hover:opacity-90"
          >
            <Mail className="h-3.5 w-3.5" />
            Get in touch
          </a>
          <a
            href={developer.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 hover:border-primary/40"
          >
            <Linkedin className="h-3.5 w-3.5" />
            Connect
          </a>
        </div>
        </div>
      </section>
    </div>
  );
}
