import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { PdfToExcelView } from "@/features/tools/views/PdfToExcelView";

export default function Page() {
  return (
    <ToolPageShell slug="pdf-to-excel">
      <PdfToExcelView />
    </ToolPageShell>
  );
}
