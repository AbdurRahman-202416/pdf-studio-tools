import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "watermark-image",
  primaryKeyword: "add watermark to image online free",
  metaDescription: "Add a text watermark to an image online free. Control the text, size, angle, opacity and position, or tile it across the photo.",
  relatedKeywords: [
    "watermark photo",
    "add text to image",
    "image watermark online",
    "copyright watermark",
    "tile watermark",
  ],
  faqs: [
    { q: "Does a watermark actually protect my image?", a: "It makes casual reuse obvious and inconvenient, which is usually the point. A determined person can still edit it out, so a tiled semi-transparent watermark across the middle is far harder to remove than a small corner mark." },
    { q: "What opacity works best?", a: "Around 30-45%. Low enough that the image is still enjoyable, high enough that the mark cannot be ignored or easily cloned out." },
    { q: "Can I watermark several photos at once?", a: "Yes - drop multiple files and the same watermark settings are applied to each, then download them together." },
    { q: "Is my photo uploaded to a server?", a: "No. The watermark is drawn onto a canvas in your browser, so the original and the result both stay on your device." },
  ],
  howTo: [
    { name: "Drop your image", text: "One file or several. Everything is processed locally." },
    { name: "Type your watermark", text: "Set the text, then adjust size, angle, opacity and position - or tile it across the whole frame." },
    { name: "Download the watermarked image", text: "The original file on your device is never modified." },
  ],
  seoCopy:
    "Add a text watermark to a photo before you post or send it, entirely inside your browser. You control the text, size, rotation, opacity and placement, and you can tile the mark across the whole frame rather than tucking it into a corner - a tiled semi-transparent watermark at roughly 30-45% opacity is far harder to clone out than a small corner mark, while still leaving the picture readable. Drop several files to stamp them all with the same settings in one pass.",
};
