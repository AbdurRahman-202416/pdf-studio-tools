import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "jpg-to-png",
  primaryKeyword: "jpg to png converter online free",
  metaDescription: "Convert JPG to PNG online free. Lossless output with optional transparency, converted in your browser - no upload, no watermark.",
  relatedKeywords: [
    "jpeg to png",
    "convert jpg to png",
    "jpg to png online",
    "change jpg to png",
  ],
  faqs: [
    { q: "Does converting to PNG improve quality?", a: "No. Detail already lost when the JPG was saved cannot come back. PNG stops any further loss, which matters if you plan to edit and re-save the file repeatedly." },
    { q: "Will the PNG be larger than the JPG?", a: "Usually yes, often several times larger, because PNG stores photographic detail losslessly. That is the trade you make for no further degradation." },
    { q: "Can I get a transparent background?", a: "JPG cannot store transparency, so there is none to recover. The converter can make one flat colour transparent, which works well for logos on a solid background." },
    { q: "When should I use PNG over JPG?", a: "Screenshots, logos, line art, anything with sharp edges or text, and any image you will edit again. Photographs destined for the web are usually better as JPG or WebP." },
  ],
  howTo: [
    { name: "Drop your JPG", text: "Single or multiple files. Everything is processed locally." },
    { name: "Choose your options", text: "Optionally make one background colour transparent." },
    { name: "Download the PNG", text: "Lossless from this point on - re-saving will not degrade it further." },
  ],
  seoCopy:
    "Convert JPG to PNG in your browser, with nothing uploaded to a server. PNG is lossless, so once converted the image stops degrading each time you save it - which is what makes it the right format for anything you will edit repeatedly, and for screenshots, logos and line art where JPG artefacts show around sharp edges. Expect the PNG to be larger than the JPG it came from: that extra size is the cost of storing photographic detail without throwing any of it away.",
};
