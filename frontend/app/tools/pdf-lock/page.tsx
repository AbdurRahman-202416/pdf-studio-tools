import type { Metadata } from "next";

import { PdfLockView } from "@/features/tools/views/PdfLockView";

export const metadata: Metadata = {
  title: "Lock or Unlock PDF – Password protect PDFs",
  description:
    "Add or remove password protection on PDFs with AES-256 encryption. Free, secure, and no signup. Same encryption as Adobe Acrobat.",
  keywords: [
    "PDF lock",
    "PDF unlock",
    "password protect PDF",
    "remove PDF password",
    "AES-256 PDF",
    "পিডিএফ পাসওয়ার্ড",
  ],
  alternates: { canonical: "/tools/pdf-lock" },
  openGraph: {
    title: "Lock / Unlock PDF · PDF Studio",
    description: "Add or remove password protection on any PDF.",
    url: "/tools/pdf-lock",
    images: [
      {
        url: "/og?title=Lock+or+Unlock+PDF&subtitle=AES-256+password+protect++free+and+no+signup",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function PdfLockPage() {
  return <PdfLockView />;
}
