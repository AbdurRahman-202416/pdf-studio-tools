import { JsonLd } from "@/components/seo/JsonLd";

const FAQ = [
  {
    q: "Are my PDFs safe?",
    a: "Yes. Files are uploaded over HTTPS, processed on the server, and automatically deleted one hour later. We never share, sell, or analyze them.",
  },
  {
    q: "Is PDF Studio really free?",
    a: "Yes, every tool listed is free with no signup. We may add a Pro tier later for batch processing and API access, but the core tools stay free.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. PDF Studio is anonymous-first. Drop files, process, download.",
  },
  {
    q: "What's the maximum file size?",
    a: "100 MB per file. Need bigger? Contact us, we can lift the limit for specific use cases.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes, every tool is mobile-responsive with touch-friendly drag-and-drop and large tap targets.",
  },
  {
    q: "Can I OCR scanned Bangla documents?",
    a: "Yes, the Bangla OCR tool runs Tesseract with the Bengali (ben) language pack. It also handles English on the same page.",
  },
  {
    q: "Can I password-protect a PDF?",
    a: "Yes, the Lock / Unlock PDF tool adds AES-256 password protection, the same algorithm used by Acrobat.",
  },
];

export function FaqSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Frequently asked questions
        </h2>
        <p className="text-muted-foreground">
          Answers to common questions about privacy, pricing, and supported features.
        </p>
      </div>
      <ul className="space-y-3">
        {FAQ.map((f) => (
          <li key={f.q} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
          </li>
        ))}
      </ul>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </section>
  );
}
