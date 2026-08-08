import type { ToolMeta } from "./types";

/**
 * Slim, client-safe tool registry.
 *
 * Identity, taxonomy, runtime and card copy only. SEO prose lives in
 * ./content/<domain>/<slug>.ts behind `server-only`, so adding tools does not
 * grow any client bundle.
 */
export const tools: ToolMeta[] = [
  {
    id: "compress-pdf",
    slug: "compress-pdf",
    legacySlug: "compress-pdf-without-losing-quality",
    domain: "pdf",
    operation: "optimize",
    runtime: "server",
    surface: "drop",
    iconName: "Wand2",
    status: "live",
    cardTitle: "Compress PDF",
    cardBlurb: "Shrink PDFs to fit email, chat, or upload limits.",
    backendEndpoint: "/tools/compress/target-size",
    regions: ["global"],
    accepts: ["application/pdf"],
    featured: true,
    trending: true,
  },
  {
    id: "compress-pdf-to-100kb",
    slug: "compress-pdf-to-100kb",
    domain: "pdf",
    operation: "optimize",
    runtime: "server",
    surface: "drop",
    iconName: "Target",
    status: "live",
    cardTitle: "Compress PDF to 100KB",
    cardBlurb: "Hit an exact file size for government forms and portals.",
    backendEndpoint: "/tools/compress/target-size",
    regions: ["BD"],
    accepts: ["application/pdf"],
  },
  {
    id: "compress-pdf-to-200kb",
    slug: "compress-pdf-to-200kb",
    domain: "pdf",
    operation: "optimize",
    runtime: "server",
    surface: "drop",
    iconName: "Target",
    status: "live",
    cardTitle: "Compress PDF to 200KB",
    cardBlurb: "Hit a 200KB target while keeping scans readable.",
    backendEndpoint: "/tools/compress/target-size",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "compress-pdf-to-500kb",
    slug: "compress-pdf-to-500kb",
    domain: "pdf",
    operation: "optimize",
    runtime: "server",
    surface: "drop",
    iconName: "Target",
    status: "live",
    cardTitle: "Compress PDF to 500KB",
    cardBlurb: "Drop a heavy PDF under 500KB with minimal quality loss.",
    backendEndpoint: "/tools/compress/target-size",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "compress-pdf-to-1mb",
    slug: "compress-pdf-to-1mb",
    domain: "pdf",
    operation: "optimize",
    runtime: "server",
    surface: "drop",
    iconName: "Target",
    status: "live",
    cardTitle: "Compress PDF to 1MB",
    cardBlurb: "Get any PDF under 1MB while keeping it sharp.",
    backendEndpoint: "/tools/compress/target-size",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    legacySlug: "merge-large-pdf-files-online",
    domain: "pdf",
    operation: "organize",
    runtime: "server",
    surface: "drop",
    iconName: "Merge",
    status: "live",
    cardTitle: "Merge PDF",
    cardBlurb: "Combine multiple PDFs into one, reorder pages freely.",
    backendEndpoint: "/merge",
    regions: ["global"],
    accepts: ["application/pdf"],
    featured: true,
    trending: true,
  },
  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    legacySlug: "pdf-to-jpg-high-quality",
    domain: "pdf",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "Image",
    status: "live",
    cardTitle: "PDF to JPG / PNG",
    cardBlurb: "Export each PDF page as a JPG or PNG image.",
    backendEndpoint: "/tools/pdf-to-jpg",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "jpg-to-pdf",
    slug: "jpg-to-pdf",
    domain: "pdf",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "ImagePlus",
    status: "live",
    cardTitle: "JPG to PDF",
    cardBlurb: "Turn photos and images into a single shareable PDF.",
    backendEndpoint: "/tools/jpg-to-pdf",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png"],
  },
  {
    id: "lock-pdf",
    slug: "lock-pdf",
    legacySlug: "password-protect-pdf-online",
    domain: "pdf",
    operation: "secure",
    runtime: "server",
    surface: "drop",
    iconName: "Lock",
    status: "live",
    cardTitle: "Password Protect PDF",
    cardBlurb: "Lock a PDF with a password (AES-256 encryption).",
    backendEndpoint: "/tools/pdf/lock",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "unlock-pdf",
    slug: "unlock-pdf",
    legacySlug: "unlock-pdf-with-password-online",
    domain: "pdf",
    operation: "secure",
    runtime: "server",
    surface: "drop",
    iconName: "Unlock",
    status: "live",
    cardTitle: "Unlock PDF",
    cardBlurb: "Remove a password from a PDF you can already open.",
    backendEndpoint: "/tools/pdf/unlock",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "pdf-ocr",
    slug: "pdf-ocr",
    legacySlug: "pdf-ocr-online-free",
    domain: "pdf",
    operation: "extract",
    runtime: "server",
    surface: "drop",
    iconName: "Languages",
    status: "live",
    cardTitle: "PDF OCR",
    cardBlurb: "Pull selectable text out of scanned PDFs, 100+ languages.",
    backendEndpoint: "/tools/ocr/extract",
    regions: ["global"],
    accepts: ["application/pdf"],
    trending: true,
  },
  {
    id: "nid-combine",
    slug: "nid-combine",
    legacySlug: "id-card-to-pdf",
    domain: "pdf",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "IdCard",
    status: "live",
    cardTitle: "ID Combine",
    cardBlurb: "Front and back of an ID card on a single A4 page.",
    backendEndpoint: "/tools/id-card/combine",
    regions: ["BD"],
    accepts: ["image/jpeg", "image/png"],
  },
  {
    id: "passport-photo-pdf",
    slug: "passport-photo-pdf",
    legacySlug: "passport-photo-to-pdf",
    domain: "pdf",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "Camera",
    status: "live",
    cardTitle: "Passport Photo PDF",
    cardBlurb: "Tile passport-size photos onto A4, ready to print.",
    backendEndpoint: "/tools/photo/to-pdf",
    regions: ["BD"],
    accepts: ["image/jpeg", "image/png"],
  },
  {
    id: "pdf-to-excel",
    slug: "pdf-to-excel",
    legacySlug: "pdf-to-excel-converter",
    domain: "pdf",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "Table",
    status: "live",
    cardTitle: "PDF to Excel",
    cardBlurb: "Lift tables out of a PDF into editable spreadsheets.",
    backendEndpoint: "/tools/pdf-table/to-excel",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "excel-to-pdf",
    slug: "excel-to-pdf",
    legacySlug: "excel-to-pdf-converter",
    domain: "pdf",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "Sheet",
    status: "live",
    cardTitle: "Excel to PDF",
    cardBlurb: "Render every sheet of an .xlsx as a clean PDF.",
    backendEndpoint: "/tools/excel/to-pdf",
    regions: ["global"],
    accepts: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  },
  {
    id: "pdf-to-word",
    slug: "pdf-to-word",
    domain: "pdf",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "FileText",
    status: "live",
    cardTitle: "PDF to Word",
    cardBlurb: "Convert a PDF into an editable Word (.docx) document.",
    backendEndpoint: "/tools/pdf-to-word",
    regions: ["global"],
    accepts: ["application/pdf"],
    featured: true,
    trending: true,
  },
  {
    id: "word-to-pdf",
    slug: "word-to-pdf",
    domain: "pdf",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "FileType",
    status: "live",
    cardTitle: "Word to PDF",
    cardBlurb: "Turn a .docx into a shareable PDF, formatting preserved.",
    backendEndpoint: "/tools/word-to-pdf",
    regions: ["global"],
    accepts: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
  {
    id: "sign-pdf",
    slug: "sign-pdf",
    domain: "pdf",
    operation: "edit",
    runtime: "server",
    surface: "drop",
    iconName: "PenTool",
    status: "live",
    cardTitle: "Sign PDF",
    cardBlurb: "Draw your signature and drop it on any page.",
    backendEndpoint: "/tools/sign-pdf",
    regions: ["global"],
    accepts: ["application/pdf"],
    // Only `edit` tool in the catalogue, so scoring has no siblings to rank.
    relatedOverride: ["lock-pdf", "merge-pdf", "compress-pdf"],
  },
  {
    id: "split-pdf",
    slug: "split-pdf",
    domain: "pdf",
    operation: "organize",
    runtime: "server",
    surface: "drop",
    iconName: "Scissors",
    status: "live",
    cardTitle: "Split PDF",
    cardBlurb: "Extract pages or break a PDF into separate files.",
    backendEndpoint: "/tools/pdf/split",
    regions: ["global"],
    accepts: ["application/pdf"],
    trending: true,
  },
  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    domain: "pdf",
    operation: "organize",
    runtime: "server",
    surface: "drop",
    iconName: "RotateCw",
    status: "live",
    cardTitle: "Rotate PDF",
    cardBlurb: "Fix sideways or upside-down pages permanently.",
    backendEndpoint: "/tools/pdf/rotate",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "delete-pdf-pages",
    slug: "delete-pdf-pages",
    domain: "pdf",
    operation: "organize",
    runtime: "server",
    surface: "drop",
    iconName: "Trash2",
    status: "live",
    cardTitle: "Delete PDF Pages",
    cardBlurb: "Remove blank, wrong, or duplicate pages from a PDF.",
    backendEndpoint: "/tools/pdf/delete-pages",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "compress-image",
    slug: "compress-image",
    domain: "image",
    operation: "optimize",
    runtime: "client",
    surface: "drop",
    iconName: "Wand2",
    status: "live",
    cardTitle: "Compress Image",
    cardBlurb: "Shrink JPG, PNG or WebP without visible quality loss.",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png", "image/webp"],
    featured: true,
    trending: true,
  },
  {
    id: "resize-image",
    slug: "resize-image",
    domain: "image",
    operation: "edit",
    runtime: "client",
    surface: "drop",
    iconName: "Scaling",
    status: "live",
    cardTitle: "Resize Image",
    cardBlurb: "Set exact pixel dimensions, or fit a preset size.",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png", "image/webp"],
    trending: true,
  },
  {
    id: "jpg-to-png",
    slug: "jpg-to-png",
    domain: "image",
    operation: "convert",
    runtime: "client",
    surface: "drop",
    iconName: "Image",
    status: "live",
    cardTitle: "JPG to PNG",
    cardBlurb: "Convert JPG to PNG and keep a lossless copy.",
    regions: ["global"],
    accepts: ["image/jpeg"],
  },
  {
    id: "png-to-jpg",
    slug: "png-to-jpg",
    domain: "image",
    operation: "convert",
    runtime: "client",
    surface: "drop",
    iconName: "Image",
    status: "live",
    cardTitle: "PNG to JPG",
    cardBlurb: "Convert PNG to JPG with a background of your choice.",
    regions: ["global"],
    accepts: ["image/png"],
    trending: true,
  },
  {
    id: "webp-converter",
    slug: "webp-converter",
    domain: "image",
    operation: "convert",
    runtime: "client",
    surface: "drop",
    iconName: "Repeat",
    status: "live",
    cardTitle: "WebP Converter",
    cardBlurb: "Convert to WebP, or turn WebP back into JPG or PNG.",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "heic-to-jpg",
    slug: "heic-to-jpg",
    domain: "image",
    operation: "convert",
    runtime: "server",
    surface: "drop",
    iconName: "Camera",
    status: "live",
    cardTitle: "HEIC to JPG",
    cardBlurb: "Turn iPhone HEIC photos into JPGs anything can open.",
    backendEndpoint: "/tools/heic-to-jpg",
    regions: ["global"],
    accepts: ["image/heic", "image/heif"],
    featured: true,
    trending: true,
  },
  {
    id: "crop-image",
    slug: "crop-image",
    domain: "image",
    operation: "edit",
    runtime: "client",
    surface: "drop",
    iconName: "Crop",
    status: "live",
    cardTitle: "Crop Image",
    cardBlurb: "Trim to a region, or crop to a fixed aspect ratio.",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "watermark-image",
    slug: "watermark-image",
    domain: "image",
    operation: "edit",
    runtime: "client",
    surface: "drop",
    iconName: "Type",
    status: "live",
    cardTitle: "Watermark Image",
    cardBlurb: "Stamp text across a photo before you share it.",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "image-to-ico",
    slug: "image-to-ico",
    domain: "image",
    operation: "convert",
    runtime: "client",
    surface: "drop",
    iconName: "AppWindow",
    status: "live",
    cardTitle: "Convert to ICO",
    cardBlurb: "Build a multi-size .ico favicon from any image.",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "qr-code-generator",
    slug: "qr-code-generator",
    domain: "image",
    operation: "generate",
    runtime: "client",
    surface: "text",
    iconName: "QrCode",
    status: "live",
    cardTitle: "QR Code Generator",
    cardBlurb: "Make a QR code for a link, text, WiFi or contact.",
    regions: ["global"],
    featured: true,
    trending: true,
  },
  {
    id: "barcode-generator",
    slug: "barcode-generator",
    domain: "image",
    operation: "generate",
    runtime: "client",
    surface: "text",
    iconName: "Barcode",
    status: "live",
    cardTitle: "Barcode Generator",
    cardBlurb: "Generate CODE128, EAN-13, UPC and more.",
    regions: ["global"],
  },
  {
    id: "qr-scanner",
    slug: "qr-scanner",
    domain: "image",
    operation: "extract",
    runtime: "client",
    surface: "drop",
    iconName: "ScanLine",
    status: "live",
    cardTitle: "QR Scanner",
    cardBlurb: "Read a QR code out of a screenshot or photo.",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "password-generator",
    slug: "password-generator",
    domain: "security",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "KeyRound",
    status: "live",
    cardTitle: "Password Generator",
    cardBlurb: "Strong random passwords, generated in your browser.",
    regions: ["global"],
    featured: true,
  },
  {
    id: "color-picker",
    slug: "color-picker",
    domain: "color",
    operation: "extract",
    runtime: "client",
    surface: "drop",
    iconName: "Pipette",
    status: "live",
    cardTitle: "Color Picker",
    cardBlurb: "Pull exact colours out of any image you upload.",
    regions: ["global"],
    accepts: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "color-converter",
    slug: "color-converter",
    domain: "color",
    operation: "convert",
    runtime: "client",
    surface: "text",
    iconName: "Palette",
    status: "live",
    cardTitle: "Color Converter",
    cardBlurb: "Convert HEX, RGB, HSL and OKLCH both ways.",
    regions: ["global"],
  },
  {
    id: "timestamp-converter",
    slug: "timestamp-converter",
    domain: "convert",
    operation: "convert",
    runtime: "client",
    surface: "text",
    iconName: "Clock",
    status: "live",
    cardTitle: "Timestamp Converter",
    cardBlurb: "Unix epoch to human dates, and back again.",
    regions: ["global"],
  },

  // Developer / text / data tools - all client-side, zero server cost.
  {
    id: "json-formatter",
    slug: "json-formatter",
    domain: "code",
    operation: "format",
    runtime: "client",
    surface: "text",
    iconName: "Braces",
    status: "live",
    cardTitle: "JSON Formatter",
    cardBlurb: "Format, validate and minify JSON instantly.",
    regions: ["global"],
    featured: true,
    trending: true,
  },
  {
    id: "base64-encode-decode",
    slug: "base64-encode-decode",
    domain: "code",
    operation: "convert",
    runtime: "client",
    surface: "text",
    iconName: "Binary",
    status: "live",
    cardTitle: "Base64 Encode / Decode",
    cardBlurb: "Encode or decode Base64, UTF-8 safe.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "jwt-decoder",
    slug: "jwt-decoder",
    domain: "code",
    operation: "extract",
    runtime: "client",
    surface: "text",
    iconName: "KeySquare",
    status: "live",
    cardTitle: "JWT Decoder",
    cardBlurb: "Read a token's header and claims locally.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "hash-generator",
    slug: "hash-generator",
    domain: "security",
    operation: "generate",
    runtime: "client",
    surface: "text",
    iconName: "Fingerprint",
    status: "live",
    cardTitle: "Hash Generator",
    cardBlurb: "SHA-1, SHA-256, SHA-384 and SHA-512.",
    regions: ["global"],
  },
  {
    id: "uuid-generator",
    slug: "uuid-generator",
    domain: "code",
    operation: "generate",
    runtime: "client",
    surface: "text",
    iconName: "Hash",
    status: "live",
    cardTitle: "UUID Generator",
    cardBlurb: "Random v4 UUIDs, as many as you need.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "regex-tester",
    slug: "regex-tester",
    domain: "code",
    operation: "extract",
    runtime: "client",
    surface: "text",
    iconName: "Regex",
    status: "live",
    cardTitle: "Regex Tester",
    cardBlurb: "Test patterns and inspect every capture group.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "url-encoder-decoder",
    slug: "url-encoder-decoder",
    domain: "code",
    operation: "convert",
    runtime: "client",
    surface: "text",
    iconName: "Link2",
    status: "live",
    cardTitle: "URL Encoder / Decoder",
    cardBlurb: "Percent-encode query strings and paths.",
    regions: ["global"],
  },
  {
    id: "cron-expression-generator",
    slug: "cron-expression-generator",
    domain: "code",
    operation: "format",
    runtime: "client",
    surface: "text",
    iconName: "Clock",
    status: "live",
    cardTitle: "Cron Expression Explainer",
    cardBlurb: "Read back, in English, when a cron runs.",
    regions: ["global"],
  },
  {
    id: "sql-formatter",
    slug: "sql-formatter",
    domain: "code",
    operation: "format",
    runtime: "client",
    surface: "text",
    iconName: "Database",
    status: "live",
    cardTitle: "SQL Formatter",
    cardBlurb: "Readable SQL across five dialects.",
    regions: ["global"],
  },
  {
    id: "yaml-to-json",
    slug: "yaml-to-json",
    domain: "data",
    operation: "convert",
    runtime: "client",
    surface: "text",
    iconName: "FileJson",
    status: "live",
    cardTitle: "YAML to JSON",
    cardBlurb: "Convert YAML to JSON and back again.",
    regions: ["global"],
  },
  {
    id: "csv-to-json",
    slug: "csv-to-json",
    domain: "data",
    operation: "convert",
    runtime: "client",
    surface: "text",
    iconName: "Table2",
    status: "live",
    cardTitle: "CSV to JSON",
    cardBlurb: "Quoted fields and embedded commas handled.",
    regions: ["global"],
  },
  {
    id: "markdown-to-html",
    slug: "markdown-to-html",
    domain: "text",
    operation: "convert",
    runtime: "client",
    surface: "text",
    iconName: "FileCode",
    status: "live",
    cardTitle: "Markdown to HTML",
    cardBlurb: "GitHub-flavoured markdown to clean HTML.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "diff-checker",
    slug: "diff-checker",
    domain: "text",
    operation: "extract",
    runtime: "client",
    surface: "text",
    iconName: "GitCompare",
    status: "live",
    cardTitle: "Diff Checker",
    cardBlurb: "Compare two texts line by line.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "word-counter",
    slug: "word-counter",
    domain: "text",
    operation: "extract",
    runtime: "client",
    surface: "text",
    iconName: "Type",
    status: "live",
    cardTitle: "Word Counter",
    cardBlurb: "Words, characters and reading time.",
    regions: ["global"],
    trending: true,
  },

  // PDF gap tools - pure PyMuPDF, same pipeline as the existing PDF endpoints.
  {
    id: "watermark-pdf",
    slug: "watermark-pdf",
    domain: "pdf",
    operation: "edit",
    runtime: "server",
    surface: "drop",
    iconName: "Stamp",
    status: "live",
    cardTitle: "Watermark PDF",
    cardBlurb: "Stamp text across every page, tiled or centred.",
    backendEndpoint: "/tools/pdf/watermark",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "add-page-numbers",
    slug: "add-page-numbers",
    domain: "pdf",
    operation: "edit",
    runtime: "server",
    surface: "drop",
    iconName: "ListOrdered",
    status: "live",
    cardTitle: "Add Page Numbers",
    cardBlurb: "Number pages, with your own format and position.",
    backendEndpoint: "/tools/pdf/page-numbers",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "crop-pdf",
    slug: "crop-pdf",
    domain: "pdf",
    operation: "edit",
    runtime: "server",
    surface: "drop",
    iconName: "Crop",
    status: "live",
    cardTitle: "Crop PDF",
    cardBlurb: "Trim margins without re-rendering the page.",
    backendEndpoint: "/tools/pdf/crop",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "flatten-pdf",
    slug: "flatten-pdf",
    domain: "pdf",
    operation: "edit",
    runtime: "server",
    surface: "drop",
    iconName: "Layers",
    status: "live",
    cardTitle: "Flatten PDF",
    cardBlurb: "Bake forms and annotations into the page.",
    backendEndpoint: "/tools/pdf/flatten",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "organize-pdf",
    slug: "organize-pdf",
    domain: "pdf",
    operation: "organize",
    runtime: "server",
    surface: "drop",
    iconName: "ArrowUpDown",
    status: "live",
    cardTitle: "Organize PDF",
    cardBlurb: "Reorder, subset or reverse pages.",
    backendEndpoint: "/tools/pdf/organize",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "redact-pdf",
    slug: "redact-pdf",
    domain: "pdf",
    operation: "secure",
    runtime: "server",
    surface: "drop",
    iconName: "EyeOff",
    status: "live",
    cardTitle: "Redact PDF",
    cardBlurb: "Permanently delete text, not just cover it.",
    backendEndpoint: "/tools/pdf/redact",
    regions: ["global"],
    accepts: ["application/pdf"],
    trending: true,
  },
  {
    id: "repair-pdf",
    slug: "repair-pdf",
    domain: "pdf",
    operation: "edit",
    runtime: "server",
    surface: "drop",
    iconName: "Wrench",
    status: "live",
    cardTitle: "Repair PDF",
    cardBlurb: "Rebuild a damaged or unopenable PDF.",
    backendEndpoint: "/tools/pdf/repair",
    regions: ["global"],
    accepts: ["application/pdf"],
  },

  // Calculators - client-side, and the highest-RPM traffic on the site.
  {
    id: "mortgage-calculator",
    slug: "mortgage-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Home",
    status: "live",
    cardTitle: "Mortgage Calculator",
    cardBlurb: "Monthly payment with tax and insurance included.",
    regions: ["global"],
    featured: true,
    trending: true,
  },
  {
    id: "loan-emi-calculator",
    slug: "loan-emi-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Landmark",
    status: "live",
    cardTitle: "Loan EMI Calculator",
    cardBlurb: "Monthly instalment and what the loan really costs.",
    regions: ["global"],
  },
  {
    id: "percentage-calculator",
    slug: "percentage-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Percent",
    status: "live",
    cardTitle: "Percentage Calculator",
    cardBlurb: "Percent of, percent change, and what-percent-is.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "age-calculator",
    slug: "age-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Cake",
    status: "live",
    cardTitle: "Age Calculator",
    cardBlurb: "Exact age and the countdown to your next birthday.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "date-difference-calculator",
    slug: "date-difference-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "CalendarDays",
    status: "live",
    cardTitle: "Date Difference Calculator",
    cardBlurb: "Days between two dates, weekdays counted separately.",
    regions: ["global"],
  },
  {
    id: "bmi-calculator",
    slug: "bmi-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "HeartPulse",
    status: "live",
    cardTitle: "BMI Calculator",
    cardBlurb: "Body mass index in metric or imperial.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "discount-calculator",
    slug: "discount-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Tag",
    status: "live",
    cardTitle: "Discount Calculator",
    cardBlurb: "What you actually pay after a percentage off.",
    regions: ["global"],
  },
  {
    id: "tip-calculator",
    slug: "tip-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "HandCoins",
    status: "live",
    cardTitle: "Tip Calculator",
    cardBlurb: "Tip, total and the split per person.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "gpa-calculator",
    slug: "gpa-calculator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "GraduationCap",
    status: "live",
    cardTitle: "GPA Calculator",
    cardBlurb: "Credit-weighted GPA on the 4.0 scale.",
    regions: ["global"],
  },
  {
    id: "unit-converter",
    slug: "unit-converter",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Ruler",
    status: "live",
    cardTitle: "Unit Converter",
    cardBlurb: "Length, weight, temperature, volume and more.",
    regions: ["global"],
    trending: true,
  },

  // Tier 2 + 3: general-audience tools.
  {
    id: "case-converter",
    slug: "case-converter",
    domain: "text",
    operation: "format",
    runtime: "client",
    surface: "text",
    iconName: "CaseSensitive",
    status: "live",
    cardTitle: "Case Converter",
    cardBlurb: "UPPER, lower, Title, camelCase and more.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "social-media-image-resizer",
    slug: "social-media-image-resizer",
    domain: "image",
    operation: "edit",
    runtime: "client",
    surface: "drop",
    iconName: "Scaling",
    status: "live",
    cardTitle: "Social Media Image Resizer",
    cardBlurb: "Exact sizes for Instagram, YouTube, LinkedIn and more.",
    regions: ["global"],
    featured: true,
    trending: true,
  },
  {
    id: "photo-resizer-for-print",
    slug: "photo-resizer-for-print",
    domain: "image",
    operation: "edit",
    runtime: "client",
    surface: "drop",
    iconName: "Crop",
    status: "live",
    cardTitle: "Photo Resizer for Print",
    cardBlurb: "4x6, A4, passport and ID sizes at 300 DPI.",
    regions: ["global"],
  },
  {
    id: "password-strength-checker",
    slug: "password-strength-checker",
    domain: "security",
    operation: "analyze",
    runtime: "client",
    surface: "text",
    iconName: "ShieldCheck",
    status: "live",
    cardTitle: "Password Strength Checker",
    cardBlurb: "How long your password would really survive.",
    regions: ["global"],
  },
  {
    id: "pdf-to-text",
    slug: "pdf-to-text",
    domain: "pdf",
    operation: "extract",
    runtime: "server",
    surface: "drop",
    iconName: "FileText",
    status: "live",
    cardTitle: "PDF to Text",
    cardBlurb: "Pull the text layer out of a PDF instantly.",
    backendEndpoint: "/tools/pdf/to-text",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "compare-pdf",
    slug: "compare-pdf",
    domain: "pdf",
    operation: "extract",
    runtime: "server",
    surface: "drop",
    iconName: "GitCompare",
    status: "live",
    cardTitle: "Compare PDF",
    cardBlurb: "Find what changed between two documents.",
    backendEndpoint: "/tools/pdf/compare",
    regions: ["global"],
    accepts: ["application/pdf"],
  },
  {
    id: "coin-flip",
    slug: "coin-flip",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Coins",
    status: "live",
    cardTitle: "Coin Flip",
    cardBlurb: "A genuinely random heads or tails.",
    regions: ["global"],
  },
  {
    id: "dice-roller",
    slug: "dice-roller",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Dices",
    status: "live",
    cardTitle: "Dice Roller",
    cardBlurb: "Roll any dice, any number of sides.",
    regions: ["global"],
  },
  {
    id: "random-number-generator",
    slug: "random-number-generator",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Hash",
    status: "live",
    cardTitle: "Random Number Generator",
    cardBlurb: "Pick numbers in a range, with or without repeats.",
    regions: ["global"],
  },
  {
    id: "random-picker-wheel",
    slug: "random-picker-wheel",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Shuffle",
    status: "live",
    cardTitle: "Random Picker Wheel",
    cardBlurb: "Fair draws for giveaways and classrooms.",
    regions: ["global"],
  },
  {
    id: "random-name-generator",
    slug: "random-name-generator",
    domain: "text",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Users",
    status: "live",
    cardTitle: "Random Name Generator",
    cardBlurb: "Placeholder names for test data and mock-ups.",
    regions: ["global"],
    trending: true,
  },
  {
    id: "countdown-timer",
    slug: "countdown-timer",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "Timer",
    status: "live",
    cardTitle: "Countdown Timer",
    cardBlurb: "Set a duration and get an audible alert.",
    regions: ["global"],
  },
  {
    id: "stopwatch-online",
    slug: "stopwatch-online",
    domain: "calc",
    operation: "generate",
    runtime: "client",
    surface: "form",
    iconName: "TimerReset",
    status: "live",
    cardTitle: "Online Stopwatch",
    cardBlurb: "Start, stop and record laps.",
    regions: ["global"],
  },
];

