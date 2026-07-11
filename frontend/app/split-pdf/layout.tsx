import { toolMetadata } from "@/lib/seo/tool-metadata";

export const metadata = toolMetadata("split-pdf");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
