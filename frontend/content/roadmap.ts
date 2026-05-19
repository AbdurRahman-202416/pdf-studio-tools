export type Status = "shipped" | "in-progress" | "planned" | "considering";

export interface RoadmapItem {
  title: string;
  description: string;
  status: Status;
}

export const roadmap: RoadmapItem[] = [
  { title: "Merge & Compress", description: "Drag, drop, reorder, merge selected pages, compress at 3 levels.", status: "shipped" },
  { title: "PDF OCR", description: "Extract text from scanned PDFs with Tesseract — 100+ languages.", status: "shipped" },
  { title: "ID Card to PDF", description: "Combine any two-sided ID card (front + back) into a single print-ready A4 PDF.", status: "shipped" },
  { title: "PDF Table to Excel", description: "Convert tabular PDF data into clean, formatted XLSX spreadsheets.", status: "shipped" },
  { title: "Passport Photo to PDF", description: "Auto-arrange passport / visa / stamp photos on A4.", status: "shipped" },
  { title: "PDF → JPG / PNG", description: "Export PDF pages as high-quality images, single image or ZIP.", status: "shipped" },
  { title: "Lock / Unlock PDF", description: "Add or remove AES-256 password protection.", status: "shipped" },
  { title: "Watermark PDF", description: "Add a text or image watermark to every page.", status: "planned" },
  { title: "PDF Page Numbers", description: "Add page numbers in customizable positions.", status: "planned" },
  { title: "eSign PDF", description: "Draw or upload a signature, place anywhere on the PDF.", status: "considering" },
  { title: "Redact PDF", description: "Permanently black out sensitive text and images.", status: "considering" },
  { title: "Edit Text in PDF", description: "Click to edit text directly on the PDF.", status: "considering" },
  { title: "Compare PDFs", description: "Highlight differences between two PDF versions side by side.", status: "considering" },
];
