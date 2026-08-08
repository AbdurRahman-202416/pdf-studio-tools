import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "redact-pdf",
  primaryKeyword: "redact pdf online free",
  metaDescription: "Redact a PDF online free. Permanently deletes the matching text rather than covering it with a black box. No signup.",
  relatedKeywords: [
    "black out pdf text",
    "remove text from pdf",
    "pdf redaction tool",
    "hide sensitive information pdf",
  ],
  faqs: [
    { q: "How is this different from drawing a black box?", a: "Completely. A black rectangle sits on top - the text is still in the file and can be copied straight out from underneath it. That mistake has leaked real documents. This deletes the underlying characters before saving." },
    { q: "Can I verify the text is gone?", a: "Yes, and you should. Open the result and try to select or search for the redacted term. If nothing is found, it is genuinely gone." },
    { q: "Does it work on scanned documents?", a: "No. A scan is an image with no text to find - run OCR first so there is real text, then redact." },
    { q: "Does it catch every occurrence?", a: "It removes every match of the terms you give, across all pages. It cannot know about information you did not list, so review the result before sharing it." },
  ],
  howTo: [
    { name: "Upload your PDF", text: "Must contain real text - run OCR first if it is a scan." },
    { name: "List the words or phrases", text: "One per line. Every match on every page is removed." },
    { name: "Download and verify", text: "Try selecting the redacted term in the result - it should not be there." },
  ],
  seoCopy:
    "Redact a PDF by permanently deleting the matching characters rather than covering them. This distinction matters more than almost anything else in PDF handling: drawing a black rectangle leaves the original text sitting in the file, selectable and copyable from underneath, and that exact mistake has exposed real confidential documents. Here the glyphs are removed before the file is written. Because it searches real text, a scanned document needs OCR first, and you should always verify by trying to select the redacted term afterwards.",
};
