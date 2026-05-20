"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Target, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import {
  compressPdfToTarget,
  toolDownloadUrl,
  type CompressTargetKey,
  type CompressTargetResult,
} from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { cn, formatBytes } from "@/lib/utils";
import { trackEvent } from "@/lib/track";

const TARGETS: { value: CompressTargetKey; label: string; sub: string }[] = [
  { value: "50kb", label: "50 KB", sub: "Smallest, may blur images" },
  { value: "100kb", label: "100 KB", sub: "Govt portals (NID, BCS, UPSC)" },
  { value: "200kb", label: "200 KB", sub: "Balanced - keeps scans legible" },
  { value: "500kb", label: "500 KB", sub: "High quality, modest size" },
  { value: "1mb", label: "1 MB", sub: "Lossy minimum acceptable" },
  { value: "2mb", label: "2 MB", sub: "Almost-original quality" },
];

export function CompressTo100kbView() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<CompressTargetKey>("100kb");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CompressTargetResult | null>(null);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Upload a PDF first");
      return;
    }
    setBusy(true);
    trackEvent("tool_started", { tool: "compress-pdf-to-100kb", target });
    try {
      const r = await compressPdfToTarget(file, target);
      setResult(r);
      if (r.reached_target) {
        toast.success(`Compressed to ${formatBytes(r.final_bytes)} (target ${target})`);
      } else {
        toast.warning(
          `Smallest achievable was ${formatBytes(r.final_bytes)} - try a higher target.`,
        );
      }
    } catch (err) {
      trackEvent("tool_failed", { tool: "compress-pdf-to-100kb" });
      toast.error(err instanceof ApiError ? err.message : "Compression failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Compress PDF to 100KB"
      subtitle="Target-size PDF compressor for govt portals, NID and passport applications, and strict upload limits."
      badge="Optimized for BD"
      icon={Target}
      sideCard={
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. We rasterize each page at progressively lower DPI.</p>
            <p>2. JPEG quality is dialed down step-by-step.</p>
            <p>3. We stop the moment your target is met - quality stays as high as possible.</p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        <FileDrop
          label="Drop your PDF"
          hint="Max 100 MB. Files auto-delete after 1 hour."
          accept={{ "application/pdf": [".pdf"] }}
          file={file}
          onChange={setFile}
          className="max-w-xl"
        />

        <Card>
          <CardHeader>
            <CardTitle>Target file size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {TARGETS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTarget(t.value)}
                  aria-pressed={target === t.value}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    target === t.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50 hover:bg-muted/60",
                  )}
                >
                  <p className="font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.sub}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button size="lg" onClick={handleSubmit} isLoading={busy} disabled={!file}>
          <Wand2 className="h-4 w-4" /> Compress to {target.toUpperCase()}
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={`${formatBytes(result.original_size_bytes)} → ${formatBytes(result.final_bytes)} · DPI ${result.dpi} · ${result.iterations} pass${result.iterations === 1 ? "" : "es"}`}
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="compress-pdf-to-100kb"
            testId="compress-target-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
