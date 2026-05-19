import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { NidCombineView } from "@/features/tools/views/NidCombineView";

export default function Page() {
  return (
    <ToolPageShell slug="nid-combine">
      <NidCombineView />
    </ToolPageShell>
  );
}
