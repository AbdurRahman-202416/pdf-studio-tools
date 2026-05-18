import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("pdf-ocr-online-free")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description: `Extract text from scanned PDFs in 100+ languages. ${tool.relatedKeywords[0]}, free and watermark-free.`,
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
