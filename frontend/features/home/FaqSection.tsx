import { JsonLd } from "@/components/seo/JsonLd";

const FAQ = [
  {
    q: "Is PDF Studio really free?",
    a: "Yes — every tool is free, with no daily limit, no signup, and no watermark on the output. We're funded by optional donations and don't show ads.",
  },
  {
    q: "What happens to my uploaded files?",
    a: "Files are processed on our server, then automatically deleted within one hour. We never store, share, or train any model on your documents.",
  },
  {
    q: "How large a PDF can I upload?",
    a: "Up to 100 MB per file. For larger files, split first with the workspace tool, process each part, then merge.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. PDF Studio runs entirely in your browser; the heavy lifting happens on our server. Nothing to download.",
  },
  {
    q: "Is it safe to upload sensitive PDFs?",
    a: "Files are transferred over HTTPS, processed in isolated workers, and deleted within an hour. For maximum privacy, use the Password Protect PDF tool before uploading.",
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
