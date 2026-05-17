import type { Metadata } from "next";

import { WorkspaceShell } from "@/features/pdf/components/WorkspaceShell";

export const metadata: Metadata = {
  title: "Workspace",
  description:
    "Drag and drop PDFs to merge, compress, reorder pages, rotate, and split, all in one fast, free workspace.",
  alternates: { canonical: "/workspace" },
  openGraph: {
    title: "Workspace · PDF Studio",
    description:
      "Drag and drop PDFs to merge, compress, reorder, rotate, and split.",
  },
};

export default function WorkspacePage() {
  return <WorkspaceShell />;
}
