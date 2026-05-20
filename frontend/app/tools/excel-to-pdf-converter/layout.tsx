import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("excel-to-pdf")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description: tool.metaDescription,
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
