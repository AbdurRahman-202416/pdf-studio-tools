import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "repair-pdf",
  primaryKeyword: "repair corrupted pdf online free",
  metaDescription: "Repair a damaged PDF online free. Rebuilds a broken cross-reference table to recover a file that won't open.",
  relatedKeywords: [
    "fix corrupted pdf",
    "pdf recovery",
    "damaged pdf repair",
    "pdf wont open",
    "restore pdf file",
  ],
  faqs: [
    { q: "What kind of damage can this fix?", a: "The common kind: a broken cross-reference table, usually from an interrupted download or a crash mid-save. The page content is intact but the index pointing at it is not, and that index can be rebuilt." },
    { q: "What can't it fix?", a: "Genuinely truncated files. If the download stopped halfway, the missing bytes do not exist anywhere and no tool can invent them - though you may still recover the pages that did arrive." },
    { q: "Will the repaired file look the same?", a: "Whatever is recoverable comes back unchanged. If some objects are unsalvageable, you may lose particular images or fonts, and the tool tells you how many pages were recovered." },
    { q: "My PDF opens but shows an error - is it worth trying?", a: "Yes. Files that open with a warning usually have minor structural damage, and re-saving through a rebuild often clears it permanently." },
  ],
  howTo: [
    { name: "Upload the damaged PDF", text: "Even one that other readers refuse to open." },
    { name: "We rebuild its structure", text: "The cross-reference table is reconstructed from the objects actually present." },
    { name: "Download and check", text: "You are told what was found and how many pages were recovered." },
  ],
  seoCopy:
    "Recover a PDF that will not open by rebuilding its internal structure. The most common failure by far is a damaged cross-reference table - the index that tells a reader where each object lives - usually caused by an interrupted download or a crash during save. The page content is generally intact, and that index can be reconstructed from the objects actually present in the file. Genuinely truncated downloads are the limit: missing bytes cannot be invented, though the pages that did arrive can often still be salvaged.",
};
