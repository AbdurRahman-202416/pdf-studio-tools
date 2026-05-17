import type { Metadata } from "next";

import { PdfToJpgView } from "@/features/tools/views/PdfToJpgView";

export const metadata: Metadata = {
  title: "PDF to JPG – Convert PDF pages to images",
  description:
    "Convert each PDF page into a high-quality JPG or PNG image. Free online PDF-to-image converter with adjustable DPI. No signup, no watermark.",
  keywords: [
    "PDF to JPG",
    "PDF to image",
    "PDF to PNG",
    "convert PDF pages to JPG",
    "পিডিএফ থেকে JPG",
  ],
  alternates: { canonical: "/tools/pdf-to-jpg" },
  openGraph: {
    title: "PDF to JPG · PDF Studio",
    description:
      "Convert PDF pages into high-quality JPG or PNG. Free and no signup.",
    url: "/tools/pdf-to-jpg",
    images: [
      {
        url: "/og?title=PDF+to+JPG&subtitle=Convert+PDF+pages+to+high-quality+JPG+or+PNG",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function PdfToJpgPage() {
  return <PdfToJpgView />;
}
