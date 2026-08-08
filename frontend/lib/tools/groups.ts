import { tools } from "@/lib/tools";
import type { Domain, ToolMeta } from "@/lib/tools/types";

/**
 * Sub-groups inside a hub.
 *
 * PDF has 30 tools; one undifferentiated grid of 30 is not a list anyone reads.
 * Splitting by job - compress, convert, organise, edit, secure - is how people
 * actually arrive ("I need to make this smaller"), so that is the grouping.
 *
 * Membership is explicit rather than derived from `operation`, because the
 * operation axis is about what the code does and these headings are about what
 * the user wants. Anything not listed falls into a trailing "More" group, so a
 * newly added tool is never silently dropped from its hub.
 */
export interface ToolGroup {
  title: string;
  slugs: string[];
}

const GROUPS: Partial<Record<Domain, ToolGroup[]>> = {
  pdf: [
    {
      title: "Compress",
      slugs: [
        "compress-pdf",
        "compress-pdf-to-100kb",
        "compress-pdf-to-200kb",
        "compress-pdf-to-500kb",
        "compress-pdf-to-1mb",
      ],
    },
    {
      title: "Convert",
      slugs: [
        "pdf-to-word", "word-to-pdf", "pdf-to-excel", "excel-to-pdf",
        "pdf-to-jpg", "jpg-to-pdf", "pdf-to-text", "pdf-ocr",
      ],
    },
    {
      title: "Organize pages",
      slugs: ["merge-pdf", "split-pdf", "organize-pdf", "rotate-pdf", "delete-pdf-pages"],
    },
    {
      title: "Edit",
      slugs: ["watermark-pdf", "add-page-numbers", "crop-pdf", "flatten-pdf", "repair-pdf"],
    },
    {
      title: "Protect",
      slugs: ["lock-pdf", "unlock-pdf", "redact-pdf"],
    },
    {
      title: "Specialised",
      slugs: ["sign-pdf", "compare-pdf", "nid-combine", "passport-photo-pdf"],
    },
  ],
  image: [
    {
      title: "Compress & resize",
      slugs: [
        "compress-image", "resize-image", "social-media-image-resizer",
        "photo-resizer-for-print", "crop-image",
      ],
    },
    {
      title: "Convert",
      slugs: ["jpg-to-png", "png-to-jpg", "webp-converter", "heic-to-jpg", "image-to-ico"],
    },
    { title: "Edit", slugs: ["watermark-image"] },
    { title: "Codes", slugs: ["qr-code-generator", "barcode-generator", "qr-scanner"] },
  ],
  calc: [
    {
      title: "Money",
      slugs: ["mortgage-calculator", "loan-emi-calculator", "discount-calculator", "tip-calculator"],
    },
    {
      title: "Health, dates & grades",
      slugs: ["bmi-calculator", "age-calculator", "date-difference-calculator", "gpa-calculator"],
    },
    { title: "Everyday maths", slugs: ["percentage-calculator", "unit-converter"] },
    {
      title: "Timers & random",
      slugs: [
        "countdown-timer", "stopwatch-online", "coin-flip", "dice-roller",
        "random-number-generator", "random-picker-wheel",
      ],
    },
  ],
  code: [
    { title: "Format & validate", slugs: ["json-formatter", "sql-formatter"] },
    { title: "Encode & decode", slugs: ["base64-encode-decode", "url-encoder-decoder", "jwt-decoder"] },
    { title: "Generate & test", slugs: ["uuid-generator", "regex-tester", "cron-expression-generator"] },
  ],
};

/**
 * Group a domain's tools for display.
 *
 * Always returns every tool in the domain: anything missing from the explicit
 * groups is appended under "More tools", so adding a registry entry can never
 * make it vanish from its hub.
 */
export function groupsForDomain(domain: Domain): ToolGroup[] {
  const inDomain = tools.filter((t) => t.domain === domain);
  const defined = GROUPS[domain];

  if (!defined) {
    return inDomain.length ? [{ title: "", slugs: inDomain.map((t) => t.slug) }] : [];
  }

  const bySlug = new Map(inDomain.map((t) => [t.slug, t]));
  const claimed = new Set<string>();
  const out: ToolGroup[] = [];

  for (const g of defined) {
    const present = g.slugs.filter((s) => bySlug.has(s));
    present.forEach((s) => claimed.add(s));
    if (present.length) out.push({ title: g.title, slugs: present });
  }

  const leftovers = inDomain.filter((t) => !claimed.has(t.slug)).map((t) => t.slug);
  if (leftovers.length) out.push({ title: "More tools", slugs: leftovers });

  return out;
}

/** Resolve a group's slugs to registry entries, preserving the listed order. */
export function toolsInGroup(group: ToolGroup): ToolMeta[] {
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  return group.slugs.map((s) => bySlug.get(s)).filter((t): t is ToolMeta => !!t);
}
