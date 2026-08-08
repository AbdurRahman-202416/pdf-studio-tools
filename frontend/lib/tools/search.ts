import { tools } from "@/lib/tools";
import type { ToolMeta } from "@/lib/tools/types";

/**
 * Search index for the command palette.
 *
 * Built from the slim registry only - the SEO prose lives behind `server-only`
 * and must never be pulled in here, since this ships to every browser.
 *
 * File extensions are indexed explicitly because that is how people actually
 * search for these: someone types "png", not "portable network graphics".
 */
const EXTENSION_HINTS: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg", "photo", "picture"],
  "image/png": ["png", "screenshot", "transparent"],
  "image/webp": ["webp"],
  "image/heic": ["heic", "heif", "iphone", "apple"],
  "application/pdf": ["pdf", "document"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx", "excel", "spreadsheet"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx", "word"],
};

const DOMAIN_WORDS: Record<string, string[]> = {
  pdf: ["pdf", "document"],
  image: ["image", "photo", "picture", "graphic"],
  text: ["text", "string", "writing"],
  data: ["data", "table"],
  code: ["code", "developer", "dev", "programming"],
  color: ["color", "colour", "palette", "hex", "rgb"],
  convert: ["convert", "converter"],
  calc: ["calculator", "calculate", "maths", "math", "finance"],
  security: ["security", "password", "secure", "encrypt"],
};

export interface SearchEntry {
  tool: ToolMeta;
  haystack: string;
}

export const searchIndex: SearchEntry[] = tools.map((tool) => {
  const words = new Set<string>([
    tool.slug.replace(/-/g, " "),
    tool.cardTitle.toLowerCase(),
    tool.cardBlurb.toLowerCase(),
    tool.domain,
    tool.operation,
    ...(DOMAIN_WORDS[tool.domain] ?? []),
    ...(tool.accepts ?? []).flatMap((m) => EXTENSION_HINTS[m] ?? []),
  ]);
  return { tool, haystack: [...words].join(" ").toLowerCase() };
});

/**
 * Subsequence match: "ctpdf" finds "Compress To PDF".
 *
 * Cheap enough to run over the whole catalogue on every keystroke, and it
 * tolerates the abbreviations people type in a palette.
 */
function fuzzyScore(haystack: string, needle: string): number {
  if (!needle) return 0;
  if (haystack.includes(needle)) {
    // Prefer matches at a word boundary over ones buried mid-token.
    const at = haystack.indexOf(needle);
    const boundary = at === 0 || haystack[at - 1] === " ";
    return 1000 - at + (boundary ? 500 : 0);
  }

  let score = 0;
  let i = 0;
  let streak = 0;
  for (const ch of needle) {
    const found = haystack.indexOf(ch, i);
    if (found === -1) return 0;
    streak = found === i ? streak + 1 : 0;
    score += 10 + streak * 5;
    i = found + 1;
  }
  return score;
}

/**
 * Suggestions shown before the user types anything.
 *
 * NOT registry order. Raw order starts with five near-identical
 * "Compress PDF to <size>" entries, so opening search on an 81-tool,
 * 9-category site used to look like a PDF-only site - undoing the work the
 * rest of the page does to show breadth.
 *
 * Instead: the curated `featured` set (which deliberately spans domains),
 * then one tool per remaining domain, so the default view is a cross-section
 * of the whole catalogue.
 */
export function defaultSuggestions(limit = 8): ToolMeta[] {
  // Bucket by domain, then take round-robin. Featured tools are listed in
  // registry order, which clusters them (3 PDF, then 3 image) - interleaving
  // means the visible top of the list is a different category on every row.
  const buckets = new Map<string, ToolMeta[]>();
  const push = (t: ToolMeta) => {
    const b = buckets.get(t.domain) ?? [];
    b.push(t);
    buckets.set(t.domain, b);
  };

  for (const t of tools) if (t.featured) push(t);
  // Top up from trending so every domain can contribute a row.
  for (const t of tools) if (!t.featured && t.trending && !buckets.has(t.domain)) push(t);
  for (const t of tools) if (!buckets.has(t.domain)) push(t);

  const lists = [...buckets.values()];
  const out: ToolMeta[] = [];
  for (let round = 0; out.length < limit; round++) {
    let added = false;
    for (const list of lists) {
      const t = list[round];
      if (!t) continue;
      out.push(t);
      added = true;
      if (out.length === limit) break;
    }
    if (!added) break;
  }
  return out;
}

export function searchTools(query: string, limit = 8): ToolMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return defaultSuggestions(limit);
  }
  return searchIndex
    .map((e) => ({ tool: e.tool, score: fuzzyScore(e.haystack, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.tool);
}
