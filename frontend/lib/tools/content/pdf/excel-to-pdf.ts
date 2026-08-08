// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "excel-to-pdf",
  primaryKeyword: "excel to pdf converter free",
  metaDescription: "Convert Excel (.xlsx) to PDF online free. Render every sheet as a clean PDF table - one sheet per page, headers, borders, zebra rows. No signup, no watermark.",
  relatedKeywords: [
      "xlsx to pdf online",
      "convert spreadsheet to pdf",
      "excel sheet to pdf table",
      "xlsx to pdf converter free no email",
      "multi sheet excel to pdf",
      "excel workbook to pdf",
    ],
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
  seoCopy: "Excel to PDF converter - turn any .xlsx workbook into a clean, printable PDF. Each sheet is rendered as a styled table with header, borders, and zebra rows. Free, no signup, no watermark. Column widths, merged cells, and number formatting carry across, and wide sheets are scaled to fit the page rather than clipped at the margin. Formulas are rendered as their computed values. Works with .xlsx exported from Excel, Google Sheets, LibreOffice, and Numbers.",
};
