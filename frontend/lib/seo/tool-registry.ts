export type ToolCategory =
  | "optimize"
  | "merge"
  | "convert"
  | "edit"
  | "security"
  | "ocr"
  | "organize"
  | "sign";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolHowToStep {
  name: string;
  text: string;
}

export interface ToolEntry {
  /** Clean canonical slug - lives at /<slug>. Short, keyword-led, URL-friendly. */
  slug: string;
  /** Legacy keyword-rich slug - old route was /tools/<legacySlug>. Kept for 301 redirects. */
  legacySlug?: string;
  /** Short human label shown in cards, nav, sitemap. */
  displayName: string;
  /** Exact primary keyword - used as H1 and as base for <title>. */
  primaryKeyword: string;
  /** Concise SEO meta description (<160 chars). */
  metaDescription: string;
  /** 3-6 related long-tail keywords, naturally woven into subtitle/meta. */
  relatedKeywords: string[];
  category: ToolCategory;
  /** Lucide icon name (string, looked up at render time to keep registry serializable). */
  iconName: string;
  /** Backend POST endpoint relative to NEXT_PUBLIC_API_BASE_URL. */
  backendEndpoint: string;
  /** 3-6 FAQ entries - emitted as schema.org FAQPage JSON-LD on the tool page. */
  faqs: ToolFaq[];
  /** 3-5 HowTo steps - emitted as schema.org HowTo JSON-LD on the tool page. */
  howTo: ToolHowToStep[];
  /** Related tool slugs (clean) for internal linking + JSON-LD itemListElement. */
  relatedSlugs: string[];
  /** Short visible paragraph for SEO copy block below the tool. */
  seoCopy: string;
  /** Optional: tool is region-flagged (e.g. Bangladesh-specific). */
  region?: "BD" | "global";
  /** Optional: present when the tool is implemented out of the standard WorkspaceShell. */
  customComponent?: string;
}

