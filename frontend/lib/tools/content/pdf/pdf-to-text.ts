import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "pdf-to-text",
  primaryKeyword: "pdf to text converter online",
  metaDescription: "Free PDF to text converter. Extracts the text layer instantly - no OCR needed for digital PDFs. No signup.",
  relatedKeywords: [
    "extract text from pdf",
    "pdf to txt",
    "copy text from pdf",
    "pdf text extractor",
  ],
  faqs: [
    { q: "How is this different from PDF OCR?", a: "This reads text already stored in the file, so it is instant and perfectly accurate. OCR recognises text from an image and is slower and approximate. Use this first; if it returns nothing, the page is a scan and OCR is the right tool." },
    { q: "Why did I get an empty result?", a: "Because the PDF has no text layer - it is a scan or an export of images. The tool tells you when that happens and points you at OCR." },
    { q: "Does it keep the layout?", a: "Reading order is preserved but columns and tables flatten, because a PDF stores positioned glyphs rather than structure. For tables, PDF to Excel does a better job." },
    { q: "Is the text accurate?", a: "Exactly what is in the file, character for character. Ligatures and unusual embedded font encodings can occasionally produce odd characters, which is a property of the source PDF rather than the extraction." },
  ],
  howTo: [
    { name: "Upload your PDF", text: "Any size up to 100 MB." },
    { name: "We read the text layer", text: "Instant - no recognition step, because the text is already there." },
    { name: "Copy or download", text: "You are told plainly if the file turns out to be a scan." },
  ],
  seoCopy:
    "Extract the text layer from a PDF instantly. This is not OCR and does not need to be: a PDF created from a document already contains its text as data, so pulling it out is immediate and character-for-character exact. OCR is for the other case - a scan, where the page is an image and the text has to be recognised approximately. Try this first, and if it comes back empty you have a scan on your hands, which the tool tells you rather than just showing an empty box.",
};