/**
 * Route segments that are real pages, not tools. The catch-all `/[slug]` route
 * must never claim one; the registry test fails the build if a tool tries.
 */
export const RESERVED_SLUGS = [
  // Real pages
  "about", "api", "blog", "contact", "guides", "og", "privacy", "roadmap",
  "settings", "terms", "tools", "vs", "widget", "workspace",
  // Domain hub segments (see lib/tools/domains.ts)
  "pdf", "image", "developer", "text", "color", "security", "convert", "data",
  "calculator",
  // Redirect alias sources (see lib/redirects.ts) - a tool claiming one would
  // be shadowed by its own redirect
  "compress", "merge", "ocr", "sign",
] as const;

const bySlug = new Map(tools.map((t) => [t.slug, t]));
const byLegacySlug = new Map(
  tools.filter((t) => t.legacySlug).map((t) => [t.legacySlug as string, t]),
);

/** O(1) lookup. Accepts a clean slug or a legacy slug. */
export function getTool(slug: string): ToolMeta | undefined {
  return bySlug.get(slug) ?? byLegacySlug.get(slug);
}

/** Map a possibly-legacy slug to its canonical slug. */
export function resolveCleanSlug(slug: string): string | undefined {
  if (bySlug.has(slug)) return slug;
  return byLegacySlug.get(slug)?.slug;
}

