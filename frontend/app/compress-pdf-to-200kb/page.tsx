import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { CompressToTargetView } from "@/features/tools/views/CompressToTargetView";

export default function Page() {
  return (
    <ToolPageShell slug="compress-pdf-to-200kb">
      <CompressToTargetView
        slug="compress-pdf-to-200kb"
        defaultTarget="200kb"
        title="Compress PDF to 200KB"
        subtitle="Target-size PDF compressor that keeps scanned text legible - sized for visa forms, job portals, and 200KB upload limits."
      />
    </ToolPageShell>
  );
}
