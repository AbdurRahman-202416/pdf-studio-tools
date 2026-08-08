import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "barcode-generator",
  primaryKeyword: "barcode generator online free",
  metaDescription: "Free barcode generator - CODE128, EAN-13, UPC-A, CODE39, ITF and more. Live validation and check digits. Download PNG or SVG.",
  relatedKeywords: [
    "create barcode",
    "ean 13 generator",
    "code 128 barcode",
    "upc barcode generator",
    "barcode png",
  ],
  faqs: [
    { q: "Which barcode type do I need?", a: "CODE128 for internal use and anything alphanumeric - it is the flexible default. EAN-13 and UPC-A for retail products, but those need a real registered prefix. CODE39 for older industrial scanners." },
    { q: "What is a check digit?", a: "A final digit computed from the others so a scanner can detect a misread. EAN-13 and UPC-A require one, and it is calculated for you as you type." },
    { q: "Can I invent my own EAN-13 number?", a: "You can generate a scannable image, but a barcode you made up is not registered to you and must never go on a product for sale. Retail barcode prefixes come from GS1." },
    { q: "Why is my barcode not scanning?", a: "Usually it is printed too small, has too little white space around it, or is stretched. Keep the quiet zone either side, do not scale the width and height independently, and print at high contrast." },
  ],
  howTo: [
    { name: "Pick a barcode type", text: "CODE128 for general use, EAN-13 or UPC-A for retail products." },
    { name: "Type your value", text: "The format is validated live and any check digit is computed for you." },
    { name: "Download PNG or SVG", text: "Use SVG for print so the bars stay crisp at any size." },
  ],
  seoCopy:
    "Generate barcodes in every common symbology - CODE128, EAN-13, UPC-A, CODE39, ITF and more - with the value validated as you type and any required check digit computed automatically. Pick CODE128 when you just need something scannable for internal tracking, since it handles letters and numbers. EAN-13 and UPC-A are for retail products and need a prefix registered with GS1: a number you invent will produce a scannable image but must never go on something you sell.",
};
