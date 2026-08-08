// Auto-split from lib/seo/tool-registry.ts. SEO prose only - server-only.
import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "compress-pdf",
  // Was "compress pdf for email, whatsapp, govt portal" - a comma-stuffed
  // phrase that made a poor <title> and overlapped both the target-size tools
  // and the government-portal guide. The flagship compressor targets the head
  // transactional query; the outcome buttons remain the UX, not the keyword.
  primaryKeyword: "compress pdf online free",
  metaDescription: "Compress PDF to fit Gmail (10 MB), WhatsApp (16 MB), or a government portal (1 MB). Pick where you're sending it, we shrink it to size. Free.",
  relatedKeywords: [
      "compress pdf for email",
      "compress pdf for whatsapp",
      "reduce pdf size for government portal",
      "shrink pdf to specific size",
      "pdf compressor by target size",
      "compress pdf for gmail attachment",
    ],
  faqs: [
      { q: "Why outcome buttons instead of Light / Balanced / Maximum?", a: "Because nobody knows what 'Balanced' means until they try it. You DO know where you're sending the PDF - email, WhatsApp, a govt portal. The tool aims for the actual limit." },
      { q: "What if my PDF is already smaller than the target?", a: "Then it just downloads (almost) untouched. You can't make a 200KB file smaller by 'compressing it for email'." },
      { q: "What does 'Best quality' do?", a: "Runs the lightest compression preset - mostly removes redundant streams and recompresses embedded images at high quality. Use this when file size isn't a constraint." },
      { q: "Can I set my own target size?", a: "Yes - open 'Advanced' under the buttons and type any value from 50 KB to 20 MB." },
      { q: "Does it preserve Bangla / Arabic / CJK fonts?", a: "Yes - text remains selectable in every output." },
    ],
  howTo: [
      { name: "Drop your PDF", text: "Up to 100 MB. Multi-page works." },
      { name: "Pick where you're sending it", text: "Email, WhatsApp, govt portal, or 'Best quality'. Each button knows the real size limit." },
      { name: "Download", text: "We shrink to fit, you download. Done." },
    ],
  seoCopy: "Compress PDF by outcome, not by guesswork. Pick the channel you're sending it to - Gmail (10 MB), WhatsApp (16 MB), a govt portal (1 MB), or best quality - and we shrink the file to fit. Files auto-delete after one hour. Works with English, Bangla, Arabic, and 100+ languages. If the file is already under the limit you picked it downloads essentially untouched, because there is nothing to gain from degrading it further. Open Advanced to type an exact target between 50KB and 20MB.",
};
