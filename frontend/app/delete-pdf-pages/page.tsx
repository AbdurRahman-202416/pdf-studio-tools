import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { DeletePdfPagesView } from "@/features/tools/views/DeletePdfPagesView";

export default function Page() {
  return (
    <ToolPageShell slug="delete-pdf-pages">
      <DeletePdfPagesView />
    </ToolPageShell>
  );
}
