export const siteConfig = {
  name: "PDF Studio",
  shortName: "PDFStudio",
  description:
    "Free online PDF tools — compress, merge, convert, OCR, lock, unlock, and more. No watermarks. No daily limits. No signup.",
  tagline: "All-in-one PDF toolkit. Free, fast, watermark-free.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
  locale: "en_US",
  twitter: "@pdfstudio",
  themeColor: "#6366f1",
  keywords: [
    "compress pdf without losing quality",
    "merge large pdf files online free",
    "pdf to jpg high quality",
    "pdf to word converter",
    "free online pdf tools",
    "pdf editor no watermark",
    "free pdf compressor online",
    "online pdf merger",
    "ocr pdf online free",
    "password protect pdf online",
  ],
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "",
} as const;
