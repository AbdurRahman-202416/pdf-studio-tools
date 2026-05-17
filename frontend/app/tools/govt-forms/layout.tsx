import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Govt Forms – e-TIN, NID, Birth Certificate",
  description:
    "Pre-loaded Bangladesh government form templates: e-TIN, NID correction, birth certificate, police clearance. Print-ready PDFs.",
  keywords: [
    "e-TIN form",
    "NID correction form",
    "birth certificate form Bangladesh",
    "police clearance form",
    "সরকারি ফর্ম",
  ],
  alternates: { canonical: "/tools/govt-forms" },
  openGraph: {
    title: "Govt Forms · PDF Studio",
    description:
      "Pre-loaded Bangladesh government form templates.",
    url: "/tools/govt-forms",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
