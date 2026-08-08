// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "pdf-ocr",
  primaryKeyword: "pdf ocr online free",
  metaDescription: "Extract text from scanned PDFs with OCR - 100+ languages including English, Bangla, Hindi, Arabic, and Chinese. Free, no signup.",
  relatedKeywords: [
      "extract text from scanned pdf",
      "pdf to text ocr free",
      "scanned pdf to editable text",
      "ocr pdf multiple languages",
      "bangla ocr",
      "hindi pdf ocr online",
    ],
  faqs: [
      { q: "Which languages are supported?", a: "Over 100 - including English, Spanish, French, German, Hindi, Arabic, Chinese (Simplified & Traditional), Japanese, Korean, Portuguese, Russian, Italian, Dutch, Turkish, and Bengali." },
      { q: "Can I mix languages on the same page?", a: "Yes - combine codes with '+', e.g. eng+ben for English + Bangla text on the same page." },
      { q: "Does it work on photos of documents?", a: "OCR runs on PDFs. For a photo, first convert it with our JPG → PDF tool, then run OCR." },
      { q: "How good is OCR on non-Latin scripts?", a: "Well, for printed text. Tesseract 5 ships current models for Bengali, Devanagari, Arabic, Chinese, Japanese, Korean, Cyrillic and Greek, so books, forms and newspapers read accurately. Handwriting is the weak spot in every script, Latin included." },
    ],
  howTo: [
      { name: "Upload a scanned PDF", text: "Drop your scanned or image-based PDF onto the upload zone." },
      { name: "Pick a language", text: "Select English, Bangla, Hindi, Arabic, Chinese, or combine multiple with '+'." },
      { name: "Get searchable text", text: "The output PDF has a hidden, searchable text layer plus a plain-text export." },
    ],
  seoCopy: "PDF OCR online free with 100+ languages - including Bangla, English, Hindi, Arabic, and Chinese. Convert scanned PDFs into searchable, copyable text using Tesseract 5 with the latest language models. Pages that already contain selectable text are read directly instead of being re-recognised, which is both faster and more accurate than running OCR blindly over everything. Mixed documents - a typed report with scanned appendices - are handled page by page.",
};