export function toolsByDomain(domain: ToolMeta["domain"]): ToolMeta[] {
  return tools.filter((t) => t.domain === domain);
}

export function toolsByOperation(operation: ToolMeta["operation"]): ToolMeta[] {
  return tools.filter((t) => t.operation === operation);
}

/** Tools visible in a region. A tool with no `regions` is global. */
export function toolsForRegion(region: NonNullable<ToolMeta["regions"]>[number]): ToolMeta[] {
  return tools.filter((t) => !t.regions || t.regions.includes(region) || t.regions.includes("global"));
}

/** Curated homepage slider set. Deliberately spans domains, not just PDF. */
export function featuredTools(): ToolMeta[] {
  return tools.filter((t) => t.featured);
}

/**
 * Curated slider set for one hub.
 *
 * Returns nothing below MIN_SLIDER_TOOLS - a carousel over two items is worse
 * than a plain grid, so small domains skip the slider entirely.
 */
export const MIN_SLIDER_TOOLS = 5;

export function trendingTools(domain: ToolMeta["domain"]): ToolMeta[] {
  const all = tools.filter((t) => t.domain === domain);
  if (all.length < MIN_SLIDER_TOOLS) return [];
  const picked = all.filter((t) => t.trending);
  return picked.length >= MIN_SLIDER_TOOLS ? picked : [];
}

