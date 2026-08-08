import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "json-formatter",
  primaryKeyword: "json formatter and validator online",
  metaDescription: "Free JSON formatter and validator. Beautify, minify and check JSON in your browser - errors point at the exact character. Nothing is uploaded.",
  relatedKeywords: [
    "json beautifier",
    "json validator",
    "format json online",
    "json pretty print",
    "minify json",
  ],
  faqs: [
    { q: "Is my JSON sent to a server?", a: "No. Parsing and formatting happen in your browser with the built-in JSON engine, so you can paste production payloads, API responses or anything containing credentials without it leaving your machine." },
    { q: "Why does it say 'Unexpected token' with a position number?", a: "That's the browser's own parser telling you exactly which character broke it. Count to that offset in your input - it is almost always a trailing comma, a single quote instead of a double, or an unquoted key." },
    { q: "What does minify actually remove?", a: "All insignificant whitespace and newlines. The data is identical; it just stops being readable. Useful for shrinking a payload before embedding it somewhere." },
    { q: "Does it support JSON with comments or trailing commas?", a: "No, and deliberately. Those are JSON5/JSONC extensions, not JSON. If a parser accepted them here you would find out the hard way when a stricter one rejected your file." },
  ],
  howTo: [
    { name: "Paste your JSON", text: "Or load the sample. Nothing is uploaded - this runs in your browser." },
    { name: "Pick an indent", text: "Two spaces, four spaces, or minify to strip whitespace entirely." },
    { name: "Copy or download", text: "The formatted result updates as you type, with size before and after." },
  ],
  seoCopy:
    "Format, validate and minify JSON entirely inside your browser. Because parsing uses the browser's own JSON engine rather than a server, you can safely paste API responses, config files and payloads containing tokens - none of it travels anywhere. Syntax errors report the exact character offset, which is usually enough to spot the real culprit: a trailing comma, a single quote where a double belongs, or an unquoted key. Comments and trailing commas are rejected on purpose, because they are not valid JSON.",
};
