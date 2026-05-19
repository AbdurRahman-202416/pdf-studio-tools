import { toolMetadata } from "@/lib/seo/tool-metadata";

export const metadata = toolMetadata("word-to-pdf");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
