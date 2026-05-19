import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { PdfToJpgView } from "@/features/tools/views/PdfToJpgView";

export default function Page() {
  return (
    <ToolPageShell slug="pdf-to-jpg">
      <PdfToJpgView />
    </ToolPageShell>
  );
}
