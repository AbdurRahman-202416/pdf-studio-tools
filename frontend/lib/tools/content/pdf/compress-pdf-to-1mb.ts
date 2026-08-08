// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "compress-pdf-to-1mb",
  primaryKeyword: "compress pdf to 1mb",
  metaDescription: "Compress PDF to 1MB online free. Get large PDFs under a 1MB email or upload limit at near-original quality. No signup, no watermark.",
  relatedKeywords: [
      "reduce pdf size to 1mb",
      "pdf to 1mb online",
      "compress pdf under 1mb",
      "1mb pdf compressor",
      "compress pdf for email under 1mb",
      "shrink pdf to 1mb without losing quality",
    ],
  faqs: [
      { q: "Is 1MB enough quality for printing?", a: "Usually yes. A 1MB target keeps text crisp and images detailed - good for email attachments and most print jobs." },
      { q: "My PDF is already under 1MB - what happens?", a: "It downloads almost untouched. You can't meaningfully shrink a file that already beats the target." },
      { q: "Will it handle a 50MB scanned document?", a: "Yes - the tool steps down DPI and image quality until it fits, then stops to preserve as much detail as possible." },
      { q: "Do you add a watermark or require signup?", a: "No to both. Output is clean and nothing is stored beyond one hour." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop a large PDF onto the upload zone - up to 100 MB." },
      { name: "Confirm the 1MB target", text: "1MB is pre-selected; choose a smaller target for stricter portals." },
      { name: "Download", text: "Receive a near-original-quality PDF that fits a 1MB limit." },
    ],
  seoCopy: "Compress PDF to 1MB online free. The 1MB target keeps PDFs nearly indistinguishable from the original while clearing common email and upload limits. Works on any PDF in any language; no signup, no watermark. 1MB clears Gmail, most job portals, and university submission systems while leaving photographs and charts enough detail to stay useful. If your PDF is already under 1MB it downloads essentially untouched rather than being needlessly degraded.",
};
