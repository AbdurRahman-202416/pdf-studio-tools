import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("id-card-to-pdf")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description: `Combine two-sided ID cards (driver's license, passport, employee badge) onto a single print-ready A4 PDF.`,
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
