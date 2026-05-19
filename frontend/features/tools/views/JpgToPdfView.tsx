"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Wand2, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import {
  imagesToPdf,
  toolDownloadUrl,
  type ImageToPdfPageSize,
  type ImageToPdfResult,
} from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { cn, formatBytes } from "@/lib/utils";
import { trackEvent } from "@/lib/track";

const PAGE_SIZES: { value: ImageToPdfPageSize; label: string; sub: string }[] = [
  { value: "a4_portrait", label: "A4 portrait", sub: "210 × 297 mm — most common" },
  { value: "a4_landscape", label: "A4 landscape", sub: "297 × 210 mm" },
  { value: "letter_portrait", label: "US Letter", sub: "216 × 279 mm" },
  { value: "fit_image", label: "Fit image", sub: "Page = image size" },
];

export function JpgToPdfView() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<ImageToPdfPageSize>("a4_portrait");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImageToPdfResult | null>(null);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const onAdd = (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) =>
      /^image\/(jpeg|png|webp)$/i.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name),
    );
    if (!list.length) {
      toast.error("Please upload JPG, PNG, or WebP images");
      return;
    }
    setFiles((prev) => [...prev, ...list].slice(0, 50));
  };

  const handleConvert = async () => {
    if (!files.length) {
      toast.error("Add at least one image");
      return;
    }
    setBusy(true);
    trackEvent("tool_started", { tool: "jpg-to-pdf", count: files.length });
    try {
      const r = await imagesToPdf(files, pageSize);
      setResult(r);
      toast.success(`Created PDF from ${r.pages} image${r.pages === 1 ? "" : "s"}`);
    } catch (err) {
      trackEvent("tool_failed", { tool: "jpg-to-pdf" });
      toast.error(err instanceof ApiError ? err.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="JPG to PDF"
      subtitle="Combine JPG, PNG, or WebP images into a single PDF. Drag to reorder."
      icon={ImagePlus}
      sideCard={
        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• High-resolution images give crisp prints.</p>
            <p>• Up to 50 images per conversion.</p>
            <p>• Auto-orient via EXIF preserved.</p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        <div
          className="rounded-2xl border-2 border-dashed border-border bg-card p-6 hover:border-primary/40 transition cursor-pointer"
          onClick={() => document.getElementById("jpg-to-pdf-input")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
          }}
        >
          <input
            id="jpg-to-pdf-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) onAdd(e.target.files);
              e.target.value = "";
            }}
          />
          <p className="text-sm font-semibold">Drop JPG / PNG / WebP files</p>
          <p className="text-xs text-muted-foreground mt-1">Or click to browse. Up to 50 images.</p>
        </div>

        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected images ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="relative rounded-xl border border-border overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previews[i]} alt="" className="h-32 w-full object-cover bg-muted" />
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-card/95 text-foreground shadow border border-border hover:bg-destructive hover:text-destructive-foreground transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <p className="px-2 py-1.5 text-[11px] text-muted-foreground truncate">
                      {f.name} · {formatBytes(f.size)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Page size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {PAGE_SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setPageSize(s.value)}
                  aria-pressed={pageSize === s.value}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    pageSize === s.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50 hover:bg-muted/60",
                  )}
                >
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          size="lg"
          onClick={handleConvert}
          isLoading={busy}
          disabled={!files.length}
          data-testid="jpg-to-pdf-convert"
        >
          <Wand2 className="h-4 w-4" /> Convert to PDF
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={`${result.pages} page${result.pages === 1 ? "" : "s"}`}
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="jpg-to-pdf"
            testId="jpg-to-pdf-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
