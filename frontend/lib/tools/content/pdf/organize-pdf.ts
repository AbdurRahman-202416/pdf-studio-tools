import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "organize-pdf",
  primaryKeyword: "organize pdf pages online",
  metaDescription: "Reorder, subset or reverse PDF pages online free. Give an order like 3,1,2 or 10-1 and get exactly that document back.",
  relatedKeywords: [
    "reorder pdf pages",
    "rearrange pdf",
    "reverse pdf pages",
    "extract pdf pages",
    "sort pdf pages",
  ],
  faqs: [
    { q: "How do I reverse a document?", a: "Give a descending range - for a 10-page file, enter 10-1. That is the whole operation." },
    { q: "Can I use a page more than once?", a: "Yes. Repeat it in the order, for example 1,2,1,3 - useful for building a document with a repeated cover or divider." },
    { q: "Can I drop pages?", a: "Just leave them out. Entering 2,4 on a five-page file produces a two-page document." },
    { q: "Is anything re-compressed?", a: "No. Pages are copied across intact, so resolution, fonts and selectable text are all preserved exactly." },
  ],
  howTo: [
    { name: "Upload your PDF", text: "Any size up to 100 MB." },
    { name: "Type the page order", text: "Like 3,1,2 to reorder, 2,4 to subset, or 10-1 to reverse." },
    { name: "Download", text: "Pages are copied intact - nothing is re-compressed." },
  ],
  seoCopy:
    "Reorder, subset, duplicate or reverse the pages of a PDF by describing the order you want: 3,1,2 to rearrange, 2,4 to keep only those pages, 10-1 to reverse a ten-page document, or 1,2,1,3 to repeat a page. Everything is expressed in one field rather than through a drag interface, which is faster once you know what you want and works just as well on a two-hundred-page file. Pages are copied across intact, so nothing is re-compressed and selectable text stays selectable.",
};
