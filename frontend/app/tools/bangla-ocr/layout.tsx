import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bangla OCR – Extract Bangla & English text from PDFs",
  description:
    "Pull Bangla and English text out of scanned PDFs with Tesseract OCR. Free online OCR for Bengali (বাংলা) and English. No signup.",
  keywords: [
    "Bangla OCR",
    "Bengali OCR",
    "বাংলা ওসিআর",
    "scanned PDF to text Bangla",
    "Tesseract Bangla",
  ],
  alternates: { canonical: "/tools/bangla-ocr" },
  openGraph: {
    title: "Bangla OCR – Extract Bangla & English text from PDFs",
    description:
      "Free online OCR for Bengali and English scanned PDFs.",
    url: "/tools/bangla-ocr",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
