import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("pdf-to-excel-converter")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description: `Extract tables from PDF files into editable Excel spreadsheets. Free, fast, no signup.`,
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
