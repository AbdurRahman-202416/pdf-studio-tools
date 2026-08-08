// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "compress-pdf-to-100kb",
  primaryKeyword: "compress pdf to 100kb",
  metaDescription: "Compress PDF to 100KB online free. Target file size compressor for government forms, NID applications, and online portals - works with Bangla PDFs.",
  relatedKeywords: [
      "pdf to 100kb",
      "reduce pdf size to 100kb",
      "govt form pdf compressor",
      "compress pdf to 50kb 100kb 200kb",
      "100kb pdf compressor bd",
      "compress pdf for government portal",
    ],
  faqs: [
      { q: "Can I really compress any PDF to 100KB?", a: "We iteratively reduce DPI and image quality until the size target is met. Text-heavy PDFs hit 100KB easily; image-heavy scans may need a slightly higher target (200–500KB)." },
      { q: "Will the PDF still be readable at 100KB?", a: "Yes for most government forms and ID documents. For dense photo scans, we recommend 200KB to keep text legible." },
      { q: "What's the smallest target supported?", a: "50KB. Below that, text becomes unreadable and we don't allow it." },
      { q: "Does this work for BD government portals?", a: "Yes - this tool is specifically tuned for Bangladesh govt forms (BPSC, BCS, NID, Passport), Indian portals (UPSC, IBPS), and other size-restricted upload systems." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop your PDF onto the upload zone - supports forms, scans, and multi-page documents." },
      { name: "Pick a target size", text: "Choose 50KB, 100KB, 200KB, 500KB, or 1MB based on the portal's upload limit." },
      { name: "Download the compressed PDF", text: "Our compressor iterates until the target is met, then delivers the file." },
    ],
  seoCopy: "Compress PDF to 100KB online free - built for government portals, NID/passport applications, college forms, and other strict file-size limits. Works on any PDF; specially optimized for Bangladesh and South Asian government uploads. Text-heavy documents reach 100KB comfortably; dense photo scans may need a 200KB target to stay legible, and 50KB is the hard floor below which text stops being readable. Files are deleted from our servers one hour after processing.",
};
