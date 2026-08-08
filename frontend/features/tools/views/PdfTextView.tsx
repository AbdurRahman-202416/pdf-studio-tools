"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Check, Copy, Download, FileText, GitCompare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { downloadBlob } from "@/lib/utils";
import { API_BASE } from "@/services/api";

const ACCEPT = { "application/pdf": [".pdf"] };

interface ExtractResult {
  text: string;
  pages: number;
  characters: number;
  note: string | null;
}

interface CompareRow {
  op: "same" | "add" | "remove";
  text: string;
}
interface CompareResult {
  pages_a: number;
  pages_b: number;
  added: number;
  removed: number;
  identical: boolean;
  rows: CompareRow[];
  truncated: boolean;
}

export function PdfTextView({ slug }: { slug: string }) {
  return slug === "compare-pdf" ? <ComparePdf /> : <ExtractText />;
}

function ExtractText() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [copied, setCopied] = useState(false);

  const onPick = useCallback(async (f: File | null) => {
    setFile(f);
    setResult(null);
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`${API_BASE}/tools/pdf/to-text`, { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().then((x) => x?.detail).catch(() => null);
        throw new Error(d || "Could not read that PDF.");
      }
      const data: ExtractResult = await res.json();
      setResult(data);
      toast[data.characters ? "success" : "warning"](
        data.characters ? "Text extracted" : "No text layer found",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }, []);

  async function copy() {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1400);
  }

  function download() {
    if (!result?.text) return;
    downloadBlob(
      new Blob([result.text], { type: "text/plain" }),
      `${(file?.name ?? "document").replace(/\.pdf$/i, "")}.txt`,
    );
  }

  return (
    <ToolShell
      title="PDF to Text"
      subtitle="Reads the text already in the file - instant and exact. No OCR step needed."
      icon={FileText}
      badge="Server-side"
    >
      <div className="space-y-6">
        <FileDrop
          label="PDF to Text"
          accept={ACCEPT}
          file={file}
          onChange={onPick}
          testId="pdftext-input"
          hint="Up to 100 MB. Deleted an hour after processing."
        />

        {busy && <p className="text-sm text-muted-foreground">Reading…</p>}

        {result && (
          <div className="space-y-3" data-testid="pdftext-result" aria-live="polite">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Stat label="Pages" value={String(result.pages)} />
              <Stat label="Characters" value={result.characters.toLocaleString()} />
              {result.text && (
                <div className="ml-auto flex gap-3">
                  <button onClick={copy} data-testid="pdftext-copy"
                    className="flex items-center gap-1 text-xs text-primary hover:underline">
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={download}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Download className="h-3 w-3" /> Download .txt
                  </button>
                </div>
              )}
            </div>

            {result.note && (
              <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                {result.note}{" "}
                <Link href="/pdf-ocr" className="text-primary hover:underline">Open PDF OCR →</Link>
              </p>
            )}

            {result.text && (
              <textarea
                readOnly
                value={result.text}
                className="tabular h-96 w-full resize-y rounded-xl border border-border bg-card p-4 text-sm"
                aria-label="Extracted text"
              />
            )}
          </div>
        )}
      </div>
    </ToolShell>
  );
}

function ComparePdf() {
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [onlyChanges, setOnlyChanges] = useState(true);

  async function run() {
    if (!a || !b) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file_a", a);
      fd.append("file_b", b);
      const res = await fetch(`${API_BASE}/tools/pdf/compare`, { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().then((x) => x?.detail).catch(() => null);
        throw new Error(d || "Could not compare those files.");
      }
      setResult(await res.json());
      toast.success("Comparison ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const rows = result ? (onlyChanges ? result.rows.filter((r) => r.op !== "same") : result.rows) : [];

  return (
    <ToolShell
      title="Compare PDF"
      subtitle="Finds which lines changed between two versions, by comparing the text rather than the pixels."
      icon={GitCompare}
      badge="Server-side"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FileDrop label="Original" accept={ACCEPT} file={a} onChange={setA}
            testId="compare-a" hint="The version you are comparing from." />
          <FileDrop label="Revised" accept={ACCEPT} file={b} onChange={setB}
            testId="compare-b" hint="The newer version." />
        </div>

        <Button onClick={run} disabled={!a || !b || busy} data-testid="compare-pdf-run">
          {busy ? "Comparing…" : "Compare"}
        </Button>

        {result && (
          <div className="space-y-4" data-testid="compare-pdf-result" aria-live="polite">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card p-5">
              <Stat label="Pages" value={`${result.pages_a} → ${result.pages_b}`} />
              <span className="tabular text-sm" style={{ color: "rgb(var(--success))" }}>
                +{result.added} added
              </span>
              <span className="tabular text-sm" style={{ color: "rgb(var(--destructive))" }}>
                −{result.removed} removed
              </span>
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={onlyChanges}
                  onChange={(e) => setOnlyChanges(e.target.checked)}
                  className="h-4 w-4 accent-[rgb(var(--primary))]" />
                Only changed lines
              </label>
            </div>

            {result.identical ? (
              <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                The text of these two documents is identical.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="tabular w-full text-sm">
                  <caption className="sr-only">Differences between the two PDFs</caption>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} style={{
                        background:
                          r.op === "add" ? "rgb(var(--success) / 0.10)"
                          : r.op === "remove" ? "rgb(var(--destructive) / 0.08)"
                          : undefined,
                      }}>
                        <td className="w-6 select-none px-2 py-1 text-center text-xs text-muted-foreground">
                          {r.op === "add" ? "+" : r.op === "remove" ? "−" : ""}
                        </td>
                        <td className="whitespace-pre-wrap break-words px-2 py-1">{r.text || " "}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.truncated && (
              <p className="text-xs text-muted-foreground">
                Showing the first 1,500 lines. The counts above cover the whole document.
              </p>
            )}
          </div>
        )}
      </div>
    </ToolShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="tabular text-sm font-medium">{value}</span>
    </span>
  );
}
