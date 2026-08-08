// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";
import { brand } from "@/brand.config";

export const content: ToolContent = {
  slug: "pdf-to-jpg",
  primaryKeyword: "pdf to jpg converter online free",
  metaDescription: "Convert PDF to JPG or PNG online free - high quality up to 300 DPI, page ranges, batch ZIP download. No signup, no watermark.",
  relatedKeywords: [
      "pdf to jpg high quality",
      "convert pdf to png online",
      "pdf to image converter",
      "pdf to jpeg online",
      "high resolution pdf to image",
      "pdf to jpg without losing quality",
    ],
  faqs: [
      { q: "What DPI should I choose?", a: "150 dpi for web/email, 220 dpi for general printing, 300 dpi for high-quality print." },
      { q: "Can I export only specific pages?", a: "Yes - enter ranges like '1-3,7' or leave empty to export every page." },
      { q: "Multi-page PDFs - do I get one ZIP?", a: "Yes. Single-page PDFs return a single image; multi-page PDFs return a ZIP with one file per page." },
      { q: "Is image quality preserved?", a: "Yes - we use lossless rendering. JPG output uses high-quality encoding (95%); PNG is fully lossless." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop a PDF file onto the upload zone." },
      { name: "Pick format and DPI", text: "Choose JPG or PNG, then pick 150/220/300 DPI based on intended use." },
      { name: "Download images or ZIP", text: "Single-page PDFs return one image; multi-page PDFs return a ZIP archive." },
    ],
  seoCopy: `Convert PDF to JPG or PNG online free with ${brand.name}. High-quality conversion up to 300 DPI, page range selection, and batch ZIP downloads - no signup, no watermark. Pick the DPI to trade file size against detail: 150 DPI suits screen use, 300 DPI is right for printing or archiving. Multi-page PDFs come back as a ZIP with one image per page, named in page order, and PNG output preserves transparency.`,
};
