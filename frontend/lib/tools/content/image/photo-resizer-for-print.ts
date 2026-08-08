import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "photo-resizer-for-print",
  primaryKeyword: "resize photo for printing",
  metaDescription: "Free photo resizer for print - 4x6, 5x7, 8x10, A4, passport and ID sizes at 300 DPI. Runs in your browser.",
  relatedKeywords: [
    "4x6 photo size",
    "passport photo size",
    "print photo resizer",
    "300 dpi image",
    "id photo size",
  ],
  faqs: [
    { q: "Why 300 DPI?", a: "Because that is what print labs need for a sharp result. At 150 DPI a photo looks fine on screen and visibly soft on paper - screens are far more forgiving than ink." },
    { q: "Can I enlarge a small photo to print size?", a: "You can, but the pixels are not there. A 640x480 photo scaled to 8x10 at 300 DPI will look soft no matter what tool you use." },
    { q: "Which passport size do I need?", a: "35x45 mm covers the UK, EU and most countries. The US uses 2x2 inches. Check the specific requirement, as some countries also mandate head size within the frame." },
    { q: "Is my photo uploaded?", a: "No. Everything is done on a canvas in your browser." },
  ],
  howTo: [
    { name: "Drop your photo", text: "JPG, PNG or WebP." },
    { name: "Pick the print size", text: "Standard photo sizes, A-series paper, passport and ID formats." },
    { name: "Choose crop or fit", text: "Crop fills the size exactly; fit keeps the whole image and adds a border." },
  ],
  seoCopy:
    "Resize a photo to standard print and ID dimensions at 300 DPI - 4x6, 5x7, 8x10, A4, A5, plus 35x45 mm passport, US 2x2 inch and common visa and ID sizes. The 300 DPI figure matters: a photo that looks perfectly sharp on screen at 150 DPI comes back visibly soft from a print lab, because ink on paper is far less forgiving than a backlit display. Enlarging a small photo cannot add detail that was never captured.",
};
