import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "diff-checker",
  primaryKeyword: "text diff checker online",
  metaDescription: "Free diff checker. Compare two blocks of text line by line with additions and removals highlighted. Nothing is uploaded.",
  relatedKeywords: [
    "compare two texts",
    "text comparison tool",
    "diff online",
    "file diff checker",
    "find differences",
  ],
  faqs: [
    { q: "Is my text uploaded?", a: "No. The comparison runs entirely in your browser, which is why pasting real source files, config or contracts is safe here." },
    { q: "How does it decide what changed?", a: "A longest-common-subsequence diff, the same approach git uses. It finds the largest set of unchanged lines and reports everything else as added or removed." },
    { q: "Can it diff inside a line?", a: "Not currently - this is a line-level comparison. A line with one changed character shows as one removal and one addition." },
    { q: "Why do identical-looking lines show as different?", a: "Almost always trailing whitespace or a different line ending. Turn on 'ignore leading/trailing whitespace' to confirm." },
  ],
  howTo: [
    { name: "Paste the original", text: "Left side. It stays on your device." },
    { name: "Paste the changed version", text: "Right side. The comparison updates immediately." },
    { name: "Read the differences", text: "Additions and removals are highlighted with line numbers from both sides." },
  ],
  seoCopy:
    "Compare two blocks of text line by line, with additions and removals highlighted and line numbers shown from both sides. The comparison uses a longest-common-subsequence diff, the same approach git takes - it finds the largest run of unchanged lines and reports everything else as added or removed. Everything happens in your browser, so pasting real source files, configuration or contract text is safe. If lines that look identical show as different, the cause is nearly always trailing whitespace, which the ignore-whitespace option will confirm.",
};
