import { WorkspaceShell } from "@/features/pdf/components/WorkspaceShell";
import { getTool } from "@/lib/seo/tool-registry";

const tool = getTool("compress-pdf-without-losing-quality")!;

export default function CompressPdfPage() {
  return (
    <WorkspaceShell
      title={tool.displayName}
      subtitle="Drop a PDF and shrink it with Light, Balanced, or Maximum compression - no signup, no watermark."
      showBackLink
    />
  );
}
