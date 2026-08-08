// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "rotate-pdf",
  primaryKeyword: "rotate pdf online free",
  metaDescription: "Rotate PDF pages 90° or 180° online free and save the result permanently. Rotate all pages or just a few - no signup, no watermark.",
  relatedKeywords: [
      "rotate pdf and save",
      "rotate pdf pages permanently",
      "fix upside down pdf",
      "rotate scanned pdf",
      "turn pdf sideways",
      "rotate all pages in pdf",
    ],
  faqs: [
      { q: "Does the rotation stick, or is it just a preview?", a: "It's written into the PDF itself, so the pages stay rotated in every viewer - Adobe, browsers, phones, and print." },
      { q: "Can I rotate only some pages?", a: "Yes - enter a range like 2,5-7 to rotate just those pages. Everything else is untouched." },
      { q: "My scan is upside down - which option do I use?", a: "Pick 180°. For pages scanned sideways, use 90° right or 90° left depending on the direction." },
      { q: "Does rotating reduce quality?", a: "No - rotation only updates page orientation metadata. Text and images are not re-encoded." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop the PDF with sideways or upside-down pages." },
      { name: "Choose the angle", text: "90° right, 180°, or 90° left - for all pages or a range like 2,5-7." },
      { name: "Download", text: "The rotation is saved into the file permanently." },
    ],
  seoCopy: "Rotate PDF online free and save it permanently - fix upside-down scans and sideways pages in seconds. Rotate every page or just the ones you pick. No signup, no watermark, files auto-delete after 1 hour. The rotation is written into the file itself, so pages stay upright in every reader on every device - unlike rotating inside a viewer, which only changes how it looks on your screen. Text stays selectable and image quality is untouched.",
};
