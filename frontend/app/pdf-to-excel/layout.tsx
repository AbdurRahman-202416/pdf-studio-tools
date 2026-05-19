import { toolMetadata } from "@/lib/seo/tool-metadata";

export const metadata = toolMetadata("pdf-to-excel");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
