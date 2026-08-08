/**
 * Title-case a target keyword for use in the <title> tag.
 *
 * The registry stores each tool's `primaryKeyword` in lowercase (it is the
 * literal search query, e.g. "pdf to word converter online free"). Rendered
 * verbatim that produced all-lowercase SERP titles, which read as unfinished
 * and cost click-through. This casts the same words into a proper title
 * without inventing new ones, so the keyword the page targets is unchanged.
 *
 * It is deliberately conservative: it fixes casing only. It never reorders,
 * adds, or drops words.
 */

// Tokens that must render fully uppercase.
const ACRONYMS = new Set([
  "pdf", "jpg", "jpeg", "png", "gif", "bmp", "tiff", "svg", "ico",
  "ocr", "qr", "csv", "json", "yaml", "xml", "sql", "url", "uri",
  "jwt", "uuid", "html", "css", "rgb", "hsl", "cmyk", "id", "nid",
  "us", "uk", "eu", "gpa", "bmi", "emi", "api", "pdf/a", "a4",
]);

// Tokens with irregular internal casing.
const SPECIAL: Record<string, string> = {
  webp: "WebP",
  heic: "HEIC",
  heif: "HEIF",
  sha256: "SHA-256",
  sha1: "SHA-1",
  md5: "MD5",
  base64: "Base64",
  javascript: "JavaScript",
  ios: "iOS",
};

// Lowercase these unless they are the first word.
const MINOR = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from", "in",
  "of", "on", "or", "per", "the", "to", "vs", "via", "with",
]);

function castWord(word: string, isFirst: boolean): string {
  const lower = word.toLowerCase();

  // "100kb" / "1mb" / "2gb" -> uppercase unit, keep the number.
  const size = /^(\d+(?:\.\d+)?)(kb|mb|gb|tb|dpi|px)$/i.exec(word);
  if (size) return `${size[1]}${size[2].toUpperCase()}`;

  if (SPECIAL[lower]) return SPECIAL[lower];
  if (ACRONYMS.has(lower)) return lower.toUpperCase();
  if (!isFirst && MINOR.has(lower)) return lower;

  // Leave tokens that already mix case alone (rare, but don't clobber them).
  if (word !== lower && word !== word.toUpperCase()) return word;

  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function toSeoTitle(keyword: string): string {
  const words = keyword.trim().split(/\s+/);
  return words
    .map((w, i) => castWord(w, i === 0))
    .join(" ");
}
