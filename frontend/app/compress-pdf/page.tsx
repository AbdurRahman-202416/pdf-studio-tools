import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { CompressByOutcomeView } from "@/features/tools/views/CompressByOutcomeView";

export default function Page() {
  return (
    <ToolPageShell slug="compress-pdf">
      <CompressByOutcomeView />
    </ToolPageShell>
  );
}
