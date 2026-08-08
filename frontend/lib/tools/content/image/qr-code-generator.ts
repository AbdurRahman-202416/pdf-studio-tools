import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "qr-code-generator",
  primaryKeyword: "qr code generator free online",
  metaDescription: "Free QR code generator. Make codes for links, text, WiFi or contact cards, set the error correction, download PNG or SVG. No signup.",
  relatedKeywords: [
    "create qr code",
    "qr generator online",
    "wifi qr code",
    "free qr code no expiry",
    "qr code png",
  ],
  faqs: [
    { q: "Do these QR codes expire?", a: "No. The code encodes your data directly, so there is no redirect through us and nothing to switch off. It will keep working forever, including if this site disappears." },
    { q: "What is error correction and which level should I pick?", a: "It adds redundancy so the code still scans when partly damaged or covered. L survives about 7% damage, H about 30%. Use H if you will put a logo in the middle or print onto an uneven surface; L keeps the pattern simplest." },
    { q: "Why should I download SVG instead of PNG?", a: "SVG is vector, so it stays razor sharp at any print size. Use PNG for screens and SVG for anything going to a printer." },
    { q: "How small can I print a QR code?", a: "About 2cm square for a short URL scanned from close range. Longer data means a denser grid, which needs more size - keep the encoded text short and test with a real phone before printing." },
  ],
  howTo: [
    { name: "Choose what to encode", text: "A link, plain text, WiFi credentials or a contact card." },
    { name: "Adjust the look", text: "Set size, margin, colours and error-correction level." },
    { name: "Download PNG or SVG", text: "PNG for screens, SVG for print. The code never expires." },
  ],
  seoCopy:
    "Generate QR codes for links, plain text, WiFi credentials or contact cards, entirely in your browser. These codes encode your data directly rather than redirecting through a shortener, which means there is no tracking, no account, and nothing that can expire or be switched off later - the code keeps working even if this site does not. Set the error-correction level to suit the job: H tolerates roughly 30% damage and is what you want behind a centre logo or on an uneven printed surface.",
};
