import { JsonLd } from "@/components/seo/JsonLd";

const FAQ = [
  {
    q: "Is PDF Studio really free?",
    a: "Yes - every tool is free, with no daily limit, no signup required, and no watermark on the output. We're funded by optional donations and don't show ads.",
  },
  {
    q: "What happens to my uploaded files?",
    a: "Files are processed on our server, then automatically deleted within one hour. We never store, share, or train any model on your documents.",
  },
  {
    q: "Do you support Bangla, Hindi, Arabic, and Chinese PDFs?",
    a: "Yes - every tool preserves non-Latin scripts. Our OCR engine supports 100+ languages including Bangla, English, Hindi, Arabic, Chinese (Simplified/Traditional), Japanese, Korean, Russian, and many more.",
  },
  {
    q: "How large a PDF can I upload?",
    a: "Up to 100 MB per file. For larger files, split first with the workspace tool, process each part, then merge.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. PDF Studio runs entirely in your browser; the heavy lifting happens on our server. Nothing to download or install. You can also add it to your home screen as a PWA for one-tap access.",
  },
  {
    q: "Can I compress PDFs to exactly 100KB for government portals?",
    a: "Yes - use our Compress PDF to 100KB tool. It's built for Bangladesh govt portals (BPSC, BCS, NID), Indian portals (UPSC, IBPS), and any system with strict file-size limits.",
  },
  {
    q: "Is it safe to upload sensitive PDFs?",
    a: "Files are transferred over HTTPS, processed in isolated workers, and auto-deleted within an hour. For maximum privacy, use the Password Protect PDF tool before uploading anywhere.",
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
          Privacy, supported languages, file size limits, and government-portal compatibility.
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
