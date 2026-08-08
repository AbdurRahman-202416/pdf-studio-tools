import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "watermark-pdf",
  primaryKeyword: "add watermark to pdf online free",
  metaDescription: "Add a text watermark to every page of a PDF. Control opacity, angle and tiling. Free, no signup, no watermark of ours.",
  relatedKeywords: [
    "watermark pdf",
    "stamp pdf",
    "draft watermark pdf",
    "confidential pdf",
    "add text to pdf",
  ],
  faqs: [
    { q: "Can the watermark be removed?", a: "A determined person with the right software can remove almost any watermark. Tiling it across the page at moderate opacity makes that far more work than cropping off a corner mark, which is usually enough to deter casual reuse." },
    { q: "Does it cover up my text?", a: "At the default opacity it sits behind visually but over the content in the file, so your text stays readable and selectable underneath. Lower the opacity if a dense page feels cluttered." },
    { q: "Can I watermark only some pages?", a: "Yes - give a page selection like 1,3-5. Useful when only the appendix or the draft section needs marking." },
    { q: "Why is my watermark at an angle?", a: "45 degrees by default, because a diagonal mark crosses more of the content and is harder to crop out. Set it to 0 for horizontal." },
  ],
  howTo: [
    { name: "Upload your PDF", text: "Up to 100 MB. Deleted an hour after processing." },
    { name: "Type your watermark", text: "Set the text, opacity, angle and whether it tiles across the page." },
    { name: "Download", text: "Every selected page is stamped; the original on your device is untouched." },
  ],
  seoCopy:
    "Stamp a text watermark across every page of a PDF, with control over the opacity, the angle and whether the mark tiles across the whole page or sits once in the middle. A tiled diagonal watermark at moderate opacity is meaningfully harder to remove than a single mark in a corner, which can simply be cropped away - that is why it is the default here. You can restrict the stamp to a page range when only part of the document needs marking, and the text underneath stays selectable throughout.",
};
