import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { RotatePdfView } from "@/features/tools/views/RotatePdfView";

export default function Page() {
  return (
    <ToolPageShell slug="rotate-pdf">
      <RotatePdfView />
    </ToolPageShell>
  );
}
