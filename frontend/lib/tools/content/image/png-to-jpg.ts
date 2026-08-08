import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "png-to-jpg",
  primaryKeyword: "png to jpg converter online free",
  metaDescription: "Convert PNG to JPG online free. Choose the quality and what replaces transparency. Runs in your browser - nothing is uploaded.",
  relatedKeywords: [
    "png to jpeg",
    "convert png to jpg",
    "png to jpg online",
    "change png to jpg",
  ],
  faqs: [
    { q: "What happens to transparent areas?", a: "JPG has no transparency, so transparent pixels must become a solid colour. White is the default; pick any colour if your image will sit on a coloured background." },
    { q: "How much smaller will the JPG be?", a: "For photographs, often 80-90% smaller. For screenshots and flat graphics the saving is smaller and the text may soften - PNG is usually the better choice there." },
    { q: "Is the conversion reversible?", a: "No. JPG is lossy, so converting back to PNG preserves the compressed result, not the original. Keep your PNG if you may need it again." },
    { q: "Why does my text look fuzzy after converting?", a: "JPG compresses by discarding fine high-contrast detail, which is exactly what text is made of. Raise the quality, or keep images with text as PNG." },
  ],
  howTo: [
    { name: "Drop your PNG", text: "Processed in your browser - the file is not uploaded." },
    { name: "Pick quality and background", text: "Set the JPG quality, and the colour that replaces any transparency." },
    { name: "Download the JPG", text: "Typically far smaller than the PNG, especially for photographs." },
  ],
  seoCopy:
    "Convert PNG to JPG locally in your browser, choosing both the output quality and the colour that replaces transparency - JPG cannot store an alpha channel, so transparent pixels have to become something, and white is rarely the right answer when the image will sit on a coloured background. For photographs the saving is dramatic, often 80-90%. For screenshots or anything containing text, be careful: JPG compresses away exactly the sharp high-contrast detail that makes text legible.",
};
