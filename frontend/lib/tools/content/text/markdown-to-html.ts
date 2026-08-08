import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "markdown-to-html",
  primaryKeyword: "markdown to html converter",
  metaDescription: "Free Markdown to HTML converter. GitHub-flavoured markdown including tables and task lists, rendered in your browser.",
  relatedKeywords: [
    "md to html",
    "markdown converter",
    "markdown preview",
    "github markdown",
    "markdown renderer",
  ],
  faqs: [
    { q: "Which markdown flavour is this?", a: "GitHub-flavoured markdown, so tables, fenced code blocks, strikethrough and task lists all work alongside the original CommonMark syntax." },
    { q: "Is the HTML safe to embed?", a: "Treat it with the same caution as its source. Markdown permits raw HTML, so output generated from untrusted input should be sanitised before you put it on a page." },
    { q: "Why didn't my line break appear?", a: "CommonMark needs two trailing spaces, or a blank line for a new paragraph. A single newline is treated as a continuation of the same paragraph." },
    { q: "Are the class names styled?", a: "No - the output is plain semantic HTML with no classes attached, so it inherits whatever styles the destination applies." },
  ],
  howTo: [
    { name: "Paste your markdown", text: "Or load the sample to see tables and quotes render." },
    { name: "Watch it convert", text: "Output updates as you type, in your browser." },
    { name: "Copy the HTML", text: "Plain semantic markup, no framework classes attached." },
  ],
  seoCopy:
    "Convert GitHub-flavoured markdown into clean semantic HTML in your browser, with tables, fenced code blocks, strikethrough and task lists all supported alongside standard CommonMark. The output carries no class names, so it inherits whatever styling the destination applies. Two things worth knowing: a single newline continues the same paragraph, so a real line break needs two trailing spaces or a blank line; and markdown allows raw HTML through, so anything generated from untrusted input should be sanitised before it reaches a page.",
};
