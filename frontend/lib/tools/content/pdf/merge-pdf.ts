// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";
import { brand } from "@/brand.config";

export const content: ToolContent = {
  slug: "merge-pdf",
  primaryKeyword: "merge pdf online free",
  metaDescription: "Merge PDF files online free. Combine multiple PDFs into one - drag-reorder pages, no signup, no watermark, files auto-delete after an hour.",
  relatedKeywords: [
      "combine multiple pdf into one file",
      "free online pdf merger",
      "join pdf files",
      "merge large pdf files online",
      "combine pdf files online",
      "pdf joiner online",
    ],
  faqs: [
      { q: "How many PDFs can I merge at once?", a: "Up to the 100 MB per-file limit and ~20 files per merge. No daily limit on the number of merges." },
      { q: "Can I reorder pages before merging?", a: "Yes - the workspace lets you drag-reorder pages across all uploaded files before exporting." },
      { q: "Are merged PDFs watermarked?", a: "No. The merged file is identical to what you'd get from Adobe Acrobat - no watermark, no signup." },
      { q: "Does merging preserve bookmarks and links?", a: "Yes - internal hyperlinks and document structure are preserved across all source PDFs." },
    ],
  howTo: [
      { name: "Upload your PDFs", text: "Drop multiple PDFs onto the upload zone - they appear as cards you can reorder." },
      { name: "Reorder pages", text: "Drag pages across files to set the final order. Skip pages you don't need." },
      { name: "Merge and download", text: "Click Merge to combine into one PDF. The output is watermark-free and ready to share." },
    ],
  seoCopy: `Merge PDF files online for free with ${brand.name}. Combine multiple PDFs into one document, reorder pages with drag-and-drop, and download instantly - no signup, no watermark. There is no cap on how many files you combine or how large the result gets, and bookmarks plus selectable text survive the merge. Pages keep their original resolution - merging never silently re-compresses your documents.`,
};
