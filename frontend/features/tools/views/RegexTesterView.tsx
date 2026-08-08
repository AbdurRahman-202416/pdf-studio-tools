"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Regex } from "lucide-react";

import { ToolShell } from "@/features/tools/components/ToolShell";

const FLAGS = [
  { flag: "g", label: "global", hint: "find all matches, not just the first" },
  { flag: "i", label: "ignore case", hint: "" },
  { flag: "m", label: "multiline", hint: "^ and $ match line starts/ends" },
  { flag: "s", label: "dotall", hint: ". also matches newlines" },
  { flag: "u", label: "unicode", hint: "" },
];

const SAMPLE_PATTERN = "(\\w+)@(\\w+\\.\\w+)";
const SAMPLE_TEXT =
  "Write to ada@example.com or grace@navy.mil.\nBounced: not-an-email@ , also fine: linus@kernel.org";

interface Match {
  index: number;
  text: string;
  groups: string[];
  named: Record<string, string>;
}

/**
 * Matching runs in a Worker so the main thread survives catastrophic
 * backtracking. A pattern like `(a+)+b` blows up INSIDE a single `exec` call -
 * measured 20s for 28 characters, exponential after that - so no counter or
 * cap on the main thread can help; the only reliable guard is a thread you
 * can terminate. The watchdog below kills the worker after 2s.
 */
const WORKER_SRC = `
self.onmessage = (e) => {
  const { pattern, flags, text } = e.data;
  let matches = [];
  let error = null;
  try {
    // Force \`g\` for scanning; the visible flag set still drives semantics.
    const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    let m;
    let guard = 0;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        index: m.index,
        text: m[0],
        groups: m.slice(1).map((g) => (g === undefined ? "" : g)),
        named: Object.assign({}, m.groups || {}),
      });
      // A pattern that can match empty advances nowhere - step manually or spin.
      if (m[0] === "") re.lastIndex++;
      if (!flags.includes("g")) break;
      if (++guard > 5000) break;
    }
  } catch (err) {
    error = err && err.message ? err.message : "Invalid pattern";
    matches = [];
  }
  self.postMessage({ matches, error });
};
`;

const TIMEOUT_MSG =
  "Stopped after 2 seconds - this pattern backtracks catastrophically on this text. " +
  "Nested quantifiers like (a+)+ are the usual cause.";

export function RegexTesterView() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState(SAMPLE_TEXT);
  const [result, setResult] = useState<{ matches: Match[]; error: string | null }>({
    matches: [],
    error: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const watchdogRef = useRef<number | undefined>(undefined);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pattern) return;
    // Small debounce so fast typing spawns one job, not one per keystroke.
    const debounce = window.setTimeout(() => {
      window.clearTimeout(watchdogRef.current);
      workerRef.current?.terminate();
      if (!blobUrlRef.current) {
        blobUrlRef.current = URL.createObjectURL(
          new Blob([WORKER_SRC], { type: "text/javascript" }),
        );
      }
      const w = new Worker(blobUrlRef.current);
      workerRef.current = w;
      w.onmessage = (e: MessageEvent<{ matches: Match[]; error: string | null }>) => {
        window.clearTimeout(watchdogRef.current);
        setResult(e.data);
      };
      watchdogRef.current = window.setTimeout(() => {
        w.terminate();
        if (workerRef.current === w) workerRef.current = null;
        setResult({ matches: [], error: TIMEOUT_MSG });
      }, 2000);
      w.postMessage({ pattern, flags, text });
    }, 120);
    return () => window.clearTimeout(debounce);
  }, [pattern, flags, text]);

  useEffect(
    () => () => {
      window.clearTimeout(watchdogRef.current);
      workerRef.current?.terminate();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    },
    [],
  );

  const { matches, error } = pattern ? result : { matches: [] as Match[], error: null };

  const highlighted = useMemo(() => {
    if (error || !matches.length) return null;
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    matches.forEach((m, i) => {
      if (m.index > cursor) parts.push(text.slice(cursor, m.index));
      parts.push(
        <mark
          key={i}
          className="rounded bg-[rgb(var(--primary)/0.25)] px-0.5 text-foreground"
        >
          {m.text}
        </mark>,
      );
      cursor = m.index + m.text.length;
    });
    if (cursor < text.length) parts.push(text.slice(cursor));
    return parts;
  }, [matches, text, error]);

  function toggleFlag(f: string) {
    setFlags((cur) => (cur.includes(f) ? cur.replace(f, "") : cur + f));
  }

  return (
    <ToolShell
      title="Regex Tester"
      subtitle="Test a pattern against real text and see every match, group and index as you type."
      icon={Regex}
      badge="In your browser"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Pattern</span>
            <div className="flex items-center gap-2">
              <span className="tabular text-muted-foreground">/</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
                data-testid="regex-pattern"
                aria-label="Regular expression"
                aria-invalid={!!error}
                className="tabular flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="tabular text-muted-foreground">/{flags}</span>
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            {FLAGS.map((f) => (
              <button
                key={f.flag}
                onClick={() => toggleFlag(f.flag)}
                title={f.hint}
                data-testid={`flag-${f.flag}`}
                aria-pressed={flags.includes(f.flag)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  flags.includes(f.flag)
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="tabular">{f.flag}</span> {f.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert" data-testid="regex-error">
              {error}
            </p>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Test against</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              data-testid="regex-text"
              aria-label="Test text"
              className="tabular h-64 w-full resize-y rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Highlighted ({matches.length} {matches.length === 1 ? "match" : "matches"})
            </span>
            <div
              className="tabular h-64 w-full overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-3.5 text-sm"
              data-testid="regex-highlight"
              aria-live="polite"
            >
              {highlighted ?? (
                <span className="text-muted-foreground">
                  {error ? "Fix the pattern to see matches." : "No matches."}
                </span>
              )}
            </div>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5" data-testid="regex-matches">
            <p className="mb-3 text-sm font-semibold">Matches</p>
            <ol className="space-y-2">
              {matches.slice(0, 50).map((m, i) => (
                <li key={i} className="rounded-xl border border-border bg-background px-3.5 py-2.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="tabular text-sm font-medium">{m.text}</span>
                    <span className="tabular text-xs text-muted-foreground">at {m.index}</span>
                  </div>
                  {m.groups.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.groups.map((g, gi) => (
                        <span
                          key={gi}
                          className="tabular rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          ${gi + 1}: {g || "(empty)"}
                        </span>
                      ))}
                      {Object.entries(m.named).map(([k, v]) => (
                        <span
                          key={k}
                          className="tabular rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
            {matches.length > 50 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Showing the first 50 of {matches.length}.
              </p>
            )}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
