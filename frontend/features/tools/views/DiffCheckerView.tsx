"use client";

import { useMemo, useState } from "react";
import { GitCompare } from "lucide-react";

import { ToolShell } from "@/features/tools/components/ToolShell";

type Op = "same" | "add" | "remove";
interface Row {
  op: Op;
  left?: number;
  right?: number;
  text: string;
}

/**
 * Line diff via a classic LCS table.
 *
 * Hand-rolled rather than pulling a dependency: the algorithm is short, and
 * a diff library would ship far more than we need for a line-level compare.
 * The table is O(n*m), so very large inputs are capped below.
 */
function diffLines(a: string[], b: string[]): Row[] {
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] = a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  const rows: Row[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({ op: "same", left: i + 1, right: j + 1, text: a[i]! });
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      rows.push({ op: "remove", left: i + 1, text: a[i]! });
      i++;
    } else {
      rows.push({ op: "add", right: j + 1, text: b[j]! });
      j++;
    }
  }
  while (i < n) rows.push({ op: "remove", left: ++i, text: a[i - 1]! });
  while (j < m) rows.push({ op: "add", right: ++j, text: b[j - 1]! });
  return rows;
}

const MAX_LINES = 2000;

export function DiffCheckerView() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [onlyChanges, setOnlyChanges] = useState(false);

  const { rows, truncated } = useMemo(() => {
    const prep = (s: string) => {
      const lines = s.split("\n");
      const cut = lines.length > MAX_LINES;
      const use = cut ? lines.slice(0, MAX_LINES) : lines;
      return { lines: ignoreWhitespace ? use.map((l) => l.trim()) : use, cut };
    };
    const A = prep(left);
    const B = prep(right);
    if (!left && !right) return { rows: [] as Row[], truncated: false };
    return { rows: diffLines(A.lines, B.lines), truncated: A.cut || B.cut };
  }, [left, right, ignoreWhitespace]);

  const added = rows.filter((r) => r.op === "add").length;
  const removed = rows.filter((r) => r.op === "remove").length;
  const visible = onlyChanges ? rows.filter((r) => r.op !== "same") : rows;

  return (
    <ToolShell
      title="Diff Checker"
      subtitle="Compare two blocks of text line by line. Nothing is uploaded, so pasting real files is fine."
      icon={GitCompare}
      badge="In your browser"
    >
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Original</span>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              spellCheck={false}
              data-testid="diff-left"
              aria-label="Original text"
              placeholder="Paste the original here"
              className="tabular h-56 w-full resize-y rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Changed</span>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              spellCheck={false}
              data-testid="diff-right"
              aria-label="Changed text"
              placeholder="Paste the new version here"
              className="tabular h-56 w-full resize-y rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="h-4 w-4 accent-[rgb(var(--primary))]"
            />
            Ignore leading/trailing whitespace
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyChanges}
              onChange={(e) => setOnlyChanges(e.target.checked)}
              className="h-4 w-4 accent-[rgb(var(--primary))]"
            />
            Only show changed lines
          </label>
          <span className="tabular ml-auto flex gap-3 text-sm" data-testid="diff-summary">
            <span style={{ color: "rgb(var(--success))" }}>+{added}</span>
            <span style={{ color: "rgb(var(--destructive))" }}>−{removed}</span>
          </span>
        </div>

        {truncated && (
          <p className="text-xs text-muted-foreground">
            Only the first {MAX_LINES.toLocaleString()} lines of each side are compared, to keep the
            page responsive.
          </p>
        )}

        {visible.length > 0 && (
          <div
            className="overflow-x-auto rounded-2xl border border-border bg-card"
            data-testid="diff-result"
          >
            <table className="tabular w-full text-sm">
              <caption className="sr-only">Line-by-line differences</caption>
              <tbody>
                {visible.slice(0, 1000).map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      background:
                        r.op === "add"
                          ? "rgb(var(--success) / 0.10)"
                          : r.op === "remove"
                            ? "rgb(var(--destructive) / 0.08)"
                            : undefined,
                    }}
                  >
                    <td className="w-12 select-none border-r border-border px-2 py-1 text-right text-xs text-muted-foreground">
                      {r.left ?? ""}
                    </td>
                    <td className="w-12 select-none border-r border-border px-2 py-1 text-right text-xs text-muted-foreground">
                      {r.right ?? ""}
                    </td>
                    <td className="w-6 select-none px-2 py-1 text-center text-xs text-muted-foreground">
                      {r.op === "add" ? "+" : r.op === "remove" ? "−" : ""}
                    </td>
                    <td className="whitespace-pre-wrap break-words px-2 py-1">{r.text || " "}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {left && right && added === 0 && removed === 0 && (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            These two are identical{ignoreWhitespace ? ", ignoring surrounding whitespace" : ""}.
          </p>
        )}
      </div>
    </ToolShell>
  );
}
