// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "pdf-to-word",
  primaryKeyword: "pdf to word converter online free",
  metaDescription: "Convert PDF to editable Word (.docx) online free. Preserve text, paragraphs, and tables. No signup, no watermark, auto-delete in 1 hour.",
  relatedKeywords: [
      "pdf to word",
      "convert pdf to docx",
      "editable word from pdf",
      "pdf to doc online",
      "free pdf to word converter",
      "pdf to word with images",
    ],
  faqs: [
      { q: "Will my formatting be preserved?", a: "We preserve paragraphs, basic tables, lists, and inline emphasis. Complex multi-column layouts may need light cleanup in Word." },
      { q: "Does it work on scanned PDFs?", a: "Run our PDF OCR tool first to add a text layer, then convert to Word." },
      { q: "Are images included in the Word output?", a: "Yes - embedded images are extracted and re-inserted into the .docx." },
      { q: "What Word versions are supported?", a: "The output is .docx - opens in Microsoft Word 2007+, Google Docs, LibreOffice Writer, and Apple Pages." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop your PDF - works best with text-based PDFs (not scans)." },
      { name: "Wait for conversion", text: "We extract text, paragraphs, and tables, then build a clean .docx." },
      { name: "Download the Word file", text: "Open in Word, Google Docs, or any DOCX-compatible editor and edit freely." },
    ],
  seoCopy: "Convert PDF to editable Word (.docx) online for free - perfect for editing contracts, resumes, reports, and academic papers. Paragraphs, tables, and inline images are preserved. Conversion works best on PDFs generated from a document rather than scanned ones; for scans, run OCR first so there is real text to extract. Expect to adjust some spacing after opening the .docx - no converter reproduces a complex layout perfectly.",
};
