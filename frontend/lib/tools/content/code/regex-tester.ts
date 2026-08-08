import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "regex-tester",
  primaryKeyword: "regex tester online",
  metaDescription: "Free regex tester. See every match, capture group and index highlighted live as you type. Runs in your browser.",
  relatedKeywords: [
    "regular expression tester",
    "regex online",
    "test regex",
    "regex match groups",
    "javascript regex tester",
  ],
  faqs: [
    { q: "Which regex flavour is this?", a: "JavaScript's, since it runs on the browser's own engine. Most syntax is shared with PCRE, but lookbehind, named groups and unicode property escapes can differ - check your target language if the pattern is going elsewhere." },
    { q: "What does the global flag change?", a: "Without it, only the first match is found. With it, the pattern scans the whole input. This tool always scans so you can see everything, but the flag still reflects the semantics you would get in code." },
    { q: "Why does my pattern match nothing?", a: "Usually an unescaped special character. Dots, plus signs, question marks, parentheses and brackets all have meaning - escape them with a backslash to match them literally." },
    { q: "Can a regex hang the page?", a: "A badly nested pattern can backtrack catastrophically. This tool caps the scan so a runaway pattern degrades rather than freezing the tab, but the same pattern would still be dangerous in production." },
  ],
  howTo: [
    { name: "Write your pattern", text: "No surrounding slashes needed - just the expression." },
    { name: "Toggle the flags", text: "Global, ignore case, multiline, dotall and unicode." },
    { name: "Read the matches", text: "Every match is highlighted in context and listed with its index and capture groups." },
  ],
  seoCopy:
    "Test a regular expression against real text and watch every match highlight as you type, with each capture group and character index listed underneath. The engine is the browser's own, so this is JavaScript regex semantics - mostly shared with PCRE, though lookbehind, named groups and unicode property escapes are worth double-checking if the pattern is destined for another language. The scan is capped so a catastrophically backtracking pattern degrades instead of freezing the tab, though such a pattern remains dangerous in production.",
};
