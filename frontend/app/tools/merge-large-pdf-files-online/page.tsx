import { WorkspaceShell } from "@/features/pdf/components/WorkspaceShell";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("merge-large-pdf-files-online")!;

export default function MergePdfPage() {
  return (
    <WorkspaceShell
      title={tool.displayName}
      subtitle="Drop multiple PDFs, drag pages across files, and export one merged PDF - free, no watermark."
      showBackLink
    />
  );
}
