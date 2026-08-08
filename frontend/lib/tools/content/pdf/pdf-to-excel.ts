// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "pdf-to-excel",
  primaryKeyword: "pdf to excel converter free",
  metaDescription: "Convert PDF tables to Excel online free. Extract tables, bank statements, and reports into .xlsx - no signup, no watermark.",
  relatedKeywords: [
      "extract table from pdf to excel",
      "convert pdf to xlsx online",
      "pdf table to spreadsheet",
      "free pdf to excel converter no email",
      "bank statement pdf to excel",
      "pdf to xlsx converter free",
    ],
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
  seoCopy: "PDF to Excel converter - extract bank statements, financial reports, invoices, and data tables from PDFs into editable .xlsx files. Free, no signup, no watermark. Table detection works best on ruled or clearly aligned tables; free-form layouts and multi-column prose are not tables and will not convert cleanly. Each detected table becomes its own sheet so you can check the extraction before trusting the numbers.",
};
