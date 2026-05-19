import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("pdf-to-jpg-high-quality")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description: "Convert PDFs to high-quality JPG or PNG images at 150, 220, or 300 dpi. Free, no signup, no watermark.",
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
