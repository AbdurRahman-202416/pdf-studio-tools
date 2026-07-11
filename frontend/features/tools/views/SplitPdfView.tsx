"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Scissors, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { splitPdf, toolDownloadUrl, type PdfSplitResult } from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { cn } from "@/lib/utils";

const modes = [
  { value: "extract", label: "Extract pages", hint: "Selected pages become one new PDF" },
  { value: "each", label: "One PDF per page", hint: "Every page as its own PDF, in a ZIP" },
] as const;

export function SplitPdfView() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"extract" | "each">("extract");
  const [pages, setPages] = useState("all");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PdfSplitResult | null>(null);

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please select a PDF first.");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await splitPdf(file, pages, mode);
      setResult(r);
      toast.success(
        mode === "each"
          ? `Split into ${r.pages} single-page PDF${r.pages === 1 ? "" : "s"}`
          : `Extracted ${r.pages} page${r.pages === 1 ? "" : "s"}`,
      );
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Split failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const downloadName = result && (result.ext === "zip" ? "split-pages.zip" : "split.pdf");

  return (
    <ToolShell
      title="Split PDF"
      subtitle="Extract pages from a PDF or split every page into its own file. Free, no signup, no watermark."
      badge="NEW"
      icon={Scissors}
      gradient="from-sky-500 via-cyan-500 to-teal-500"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Choose your PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <FileDrop
              label="Upload PDF"
              accept={{ "application/pdf": [".pdf"] }}
              file={file}
              onChange={setFile}
              hint="Max 100 MB. Files stay private and auto-delete after 1 hour."
              testId="split-pdf-drop"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-medium mb-2">Split mode</p>
              <div className="grid grid-cols-2 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMode(m.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition",
                      mode === m.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <span className="font-medium">{m.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="split-pages-input" className="text-sm font-medium block mb-2">
                Pages
              </label>
              <input
                id="split-pages-input"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="all"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Examples: <code>all</code>, <code>1-3,5</code>, <code>2,4,7-9</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          isLoading={busy}
          disabled={!file || busy}
          data-testid="split-pdf-submit"
        >
          <Wand2 className="h-4 w-4" /> Split PDF
        </Button>

        {result && downloadName && (
          <ToolResult
            filename={downloadName}
            size_bytes={result.size_bytes}
            description={
              result.ext === "zip"
                ? `${result.pages} single-page PDFs`
                : `${result.pages} page${result.pages === 1 ? "" : "s"} extracted`
            }
            downloadHref={toolDownloadUrl(result.output_id, downloadName)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            testId="split-pdf-result"
            tool="split-pdf"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Upload your PDF (up to 100 MB).</p>
            <p>2. Pick pages: <code>all</code>, or a range like <code>1-3,5</code>.</p>
            <p>3. &quot;Extract pages&quot; gives one combined PDF; &quot;One PDF per page&quot; gives a ZIP.</p>
            <p>4. Download - files auto-delete from our servers after 1 hour.</p>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
