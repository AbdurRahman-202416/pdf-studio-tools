import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "compress-image",
  primaryKeyword: "compress image online free",
  metaDescription: "Compress JPG, PNG and WebP online free. Pick a target size or quality, see the saving before you download. No signup, no watermark.",
  relatedKeywords: [
    "compress jpg",
    "reduce image size",
    "compress png",
    "image compressor online",
    "shrink photo size",
  ],
  faqs: [
    { q: "Does compressing lose quality?", a: "Every JPG/WebP save is lossy, so some detail goes. At quality 80 the difference is invisible on screen for most photos while the file is often 60-70% smaller. Drop below 50 and you will start to see blocking around edges." },
    { q: "Is PNG compression lossless?", a: "PNG itself is lossless, but real savings on a photo-like PNG come from reducing colours or converting to JPG/WebP. For screenshots and flat graphics, PNG stays sharp and still shrinks." },
    { q: "Are my images uploaded anywhere?", a: "No. This tool runs entirely in your browser using canvas - the file never leaves your device, which is why it works offline once the page has loaded." },
    { q: "Why is my compressed file bigger than the original?", a: "Re-encoding an already heavily compressed JPG at a higher quality can add bytes. If that happens, lower the quality or keep the original - the tool tells you the before and after size." },
  ],
  howTo: [
    { name: "Drop your image", text: "JPG, PNG or WebP. Nothing is uploaded - processing happens in your browser." },
    { name: "Choose a quality or target size", text: "Drag the quality slider, or type a target in KB and let the tool find the setting that fits." },
    { name: "Download", text: "You see the before and after size, so you can judge the trade before saving." },
  ],
  seoCopy:
    "Compress JPG, PNG and WebP images without uploading them anywhere. The whole process runs in your browser through the canvas API, so photos never touch a server and the tool keeps working offline once loaded. Choose a quality level directly or give a target size in kilobytes and let it search for the setting that lands under your limit. Before and after sizes are always shown, so you can see exactly what a saving costs you in quality.",
};
