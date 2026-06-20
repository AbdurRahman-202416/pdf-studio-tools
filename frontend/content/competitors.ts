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
  {
    slug: "pdf24",
    name: "PDF24",
    shortPitch:
      "PDF24 is a generous free German PDF suite with a huge tool list and a Windows desktop app, but the web UI is dated and ad-supported.",
    rows: [
      { feature: "Price", pdfStudio: "Free, no ads", competitor: "Free, ad-supported" },
      { feature: "Signup required", pdfStudio: "No", competitor: "No" },
      { feature: "Interface", pdfStudio: "Modern, mobile-first", competitor: "Functional but dated" },
      { feature: "Target-size compression", pdfStudio: "Yes - 100KB/200KB/500KB/1MB presets", competitor: "Quality slider only" },
      { feature: "OCR support", pdfStudio: "Yes, 100+ languages", competitor: "Yes, fewer languages" },
      { feature: "ID card to A4 PDF", pdfStudio: "Yes, print-ready A4", competitor: "No dedicated tool" },
      { feature: "Files auto-delete", pdfStudio: "Yes, after 1 hour", competitor: "Yes" },
    ],
    takeaway:
      "PDF24 is a solid free workhorse, especially on Windows. PDF Studio matches it on price while adding a cleaner mobile experience, exact target-size compression, and broader OCR.",
  },
  {
    slug: "sejda",
    name: "Sejda",
    shortPitch:
      "Sejda is a polished web PDF editor with real text editing, but the free tier caps you at 3 tasks per hour and limits file size and page count.",
    rows: [
      { feature: "Free tasks", pdfStudio: "Unlimited", competitor: "3 per hour" },
      { feature: "Max pages (free)", pdfStudio: "No page cap", competitor: "200 pages / 50 MB" },
      { feature: "Signup required", pdfStudio: "No", competitor: "No (but limited)" },
      { feature: "Watermark on output", pdfStudio: "No", competitor: "No" },
      { feature: "Target-size compression", pdfStudio: "Yes - exact KB targets", competitor: "Preset levels only" },
      { feature: "OCR support", pdfStudio: "Yes, 100+ languages", competitor: "Yes (paid plans)" },
      { feature: "Price", pdfStudio: "Free", competitor: "$7.50/mo for unlimited" },
    ],
    takeaway:
      "Sejda is great for occasional in-browser editing. If you hit the 3-tasks-per-hour wall or need exact file-size targets, PDF Studio removes those limits for free.",
  },
  {
    slug: "nitro",
    name: "Nitro PDF",
    shortPitch:
      "Nitro is an enterprise-grade Acrobat alternative with strong editing and e-sign features, but it's a paid desktop product aimed at businesses.",
    rows: [
      { feature: "Price", pdfStudio: "Free", competitor: "From ~$179/yr per user" },
      { feature: "Install required", pdfStudio: "None, web only", competitor: "Desktop install (Windows)" },
      { feature: "Signup required", pdfStudio: "No", competitor: "Account + license" },
      { feature: "Quick everyday tasks", pdfStudio: "Instant in-browser", competitor: "Full app launch" },
      { feature: "OCR support", pdfStudio: "Yes, 100+ languages", competitor: "Yes (paid)" },
      { feature: "Target-size compression", pdfStudio: "Yes - exact KB targets", competitor: "Optimize profiles" },
      { feature: "Mobile-friendly web", pdfStudio: "Yes, responsive", competitor: "Desktop-focused" },
    ],
    takeaway:
      "Nitro suits businesses that need a licensed desktop suite with admin controls. For fast, free compressing, merging, OCR, and conversions, PDF Studio gets the job done in the browser.",
  },
];

export function findCompetitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}

export function listCompetitorSlugs(): string[] {
  return competitors.map((c) => c.slug);
}
