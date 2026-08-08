import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "heic-to-jpg",
  primaryKeyword: "heic to jpg converter online free",
  metaDescription: "Convert iPhone HEIC photos to JPG online free. Keeps full resolution, strips nothing you need. No signup and no watermark.",
  relatedKeywords: [
    "heic to jpeg",
    "convert heic",
    "iphone photo to jpg",
    "heic converter online",
    "heif to jpg",
  ],
  faqs: [
    { q: "Why can't my computer open HEIC files?", a: "HEIC is Apple's default camera format. Windows needs a paid codec from the Store, and many websites and older apps reject it outright, which is why converting to JPG is usually the quickest fix." },
    { q: "Does converting lose quality?", a: "There is one lossy re-encode, done at high quality, so the difference is not visible at normal viewing sizes. Resolution is preserved in full." },
    { q: "Why does this tool upload my file when your other image tools don't?", a: "Browsers cannot decode HEIC outside Safari, and the JavaScript decoder is about a megabyte. Doing it server-side keeps the page fast and makes it work in every browser. The file is deleted an hour after processing." },
    { q: "How do I stop my iPhone shooting HEIC?", a: "Settings, Camera, Formats, then choose Most Compatible. New photos will be JPG, though existing HEIC files stay as they are." },
  ],
  howTo: [
    { name: "Upload your HEIC photo", text: "Straight from an iPhone or iPad. Max 100 MB." },
    { name: "We decode and re-encode it", text: "Full resolution is kept and the JPG quality is set high." },
    { name: "Download the JPG", text: "Opens anywhere - Windows, Android, older software and any website." },
  ],
  seoCopy:
    "Convert HEIC and HEIF photos from an iPhone or iPad into ordinary JPGs. HEIC is Apple's default camera format and stores more image in fewer bytes, but Windows needs a paid codec to read it and plenty of websites and older applications simply reject the upload. This is the one image tool here that runs on our server rather than in your browser, because no browser outside Safari can decode HEIC and the JavaScript decoder is roughly a megabyte. Files are deleted an hour after processing.",
};
