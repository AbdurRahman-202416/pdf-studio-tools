import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function makeSamplePDF(label: string, pages: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`${label} – page ${i + 1}`, {
      x: 72,
      y: 760,
      size: 28,
      font,
      color: rgb(0.15, 0.15, 0.2),
    });
    page.drawText(`This is a Playwright-generated sample PDF.`, {
      x: 72,
      y: 720,
      size: 12,
      font,
      color: rgb(0.4, 0.4, 0.5),
    });
  }
  return Buffer.from(await doc.save());
}
