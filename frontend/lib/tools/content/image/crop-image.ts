import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "crop-image",
  primaryKeyword: "crop image online free",
  metaDescription: "Crop images online free. Drag a region or lock a fixed aspect ratio for avatars, banners and thumbnails. Nothing is uploaded.",
  relatedKeywords: [
    "crop photo online",
    "image cropper",
    "crop jpg",
    "crop to square",
    "free image crop",
  ],
  faqs: [
    { q: "Does cropping reduce quality?", a: "No. Cropping only discards pixels outside your selection; the pixels you keep are untouched, so there is no re-compression blur." },
    { q: "Can I crop to an exact size?", a: "Yes. Lock an aspect ratio such as 1:1 or 16:9 and drag, or type exact pixel dimensions for the crop box." },
    { q: "Which ratio should I use?", a: "1:1 for most profile pictures, 16:9 for video thumbnails and slides, 4:5 for portrait social posts, 3:2 for prints from most cameras." },
    { q: "Is my photo uploaded?", a: "No. The crop happens in your browser on a canvas, so the image never leaves your device." },
  ],
  howTo: [
    { name: "Drop your image", text: "Stays on your device - nothing is sent anywhere." },
    { name: "Drag out the area you want", text: "Or lock a ratio, or type exact pixel dimensions for the box." },
    { name: "Download the crop", text: "Pixels inside the selection are kept exactly as they were." },
  ],
  seoCopy:
    "Crop an image by dragging out the region you want, with nothing uploaded to a server. Unlike compressing or resizing, cropping is completely lossless - it throws away the pixels outside your selection and leaves everything inside untouched, so there is no re-encoding and no softening. Lock a common aspect ratio when the destination demands one: 1:1 for profile pictures, 16:9 for thumbnails and slides, 4:5 for portrait social posts. You can also type exact pixel dimensions when a platform is strict.",
};
