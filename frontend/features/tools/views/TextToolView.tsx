"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Check, Copy, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { getToolIcon } from "@/lib/seo/tool-icons";
import { downloadBlob } from "@/lib/utils";
import type { TransformResult } from "@/lib/tools/client/text";

type Mod = typeof import("@/lib/tools/client/text");

interface Choice {
  value: string;
  label: string;
}

interface Config {
  title: string;
  subtitle: string;
  iconName: string;
  placeholder: string;
  sample: string;
  /** Two-way tools expose a direction switch. */
  directions?: [Choice, Choice];
  options?: { key: string; label: string; choices: Choice[]; default: string };
  /** No input box - the tool only generates. */
  generateOnly?: boolean;
  outputLabel?: string;
  run: (m: Mod, input: string, o: Record<string, string>, dir: string) => TransformResult | Promise<TransformResult>;
}

export const TEXT_TOOLS: Record<string, Config> = {
  "json-formatter": {
    title: "JSON Formatter",
    subtitle: "Format, validate and minify JSON. Errors point at the exact character.",
    iconName: "Braces",
    placeholder: '{"name":"ada","langs":["js","py"],"active":true}',
    sample: '{"name":"ada","langs":["js","py"],"active":true,"meta":{"id":7,"tags":[]}}',
    options: {
      key: "indent",
      label: "Indent",
      choices: [
        { value: "2", label: "2 spaces" },
        { value: "4", label: "4 spaces" },
        { value: "0", label: "Minify" },
      ],
      default: "2",
    },
    run: (m, i, o) => m.formatJson(i, Number(o.indent ?? 2)),
  },
  "base64-encode-decode": {
    title: "Base64 Encode / Decode",
    subtitle: "UTF-8 safe both ways, with URL-safe output when you need it.",
    iconName: "Binary",
    placeholder: "Text to encode, or Base64 to decode",
    sample: "Hello, world — with a unicode em dash",
    directions: [
      { value: "encode", label: "Encode" },
      { value: "decode", label: "Decode" },
    ],
    options: {
      key: "variant",
      label: "Variant",
      choices: [
        { value: "standard", label: "Standard" },
        { value: "urlsafe", label: "URL-safe" },
      ],
      default: "standard",
    },
    run: (m, i, o, dir) =>
      dir === "decode" ? m.base64Decode(i) : m.base64Encode(i, o.variant === "urlsafe"),
  },
  "jwt-decoder": {
    title: "JWT Decoder",
    subtitle: "Read the header and claims of a token. Decoded locally, never sent anywhere.",
    iconName: "KeySquare",
    placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature",
    sample:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.dummy-signature",
    run: (m, i) => m.decodeJwt(i),
  },
  "hash-generator": {
    title: "Hash Generator",
    subtitle: "SHA-1, SHA-256, SHA-384 and SHA-512 via the browser's WebCrypto.",
    iconName: "Fingerprint",
    placeholder: "Text to hash",
    sample: "correct horse battery staple",
    options: {
      key: "algo",
      label: "Algorithm",
      choices: [
        { value: "SHA-256", label: "SHA-256" },
        { value: "SHA-1", label: "SHA-1" },
        { value: "SHA-384", label: "SHA-384" },
        { value: "SHA-512", label: "SHA-512" },
      ],
      default: "SHA-256",
    },
    run: (m, i, o) => m.hashText(i, (o.algo ?? "SHA-256") as "SHA-256"),
  },
  "uuid-generator": {
    title: "UUID Generator",
    subtitle: "Version 4 UUIDs from the browser's cryptographic randomness.",
    iconName: "Hash",
    placeholder: "",
    sample: "",
    generateOnly: true,
    options: {
      key: "count",
      label: "How many",
      choices: [
        { value: "1", label: "1" },
        { value: "5", label: "5" },
        { value: "10", label: "10" },
        { value: "50", label: "50" },
      ],
      default: "5",
    },
    run: (m, _i, o) => m.generateUuids(Number(o.count ?? 5)),
  },
  "url-encoder-decoder": {
    title: "URL Encoder / Decoder",
    subtitle: "Percent-encoding for query strings and paths, both directions.",
    iconName: "Link2",
    placeholder: "https://example.com/search?q=hello world&lang=en",
    sample: "https://example.com/search?q=hello world & more",
    directions: [
      { value: "encode", label: "Encode" },
      { value: "decode", label: "Decode" },
    ],
    options: {
      key: "scope",
      label: "Scope",
      choices: [
        { value: "component", label: "Component (query values)" },
        { value: "full", label: "Full URL" },
      ],
      default: "component",
    },
    run: (m, i, o, dir) =>
      dir === "decode" ? m.urlDecode(i) : m.urlEncode(i, o.scope !== "full"),
  },
  "yaml-to-json": {
    title: "YAML to JSON",
    subtitle: "Convert YAML to JSON and back, with real parse errors rather than guesses.",
    iconName: "FileJson",
    placeholder: "name: ada\nlangs:\n  - js\n  - py",
    sample: "name: ada\nactive: true\nlangs:\n  - js\n  - py\nmeta:\n  id: 7",
    directions: [
      { value: "toJson", label: "YAML → JSON" },
      { value: "toYaml", label: "JSON → YAML" },
    ],
    run: (m, i, _o, dir) => (dir === "toYaml" ? m.jsonToYaml(i) : m.yamlToJson(i)),
  },
  "csv-to-json": {
    title: "CSV to JSON",
    subtitle: "Quoted fields, embedded commas and CRLF all handled properly.",
    iconName: "Table2",
    placeholder: "name,role\nAda,Engineer\nGrace,Admiral",
    sample: 'name,role,note\nAda,Engineer,"Wrote the first algorithm"\nGrace,Admiral,"Coined ""debugging"""',
    directions: [
      { value: "toJson", label: "CSV → JSON" },
      { value: "toCsv", label: "JSON → CSV" },
    ],
    options: {
      key: "delimiter",
      label: "Delimiter",
      choices: [
        { value: ",", label: "Comma" },
        { value: ";", label: "Semicolon" },
        { value: "\t", label: "Tab" },
      ],
      default: ",",
    },
    run: (m, i, o, dir) =>
      dir === "toCsv" ? m.jsonToCsv(i, o.delimiter ?? ",") : m.csvToJson(i, o.delimiter ?? ","),
  },
  "markdown-to-html": {
    title: "Markdown to HTML",
    subtitle: "GitHub-flavoured markdown rendered to clean HTML you can paste anywhere.",
    iconName: "FileCode",
    placeholder: "# Title\n\nSome **bold** text and a [link](https://example.com).",
    sample:
      "# Release notes\n\nShipped **37 tools** today.\n\n- Images run in the browser\n- PDFs run on the server\n\n> Nothing is uploaded unless it has to be.\n\n| Tool | Runtime |\n| --- | --- |\n| Compress image | client |\n| HEIC to JPG | server |",
    run: (m, i) => m.markdownToHtml(i),
  },
  "sql-formatter": {
    title: "SQL Formatter",
    subtitle: "Readable indentation and uppercased keywords, for several dialects.",
    iconName: "Database",
    placeholder: "select * from users u join orders o on o.user_id=u.id where u.active=1",
    sample:
      "select u.id,u.name,count(o.id) as orders from users u left join orders o on o.user_id=u.id where u.active=1 and u.created_at>'2026-01-01' group by u.id,u.name having count(o.id)>3 order by orders desc limit 20",
    options: {
      key: "dialect",
      label: "Dialect",
      choices: [
        { value: "sql", label: "Standard SQL" },
        { value: "postgresql", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
        { value: "sqlite", label: "SQLite" },
        { value: "bigquery", label: "BigQuery" },
      ],
      default: "sql",
    },
    run: (m, i, o) => m.formatSql(i, o.dialect ?? "sql"),
  },
  "word-counter": {
    title: "Word Counter",
    subtitle: "Words, characters, sentences, paragraphs and a reading-time estimate.",
    iconName: "Type",
    placeholder: "Paste or type your text",
    sample:
      "The best tools disappear. You arrive with a problem, the problem goes away, and you leave without having learned an interface.\n\nThat is the whole ambition here.",
    outputLabel: "Your text",
    run: (m, i) => m.countText(i),
  },
  "case-converter": {
    title: "Case Converter",
    subtitle: "Every case you actually need, including the programming ones.",
    iconName: "CaseSensitive",
    placeholder: "the quick brown fox jumps over the lazy dog",
    sample: "the quick brown fox jumps over the lazy dog",
    options: {
      key: "mode",
      label: "Convert to",
      choices: [
        { value: "upper", label: "UPPER CASE" },
        { value: "lower", label: "lower case" },
        { value: "title", label: "Title Case" },
        { value: "sentence", label: "Sentence case" },
        { value: "camel", label: "camelCase" },
        { value: "pascal", label: "PascalCase" },
        { value: "snake", label: "snake_case" },
        { value: "kebab", label: "kebab-case" },
        { value: "constant", label: "CONSTANT_CASE" },
        { value: "alternating", label: "aLtErNaTiNg" },
        { value: "invert", label: "iNVERT cASE" },
      ],
      default: "title",
    },
    run: (m, i, o) => m.changeCase(i, (o.mode ?? "title") as "title"),
  },
  "cron-expression-generator": {
    title: "Cron Expression Explainer",
    subtitle: "Paste a cron line and read back, in English, when it actually runs.",
    iconName: "Clock",
    placeholder: "*/15 * * * *",
    sample: "30 2 * * 1",
    outputLabel: "In plain English",
    run: (m, i) => m.describeCron(i),
  },
};

export function TextToolView({ slug }: { slug: string }) {
  const cfg = TEXT_TOOLS[slug];
  const [mod, setMod] = useState<Mod | null>(null);
  const [input, setInput] = useState("");
  const [dir, setDir] = useState(cfg?.directions?.[0]?.value ?? "");
  const [opts, setOpts] = useState<Record<string, string>>(
    cfg?.options ? { [cfg.options.key]: cfg.options.default } : {},
  );
  const [result, setResult] = useState<TransformResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let live = true;
    import("@/lib/tools/client/text").then((m) => live && setMod(m));
    return () => {
      live = false;
    };
  }, []);

  const compute = useCallback(async () => {
    if (!cfg || !mod) return;
    if (!cfg.generateOnly && !input.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    try {
      const r = await cfg.run(mod, input, opts, dir);
      setResult(r);
      setError(null);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Could not process that input.");
    }
  }, [cfg, mod, input, opts, dir]);

  // Debounced so a long paste doesn't re-run on every keystroke.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(compute, 180);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [compute]);

  if (!cfg) return null;
  const Icon = getToolIcon(cfg.iconName) ?? getToolIcon("FileText")!;

  async function copy() {
    if (!result?.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1400);
  }

  function download() {
    if (!result?.output) return;
    const ext = result.language === "json" ? "json" : result.language === "yaml" ? "yaml" : result.language === "html" ? "html" : result.language === "sql" ? "sql" : "txt";
    downloadBlob(new Blob([result.output], { type: "text/plain" }), `${slug}.${ext}`);
  }

  return (
    <ToolShell title={cfg.title} subtitle={cfg.subtitle} icon={Icon} badge="In your browser">
      <div className="space-y-5">
        {(cfg.directions || cfg.options) && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
            {cfg.directions && (
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Direction">
                {cfg.directions.map((d) => (
                  <button
                    key={d.value}
                    role="tab"
                    aria-selected={dir === d.value}
                    onClick={() => setDir(d.value)}
                    data-testid={`dir-${d.value}`}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      dir === d.value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
                <ArrowLeftRight className="ml-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              </div>
            )}
            {cfg.options && (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-xs font-medium text-muted-foreground">
                  {cfg.options.label}
                </span>
                <select
                  value={opts[cfg.options.key] ?? cfg.options.default}
                  onChange={(e) => setOpts({ ...opts, [cfg.options!.key]: e.target.value })}
                  data-testid="tool-option"
                  aria-label={cfg.options.label}
                  className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {cfg.options.choices.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {cfg.generateOnly && (
              <Button onClick={compute} data-testid="generate">
                Generate
              </Button>
            )}
          </div>
        )}

        <div className={cfg.generateOnly ? "" : "grid gap-4 lg:grid-cols-2"}>
          {!cfg.generateOnly && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="tool-input" className="text-xs font-medium text-muted-foreground">
                  Input
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setInput(cfg.sample)}
                    className="text-xs text-primary hover:underline"
                    data-testid="load-sample"
                  >
                    Load sample
                  </button>
                  <button
                    onClick={() => setInput("")}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    aria-label="Clear input"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                </div>
              </div>
              <textarea
                id="tool-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={cfg.placeholder}
                spellCheck={false}
                data-testid="tool-input"
                className="tabular h-72 w-full resize-y rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {cfg.outputLabel ?? "Output"}
              </span>
              {result?.output && (
                <div className="flex gap-3">
                  <button
                    onClick={copy}
                    data-testid="copy-output"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={download}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                </div>
              )}
            </div>
            <output
              data-testid="tool-output"
              aria-live="polite"
              className={`tabular block h-72 w-full overflow-auto whitespace-pre-wrap break-words rounded-xl border p-3.5 text-sm ${
                error ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"
              }`}
            >
              {error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                result?.output || (
                  <span className="text-muted-foreground">
                    {cfg.generateOnly ? "Press Generate." : "Output appears here as you type."}
                  </span>
                )
              )}
            </output>
          </div>
        </div>

        {result?.stats && Object.keys(result.stats).length > 0 && (
          <dl
            className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3"
            data-testid="tool-stats"
          >
            {Object.entries(result.stats).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {k}
                </dt>
                <dd className="tabular text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </ToolShell>
  );
}
