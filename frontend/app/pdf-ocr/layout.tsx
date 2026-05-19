import { toolMetadata } from "@/lib/seo/tool-metadata";

export const metadata = toolMetadata("pdf-ocr");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
