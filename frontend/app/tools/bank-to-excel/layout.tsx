import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bank Statement to Excel – Convert PDF to XLSX",
  description:
    "Convert Bangladeshi bank statement PDFs into clean, formatted Excel spreadsheets. Free, fast, no signup.",
  keywords: [
    "bank statement to Excel",
    "PDF to Excel",
    "ব্যাংক স্টেটমেন্ট এক্সেল",
    "BD bank PDF converter",
  ],
  alternates: { canonical: "/tools/bank-to-excel" },
  openGraph: {
    title: "Bank Statement to Excel · PDF Studio",
    description:
      "Convert Bangladeshi bank statement PDFs to Excel, clean and formatted.",
    url: "/tools/bank-to-excel",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
