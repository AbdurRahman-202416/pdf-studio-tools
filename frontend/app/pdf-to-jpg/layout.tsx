import { toolMetadata } from "@/lib/seo/tool-metadata";

export const metadata = toolMetadata("pdf-to-jpg");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
