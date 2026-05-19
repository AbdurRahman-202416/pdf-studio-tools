import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("passport-photo-to-pdf")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description: "Arrange passport, visa, or stamp-size photos onto a print-ready A4 PDF. Up to 8 photos per sheet.",
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
