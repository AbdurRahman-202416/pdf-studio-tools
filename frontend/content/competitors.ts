export interface ComparisonRow {
  feature: string;
  pdfStudio: string;
  competitor: string;
}

export interface Competitor {
  slug: string;
  name: string;
  shortPitch: string;
  rows: ComparisonRow[];
  takeaway: string;
}

export const competitors: Competitor[] = [
  {
    slug: "smallpdf",
    name: "Smallpdf",
    shortPitch:
      "Smallpdf is a popular Swiss PDF service with a generous free tier, but it caps you at 2 free actions per day and pushes a $9/month subscription.",
    rows: [
      { feature: "Free actions per day", pdfStudio: "Unlimited", competitor: "2 per day on the free tier" },
      { feature: "Signup required", pdfStudio: "No", competitor: "No (but encouraged)" },
      { feature: "Max file size (free)", pdfStudio: "100 MB", competitor: "5 GB on Pro, lower free" },
      { feature: "Watermark on output", pdfStudio: "No", competitor: "No (free), no (Pro)" },
      { feature: "OCR support", pdfStudio: "Yes, 100+ languages", competitor: "Limited language support" },
      { feature: "ID card to A4 PDF", pdfStudio: "Yes, print-ready A4", competitor: "No dedicated tool" },
      { feature: "PDF table to Excel", pdfStudio: "Yes, formatted XLSX", competitor: "Generic PDF→Excel only" },
      { feature: "Price", pdfStudio: "Free", competitor: "$9/mo Pro" },
    ],
    takeaway:
      "If you want unlimited daily use, multi-language OCR, and no-watermark output without a paywall, PDF Studio is the better fit.",
  },
  {
    slug: "ilovepdf",
    name: "iLovePDF",
    shortPitch:
      "iLovePDF is another big PDF site with a wide tool catalog, but the free tier is ad-heavy and many tools nag you to upgrade.",
    rows: [
      { feature: "Ads on free tier", pdfStudio: "None", competitor: "Yes, prominent" },
      { feature: "Signup required", pdfStudio: "No", competitor: "Required for many tools" },
      { feature: "Max file size (free)", pdfStudio: "100 MB", competitor: "Varies per tool" },
      { feature: "OCR support", pdfStudio: "Yes, 100+ languages", competitor: "Limited" },
      { feature: "ID card to A4 PDF", pdfStudio: "Yes", competitor: "No" },
      { feature: "PDF table to Excel", pdfStudio: "Yes, formatted XLSX", competitor: "Generic only" },
      { feature: "Price", pdfStudio: "Free", competitor: "$7/mo Pro" },
    ],
    takeaway:
      "iLovePDF is a fine generalist if you want a one-stop site with mobile apps. PDF Studio is leaner, ad-free, and no signup required.",
  },
  {
    slug: "adobe-acrobat",
    name: "Adobe Acrobat",
    shortPitch:
      "Adobe Acrobat is the original PDF tool, powerful, but heavy, expensive, and overkill for everyday tasks like merging two files.",
    rows: [
      { feature: "Install required", pdfStudio: "None, web only", competitor: "Desktop install" },
      { feature: "Signup required", pdfStudio: "No", competitor: "Adobe ID required" },
      { feature: "Free tier", pdfStudio: "Unlimited", competitor: "Limited Reader features only" },
      { feature: "OCR support", pdfStudio: "Yes, 100+ languages", competitor: "Yes (paid)" },
      { feature: "ID card to A4 PDF", pdfStudio: "Yes", competitor: "No (manual layout)" },
      { feature: "Mobile-friendly web", pdfStudio: "Yes, responsive", competitor: "App download" },
      { feature: "Price", pdfStudio: "Free", competitor: "$19.99/mo Acrobat Pro" },
    ],
    takeaway:
      "Adobe is the right answer for heavy enterprise PDF work. For everyday merges, compressions, OCR, and document conversions, PDF Studio is faster and free.",
  },
];

export function findCompetitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}

export function listCompetitorSlugs(): string[] {
  return competitors.map((c) => c.slug);
}
