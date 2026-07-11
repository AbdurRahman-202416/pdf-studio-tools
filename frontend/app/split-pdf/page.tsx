import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { SplitPdfView } from "@/features/tools/views/SplitPdfView";

export default function Page() {
  return (
    <ToolPageShell slug="split-pdf">
      <SplitPdfView />
    </ToolPageShell>
  );
}
