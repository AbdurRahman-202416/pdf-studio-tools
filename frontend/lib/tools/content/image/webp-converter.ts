import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "webp-converter",
  primaryKeyword: "webp converter online free",
  metaDescription: "Convert images to WebP, or WebP back to JPG and PNG. Free, browser-based, no upload - with a size comparison before you download.",
  relatedKeywords: [
    "convert to webp",
    "webp to jpg",
    "webp to png",
    "jpg to webp",
    "webp converter online",
  ],
  faqs: [
    { q: "Is WebP smaller than JPG?", a: "Usually yes - typically 25-35% smaller at comparable quality, which is why it is the default for most modern sites." },
    { q: "Do all browsers support WebP?", a: "Every current browser does, and has since 2020. Only very old software - some desktop image viewers and legacy email clients - still struggles, which is when converting back to JPG helps." },
    { q: "Does WebP support transparency?", a: "Yes, unlike JPG. That makes it a good single replacement for both PNG and JPG on the web." },
    { q: "Can WebP be lossless?", a: "Yes. Lossless WebP is still usually smaller than the equivalent PNG, though larger than lossy WebP. Pick lossless when the image contains text or sharp edges." },
  ],
  howTo: [
    { name: "Drop your image", text: "JPG, PNG or an existing WebP file." },
    { name: "Choose the direction and quality", text: "Convert to WebP, or take a WebP back to JPG or PNG." },
    { name: "Download", text: "The size difference is shown so you can confirm the conversion was worth it." },
  ],
  seoCopy:
    "Convert images to WebP and back again, entirely in your browser. WebP typically lands 25-35% smaller than JPG at comparable quality and, unlike JPG, supports transparency - which is why it has become the default image format on the modern web. It also works the other way: if you have been handed a WebP that some older desktop viewer or email client refuses to open, convert it back to JPG or PNG. The size difference is displayed before you download, so the trade is never a guess.",
};
