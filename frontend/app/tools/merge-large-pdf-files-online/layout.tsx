import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("merge-large-pdf-files-online")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description:
    "Merge large PDF files online for free. Drag pages across files, reorder, and export - no watermark, no signup.",
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
