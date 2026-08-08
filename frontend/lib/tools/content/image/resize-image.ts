import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "resize-image",
  primaryKeyword: "resize image online free",
  metaDescription: "Resize images online free. Set exact pixel dimensions, scale by percentage, or fit a preset - aspect ratio locked by default.",
  relatedKeywords: [
    "resize photo",
    "change image dimensions",
    "scale image online",
    "image resizer",
    "resize jpg",
  ],
  faqs: [
    { q: "Will resizing distort my image?", a: "Not unless you want it to. The aspect ratio is locked by default, so setting one dimension computes the other. Unlock it only when you deliberately need to stretch." },
    { q: "Can I make an image bigger?", a: "You can, but enlarging invents pixels that were never captured, so the result looks soft. Going beyond about 200% of the original rarely looks good." },
    { q: "What is the difference between resizing and cropping?", a: "Resizing scales the whole picture to new dimensions. Cropping cuts a region out and throws the rest away. Use Crop Image if you want to change the framing." },
    { q: "Does resizing reduce file size?", a: "Yes, and usually far more than compression does. Halving both dimensions leaves a quarter of the pixels, which typically cuts the file by a similar factor." },
  ],
  howTo: [
    { name: "Drop your image", text: "JPG, PNG or WebP, any size. It stays on your device." },
    { name: "Enter the size you need", text: "Type a width or height and the other follows automatically, or pick a preset." },
    { name: "Download the resized image", text: "Output keeps the original format unless you choose a different one." },
  ],
  seoCopy:
    "Resize an image to exact pixel dimensions without uploading it to anyone. Type a width and the height follows automatically, because the aspect ratio is locked until you deliberately unlock it - so nothing comes out stretched by accident. Scale by percentage when you just want something smaller, or pick a preset for common cases. Resizing usually saves far more file size than compression, since halving both dimensions leaves a quarter as many pixels to store.",
};