/** Domains that actually have tools, in display order. */
export const DOMAINS_IN_USE = Array.from(new Set(tools.map((t) => t.domain)));

/**
 * "a-to-b" <-> "b-to-a". Catches pdf-to-jpg/jpg-to-pdf, pdf-to-word/word-to-pdf
 * and friends without needing a hand-maintained inverse table.
 */
function inverseSlug(slug: string): string | null {
  const parts = slug.split("-to-");
  if (parts.length !== 2) return null;
  return `${parts[1]}-to-${parts[0]}`;
}

function familyKey(slug: string): string {
  return slug.split("-")[0] ?? slug;
}

/**
 * Relatedness score. Replaces the hand-maintained `relatedSlugs` array, which
 * would rot the moment the catalogue outgrows what one person can curate.
 */
export function relatedScore(a: ToolMeta, b: ToolMeta): number {
  if (a.slug === b.slug) return -1;
  let score = 0;
  if (inverseSlug(a.slug) === b.slug) score += 6;
  if (a.domain === b.domain) score += 2;
  if (a.operation === b.operation) score += 3;
  if (familyKey(a.slug) === familyKey(b.slug)) score += 2;
  if (a.accepts && b.accepts && a.accepts.some((m) => b.accepts!.includes(m))) score += 2;
  if (a.runtime === b.runtime) score += 1;
  return score;
}

