import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NID Combiner – Front + Back on one A4 PDF",
  description:
    "Combine NID front and back onto a single, print-ready A4 PDF in real ID-card dimensions. Free, no signup, no watermark.",
  keywords: [
    "NID combine",
    "NID front back PDF",
    "এনআইডি কম্বাইন",
    "Bangladesh NID printer",
  ],
  alternates: { canonical: "/tools/nid-combine" },
  openGraph: {
    title: "NID Combiner – Front + Back on one A4 PDF",
    description:
      "Combine NID front and back onto a single print-ready A4 PDF.",
    url: "/tools/nid-combine",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
