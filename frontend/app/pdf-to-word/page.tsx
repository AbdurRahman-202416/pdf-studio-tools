import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { PdfToWordView } from "@/features/tools/views/PdfToWordView";

export default function Page() {
  return (
    <ToolPageShell slug="pdf-to-word">
      <PdfToWordView />
    </ToolPageShell>
  );
}
