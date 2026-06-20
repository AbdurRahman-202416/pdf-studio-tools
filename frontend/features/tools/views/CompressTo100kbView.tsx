"use client";

import { CompressToTargetView } from "@/features/tools/views/CompressToTargetView";

export function CompressTo100kbView() {
  return (
    <CompressToTargetView
      slug="compress-pdf-to-100kb"
      defaultTarget="100kb"
      title="Compress PDF to 100KB"
      subtitle="Target-size PDF compressor for govt portals, NID and passport applications, and strict upload limits."
      badge="Optimized for BD"
    />
  );
}
