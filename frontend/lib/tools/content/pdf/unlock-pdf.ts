// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";
import { brand } from "@/brand.config";

export const content: ToolContent = {
  slug: "unlock-pdf",
  primaryKeyword: "unlock pdf online free",
  metaDescription: "Unlock PDF with password online free. Remove PDF password - no signup, no watermark, auto-delete in 1 hour.",
  relatedKeywords: [
      "remove pdf password free",
      "decrypt pdf online",
      "open password protected pdf",
      "pdf password remover",
      "unlock pdf with password",
      "pdf unlock online",
    ],
  faqs: [
      { q: "Can you unlock a PDF I don't know the password for?", a: "No - we require the correct password. We do not attempt to crack passwords." },
      { q: "Will the unlocked PDF look the same?", a: "Yes. We strip only the password layer; content, fonts, and formatting are preserved." },
      { q: "Is this safe to use?", a: "Yes - the file is processed over HTTPS and auto-deleted within one hour." },
      { q: "Do I need the current password?", a: "Yes. This removes a password you already know so the file stops prompting you. It cannot open a document you don't have the password for." },
    ],
  howTo: [
      { name: "Upload your locked PDF", text: "Drop the password-protected PDF onto the upload zone." },
      { name: "Enter the password", text: "Type the password used to encrypt the file." },
      { name: "Download the unlocked PDF", text: "The downloaded PDF opens without any password." },
    ],
  seoCopy: `Unlock PDF online for free with ${brand.name}. Remove the open-password from any PDF you legitimately own - bank statements, eTickets, government forms - in seconds. You need the current password: this removes a password you already know so the file stops prompting you every time. It is not a way into documents you do not have access to. Both copies are deleted an hour later.`,
};
