import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("unlock-pdf-with-password-online")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description: "Remove the password from any PDF you own. Free, no signup, no watermark.",
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
