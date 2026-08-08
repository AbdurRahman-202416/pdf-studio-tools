/**
 * Text, code and data transforms.
 *
 * All pure and synchronous unless a transform needs a library, in which case it
 * is imported inside the function so the dependency only loads on the page that
 * uses it. Nothing here touches the network - that is the whole point of these
 * tools: you can paste production data in and it stays on your machine.
 */

export interface TransformResult {
  output: string;
  /** Optional key/value facts shown above the output. */
  stats?: Record<string, string | number>;
  language?: "json" | "yaml" | "sql" | "html" | "text";
}

export class TransformError extends Error {}

/* ---------------------------------- JSON --------------------------------- */

export function formatJson(input: string, indent = 2, sort = false): TransformResult {
  if (!input.trim()) return { output: "" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    // Browser JSON errors include a character position; surface it, since
    // "Unexpected token } in JSON at position 412" is the useful part.
    throw new TransformError(e instanceof Error ? e.message : "That isn't valid JSON.");
  }
  const replacer = sort
    ? (_k: string, v: unknown) =>
        v && typeof v === "object" && !Array.isArray(v)
          ? Object.fromEntries(Object.entries(v as object).sort(([a], [b]) => a.localeCompare(b)))
          : v
    : undefined;

  const output = JSON.stringify(parsed, replacer, indent === 0 ? undefined : indent);
  return {
    output,
    language: "json",
    stats: {
      "Original size": `${new Blob([input]).size} B`,
      "Formatted size": `${new Blob([output]).size} B`,
      "Top-level keys": Array.isArray(parsed)
        ? `${parsed.length} (array)`
        : parsed && typeof parsed === "object"
          ? Object.keys(parsed).length
          : "0 (scalar)",
    },
  };
}

/* --------------------------------- Base64 -------------------------------- */

/** btoa/atob are latin1-only, so round-trip through UTF-8 bytes. */
export function base64Encode(input: string, urlSafe = false): TransformResult {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  let out = btoa(bin);
  if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return { output: out };
}

export function base64Decode(input: string): TransformResult {
  const normalised = input.trim().replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalised + "=".repeat((4 - (normalised.length % 4)) % 4);
  try {
    const bin = atob(padded);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return { output: new TextDecoder().decode(bytes) };
  } catch {
    throw new TransformError("That isn't valid Base64.");
  }
}

/* ----------------------------------- JWT --------------------------------- */

export function decodeJwt(input: string): TransformResult {
  const parts = input.trim().split(".");
  if (parts.length < 2) {
    throw new TransformError("A JWT has three dot-separated parts: header.payload.signature.");
  }
  const decodePart = (p: string) => {
    const s = p.replace(/-/g, "+").replace(/_/g, "/");
    const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
    const bin = atob(padded);
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  };

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = decodePart(parts[0]!);
    payload = decodePart(parts[1]!);
  } catch {
    throw new TransformError("Could not decode that token - the header or payload isn't valid.");
  }

  const stats: Record<string, string | number> = {
    Algorithm: String(header.alg ?? "unknown"),
    Signature: parts[2] ? `${parts[2].slice(0, 12)}… (not verified)` : "missing",
  };
  const fmtTime = (v: unknown) =>
    typeof v === "number" ? new Date(v * 1000).toISOString().replace(".000", "") : null;
  const exp = fmtTime(payload.exp);
  const iat = fmtTime(payload.iat);
  if (iat) stats["Issued at"] = iat;
  if (exp) {
    const expired = (payload.exp as number) * 1000 < Date.now();
    stats["Expires"] = `${exp}${expired ? " — EXPIRED" : ""}`;
  }

  return {
    output: JSON.stringify({ header, payload }, null, 2),
    language: "json",
    stats,
  };
}

/* ---------------------------------- Hash --------------------------------- */

export async function hashText(
  input: string,
  algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
): Promise<TransformResult> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(input));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { output: hex, stats: { Algorithm: algo, Length: `${hex.length} hex chars` } };
}

/* ---------------------------------- URL ---------------------------------- */

