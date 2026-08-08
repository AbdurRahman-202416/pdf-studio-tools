// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "word-to-pdf",
  primaryKeyword: "word to pdf converter online free",
  metaDescription: "Convert Word (.docx) to PDF online free. Preserve fonts, layout, headings, and images. No signup, no watermark.",
  relatedKeywords: [
      "docx to pdf",
      "word to pdf converter",
      "convert doc to pdf online",
      "free word to pdf",
      "docx to pdf high quality",
      "save word as pdf",
    ],
  faqs: [
      { q: "Will my fonts and layout be preserved?", a: "Yes - we render via a clean HTML pipeline that maps Word styles, headings, lists, and tables to PDF." },
      { q: "Does it support .doc as well as .docx?", a: "Currently .docx only. For older .doc files, please re-save in Word as .docx first." },
      { q: "Are images included?", a: "Yes - inline images embedded in the Word document are placed into the PDF." },
      { q: "Will my fonts look the same?", a: "Standard fonts are embedded and render identically. A font installed only on your own machine is substituted with the closest match, so check the output if you used an unusual typeface." },
    ],
  howTo: [
      { name: "Upload your .docx", text: "Drop a Microsoft Word document onto the upload zone." },
      { name: "Wait for rendering", text: "We convert headings, paragraphs, tables, and images to a clean PDF." },
      { name: "Download the PDF", text: "The output PDF preserves your Word formatting and is ready to share." },
    ],
  seoCopy: "Word to PDF converter - turn your .docx files into shareable PDFs with formatting preserved. Free, no signup, no watermark - ideal for resumes, reports, and assignments. Fonts, headings, tables, images, and page breaks are preserved, so what you see in Word is what the recipient sees - which is the whole reason to send a PDF instead of a .docx. Works with files from Word, Google Docs, and LibreOffice.",
};
