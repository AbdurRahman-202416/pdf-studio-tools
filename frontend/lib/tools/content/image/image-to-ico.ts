import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "image-to-ico",
  primaryKeyword: "convert image to ico favicon online",
  metaDescription: "Convert PNG or JPG to a multi-size .ico favicon online free. Bundles 16, 32, 48 and 256px in one file. Browser-based, no upload.",
  relatedKeywords: [
    "png to ico",
    "favicon generator",
    "image to icon",
    "ico converter",
    "make favicon",
  ],
  faqs: [
    { q: "What sizes should a favicon include?", a: "16 and 32 pixels cover browser tabs and bookmarks, 48 is used by some Windows contexts, and 256 is used when the icon is shown large. A single .ico can hold all of them, and this tool writes all four by default." },
    { q: "Do I still need an .ico file in 2026?", a: "For favicon.ico at your site root, yes - browsers and crawlers still request it, and it is the reliable fallback. Modern browsers will prefer a PNG or SVG you declare in a link tag." },
    { q: "Should my source image be square?", a: "Yes. A non-square image gets padded or cropped to fit a square icon. Start from a square PNG with transparency for the cleanest result." },
    { q: "Will small sizes look blurry?", a: "Detailed logos turn to mush at 16 pixels. Use a simplified mark - a single letter or shape - for anything that will be seen that small." },
  ],
  howTo: [
    { name: "Drop a square image", text: "PNG with transparency gives the cleanest result. Processed in your browser." },
    { name: "Pick the sizes to include", text: "16, 32, 48 and 256 pixels are selected by default." },
    { name: "Download the .ico", text: "Drop it at your site root as favicon.ico." },
  ],
  seoCopy:
    "Build a proper multi-resolution .ico favicon from a PNG or JPG without uploading anything. A real .ico is a container: this tool writes 16, 32, 48 and 256 pixel versions into one file so the browser can pick the right one for a tab, a bookmark or a large tile, instead of scaling a single bitmap badly. Start from a square source, ideally a PNG with transparency, and simplify the artwork - a detailed logo becomes unreadable mush at sixteen pixels across.",
};
