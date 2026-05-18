import type { Metadata } from "next";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("password-protect-pdf-online")!;

export const metadata: Metadata = {
  title: tool.primaryKeyword,
  description: "Add AES-256 password protection to any PDF in seconds. Free, no signup, files auto-delete in 1 hour.",
  keywords: [tool.primaryKeyword, ...tool.relatedKeywords],
  alternates: { canonical: `/tools/${tool.slug}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
