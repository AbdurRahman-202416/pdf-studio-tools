import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { CompressToTargetView } from "@/features/tools/views/CompressToTargetView";

export default function Page() {
  return (
    <ToolPageShell slug="compress-pdf-to-1mb">
      <CompressToTargetView
        slug="compress-pdf-to-1mb"
        defaultTarget="1mb"
        title="Compress PDF to 1MB"
        subtitle="Reduce large PDFs under a 1MB email or upload limit with near-original quality."
      />
    </ToolPageShell>
  );
}
