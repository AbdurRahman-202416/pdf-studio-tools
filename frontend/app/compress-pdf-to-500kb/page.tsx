import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { CompressToTargetView } from "@/features/tools/views/CompressToTargetView";

export default function Page() {
  return (
    <ToolPageShell slug="compress-pdf-to-500kb">
      <CompressToTargetView
        slug="compress-pdf-to-500kb"
        defaultTarget="500kb"
        title="Compress PDF to 500KB"
        subtitle="Shrink large or image-heavy PDFs under a 500KB limit while keeping high quality."
      />
    </ToolPageShell>
  );
}
