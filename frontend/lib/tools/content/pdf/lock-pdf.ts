// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";
import { brand } from "@/brand.config";

export const content: ToolContent = {
  slug: "lock-pdf",
  primaryKeyword: "password protect pdf online free",
  metaDescription: "Lock PDF with a password online free. AES-256 encryption, no signup, no watermark - secure your PDF in seconds.",
  relatedKeywords: [
      "lock pdf with password",
      "encrypt pdf online free",
      "add password to pdf",
      "secure pdf with password",
      "pdf password protect online",
      "make pdf private",
    ],
  faqs: [
      { q: "What encryption is used?", a: "AES-256, the same encryption used by Adobe Acrobat Pro and modern PDF readers." },
      { q: "Can I remove the password later?", a: "Yes - use the Unlock PDF tool with the same password you set." },
      { q: "Is the password sent to your servers?", a: "It's transmitted over HTTPS only to apply encryption, never stored, and the file is deleted within one hour." },
      { q: "Will the password also prevent printing or copying?", a: "Yes - we apply a single password that restricts opening; once opened, all standard permissions are granted." },
    ],
  howTo: [
      { name: "Upload your PDF", text: "Drop the PDF you want to protect." },
      { name: "Choose a strong password", text: "Pick a password of at least 8 characters - store it safely, we don't keep it." },
      { name: "Download the locked PDF", text: "Recipients will need the password to open the file." },
    ],
  seoCopy: `Lock PDF with a password online for free using ${brand.name}. AES-256 encryption protects your confidential documents - invoices, contracts, ID scans - with the same standard used by Adobe Acrobat. The password you choose is required to open the document. We never store it and cannot recover it for you, so keep a copy somewhere safe before you send the file on. Both the original and the encrypted copy are deleted an hour later.`,
};
