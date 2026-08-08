// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "sign-pdf",
  primaryKeyword: "sign pdf online free",
  metaDescription: "Sign PDF online free. Draw your signature, place it on any page, and download the signed PDF - no signup, no watermark.",
  relatedKeywords: [
      "draw signature on pdf",
      "electronic signature pdf",
      "esign pdf online",
      "add signature to pdf free",
      "sign pdf with mouse",
      "online pdf signer",
    ],
  faqs: [
      { q: "Is this a legally-binding eSignature?", a: "It applies a visible signature image to the PDF, which is accepted by most informal and business contexts. For legally-binding digital signatures with cryptographic proof, you need a certificate-based tool like Adobe Sign or DocuSign." },
      { q: "Can I place the signature on any page?", a: "Yes - drag the signature box onto any page, resize it, and we'll stamp it at the chosen position." },
      { q: "Can I save my signature for next time?", a: "Signatures are stored locally in your browser (not on our server) so they're available next time you visit." },
      { q: "Does it work with non-Latin scripts?", a: "Yes - draw in any script. The drawing is rendered as an image, so any language works." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop the PDF you want to sign." },
      { name: "Draw your signature", text: "Use your mouse, trackpad, or touch screen to draw a signature in the box." },
      { name: "Place and download", text: "Drag the signature onto the right page and position, then download the signed PDF." },
    ],
  seoCopy: "Sign PDF online free - draw your signature, place it anywhere on the document, and download the signed PDF. Works on desktop, tablet, and mobile (touch-friendly). Draw with a mouse, trackpad, or finger, then drag the signature into position and resize it before flattening it onto the page. The result is an ordinary PDF that opens anywhere. Your signature is never stored, and both files are deleted an hour after download.",
};
