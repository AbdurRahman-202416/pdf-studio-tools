import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { CompressTo100kbView } from "@/features/tools/views/CompressTo100kbView";

export default function Page() {
  return (
    <ToolPageShell slug="compress-pdf-to-100kb">
      <CompressTo100kbView />
    </ToolPageShell>
  );
}
