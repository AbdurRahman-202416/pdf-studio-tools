// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";
import { brand } from "@/brand.config";

export const content: ToolContent = {
  slug: "jpg-to-pdf",
  primaryKeyword: "jpg to pdf converter online free",
  metaDescription: "Convert JPG, PNG, or WebP images to PDF online free. Combine multiple images into one PDF - no signup, no watermark, auto-delete in 1 hour.",
  relatedKeywords: [
      "image to pdf converter",
      "png to pdf",
      "convert jpg to pdf online",
      "photo to pdf",
      "multiple images to one pdf",
      "jpg to pdf free",
    ],
  faqs: [
      { q: "What image formats are supported?", a: "JPG, JPEG, PNG, and WebP. We auto-orient based on EXIF and preserve original resolution." },
      { q: "Can I combine multiple images into one PDF?", a: "Yes - drop several images and we'll merge them in the order you upload (drag to reorder)." },
      { q: "What page size is the output PDF?", a: "Default is A4 portrait, but you can choose A4 portrait, A4 landscape, US Letter, or fit-to-image." },
      { q: "Can I control the page order?", a: "Yes - reorder the thumbnails before converting. Images are placed one per page in exactly the order shown." },
    ],
  howTo: [
      { name: "Upload your images", text: "Drop JPG, PNG, or WebP files onto the upload zone - multiple files are combined into one PDF." },
      { name: "Pick a page size", text: "Choose A4, US Letter, or fit-to-image for the output PDF." },
      { name: "Download the PDF", text: "Click Convert and download your image-to-PDF result." },
    ],
  seoCopy: `Convert JPG, PNG, or WebP images to PDF online for free with ${brand.name}. Combine multiple photos into a single PDF document - ideal for scanned receipts, school assignments, and visa applications. Images are placed one per page at their original aspect ratio, and you can reorder them before converting. JPG, PNG, and WebP can be mixed in the same document. There is no page limit and nothing is watermarked.`,
};
