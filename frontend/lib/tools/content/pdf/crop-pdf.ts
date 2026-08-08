import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "crop-pdf",
  primaryKeyword: "crop pdf online free",
  metaDescription: "Crop PDF margins online free. Trim any edge by percentage without re-rendering, so text stays selectable and sharp.",
  relatedKeywords: [
    "trim pdf margins",
    "pdf cropper",
    "remove pdf white space",
    "crop pdf pages",
  ],
  faqs: [
    { q: "Does cropping reduce quality?", a: "No. Cropping sets the page's visible box rather than redrawing anything, so text stays selectable and images keep their original resolution." },
    { q: "Is the cropped content really gone?", a: "Not deleted - hidden. The CropBox controls what is displayed and printed, and specialist software can restore the full page. If content must be removed permanently, use Redact PDF instead." },
    { q: "Why crop by percentage rather than millimetres?", a: "Because a percentage works the same on A4, Letter and a scanned photo, all of which you might feed to it in the same session." },
    { q: "Can I crop only some pages?", a: "Yes - give a page selection like 1,3-5. Handy when only scanned pages have the big white borders." },
  ],
  howTo: [
    { name: "Upload your PDF", text: "Any size up to 100 MB." },
    { name: "Set the trim for each edge", text: "As a percentage, so it works on any page size." },
    { name: "Download", text: "Nothing is re-rendered, so quality is untouched." },
  ],
  seoCopy:
    "Trim the margins off a PDF by setting how much to cut from each edge as a percentage - which works identically on A4, Letter or a scanned photo. Cropping here adjusts the page's CropBox rather than redrawing the content, so nothing is re-rendered: text stays selectable, images keep their resolution and the file does not grow. Worth knowing that cropped content is hidden rather than deleted, and specialist software can restore it. When something genuinely must be removed, use Redact PDF.",
};
