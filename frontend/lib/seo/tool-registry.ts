export type ToolCategory =
  | "optimize"
  | "merge"
  | "convert"
  | "edit"
  | "security"
  | "ocr"
  | "organize";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolEntry {
  /** URL slug, lives at /tools/<slug> */
  slug: string;
  /** Short human label shown in cards, nav, sitemap */
  displayName: string;
  /** Exact primary keyword — used as H1 and as base for <title> */
  primaryKeyword: string;
  /** 3-5 related long-tail keywords, naturally woven into subtitle/meta */
  relatedKeywords: string[];
  category: ToolCategory;
  /** Lucide icon name (string, looked up at render time to keep registry serializable) */
  iconName: string;
  /** Backend POST endpoint relative to NEXT_PUBLIC_API_BASE_URL */
  backendEndpoint: string;
  /** 3-5 FAQ entries — emitted as schema.org FAQPage JSON-LD on the tool page */
  faqs: ToolFaq[];
}

export const toolRegistry: ToolEntry[] = [
  {
    slug: "compress-pdf-without-losing-quality",
    displayName: "Compress PDF",
    primaryKeyword: "compress pdf without losing quality",
    relatedKeywords: [
      "compress large pdf online free",
      "reduce pdf file size online free",
      "high quality pdf compressor online",
      "compress pdf for email attachment",
    ],
    category: "optimize",
    iconName: "Wand2",
    backendEndpoint: "/compress",
    faqs: [
      { q: "Does compressing a PDF lose quality?", a: "Light and Balanced presets preserve original text and most image fidelity. Maximum trades some image clarity for the smallest file size." },
      { q: "How small can I make a PDF?", a: "Maximum can reduce typical scanned PDFs by 60–90%. Vector-heavy PDFs (like reports with text) often shrink less because they were already efficient." },
      { q: "Is there a file size limit?", a: "Yes — 100 MB per upload. Files auto-delete after one hour." },
    ],
  },
  {
    slug: "merge-large-pdf-files-online",
    displayName: "Merge PDF",
    primaryKeyword: "merge large pdf files online free",
    relatedKeywords: [
      "combine multiple pdf into one file",
      "free online pdf merger tool",
      "join pdf files instantly",
      "merge pdf in browser",
    ],
    category: "merge",
    iconName: "Merge",
    backendEndpoint: "/merge",
    faqs: [
      { q: "How many PDFs can I merge at once?", a: "Up to the 100 MB per-file limit and ~20 files per merge. No daily limit on the number of merges." },
      { q: "Can I reorder pages before merging?", a: "Yes — the workspace lets you drag-reorder pages across all uploaded files before exporting." },
      { q: "Are merged PDFs watermarked?", a: "No. The merged file is identical to what you'd get from Adobe Acrobat — no watermark, no signup." },
    ],
  },
  {
    slug: "pdf-to-jpg-high-quality",
    displayName: "PDF to JPG / PNG",
    primaryKeyword: "pdf to jpg high quality",
    relatedKeywords: [
      "convert pdf to images fast",
      "pdf to png converter online",
      "pdf to jpg without losing quality",
      "high resolution pdf to image",
    ],
    category: "convert",
    iconName: "Image",
    backendEndpoint: "/tools/pdf-to-jpg",
    faqs: [
      { q: "What DPI should I choose?", a: "150 dpi for web/email, 220 dpi for general printing, 300 dpi for high-quality print." },
      { q: "Can I export only specific pages?", a: "Yes — enter ranges like '1-3,7' or leave empty to export every page." },
      { q: "Multi-page PDFs — do I get one ZIP?", a: "Yes. Single-page PDFs return a single image; multi-page PDFs return a ZIP with one file per page." },
    ],
  },
  {
    slug: "password-protect-pdf-online",
    displayName: "Password Protect PDF",
    primaryKeyword: "password protect pdf online free",
    relatedKeywords: [
      "lock pdf with password",
      "encrypt pdf online free",
      "add password to pdf",
      "secure pdf with password",
    ],
    category: "security",
    iconName: "Lock",
    backendEndpoint: "/tools/pdf/lock",
    faqs: [
      { q: "What encryption is used?", a: "AES-256, the same encryption used by Adobe Acrobat Pro and modern PDF readers." },
      { q: "Can I remove the password later?", a: "Yes — use the Unlock PDF tool with the same password you set." },
      { q: "Is the password sent to your servers?", a: "It's transmitted over HTTPS only to apply encryption, never stored, and the file is deleted within one hour." },
    ],
  },
  {
    slug: "unlock-pdf-without-password",
    displayName: "Unlock PDF",
    primaryKeyword: "unlock pdf with password online",
    relatedKeywords: [
      "remove pdf password free",
      "decrypt pdf online",
      "open password protected pdf",
      "pdf password remover",
    ],
    category: "security",
    iconName: "Unlock",
    backendEndpoint: "/tools/pdf/unlock",
    faqs: [
      { q: "Can you unlock a PDF I don't know the password for?", a: "No — we require the correct password. We do not attempt to crack passwords." },
      { q: "Will the unlocked PDF look the same?", a: "Yes. We strip only the password layer; content, fonts, and formatting are preserved." },
      { q: "Is this safe to use?", a: "Yes — the file is processed over HTTPS and auto-deleted within one hour." },
    ],
  },
  {
    slug: "pdf-ocr-online-free",
    displayName: "PDF OCR",
    primaryKeyword: "pdf ocr online free 100 languages",
    relatedKeywords: [
      "extract text from scanned pdf",
      "pdf to text ocr free",
      "scanned pdf to editable text",
      "ocr pdf multiple languages",
    ],
    category: "ocr",
    iconName: "Languages",
    backendEndpoint: "/tools/ocr/extract",
    faqs: [
      { q: "Which languages are supported?", a: "Over 100 — including English, Spanish, French, German, Hindi, Arabic, Chinese (Simplified & Traditional), Japanese, Korean, Portuguese, Russian, Italian, Dutch, Turkish, and Bengali." },
      { q: "Can I mix languages on the same page?", a: "Yes — combine codes with '+', e.g. `eng+spa` for English + Spanish text on the same page." },
      { q: "Does it work on photos of documents?", a: "OCR runs on PDFs. For a photo, first convert it with our JPG → PDF tool, then run OCR." },
    ],
  },
  {
    slug: "id-card-to-pdf",
    displayName: "ID Card to PDF",
    primaryKeyword: "id card to a4 pdf",
    relatedKeywords: [
      "combine id card front and back pdf",
      "driver's license to pdf",
      "passport scan to a4",
      "id card scanner to pdf",
    ],
    category: "convert",
    iconName: "IdCard",
    backendEndpoint: "/tools/id-card/combine",
    faqs: [
      { q: "What document types work?", a: "Driver's license, national ID, passport, employee badge, business cards — any two-sided card fits the A4 template." },
      { q: "Can I add labels like 'Front' / 'Back'?", a: "Yes — toggle 'Add labels' before processing." },
      { q: "What layouts are available?", a: "A4 portrait (stacked), A4 landscape (side-by-side), and Compact (smaller, more whitespace)." },
    ],
  },
  {
    slug: "passport-photo-to-pdf",
    displayName: "Passport Photo to PDF",
    primaryKeyword: "passport photo to pdf a4",
    relatedKeywords: [
      "passport size photo print pdf",
      "visa photo to a4 pdf",
      "make passport photo sheet",
      "8 passport photos on one page",
    ],
    category: "convert",
    iconName: "Camera",
    backendEndpoint: "/tools/photo/to-pdf",
    faqs: [
      { q: "Which photo sizes are supported?", a: "Standard passport (35×45mm), stamp (20×25mm), US visa (51×51mm), and a custom size option." },
      { q: "How many photos per A4 sheet?", a: "Up to 8 in grid layout. Choose Single, Grid of 4, or Grid of 8 from the layout dropdown." },
      { q: "Can I print directly from the PDF?", a: "Yes — the PDF is print-ready A4. Set your printer to 'Actual size' (not 'Fit to page') to preserve dimensions." },
    ],
  },
  {
    slug: "pdf-to-excel-converter",
    displayName: "PDF Table to Excel",
    primaryKeyword: "pdf to excel converter free",
    relatedKeywords: [
      "extract table from pdf to excel",
      "convert pdf to xlsx online",
      "pdf table to spreadsheet",
      "free pdf to excel converter no email",
    ],
    category: "convert",
    iconName: "Table",
    backendEndpoint: "/tools/pdf-table/to-excel",
    faqs: [
      { q: "What kind of PDFs work best?", a: "PDFs with clearly-separated tabular data work best. Scanned PDFs (run OCR first) and complex multi-column layouts may give imperfect results." },
      { q: "Will formulas be preserved?", a: "No — PDF tables are static data, not formulas. The output contains values only." },
      { q: "Can I extract multiple tables from one PDF?", a: "Currently we extract the dominant table per page. Multi-table extraction is on the roadmap." },
    ],
  },
];

/** O(1) lookup by slug — used by tool pages, sitemap, OG generator. */
const bySlug = new Map(toolRegistry.map((t) => [t.slug, t]));

export function getTool(slug: string): ToolEntry | undefined {
  return bySlug.get(slug);
}

/** Categories in display order, used by the homepage tool-grid tabs. */
export const TOOL_CATEGORIES: ToolCategory[] = [
  "optimize",
  "merge",
  "convert",
  "security",
  "ocr",
  "organize",
  "edit",
];
