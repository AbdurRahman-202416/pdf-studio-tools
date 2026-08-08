import "server-only";

import type { ToolContent } from "@/lib/tools/types";

/**
 * Server-only content loaders. Each tool's SEO prose is a separate module so
 * it is loaded per-route and can never be pulled into a client bundle.
 */
const LOADERS: Record<string, () => Promise<{ content: ToolContent }>> = {
  "compress-pdf": () => import("./pdf/compress-pdf"),
  "compress-pdf-to-100kb": () => import("./pdf/compress-pdf-to-100kb"),
  "compress-pdf-to-200kb": () => import("./pdf/compress-pdf-to-200kb"),
  "compress-pdf-to-500kb": () => import("./pdf/compress-pdf-to-500kb"),
  "compress-pdf-to-1mb": () => import("./pdf/compress-pdf-to-1mb"),
  "merge-pdf": () => import("./pdf/merge-pdf"),
  "pdf-to-jpg": () => import("./pdf/pdf-to-jpg"),
  "jpg-to-pdf": () => import("./pdf/jpg-to-pdf"),
  "lock-pdf": () => import("./pdf/lock-pdf"),
  "unlock-pdf": () => import("./pdf/unlock-pdf"),
  "pdf-ocr": () => import("./pdf/pdf-ocr"),
  "nid-combine": () => import("./pdf/nid-combine"),
  "passport-photo-pdf": () => import("./pdf/passport-photo-pdf"),
  "pdf-to-excel": () => import("./pdf/pdf-to-excel"),
  "excel-to-pdf": () => import("./pdf/excel-to-pdf"),
  "pdf-to-word": () => import("./pdf/pdf-to-word"),
  "word-to-pdf": () => import("./pdf/word-to-pdf"),
  "sign-pdf": () => import("./pdf/sign-pdf"),
  "split-pdf": () => import("./pdf/split-pdf"),
  "rotate-pdf": () => import("./pdf/rotate-pdf"),
  "delete-pdf-pages": () => import("./pdf/delete-pdf-pages"),
  "compress-image": () => import("./image/compress-image"),
  "resize-image": () => import("./image/resize-image"),
  "jpg-to-png": () => import("./image/jpg-to-png"),
  "png-to-jpg": () => import("./image/png-to-jpg"),
  "webp-converter": () => import("./image/webp-converter"),
  "heic-to-jpg": () => import("./image/heic-to-jpg"),
  "crop-image": () => import("./image/crop-image"),
  "watermark-image": () => import("./image/watermark-image"),
  "image-to-ico": () => import("./image/image-to-ico"),
  "qr-code-generator": () => import("./image/qr-code-generator"),
  "barcode-generator": () => import("./image/barcode-generator"),
  "qr-scanner": () => import("./image/qr-scanner"),
  "password-generator": () => import("./security/password-generator"),
  "color-picker": () => import("./color/color-picker"),
  "color-converter": () => import("./color/color-converter"),
  "timestamp-converter": () => import("./convert/timestamp-converter"),
  "json-formatter": () => import("./code/json-formatter"),
  "base64-encode-decode": () => import("./code/base64-encode-decode"),
  "jwt-decoder": () => import("./code/jwt-decoder"),
  "hash-generator": () => import("./security/hash-generator"),
  "uuid-generator": () => import("./code/uuid-generator"),
  "regex-tester": () => import("./code/regex-tester"),
  "url-encoder-decoder": () => import("./code/url-encoder-decoder"),
  "cron-expression-generator": () => import("./code/cron-expression-generator"),
  "sql-formatter": () => import("./code/sql-formatter"),
  "yaml-to-json": () => import("./data/yaml-to-json"),
  "csv-to-json": () => import("./data/csv-to-json"),
  "markdown-to-html": () => import("./text/markdown-to-html"),
  "diff-checker": () => import("./text/diff-checker"),
  "word-counter": () => import("./text/word-counter"),
  "watermark-pdf": () => import("./pdf/watermark-pdf"),
  "add-page-numbers": () => import("./pdf/add-page-numbers"),
  "crop-pdf": () => import("./pdf/crop-pdf"),
  "flatten-pdf": () => import("./pdf/flatten-pdf"),
  "organize-pdf": () => import("./pdf/organize-pdf"),
  "redact-pdf": () => import("./pdf/redact-pdf"),
  "repair-pdf": () => import("./pdf/repair-pdf"),
  "mortgage-calculator": () => import("./calc/mortgage-calculator"),
  "loan-emi-calculator": () => import("./calc/loan-emi-calculator"),
  "percentage-calculator": () => import("./calc/percentage-calculator"),
  "age-calculator": () => import("./calc/age-calculator"),
  "date-difference-calculator": () => import("./calc/date-difference-calculator"),
  "bmi-calculator": () => import("./calc/bmi-calculator"),
  "discount-calculator": () => import("./calc/discount-calculator"),
  "tip-calculator": () => import("./calc/tip-calculator"),
  "gpa-calculator": () => import("./calc/gpa-calculator"),
  "unit-converter": () => import("./calc/unit-converter"),
  "case-converter": () => import("./text/case-converter"),
  "social-media-image-resizer": () => import("./image/social-media-image-resizer"),
  "photo-resizer-for-print": () => import("./image/photo-resizer-for-print"),
  "password-strength-checker": () => import("./security/password-strength-checker"),
  "pdf-to-text": () => import("./pdf/pdf-to-text"),
  "compare-pdf": () => import("./pdf/compare-pdf"),
  "coin-flip": () => import("./calc/coin-flip"),
  "dice-roller": () => import("./calc/dice-roller"),
  "random-number-generator": () => import("./calc/random-number-generator"),
  "random-picker-wheel": () => import("./calc/random-picker-wheel"),
  "random-name-generator": () => import("./text/random-name-generator"),
  "countdown-timer": () => import("./calc/countdown-timer"),
  "stopwatch-online": () => import("./calc/stopwatch-online"),
};

export async function getToolContent(slug: string): Promise<ToolContent | undefined> {
  const load = LOADERS[slug];
  if (!load) return undefined;
  return (await load()).content;
}

/** All content, for build-time validation only. Never call from a request path. */
export async function allToolContent(): Promise<ToolContent[]> {
  return Promise.all(Object.values(LOADERS).map(async (l) => (await l()).content));
}
