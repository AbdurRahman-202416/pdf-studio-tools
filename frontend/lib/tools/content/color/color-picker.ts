import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "color-picker",
  primaryKeyword: "color picker from image online",
  metaDescription: "Pick colours from an image online free. Click any pixel for HEX, RGB and HSL, and pull a palette out of a photo. Nothing is uploaded.",
  relatedKeywords: [
    "get color from image",
    "hex color picker",
    "image color extractor",
    "eyedropper online",
    "photo palette",
  ],
  faqs: [
    { q: "How do I get the colour of one pixel?", a: "Upload the image and click it. The HEX, RGB and HSL values for that exact pixel appear and can be copied with one click." },
    { q: "Can I extract a whole palette?", a: "Yes. The tool clusters the image's colours and shows the dominant ones, which is a fast way to build a scheme from a photograph." },
    { q: "Why does the colour differ from what I see elsewhere?", a: "Screenshots taken on wide-gamut displays can carry a colour profile that shifts values. The number here is what is actually stored in the file's pixels." },
    { q: "Is my image uploaded?", a: "No. It is drawn to a canvas in your browser and read back locally, so the picture never leaves your device." },
  ],
  howTo: [
    { name: "Drop an image", text: "Any JPG, PNG or WebP. It is read locally, never uploaded." },
    { name: "Click any pixel", text: "HEX, RGB and HSL for that point appear immediately." },
    { name: "Copy the value or take the palette", text: "One click to copy, or lift the dominant colours from the whole image." },
  ],
  seoCopy:
    "Pick exact colours out of any image without uploading it. Click a pixel to get its HEX, RGB and HSL values, or let the tool cluster the whole picture and show you its dominant colours - a fast way to build a palette from a photograph you like. Everything is read from a canvas in your browser, so the image stays on your device. Worth knowing: screenshots from wide-gamut displays can carry a colour profile that shifts what you see, and the values here are what is actually stored in the file.",
};
