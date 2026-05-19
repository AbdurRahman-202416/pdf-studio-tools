import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { WordToPdfView } from "@/features/tools/views/WordToPdfView";

export default function Page() {
  return (
    <ToolPageShell slug="word-to-pdf">
      <WordToPdfView />
    </ToolPageShell>
  );
}
