import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "add-page-numbers",
  primaryKeyword: "add page numbers to pdf online",
  metaDescription: "Add page numbers to a PDF free. Choose the position, starting number and format like 'Page 3 of 12'. No signup.",
  relatedKeywords: [
    "number pdf pages",
    "pdf page numbering",
    "insert page numbers",
    "paginate pdf",
  ],
  faqs: [
    { q: "Can I start numbering at something other than 1?", a: "Yes. Set the starting number - useful when the document is one chapter of something larger, or when a cover page should not count." },
    { q: "Can I skip the cover page?", a: "Yes, there is an option for exactly that. The cover stays unnumbered and numbering begins on page two." },
    { q: "What formats are supported?", a: "Anything containing {n} for the current page, and optionally {total} for the page count - so 'Page {n} of {total}' produces 'Page 3 of 12'." },
    { q: "Will it cover existing content?", a: "Numbers are placed in the margin. If your document already prints close to the edge, move the position to the opposite corner." },
  ],
  howTo: [
    { name: "Upload your PDF", text: "Processed on our server and deleted an hour later." },
    { name: "Choose position and format", text: "Six positions, a custom format, and an optional skip for the cover page." },
    { name: "Download the numbered PDF", text: "Text stays selectable - the numbers are real text, not an image." },
  ],
  seoCopy:
    "Add real page numbers to a PDF - actual selectable text placed in the margin, not an image stamped over the page. Choose from six positions, set the starting number when the document is one part of something larger, and use a format string containing {n} and {total} to produce labels like 'Page 3 of 12'. There is a dedicated option to skip the cover page, which is the most common requirement and the one most tools make you work around manually.",
};
