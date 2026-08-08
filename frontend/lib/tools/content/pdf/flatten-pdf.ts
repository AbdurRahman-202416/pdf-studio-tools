import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "flatten-pdf",
  primaryKeyword: "flatten pdf online free",
  metaDescription: "Flatten a PDF online free. Bake form fields and annotations into the page so it looks identical in every reader.",
  relatedKeywords: [
    "flatten pdf form",
    "remove pdf form fields",
    "flatten annotations",
    "make pdf non editable",
  ],
  faqs: [
    { q: "What does flattening actually do?", a: "It converts interactive elements - filled form fields, comments, highlights, stamps - into ordinary page content. The values stay visible but stop being editable." },
    { q: "Why would I need this?", a: "Because readers render form widgets inconsistently. A form that looks right in Acrobat can print blank elsewhere. Flattening guarantees everyone sees what you see." },
    { q: "Can I edit the form afterwards?", a: "No, and that is the point. Keep the original if you may need to change the answers later." },
    { q: "Does it remove a password?", a: "No. Flattening is unrelated to encryption - use Unlock PDF for that, and unlock first if the file is protected." },
  ],
  howTo: [
    { name: "Upload your filled PDF", text: "Forms, comments and annotations are all handled." },
    { name: "We bake it into the page", text: "Interactive elements become ordinary page content." },
    { name: "Download", text: "Looks the same everywhere, and can no longer be edited." },
  ],
  seoCopy:
    "Flatten a PDF so its interactive parts - filled form fields, comments, highlights and stamps - become ordinary page content. The values stay visible and printable but stop being editable. The reason this matters is consistency: PDF readers render form widgets differently, and a form that displays perfectly in Acrobat can print with empty boxes somewhere else. Flattening removes that whole class of problem. Keep your original, because the answers cannot be changed afterwards.",
};
