// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "compress-pdf-to-200kb",
  primaryKeyword: "compress pdf to 200kb",
  metaDescription: "Compress PDF to 200KB online free. Target-size compressor that keeps scanned text legible - built for job portals and visa forms. No signup.",
  relatedKeywords: [
      "reduce pdf size to 200kb",
      "pdf to 200kb online",
      "compress pdf under 200kb",
      "200kb pdf compressor",
      "compress pdf for online application",
      "shrink pdf to 200kb without losing quality",
    ],
  faqs: [
      { q: "Why choose 200KB instead of 100KB?", a: "200KB keeps scanned documents and photo IDs noticeably sharper while still clearing most portal limits. Pick 100KB only when a form explicitly caps uploads there." },
      { q: "Will text stay selectable?", a: "Yes for digital PDFs. Scanned (image-only) PDFs stay as images but remain crisp at 200KB - run our OCR tool first if you need selectable text." },
      { q: "Does it work for visa and job application uploads?", a: "Yes. 200KB is a common ceiling for visa portals, job boards, and university applications worldwide." },
      { q: "Is there a watermark?", a: "Never. Output is clean, and files auto-delete after one hour." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop any PDF - forms, scans, or multi-page documents up to 100 MB." },
      { name: "Confirm the 200KB target", text: "200KB is pre-selected; switch to 100KB, 500KB, or 1MB if your portal differs." },
      { name: "Download", text: "We compress until the target is met, then hand you the file." },
    ],
  seoCopy: "Compress PDF to 200KB online free. The 200KB target is the sweet spot for online applications - small enough for strict portals, large enough to keep scanned IDs and forms legible. Works on any PDF in any language; no signup, no watermark. Phone photos of documents shrink the most; a text-only PDF may already sit under 200KB and will pass through nearly unchanged. Text stays selectable wherever the original had real text, and files are deleted an hour after processing.",
};
