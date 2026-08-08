"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RotateCw, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { rotatePdf, toolDownloadUrl, type PdfRotateResult } from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { cn } from "@/lib/utils";

const angles = [
  { value: 90, label: "90° right", hint: "Quarter turn clockwise" },
  { value: 180, label: "180°", hint: "Upside-down fix" },
  { value: 270, label: "90° left", hint: "Quarter turn counter-clockwise" },
] as const;

export function RotatePdfView() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [pages, setPages] = useState("all");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PdfRotateResult | null>(null);

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please select a PDF first.");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await rotatePdf(file, angle, pages);
      setResult(r);
      toast.success(`Rotated ${r.rotated} page${r.rotated === 1 ? "" : "s"}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Rotate failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Rotate PDF"
      subtitle="Turn sideways or upside-down pages the right way up - permanently. Free, no signup, no watermark."
      badge="NEW"
      icon={RotateCw}
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
              onChange={(f) => {
                setFile(f);
                setResult(null);
              }}
              hint="Max 100 MB. Files stay private and auto-delete after 1 hour."
              testId="rotate-pdf-drop"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-medium mb-2">Rotation</p>
              <div className="grid grid-cols-3 gap-2">
                {angles.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAngle(a.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition",
                      angle === a.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <span className="font-medium">{a.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="rotate-pages-input" className="text-sm font-medium block mb-2">
                Pages
              </label>
              <input
                id="rotate-pages-input"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="all"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Examples: <code>all</code>, <code>1,3-5</code>
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
          data-testid="rotate-pdf-submit"
        >
          <Wand2 className="h-4 w-4" /> Rotate PDF
        </Button>

        {result && (
          <ToolResult
            filename="rotated.pdf"
            size_bytes={result.size_bytes}
            description={`${result.rotated} page${result.rotated === 1 ? "" : "s"} rotated by ${angle}°`}
            downloadHref={toolDownloadUrl(result.output_id, "rotated.pdf")}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            testId="rotate-pdf-result"
            tool="rotate-pdf"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Upload your PDF (up to 100 MB).</p>
            <p>2. Pick the rotation: 90° right, 180°, or 90° left.</p>
            <p>3. Rotate every page, or only some (e.g. <code>2,5-7</code>).</p>
            <p>4. The rotation is saved into the file - it stays fixed in every viewer.</p>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
