import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { PdfLockView } from "@/features/tools/views/PdfLockView";

export default function Page() {
  return (
    <ToolPageShell slug="unlock-pdf">
      <PdfLockView mode="unlock" />
    </ToolPageShell>
  );
}