export function urlEncode(input: string, component = true): TransformResult {
  return { output: component ? encodeURIComponent(input) : encodeURI(input) };
}

export function urlDecode(input: string): TransformResult {
  try {
    return { output: decodeURIComponent(input.replace(/\+/g, " ")) };
  } catch {
    throw new TransformError("That isn't a valid percent-encoded string.");
  }
}

/* ---------------------------------- UUID --------------------------------- */

export function generateUuids(count: number, uppercase = false): TransformResult {
  const list: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    list.push(uppercase ? id.toUpperCase() : id);
  }
  return { output: list.join("\n"), stats: { Version: "4 (random)", Generated: count } };
}

/* ---------------------------------- YAML --------------------------------- */

export async function yamlToJson(input: string): Promise<TransformResult> {
  if (!input.trim()) return { output: "" };
  const YAML = await import("js-yaml");
  try {
    const doc = YAML.load(input);
    return { output: JSON.stringify(doc, null, 2), language: "json" };
  } catch (e) {
    throw new TransformError(e instanceof Error ? e.message : "That isn't valid YAML.");
  }
}

export async function jsonToYaml(input: string): Promise<TransformResult> {
  if (!input.trim()) return { output: "" };
  const YAML = await import("js-yaml");
  try {
    return { output: YAML.dump(JSON.parse(input), { indent: 2, lineWidth: 100 }), language: "yaml" };
  } catch (e) {
    throw new TransformError(e instanceof Error ? e.message : "That isn't valid JSON.");
  }
}

/* ----------------------------------- CSV --------------------------------- */

/** Minimal RFC-4180 reader: handles quoted fields, escaped quotes, CRLF. */
export function parseCsv(input: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function csvToJson(input: string, delimiter = ","): TransformResult {
  if (!input.trim()) return { output: "" };
  const rows = parseCsv(input, delimiter).filter((r) => r.some((c) => c !== ""));
  if (!rows.length) throw new TransformError("No rows found in that CSV.");
  const [header, ...body] = rows;
  const out = body.map((r) =>
    Object.fromEntries(header!.map((h, i) => [h || `column_${i + 1}`, r[i] ?? ""])),
  );
  return {
    output: JSON.stringify(out, null, 2),
    language: "json",
    stats: { Rows: out.length, Columns: header!.length },
  };
}

export function jsonToCsv(input: string, delimiter = ","): TransformResult {
  if (!input.trim()) return { output: "" };
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new TransformError("That isn't valid JSON.");
  }
  if (!Array.isArray(data)) throw new TransformError("CSV needs an array of objects.");
  if (!data.length) return { output: "" };

  const keys = [...new Set(data.flatMap((r) => Object.keys(r as object)))];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /["\n\r]|^\s|\s$/.test(s) || s.includes(delimiter) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    keys.join(delimiter),
    ...data.map((r) => keys.map((k) => esc((r as Record<string, unknown>)[k])).join(delimiter)),
  ];
  return { output: lines.join("\n"), stats: { Rows: data.length, Columns: keys.length } };
}

/* --------------------------------- Markdown ------------------------------ */

export async function markdownToHtml(input: string): Promise<TransformResult> {
  if (!input.trim()) return { output: "" };
  const { marked } = await import("marked");
  const html = await marked.parse(input, { gfm: true, breaks: false });
  return { output: html, language: "html" };
}

/* ----------------------------------- SQL --------------------------------- */

export async function formatSql(input: string, dialect = "sql"): Promise<TransformResult> {
  if (!input.trim()) return { output: "" };
  const { format } = await import("sql-formatter");
  try {
    return {
      output: format(input, {
        language: dialect as "sql",
        keywordCase: "upper",
        tabWidth: 2,
      }),
      language: "sql",
    };
  } catch (e) {
    throw new TransformError(e instanceof Error ? e.message : "Could not parse that SQL.");
  }
}

/* --------------------------------- Counting ------------------------------ */

