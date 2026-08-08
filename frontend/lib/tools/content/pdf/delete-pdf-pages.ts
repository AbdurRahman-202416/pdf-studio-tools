// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "delete-pdf-pages",
  primaryKeyword: "delete pages from pdf",
  metaDescription: "Delete pages from PDF online free - remove blank scans, wrong pages, or duplicates and download the cleaned file. No signup, no watermark.",
  relatedKeywords: [
      "remove pages from pdf",
      "delete pdf pages online",
      "remove blank pages from pdf",
      "pdf page remover",
      "delete one page from pdf",
      "remove pages from pdf free",
    ],
  faqs: [
      { q: "How do I delete just one page?", a: "Type its page number (e.g. 3) and hit Delete pages. For several, use commas and ranges like 2,4-6." },
      { q: "Will the remaining pages be re-numbered?", a: "The remaining pages keep their content and order; only the removed pages disappear. Printed page numbers inside the document are part of the content and don't change." },
      { q: "Can I delete every page?", a: "No - at least one page must remain, otherwise the output wouldn't be a valid PDF." },
      { q: "Is my file kept on your servers?", a: "Only temporarily - uploads and outputs auto-delete after 1 hour, and nothing is ever shared." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop the PDF you want to clean up." },
      { name: "Enter pages to delete", text: "Single pages or ranges, e.g. 2,4-6. At least one page must remain." },
      { name: "Download the cleaned PDF", text: "The selected pages are gone; everything else is untouched." },
    ],
  seoCopy: "Delete pages from a PDF online free - drop blank scans, wrong pages, and duplicates without re-creating the document. Lossless for the pages you keep, private (auto-delete after 1 hour), and free with no signup or watermark. Page numbers refer to the original document, so you can remove 3, 7, and 12 in a single pass without recounting after each deletion. Everything you keep retains its original resolution, fonts, and embedded links.",
};
