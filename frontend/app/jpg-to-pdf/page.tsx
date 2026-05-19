import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { JpgToPdfView } from "@/features/tools/views/JpgToPdfView";

export default function Page() {
  return (
    <ToolPageShell slug="jpg-to-pdf">
      <JpgToPdfView />
    </ToolPageShell>
  );
}
