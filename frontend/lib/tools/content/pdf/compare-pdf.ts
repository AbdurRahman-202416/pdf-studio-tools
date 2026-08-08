import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "compare-pdf",
  primaryKeyword: "compare two pdf files online",
  metaDescription: "Free PDF compare tool. See exactly which lines were added or removed between two versions of a document.",
  relatedKeywords: [
    "pdf diff",
    "compare pdf documents",
    "find differences between pdfs",
    "pdf version compare",
  ],
  faqs: [
    { q: "Does it compare visually or by text?", a: "By text. A pixel comparison of a re-flowed document is mostly noise - a single inserted word shifts everything after it. Comparing the extracted text finds the edits people actually care about." },
    { q: "Can it compare scanned documents?", a: "No. Scans have no text layer, so there is nothing to compare. Run OCR on both first, then compare the results." },
    { q: "What counts as a change?", a: "A line that appears in one document but not the other. A line with one word altered shows as one removal and one addition, since this is a line-level comparison." },
    { q: "Is there a size limit?", a: "Very long documents are rejected rather than left to hang, because the comparison is quadratic in the number of lines. Split them into sections if you hit that." },
  ],
  howTo: [
    { name: "Upload the original", text: "The version you are comparing from." },
    { name: "Upload the revised version", text: "Both are read for their text layer." },
    { name: "Read the differences", text: "Additions and removals listed, with a count of each." },
  ],
  seoCopy:
    "Compare two PDFs and see exactly which lines were added or removed. The comparison works on the extracted text using a longest-common-subsequence diff - the same approach git takes - rather than comparing pixels, because a single inserted word reflows everything after it and a visual diff would then report the entire remainder of the document as changed. Both files need a real text layer, so scanned documents need OCR run on them first.",
};
