import { toolMetadata } from "@/lib/seo/tool-metadata";

export const metadata = toolMetadata("pdf-to-word");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