export const toolRegistry: ToolEntry[] = [
  {
    slug: "compress-pdf",
    legacySlug: "compress-pdf-without-losing-quality",
    displayName: "Compress PDF",
    primaryKeyword: "compress pdf for email, whatsapp, govt portal",
    metaDescription:
      "Compress PDF to fit Gmail (10 MB), WhatsApp (16 MB), or a government portal (1 MB). Pick where you're sending it, we'll shrink to size. Free, no signup, no watermark.",
    relatedKeywords: [
      "compress pdf for email",
      "compress pdf for whatsapp",
      "reduce pdf size for government portal",
      "shrink pdf to specific size",
      "pdf compressor by target size",
      "compress pdf for gmail attachment",
    ],
    category: "optimize",
    iconName: "Wand2",
    backendEndpoint: "/tools/compress/target-size",
    faqs: [
      { q: "Why outcome buttons instead of Light / Balanced / Maximum?", a: "Because nobody knows what 'Balanced' means until they try it. You DO know where you're sending the PDF - email, WhatsApp, a govt portal. The tool aims for the actual limit." },
      { q: "What if my PDF is already smaller than the target?", a: "Then it just downloads (almost) untouched. You can't make a 200KB file smaller by 'compressing it for email'." },
      { q: "What does 'Best quality' do?", a: "Runs the lightest compression preset - mostly removes redundant streams and recompresses embedded images at high quality. Use this when file size isn't a constraint." },
      { q: "Can I set my own target size?", a: "Yes - open 'Advanced' under the buttons and type any value from 50 KB to 20 MB." },
      { q: "Does it preserve Bangla / Arabic / CJK fonts?", a: "Yes - text remains selectable in every output." },
    ],
    howTo: [
      { name: "Drop your PDF", text: "Up to 100 MB. Multi-page works." },
      { name: "Pick where you're sending it", text: "Email, WhatsApp, govt portal, or 'Best quality'. Each button knows the real size limit." },
      { name: "Download", text: "We shrink to fit, you download. Done." },
    ],
    relatedSlugs: ["compress-pdf-to-100kb", "merge-pdf", "pdf-to-jpg"],
    seoCopy:
      "Compress PDF by outcome, not by guesswork. Pick the channel you're sending it to - Gmail (10 MB), WhatsApp (16 MB), a govt portal (1 MB), or best quality - and we shrink the file to fit. Files auto-delete after one hour. Works with English, Bangla, Arabic, and 100+ languages.",
    region: "global",
  },
  {
    slug: "compress-pdf-to-100kb",
    displayName: "Compress PDF to 100KB",
    primaryKeyword: "compress pdf to 100kb",
    metaDescription:
      "Compress PDF to 100KB online free. Target file size compressor for government forms, NID applications, and online portals - works with Bangla PDFs.",
    relatedKeywords: [
      "pdf to 100kb",
      "reduce pdf size to 100kb",
      "govt form pdf compressor",
      "compress pdf to 50kb 100kb 200kb",
      "100kb pdf compressor bd",
      "compress pdf for government portal",
    ],
    category: "optimize",
    iconName: "Target",
    backendEndpoint: "/tools/compress/target-size",
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
    relatedSlugs: ["compress-pdf", "nid-combine", "jpg-to-pdf"],
    seoCopy:
      "Compress PDF to 100KB online free - built for government portals, NID/passport applications, college forms, and other strict file-size limits. Works on any PDF; specially optimized for Bangladesh and South Asian government uploads.",
    region: "BD",
  },
  {
    slug: "merge-pdf",
    legacySlug: "merge-large-pdf-files-online",
    displayName: "Merge PDF",
    primaryKeyword: "merge pdf online free",
    metaDescription:
      "Merge PDF files online free. Combine multiple PDFs into one - drag-reorder pages, no signup, no watermark, files auto-delete after an hour.",
    relatedKeywords: [
      "combine multiple pdf into one file",
      "free online pdf merger",
      "join pdf files",
      "merge large pdf files online",
      "combine pdf files online",
      "pdf joiner online",
    ],
    category: "merge",
    iconName: "Merge",
    backendEndpoint: "/merge",
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
    relatedSlugs: ["compress-pdf", "pdf-to-jpg", "nid-combine"],
    seoCopy:
      "Merge PDF files online for free with PDF Studio. Combine multiple PDFs into one document, reorder pages with drag-and-drop, and download instantly - no signup, no watermark.",
    region: "global",
  },
  {
    slug: "pdf-to-jpg",
    legacySlug: "pdf-to-jpg-high-quality",
    displayName: "PDF to JPG / PNG",
    primaryKeyword: "pdf to jpg converter online free",
    metaDescription:
      "Convert PDF to JPG or PNG online free - high quality up to 300 DPI, page ranges, batch ZIP download. No signup, no watermark.",
    relatedKeywords: [
      "pdf to jpg high quality",
      "convert pdf to png online",
      "pdf to image converter",
      "pdf to jpeg online",
      "high resolution pdf to image",
      "pdf to jpg without losing quality",
    ],
    category: "convert",
    iconName: "Image",
    backendEndpoint: "/tools/pdf-to-jpg",
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
    relatedSlugs: ["jpg-to-pdf", "pdf-to-word", "pdf-ocr"],
    seoCopy:
      "Convert PDF to JPG or PNG online free with PDF Studio. High-quality conversion up to 300 DPI, page range selection, and batch ZIP downloads - no signup, no watermark.",
    region: "global",
  },
  {
    slug: "jpg-to-pdf",
    displayName: "JPG to PDF",
    primaryKeyword: "jpg to pdf converter online free",
    metaDescription:
      "Convert JPG, PNG, or WebP images to PDF online free. Combine multiple images into one PDF - no signup, no watermark, auto-delete in 1 hour.",
    relatedKeywords: [
      "image to pdf converter",
      "png to pdf",
      "convert jpg to pdf online",
      "photo to pdf",
      "multiple images to one pdf",
      "jpg to pdf free",
    ],
    category: "convert",
    iconName: "ImagePlus",
    backendEndpoint: "/tools/jpg-to-pdf",
    faqs: [
      { q: "What image formats are supported?", a: "JPG, JPEG, PNG, and WebP. We auto-orient based on EXIF and preserve original resolution." },
      { q: "Can I combine multiple images into one PDF?", a: "Yes - drop several images and we'll merge them in the order you upload (drag to reorder)." },
      { q: "What page size is the output PDF?", a: "Default is A4 portrait, but you can choose A4 portrait, A4 landscape, US Letter, or fit-to-image." },
    ],
    howTo: [
      { name: "Upload your images", text: "Drop JPG, PNG, or WebP files onto the upload zone - multiple files are combined into one PDF." },
      { name: "Pick a page size", text: "Choose A4, US Letter, or fit-to-image for the output PDF." },
      { name: "Download the PDF", text: "Click Convert and download your image-to-PDF result." },
    ],
    relatedSlugs: ["pdf-to-jpg", "merge-pdf", "passport-photo-pdf"],
    seoCopy:
      "Convert JPG, PNG, or WebP images to PDF online for free with PDF Studio. Combine multiple photos into a single PDF document - ideal for scanned receipts, school assignments, and visa applications.",
    region: "global",
  },
  {
    slug: "lock-pdf",
    legacySlug: "password-protect-pdf-online",
    displayName: "Password Protect PDF",
    primaryKeyword: "password protect pdf online free",
    metaDescription:
      "Lock PDF with a password online free. AES-256 encryption, no signup, no watermark - secure your PDF in seconds.",
    relatedKeywords: [
      "lock pdf with password",
      "encrypt pdf online free",
      "add password to pdf",
      "secure pdf with password",
      "pdf password protect online",
      "make pdf private",
    ],
    category: "security",
    iconName: "Lock",
    backendEndpoint: "/tools/pdf/lock",
    faqs: [
      { q: "What encryption is used?", a: "AES-256, the same encryption used by Adobe Acrobat Pro and modern PDF readers." },
      { q: "Can I remove the password later?", a: "Yes - use the Unlock PDF tool with the same password you set." },
      { q: "Is the password sent to your servers?", a: "It's transmitted over HTTPS only to apply encryption, never stored, and the file is deleted within one hour." },
      { q: "Will the password also prevent printing or copying?", a: "Yes - we apply a single password that restricts opening; once opened, all standard permissions are granted." },
    ],
    howTo: [
      { name: "Upload your PDF", text: "Drop the PDF you want to protect." },
      { name: "Choose a strong password", text: "Pick a password of at least 8 characters - store it safely, we don't keep it." },
      { name: "Download the locked PDF", text: "Recipients will need the password to open the file." },
    ],
    relatedSlugs: ["unlock-pdf", "sign-pdf", "compress-pdf"],
    seoCopy:
      "Lock PDF with a password online for free using PDF Studio. AES-256 encryption protects your confidential documents - invoices, contracts, ID scans - with the same standard used by Adobe Acrobat.",
    region: "global",
  },
  {
    slug: "unlock-pdf",
    legacySlug: "unlock-pdf-with-password-online",
    displayName: "Unlock PDF",
    primaryKeyword: "unlock pdf online free",
    metaDescription:
      "Unlock PDF with password online free. Remove PDF password - no signup, no watermark, auto-delete in 1 hour.",
    relatedKeywords: [
      "remove pdf password free",
      "decrypt pdf online",
      "open password protected pdf",
      "pdf password remover",
      "unlock pdf with password",
      "pdf unlock online",
    ],
    category: "security",
    iconName: "Unlock",
    backendEndpoint: "/tools/pdf/unlock",
    faqs: [
      { q: "Can you unlock a PDF I don't know the password for?", a: "No - we require the correct password. We do not attempt to crack passwords." },
      { q: "Will the unlocked PDF look the same?", a: "Yes. We strip only the password layer; content, fonts, and formatting are preserved." },
      { q: "Is this safe to use?", a: "Yes - the file is processed over HTTPS and auto-deleted within one hour." },
    ],
    howTo: [
      { name: "Upload your locked PDF", text: "Drop the password-protected PDF onto the upload zone." },
      { name: "Enter the password", text: "Type the password used to encrypt the file." },
      { name: "Download the unlocked PDF", text: "The downloaded PDF opens without any password." },
    ],
    relatedSlugs: ["lock-pdf", "compress-pdf", "merge-pdf"],
    seoCopy:
      "Unlock PDF online for free with PDF Studio. Remove the open-password from any PDF you legitimately own - bank statements, eTickets, government forms - in seconds.",
    region: "global",
  },
  {
    slug: "pdf-ocr",
    legacySlug: "pdf-ocr-online-free",
    displayName: "PDF OCR",
    primaryKeyword: "pdf ocr online free",
    metaDescription:
      "Extract text from scanned PDFs with OCR - 100+ languages including English, Bangla, Hindi, Arabic, and Chinese. Free, no signup.",
    relatedKeywords: [
      "extract text from scanned pdf",
      "pdf to text ocr free",
      "scanned pdf to editable text",
      "ocr pdf multiple languages",
      "bangla ocr",
      "hindi pdf ocr online",
    ],
    category: "ocr",
    iconName: "Languages",
    backendEndpoint: "/tools/ocr/extract",
    faqs: [
      { q: "Which languages are supported?", a: "Over 100 - including English, Spanish, French, German, Hindi, Arabic, Chinese (Simplified & Traditional), Japanese, Korean, Portuguese, Russian, Italian, Dutch, Turkish, and Bengali." },
      { q: "Can I mix languages on the same page?", a: "Yes - combine codes with '+', e.g. eng+ben for English + Bangla text on the same page." },
      { q: "Does it work on photos of documents?", a: "OCR runs on PDFs. For a photo, first convert it with our JPG → PDF tool, then run OCR." },
      { q: "Does Bangla OCR work well?", a: "Yes - we use Tesseract 5 with the latest Bengali language pack, which handles printed Bangla text from books, forms, and newspapers." },
    ],
    howTo: [
      { name: "Upload a scanned PDF", text: "Drop your scanned or image-based PDF onto the upload zone." },
      { name: "Pick a language", text: "Select English, Bangla, Hindi, Arabic, Chinese, or combine multiple with '+'." },
      { name: "Get searchable text", text: "The output PDF has a hidden, searchable text layer plus a plain-text export." },
    ],
    relatedSlugs: ["pdf-to-word", "pdf-to-excel", "pdf-to-jpg"],
    seoCopy:
      "PDF OCR online free with 100+ languages - including Bangla, English, Hindi, Arabic, and Chinese. Convert scanned PDFs into searchable, copyable text using Tesseract 5 with the latest language models.",
    region: "global",
  },
  {
    slug: "nid-combine",
    legacySlug: "id-card-to-pdf",
    displayName: "ID Combine",
    // Primary keyword leads with "nid" so the <title> tag and meta-keywords
    // rank for the highest-volume BD query, while the visible label stays "ID Combine".
    primaryKeyword: "nid combine pdf - id card front back",
    metaDescription:
      "NID combine PDF online free. Combine any 2-sided ID - NID, student ID, employee ID, driver's license, passport - front and back onto one A4 PDF. No signup, no watermark.",
    relatedKeywords: [
      "nid combine pdf",
      "nid front back combine",
      "nid card pdf bd",
      "student id to pdf",
      "employee id card pdf",
      "driver license to pdf",
      "id card front back combine",
      "national id card combine",
    ],
    category: "convert",
    iconName: "IdCard",
    backendEndpoint: "/tools/id-card/combine",
    faqs: [
      { q: "What document types work?", a: "Any two-sided card: Bangladesh NID (smart card and old), student ID, employee ID, driver's license, passport, gym card, library card, business card - all fit the A4 template." },
      { q: "Can I add 'Front' / 'Back' labels?", a: "Yes - toggle 'Add labels' before processing." },
      { q: "What layouts are available?", a: "A4 portrait (stacked), A4 landscape (side-by-side), and Compact (smaller, more whitespace)." },
      { q: "Is this accepted by BD government portals?", a: "Yes - the A4 portrait layout matches the standard NID copy format accepted by NID Wing, Passport Office, banks, and embassies. Also works for student verification and employer KYC." },
    ],
    howTo: [
      { name: "Upload the front side", text: "Take a clear photo of the front of your ID card (NID, student, employee, license, etc.) and drop it as the first image." },
      { name: "Upload the back side", text: "Add the back photo. Both images are auto-rotated and sized." },
      { name: "Pick A4 layout and download", text: "Choose Portrait, Landscape, or Compact, then download the print-ready PDF." },
    ],
    relatedSlugs: ["passport-photo-pdf", "compress-pdf-to-100kb", "jpg-to-pdf"],
    seoCopy:
      "Combine the front and back of any ID card - NID, student ID, employee ID, driver's license, passport, smart card - into a single A4 PDF. Print-ready output accepted by Bangladesh government portals, banks, embassies, schools, and employers.",
    region: "BD",
  },
  {
    slug: "passport-photo-pdf",
    legacySlug: "passport-photo-to-pdf",
    displayName: "Passport Photo PDF",
    primaryKeyword: "passport size photo pdf a4",
    metaDescription:
      "Make passport-size photo PDF online free. Generate A4 sheets with up to 8 photos - built for Bangladesh, India, visa, and govt photo requirements.",
    relatedKeywords: [
      "passport size photo print pdf",
      "visa photo to a4 pdf",
      "make passport photo sheet",
      "8 passport photos on one page",
      "passport photo bd",
      "studio quality passport photo pdf",
    ],
    category: "convert",
    iconName: "Camera",
    backendEndpoint: "/tools/photo/to-pdf",
    faqs: [
      { q: "Which photo sizes are supported?", a: "Standard passport (35×45mm - used in Bangladesh, India, EU), stamp (20×25mm), US visa (51×51mm), and a custom size option." },
      { q: "How many photos per A4 sheet?", a: "Up to 8 in grid layout. Choose Single, Grid of 4, or Grid of 8 from the layout dropdown." },
      { q: "Can I print directly from the PDF?", a: "Yes - the PDF is print-ready A4. Set your printer to 'Actual size' (not 'Fit to page') to preserve dimensions." },
      { q: "Will this work at a local print shop in Bangladesh?", a: "Yes - any A4 photo printer accepts the output. Most BD studios charge less than 100 taka for an 8-photo print." },
    ],
    howTo: [
      { name: "Upload one photo", text: "Drop a single clear photo of yourself (front-facing, plain background)." },
      { name: "Pick size and layout", text: "Select Bangladesh/India 35×45mm or US visa 51×51mm, then Single, Grid of 4, or Grid of 8." },
      { name: "Download and print", text: "Print the A4 PDF on photo paper at any local print shop or home printer." },
    ],
    relatedSlugs: ["jpg-to-pdf", "nid-combine", "compress-pdf-to-100kb"],
    seoCopy:
      "Generate a passport-size photo PDF on A4 - perfect for Bangladesh, India, EU, and US visa applications. Choose Single, Grid of 4, or Grid of 8 layouts and print at any local studio.",
    region: "BD",
  },
  {
    slug: "pdf-to-excel",
    legacySlug: "pdf-to-excel-converter",
    displayName: "PDF to Excel",
    primaryKeyword: "pdf to excel converter free",
    metaDescription:
      "Convert PDF tables to Excel online free. Extract tables, bank statements, and reports into .xlsx - no signup, no watermark.",
    relatedKeywords: [
      "extract table from pdf to excel",
      "convert pdf to xlsx online",
      "pdf table to spreadsheet",
      "free pdf to excel converter no email",
      "bank statement pdf to excel",
      "pdf to xlsx converter free",
    ],
    category: "convert",
    iconName: "Table",
    backendEndpoint: "/tools/pdf-table/to-excel",
    faqs: [
      { q: "What kind of PDFs work best?", a: "PDFs with clearly-separated tabular data work best. Scanned PDFs (run OCR first) and complex multi-column layouts may give imperfect results." },
      { q: "Will formulas be preserved?", a: "No - PDF tables are static data, not formulas. The output contains values only." },
      { q: "Can I extract multiple tables from one PDF?", a: "Currently we extract the dominant table per page. Multi-table extraction is on the roadmap." },
      { q: "Will scanned bank statements work?", a: "Run our PDF OCR tool first to add a text layer, then upload to PDF to Excel." },
    ],
    howTo: [
      { name: "Upload your PDF", text: "Drop a PDF with at least one table." },
      { name: "Wait for extraction", text: "We detect rows, columns, and headers automatically using PDFPlumber." },
      { name: "Download the .xlsx", text: "Open in Excel, Google Sheets, or LibreOffice - the columns are preserved." },
    ],
    relatedSlugs: ["pdf-ocr", "pdf-to-word", "merge-pdf"],
    seoCopy:
      "PDF to Excel converter - extract bank statements, financial reports, invoices, and data tables from PDFs into editable .xlsx files. Free, no signup, no watermark.",
    region: "global",
  },
  {
    slug: "excel-to-pdf",
    legacySlug: "excel-to-pdf-converter",
    displayName: "Excel to PDF",
    primaryKeyword: "excel to pdf converter free",
    metaDescription:
      "Convert Excel (.xlsx) to PDF online free. Render every sheet as a clean PDF table - one sheet per page, headers, borders, zebra rows. No signup, no watermark.",
    relatedKeywords: [
      "xlsx to pdf online",
      "convert spreadsheet to pdf",
      "excel sheet to pdf table",
      "xlsx to pdf converter free no email",
      "multi sheet excel to pdf",
      "excel workbook to pdf",
    ],
    category: "convert",
    iconName: "Sheet",
    backendEndpoint: "/tools/excel/to-pdf",
    faqs: [
      { q: "Does it preserve formulas?", a: "Cached formula values are rendered. The PDF is read-only, so the formulas themselves are not embedded." },
      { q: "What about multi-sheet workbooks?", a: "Every sheet becomes a separate PDF page (or several, if a sheet overflows). The sheet name is shown as a heading above the table." },
      { q: "Will wide spreadsheets fit?", a: "Yes - wide sheets are auto-rendered in landscape and column widths are sized to fit the page." },
      { q: "Are images or charts included?", a: "Not yet - this tool renders the cell grid only. Charts and embedded images are skipped." },
    ],
    howTo: [
      { name: "Upload your .xlsx", text: "Drop any Excel file (.xlsx or .xlsm). Multi-sheet workbooks are fully supported." },
      { name: "Wait for rendering", text: "We render every sheet as a styled table with header, borders, and zebra rows." },
      { name: "Download the PDF", text: "Open or print the PDF - one sheet per page, ready to share." },
    ],
    relatedSlugs: ["pdf-to-excel", "pdf-to-word", "word-to-pdf"],
    seoCopy:
      "Excel to PDF converter - turn any .xlsx workbook into a clean, printable PDF. Each sheet is rendered as a styled table with header, borders, and zebra rows. Free, no signup, no watermark.",
    region: "global",
  },
  {
    slug: "pdf-to-word",
    displayName: "PDF to Word",
    primaryKeyword: "pdf to word converter online free",
    metaDescription:
      "Convert PDF to editable Word (.docx) online free. Preserve text, paragraphs, and tables. No signup, no watermark, auto-delete in 1 hour.",
    relatedKeywords: [
      "pdf to word",
      "convert pdf to docx",
      "editable word from pdf",
      "pdf to doc online",
      "free pdf to word converter",
      "pdf to word with images",
    ],
    category: "convert",
    iconName: "FileText",
    backendEndpoint: "/tools/pdf-to-word",
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
    relatedSlugs: ["word-to-pdf", "pdf-to-excel", "pdf-ocr"],
    seoCopy:
      "Convert PDF to editable Word (.docx) online for free - perfect for editing contracts, resumes, reports, and academic papers. Paragraphs, tables, and inline images are preserved.",
    region: "global",
  },
  {
    slug: "word-to-pdf",
    displayName: "Word to PDF",
    primaryKeyword: "word to pdf converter online free",
    metaDescription:
      "Convert Word (.docx) to PDF online free. Preserve fonts, layout, headings, and images. No signup, no watermark.",
    relatedKeywords: [
      "docx to pdf",
      "word to pdf converter",
      "convert doc to pdf online",
      "free word to pdf",
      "docx to pdf high quality",
      "save word as pdf",
    ],
    category: "convert",
    iconName: "FileType",
    backendEndpoint: "/tools/word-to-pdf",
    faqs: [
      { q: "Will my fonts and layout be preserved?", a: "Yes - we render via a clean HTML pipeline that maps Word styles, headings, lists, and tables to PDF." },
      { q: "Does it support .doc as well as .docx?", a: "Currently .docx only. For older .doc files, please re-save in Word as .docx first." },
      { q: "Are images included?", a: "Yes - inline images embedded in the Word document are placed into the PDF." },
    ],
    howTo: [
      { name: "Upload your .docx", text: "Drop a Microsoft Word document onto the upload zone." },
      { name: "Wait for rendering", text: "We convert headings, paragraphs, tables, and images to a clean PDF." },
      { name: "Download the PDF", text: "The output PDF preserves your Word formatting and is ready to share." },
    ],
    relatedSlugs: ["pdf-to-word", "jpg-to-pdf", "compress-pdf"],
    seoCopy:
      "Word to PDF converter - turn your .docx files into shareable PDFs with formatting preserved. Free, no signup, no watermark - ideal for resumes, reports, and assignments.",
    region: "global",
  },
  {
    slug: "sign-pdf",
    displayName: "Sign PDF",
    primaryKeyword: "sign pdf online free",
    metaDescription:
      "Sign PDF online free. Draw your signature, place it on any page, and download the signed PDF - no signup, no watermark.",
    relatedKeywords: [
      "draw signature on pdf",
      "electronic signature pdf",
      "esign pdf online",
      "add signature to pdf free",
      "sign pdf with mouse",
      "online pdf signer",
    ],
    category: "sign",
    iconName: "PenTool",
    backendEndpoint: "/tools/sign-pdf",
    faqs: [
      { q: "Is this a legally-binding eSignature?", a: "It applies a visible signature image to the PDF, which is accepted by most informal and business contexts. For legally-binding digital signatures with cryptographic proof, you need a certificate-based tool like Adobe Sign or DocuSign." },
      { q: "Can I place the signature on any page?", a: "Yes - drag the signature box onto any page, resize it, and we'll stamp it at the chosen position." },
      { q: "Can I save my signature for next time?", a: "Signatures are stored locally in your browser (not on our server) so they're available next time you visit." },
      { q: "What about Bangla signatures?", a: "Yes - draw in any script. The drawing is rendered as an image, so any language works." },
    ],
    howTo: [
      { name: "Upload your PDF", text: "Drop the PDF you want to sign." },
      { name: "Draw your signature", text: "Use your mouse, trackpad, or touch screen to draw a signature in the box." },
      { name: "Place and download", text: "Drag the signature onto the right page and position, then download the signed PDF." },
    ],
    relatedSlugs: ["lock-pdf", "merge-pdf", "compress-pdf"],
    seoCopy:
      "Sign PDF online free - draw your signature, place it anywhere on the document, and download the signed PDF. Works on desktop, tablet, and mobile (touch-friendly).",
    region: "global",
    customComponent: "SignPdfWorkspace",
  },
];

/** O(1) lookup by slug - used by tool pages, sitemap, OG generator. */
const bySlug = new Map(toolRegistry.map((t) => [t.slug, t]));
const byLegacySlug = new Map(
  toolRegistry.filter((t) => t.legacySlug).map((t) => [t.legacySlug as string, t]),
);

export function getTool(slug: string): ToolEntry | undefined {
  return bySlug.get(slug) ?? byLegacySlug.get(slug);
}

/** Get clean slug for a possibly-legacy slug; used for redirects. */
export function resolveCleanSlug(slug: string): string | undefined {
  if (bySlug.has(slug)) return slug;
  const t = byLegacySlug.get(slug);
  return t?.slug;
}

/** Categories in display order, used by the homepage tool-grid tabs. */
export const TOOL_CATEGORIES: ToolCategory[] = [
  "optimize",
  "merge",
  "convert",
  "security",
  "ocr",
  "sign",
];

/** Tools filtered by region marker. */
export function toolsByRegion(region: "BD" | "global"): ToolEntry[] {
  return toolRegistry.filter((t) => t.region === region);
}
