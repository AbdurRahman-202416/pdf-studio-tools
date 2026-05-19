import { ToolPageShell } from "@/features/tools/components/ToolPageShell";
import { PassportPhotoView } from "@/features/tools/views/PassportPhotoView";

export default function Page() {
  return (
    <ToolPageShell slug="passport-photo-pdf">
      <PassportPhotoView />
    </ToolPageShell>
  );
}
