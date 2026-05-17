import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passport Photo PDF – A4 sheet for print shops",
  description:
    "Auto-arrange passport, visa, or stamp size photos on A4. Perfect for print shops in Bangladesh. Free, no watermark.",
  keywords: [
    "passport photo PDF",
    "visa photo print A4",
    "stamp size photo PDF",
    "পাসপোর্ট ছবি PDF",
  ],
  alternates: { canonical: "/tools/photo-to-pdf" },
  openGraph: {
    title: "Passport Photo PDF · PDF Studio",
    description: "Auto-arrange passport / visa / stamp photos on A4.",
    url: "/tools/photo-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