export function countText(input: string): TransformResult {
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const sentences = input.trim() ? (input.match(/[.!?]+(\s|$)/g) ?? []).length || 1 : 0;
  const paragraphs = input.trim() ? input.trim().split(/\n\s*\n/).length : 0;
  // ~200 wpm is the usual silent-reading estimate for adults.
  const minutes = Math.max(1, Math.round(words / 200));
  return {
    output: input,
    stats: {
      Words: words,
      Characters: input.length,
      "Characters (no spaces)": input.replace(/\s/g, "").length,
      Sentences: sentences,
      Paragraphs: paragraphs,
      Lines: input ? input.split("\n").length : 0,
      "Reading time": `~${minutes} min`,
    },
  };
}

/* ----------------------------------- Cron -------------------------------- */

const CRON_FIELDS = ["minute", "hour", "day of month", "month", "day of week"];

/**
 * Human-readable cron description.
 *
 * Deliberately hand-rolled rather than pulling a dependency: the common cases
 * are simple, and being explicit about what we *cannot* describe is more
 * honest than a library confidently mis-describing an exotic expression.
 */
export function describeCron(expr: string): TransformResult {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new TransformError(
      `A cron expression has 5 fields (${CRON_FIELDS.join(", ")}). You gave ${parts.length}.`,
    );
  }
  const [min, hour, dom, mon, dow] = parts as [string, string, string, string, string];

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const time =
    min === "*" && hour === "*"
      ? "every minute"
      : hour === "*"
        ? min.startsWith("*/")
          ? `every ${min.slice(2)} minutes`
          : `at minute ${min} of every hour`
        : min === "*"
          ? `every minute of hour ${hour}`
          : `at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;

  const day =
    dom === "*" && dow === "*"
      ? "every day"
      : dow !== "*"
        ? `on ${dow.split(",").map((d) => DAYS[Number(d) % 7] ?? d).join(", ")}`
        : `on day ${dom} of the month`;

  const month = mon === "*" ? "" : ` in ${mon.split(",").map((m) => MONTHS[Number(m) - 1] ?? m).join(", ")}`;

  return {
    output: `Runs ${time}, ${day}${month}.`,
    stats: Object.fromEntries(CRON_FIELDS.map((f, i) => [f, parts[i]!])),
  };
}

/* --------------------------------- Case ---------------------------------- */

export type CaseMode =
  | "upper" | "lower" | "title" | "sentence" | "camel" | "pascal"
  | "snake" | "kebab" | "constant" | "alternating" | "invert";

/** Words that stay lowercase in title case unless they lead the string. */
const MINOR_WORDS = new Set([
  "a","an","and","as","at","but","by","for","if","in","nor","of","on","or",
  "per","so","the","to","up","via","vs","yet",
]);

function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")   // split camelCase
    .replace(/[_\-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function changeCase(input: string, mode: CaseMode): TransformResult {
  if (!input) return { output: "" };
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  let output: string;

  switch (mode) {
    case "upper": output = input.toUpperCase(); break;
    case "lower": output = input.toLowerCase(); break;
    case "title":
      output = words(input)
        .map((w, i) =>
          i > 0 && MINOR_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : cap(w),
        )
        .join(" ");
      break;
    case "sentence":
      // Capitalise after ., ! and ? - lowercase everything else.
      output = input
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
      break;
    case "camel": {
      const w = words(input);
      output = w.map((x, i) => (i === 0 ? x.toLowerCase() : cap(x))).join("");
      break;
    }
    case "pascal": output = words(input).map(cap).join(""); break;
    case "snake": output = words(input).map((w) => w.toLowerCase()).join("_"); break;
    case "kebab": output = words(input).map((w) => w.toLowerCase()).join("-"); break;
    case "constant": output = words(input).map((w) => w.toUpperCase()).join("_"); break;
    case "alternating":
      output = [...input].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("");
      break;
    case "invert":
      output = [...input]
        .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
        .join("");
      break;
    default: output = input;
  }

  return {
    output,
    stats: {
      Characters: output.length,
      Words: output.trim() ? output.trim().split(/\s+/).length : 0,
    },
  };
}
