import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "qr-scanner",
  primaryKeyword: "qr code scanner online free",
  metaDescription: "Scan a QR code from an image or screenshot online free. Decodes links, WiFi and contact data in your browser - nothing is uploaded.",
  relatedKeywords: [
    "read qr code from image",
    "qr decoder online",
    "scan qr from screenshot",
    "qr reader",
  ],
  faqs: [
    { q: "Can I scan with my camera?", a: "This tool reads QR codes out of an image file or screenshot. That covers the case a phone cannot help with - a code you already have on screen rather than one in front of you." },
    { q: "Is the image uploaded anywhere?", a: "No. Decoding runs in your browser, which matters because QR codes routinely contain WiFi passwords and personal contact details." },
    { q: "Why won't my code decode?", a: "Usually the image is too low-resolution, badly blurred, or the code is cropped so a corner marker is missing. Crop tightly around the full code and try a sharper capture." },
    { q: "Is it safe to open a link from a QR code?", a: "Check it first. QR codes are a common phishing vector precisely because you cannot read them by eye - this tool shows you the decoded destination as text before you decide to visit it." },
  ],
  howTo: [
    { name: "Drop the image", text: "A screenshot, photo or saved picture containing the code." },
    { name: "It decodes locally", text: "Reading happens in your browser - nothing is uploaded." },
    { name: "Read the result", text: "The decoded content is shown as text so you can check a link before opening it." },
  ],
  seoCopy:
    "Decode a QR code out of a screenshot, photo or saved image, entirely inside your browser. This covers the situation a phone camera cannot help with: a code that is already on your screen rather than in front of you. Nothing is uploaded, which matters more than usual here, because QR codes routinely carry WiFi passwords and personal contact details. The decoded content is shown as plain text first - worth reading before you follow it, since QR codes are a common phishing vector precisely because the destination is unreadable by eye.",
};
