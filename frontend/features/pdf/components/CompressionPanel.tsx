"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ApiError, compressPDF } from "@/services/api";
import { usePDFStore } from "@/store/pdfStore";
import { cn, formatBytes } from "@/lib/utils";
import type { CompressionLevel } from "@/types/pdf";

const presets: Array<{
  level: CompressionLevel;
  label: string;
  description: string;
  estimate: string;
}> = [
  {
    level: "low",
    label: "Light",
    description: "Best visual quality. 200 DPI rasterization.",
    estimate: "~10–25% smaller",
  },
  {
    level: "medium",
    label: "Balanced",
    description: "Good for sharing. 144 DPI · JPEG 70.",
    estimate: "~40–60% smaller",
  },
  {
    level: "high",
    label: "Maximum",
    description: "Smallest size. 96 DPI · JPEG 50.",
    estimate: "~70–85% smaller",
  },
];

export function CompressionPanel() {
  const files = usePDFStore((s) => s.files);
  const compression = usePDFStore((s) => s.compression);
  const setCompression = usePDFStore((s) => s.setCompression);
  const setResult = usePDFStore((s) => s.setResult);

  const [busy, setBusy] = useState(false);
  const [targetFileId, setTargetFileId] = useState<string>("");

  const currentTarget = files.find((f) => f.file_id === (targetFileId || files[0]?.file_id));

  const handleCompress = async () => {
    if (!currentTarget) {
      toast.error("Upload a PDF first");
      return;
    }
    setBusy(true);
    try {
      const result = await compressPDF(
        currentTarget.file_id,
        compression,
        `compressed-${currentTarget.filename}`,
      );
      setResult(result, "compress");
      const pct = result.reduction_percent ?? 0;
      toast.success(
        `Compressed: ${formatBytes(result.size_bytes)} (${pct >= 0 ? pct.toFixed(0) : 0}% smaller)`,
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Compression failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  if (files.length === 0) return null;

  return (
    <Card data-testid="compression-panel">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Compression</CardTitle>
            <p className="text-xs text-muted-foreground">Pick a preset and apply</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCompress}
          isLoading={busy}
          data-testid="compress-button"
        >
          <Wand2 className="h-4 w-4" /> Compress now
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {files.length > 1 && (
          <div className="space-y-1">
            <label htmlFor="target-file" className="text-xs uppercase tracking-wider text-muted-foreground">
              Target file
            </label>
            <select
              id="target-file"
              value={currentTarget?.file_id}
              onChange={(e) => setTargetFileId(e.target.value)}
              data-testid="compression-target"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              {files.map((f) => (
                <option key={f.file_id} value={f.file_id}>
                  {f.filename} ({formatBytes(f.size_bytes)})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-3">
          {presets.map((p) => (
            <button
              key={p.level}
              type="button"
              onClick={() => setCompression(p.level)}
              data-testid={`preset-${p.level}`}
              aria-pressed={compression === p.level}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                compression === p.level
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50 hover:bg-muted/60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{p.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.level}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
              <p className="mt-1 text-xs font-medium text-primary">{p.estimate}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
