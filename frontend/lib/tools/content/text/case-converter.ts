import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "case-converter",
  primaryKeyword: "case converter online",
  metaDescription: "Free case converter - UPPER, lower, Title, Sentence, camelCase, snake_case, kebab-case and more, instantly.",
  relatedKeywords: [
    "uppercase converter",
    "title case converter",
    "camelcase converter",
    "snake case",
    "text case changer",
  ],
  faqs: [
    { q: "What is title case exactly?", a: "Major words capitalised, minor ones like 'a', 'of' and 'the' left lowercase unless they start the string. That is the convention most style guides use, and it is what this applies." },
    { q: "Sentence case versus title case?", a: "Sentence case capitalises only the first letter of each sentence - the normal way you write prose. Title case capitalises most words and is for headings." },
    { q: "Why so many programming cases?", a: "Different languages have different conventions: camelCase in JavaScript, snake_case in Python, PascalCase for classes, kebab-case in CSS and URLs, CONSTANT_CASE for constants." },
    { q: "Does it detect the input format?", a: "Yes. It splits camelCase, snake_case and kebab-case into words before rebuilding, so you can convert between any two without an intermediate step." },
  ],
  howTo: [
    { name: "Paste your text", text: "Any format - camelCase, snake_case or plain prose." },
    { name: "Pick the target case", text: "Eleven options covering prose and code." },
    { name: "Copy the result", text: "Converted as you type, in your browser." },
  ],
  seoCopy:
    "Convert text between every case you are likely to need: UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE and a couple of novelty ones. The input format is detected rather than assumed, so camelCase, snake_case and kebab-case are all split into words before being rebuilt - meaning you can go directly from any one to any other without an intermediate step. Title case follows the usual convention of leaving minor words like 'a', 'of' and 'the' lowercase unless they lead.",
};
