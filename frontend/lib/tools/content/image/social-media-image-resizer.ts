import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "social-media-image-resizer",
  primaryKeyword: "social media image resizer",
  metaDescription: "Free social media image resizer. Exact dimensions for Instagram, YouTube, Facebook, LinkedIn, X and Pinterest.",
  relatedKeywords: [
    "instagram image size",
    "youtube thumbnail size",
    "linkedin banner size",
    "facebook cover size",
    "social image resizer",
  ],
  faqs: [
    { q: "Why not just upload the original?", a: "Because the platform will crop it for you, and it decides what to cut. Resizing first means you choose what stays in frame." },
    { q: "What does 'crop to fill' do?", a: "Scales the image until it covers the target and trims the overflow from the edges, keeping the centre. 'Fit inside' scales it down until the whole picture fits and adds white bars instead." },
    { q: "Are these sizes current?", a: "They are the dimensions each platform documents. Platforms do change them occasionally, so check if something looks off - though most accept a range and only the aspect ratio is critical." },
    { q: "Is my photo uploaded?", a: "No. Resizing happens on a canvas in your browser, so the image never leaves your device." },
  ],
  howTo: [
    { name: "Drop your image", text: "Any JPG, PNG or WebP." },
    { name: "Choose the platform and format", text: "Twelve presets covering the major networks." },
    { name: "Pick crop or fit", text: "Crop fills the frame; fit adds bars but loses nothing." },
  ],
  seoCopy:
    "Resize an image to the exact dimensions each social platform expects - Instagram posts, portraits and stories, YouTube thumbnails and channel art, Facebook posts and covers, X posts and headers, LinkedIn banners and Pinterest pins. Doing it here rather than letting the upload form crop for you means you decide what stays in frame, which matters most for banners where the automatic crop routinely cuts off faces or text. Everything runs in your browser.",
};