/** Registry order doubles as a rough popularity ranking; used to break ties. */
const rankBySlug = new Map(tools.map((t, i) => [t.slug, i]));

/**
 * At most this many results may come from one slug family, so a tool with many
 * near-identical siblings (compress-pdf-to-100kb/200kb/500kb/1mb) still
 * cross-links out of its own cluster instead of dead-ending in it.
 */
const MAX_PER_FAMILY = 2;

/**
 * Top-N related tools, with guaranteed cross-category reach.
 *
 * `CROSS_DOMAIN_SLOTS` of the results are reserved for tools from OTHER
 * domains. Without that reservation a /compress-pdf visitor only ever sees
 * more PDF tools and leaves believing this is a PDF site - which was measurably
 * true before: that page linked to six tools, all PDF.
 *
 * The cross picks are drawn from curated `featured`/`trending` tools so the
 * detour is to something worth seeing, not a random corner of the catalogue.
 */
const CROSS_DOMAIN_SLOTS = 2;

export function relatedTools(slug: string, limit = 6): ToolMeta[] {
  const tool = getTool(slug);
  if (!tool) return [];

  if (tool.relatedOverride?.length) {
    const curated = tool.relatedOverride
      .map((s) => bySlug.get(s))
      .filter((t): t is ToolMeta => !!t);
    if (curated.length >= limit) return curated.slice(0, limit);
    return [...curated, ...crossDomainPicks(tool, limit - curated.length, new Set(curated.map((t) => t.slug)))];
  }

  const sameDomainSlots = Math.max(1, limit - CROSS_DOMAIN_SLOTS);

  const ranked = tools
    .map((t) => ({ t, score: relatedScore(tool, t) }))
    .filter((x) => x.score > 0 && x.t.domain === tool.domain)
    .sort(
      (x, y) =>
        y.score - x.score ||
        (rankBySlug.get(x.t.slug) ?? 0) - (rankBySlug.get(y.t.slug) ?? 0),
    );

  const out: ToolMeta[] = [];
  const perFamily = new Map<string, number>();
  for (const { t } of ranked) {
    const key = familyKey(t.slug);
    const used = perFamily.get(key) ?? 0;
    if (used >= MAX_PER_FAMILY) continue;
    perFamily.set(key, used + 1);
    out.push(t);
    if (out.length === sameDomainSlots) break;
  }

  const taken = new Set(out.map((t) => t.slug));
  taken.add(tool.slug);
  return [...out, ...crossDomainPicks(tool, limit - out.length, taken)];
}

