import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("compress-pdf-without-losing-quality")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description:
    "Compress PDFs without losing quality. Pick Light, Balanced, or Maximum — free, no signup, no watermark.",
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
