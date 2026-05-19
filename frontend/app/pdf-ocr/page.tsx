import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { PdfOcrView } from "@/features/tools/views/PdfOcrView";

export default function Page() {
  return (
    <ToolPageShell slug="pdf-ocr">
      <PdfOcrView />
    </ToolPageShell>
  );
}
