import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { SignPdfView } from "@/features/tools/views/SignPdfView";

export default function Page() {
  return (
    <ToolPageShell slug="sign-pdf">
      <SignPdfView />
    </ToolPageShell>
  );
}
