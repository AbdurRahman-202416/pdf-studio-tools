// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "split-pdf",
  primaryKeyword: "split pdf online free",
  metaDescription: "Split PDF online free - extract specific pages into a new PDF, or save every page as its own file. No signup, no watermark, no page limit.",
  relatedKeywords: [
      "split pdf pages",
      "extract pages from pdf",
      "separate pdf pages",
      "pdf splitter online",
      "split pdf into multiple files",
      "cut pdf pages",
    ],
  faqs: [
      { q: "Can I extract just a few pages into one PDF?", a: "Yes - type a range like 1-3,7 and choose 'Extract pages'. The selected pages become one new PDF in the order you typed them." },
      { q: "Can I split every page into its own file?", a: "Yes - choose 'One PDF per page' and you'll get a ZIP with a single-page PDF for each selected page." },
      { q: "Is there a page or file limit?", a: "No page limit and no daily limit. Files up to 100 MB are supported and auto-delete after 1 hour." },
      { q: "Does splitting reduce quality?", a: "No - pages are copied losslessly. Text, images, and fonts are untouched." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop the PDF you want to split - up to 100 MB." },
      { name: "Pick pages and mode", text: "Type a range like 1-3,5 and choose one combined PDF or one file per page." },
      { name: "Download", text: "Get a single PDF, or a ZIP of single-page PDFs. Files auto-delete after 1 hour." },
    ],
  seoCopy: "Split PDF online free - extract the pages you need into a new PDF, or break the whole document into single-page files. Lossless, private (files auto-delete after 1 hour), and completely free with no signup, watermark, or page limit. Extract a range such as 4-9, pick individual pages, or burst the whole document into one file per page. Output keeps the original resolution and selectable text, and there is no page limit.",
};
