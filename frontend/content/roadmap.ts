export type Status = "shipped" | "in-progress" | "planned" | "considering";

export interface RoadmapItem {
  title: string;
  description: string;
  status: Status;
}

export const roadmap: RoadmapItem[] = [
  { title: "Merge & Compress", description: "Drag, drop, reorder, merge selected pages, compress at 3 levels.", status: "shipped" },
  { title: "NID Combiner", description: "Front + back of Bangladesh NID on a single A4 print-ready PDF.", status: "shipped" },
  { title: "Bangla OCR", description: "Extract Bangla + English text from scanned PDFs with Tesseract.", status: "shipped" },
  { title: "Bank Statement → Excel", description: "Convert Bangladeshi bank statement PDFs into XLSX.", status: "shipped" },
  { title: "Passport Photo PDF", description: "Auto-arrange passport / visa / stamp photos on A4.", status: "shipped" },
  { title: "Govt Forms", description: "Pre-loaded e-TIN / NID correction / birth-certificate / police-clearance templates.", status: "shipped" },
  { title: "PDF → JPG / PNG", description: "Export PDF pages as high-quality images, single image or ZIP.", status: "shipped" },
  { title: "Lock / Unlock PDF", description: "Add or remove AES-256 password protection.", status: "shipped" },
  { title: "Watermark PDF", description: "Add a text or image watermark to every page.", status: "planned" },
  { title: "PDF Page Numbers", description: "Add page numbers in customizable positions.", status: "planned" },
  { title: "Sign PDF", description: "Draw or upload a signature, place anywhere on the PDF.", status: "planned" },
  { title: "PDF → Word", description: "Convert PDF to editable .docx.", status: "considering" },
  { title: "Edit PDF Text", description: "Click to edit text directly on the PDF.", status: "considering" },
  { title: "Batch Processing", description: "Apply the same operation across many PDFs at once.", status: "considering" },
];
