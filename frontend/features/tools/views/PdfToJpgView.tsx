"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import {
  pdfToImages,
  toolDownloadUrl,
  type PdfToImagesResult,
} from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { cn } from "@/lib/utils";

const dpiPresets = [
  { value: 150, label: "Screen", hint: "Good for web preview" },
  { value: 220, label: "Print", hint: "Good for everyday print" },
  { value: 300, label: "High", hint: "Magazine / photo print" },
] as const;

const formats = [
  { value: "jpg", label: "JPG", hint: "Smaller file size" },
  { value: "png", label: "PNG", hint: "Lossless, larger" },
] as const;

export function PdfToJpgView() {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<150 | 220 | 300>(220);
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [pages, setPages] = useState("all");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PdfToImagesResult | null>(null);

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please select a PDF first.");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await pdfToImages(file, { dpi, pages, fmt: format });
      setResult(r);
      toast.success(`Generated ${r.count} image${r.count === 1 ? "" : "s"}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Conversion failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const downloadName =
    result &&
    (result.ext === "zip"
      ? "pdf-pages.zip"
      : `pdf-page.${result.ext}`);

  return (
    <ToolShell
      title="PDF to JPG"
      subtitle="Convert each PDF page into a high-quality JPG or PNG image. Free, no signup, no watermark."
      badge="NEW"
      icon={ImageIcon}
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
              hint="Max 100 MB. Pages stay private and auto-delete after 1 hour."
              testId="pdf-to-jpg-drop"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-medium mb-2">Quality (DPI)</p>
              <div className="grid grid-cols-3 gap-2">
                {dpiPresets.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setDpi(p.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition",
                      dpi === p.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">{p.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {p.value} dpi
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Format</p>
              <div className="grid grid-cols-2 gap-2">
                {formats.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFormat(f.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition",
                      format === f.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <span className="font-medium">{f.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="pages-input" className="text-sm font-medium block mb-2">
                Pages
              </label>
              <input
                id="pages-input"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="all"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Examples: <code>all</code>, <code>1,3-5,8</code>
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
          data-testid="pdf-to-jpg-submit"
        >
          <Wand2 className="h-4 w-4" /> Convert to {format.toUpperCase()}
        </Button>

        {result && downloadName && (
          <ToolResult
            filename={downloadName}
            size_bytes={result.size_bytes}
            description={`${result.count} ${format.toUpperCase()} image${result.count === 1 ? "" : "s"}`}
            downloadHref={toolDownloadUrl(result.output_id, downloadName)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            testId="pdf-to-jpg-result"
            tool="pdf-to-jpg"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Upload your PDF (up to 100 MB).</p>
            <p>2. Choose quality and format (JPG is smaller, PNG is lossless).</p>
            <p>3. Pick which pages to export, &quot;all&quot; or a range like <code>1,3-5</code>.</p>
            <p>4. Multi-page exports come as a ZIP. Single pages as a direct image.</p>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
