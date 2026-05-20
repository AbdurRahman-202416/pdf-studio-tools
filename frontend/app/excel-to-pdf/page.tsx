import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { ExcelToPdfView } from "@/features/tools/views/ExcelToPdfView";

export default function Page() {
  return (
    <ToolPageShell slug="excel-to-pdf">
      <ExcelToPdfView />
    </ToolPageShell>
  );
}
