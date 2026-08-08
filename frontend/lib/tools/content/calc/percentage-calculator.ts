import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "percentage-calculator",
  primaryKeyword: "percentage calculator",
  metaDescription: "Free percentage calculator. What is X% of Y, X is what percent of Y, and percentage increase or decrease - all in one.",
  relatedKeywords: [
    "percent calculator",
    "percentage increase calculator",
    "percentage change",
    "what percent of",
  ],
  faqs: [
    { q: "Which mode do I need?", a: "'X% of Y' for finding a portion. 'X is what percent of Y' for turning two numbers into a percentage. 'Increase/decrease' for comparing a before and after." },
    { q: "Why isn't a 50% rise cancelled by a 50% fall?", a: "Because the second percentage applies to a larger number. 100 up 50% is 150; 150 down 50% is 75, not 100. Percentage changes are not symmetric." },
    { q: "What is percentage change from zero?", a: "Undefined. Any increase from zero is infinite in percentage terms, which is why the calculator flags it rather than printing a misleading number." },
    { q: "Percentage points versus percent?", a: "If a rate moves from 4% to 6%, that is 2 percentage points but a 50% increase. News reports confuse these constantly." },
  ],
  howTo: [
    { name: "Choose the question", text: "Three modes cover almost everything people ask." },
    { name: "Enter the two numbers", text: "The result updates as you type." },
    { name: "Read the working", text: "The calculation itself is shown, not just the answer." },
  ],
  seoCopy:
    "Three percentage questions in one calculator: what is X percent of Y, X is what percent of Y, and the percentage increase or decrease between two numbers. Each shows the actual calculation rather than just an answer. Two things it handles honestly that catch people out - percentage changes are not symmetric, so a 50% rise followed by a 50% fall does not return you to the start; and percentage change from zero is undefined rather than infinite-but-printable, so the tool says so instead of inventing a figure.",
};