/** Curated picks from domains other than the tool's own, one per domain. */
function crossDomainPicks(tool: ToolMeta, count: number, exclude: Set<string>): ToolMeta[] {
  if (count <= 0) return [];
  // `featured` first: those are the curated cross-section of the whole
  // catalogue, so a detour lands on something genuinely worth seeing rather
  // than whatever happens to sit earliest in the registry.
  const pool = tools
    .filter((t) => t.domain !== tool.domain && !exclude.has(t.slug) && (t.featured || t.trending))
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

  // One candidate per domain, so two cross picks show two different categories.
  const byDomain = new Map<string, ToolMeta>();
  for (const t of pool) if (!byDomain.has(t.domain)) byDomain.set(t.domain, t);
  const candidates = [...byDomain.values()];
  if (!candidates.length) return [];

  // Rotate the starting point per tool. Without this, all 30 PDF pages would
  // link to the same two cross-category tools - concentrating internal links on
  // two destinations instead of spreading them across the catalogue.
  const offset = hashSlug(tool.slug) % candidates.length;
  const out: ToolMeta[] = [];
  for (let i = 0; i < candidates.length && out.length < count; i++) {
    out.push(candidates[(offset + i) % candidates.length]!);
  }
  return out;
}

/** Small deterministic hash - SSG needs the same output on every build. */
function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

