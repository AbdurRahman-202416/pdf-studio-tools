"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, Mail, MessageCircle, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import {
  compressPdfQuick,
  compressPdfToTarget,
  toolDownloadUrl,
  type CompressTargetKey,
  type CompressTargetResult,
  type QuickCompressResult,
} from "@/services/tools-api";
import { ApiError } from "@/services/api";
import { trackEvent } from "@/lib/track";
import { cn, formatBytes } from "@/lib/utils";

type Outcome =
  | { kind: "target"; key: CompressTargetKey; label: string; cap: string; icon: typeof Mail; tone: string }
  | { kind: "quality"; label: string; cap: string; icon: typeof Sparkles; tone: string };

const OUTCOMES: Outcome[] = [
  {
    kind: "target",
    key: "10mb",
    label: "Email attachment",
    cap: "Fits Gmail, Outlook, Yahoo (≤ 10 MB)",
    icon: Mail,
    tone: "from-sky-50 to-sky-100/40 border-sky-200 dark:from-sky-950/30 dark:to-sky-900/10 dark:border-sky-900/40",
  },
  {
    kind: "target",
    key: "16mb",
    label: "WhatsApp / Messenger",
    cap: "Fits chat-app limits (≤ 16 MB)",
    icon: MessageCircle,
    tone: "from-emerald-50 to-emerald-100/40 border-emerald-200 dark:from-emerald-950/30 dark:to-emerald-900/10 dark:border-emerald-900/40",
  },
  {
    kind: "target",
    key: "1mb",
    label: "Govt portal upload",
    cap: "BPSC, NID, BCS, UPSC… (≤ 1 MB)",
    icon: Building2,
    tone: "from-amber-50 to-amber-100/40 border-amber-200 dark:from-amber-950/30 dark:to-amber-900/10 dark:border-amber-900/40",
  },
  {
    kind: "quality",
    label: "Best quality",
    cap: "Minimal compression, sharpest text",
    icon: Sparkles,
    tone: "from-violet-50 to-violet-100/40 border-violet-200 dark:from-violet-950/30 dark:to-violet-900/10 dark:border-violet-900/40",
  },
];

type AnyResult = CompressTargetResult | QuickCompressResult;

const isTargetResult = (r: AnyResult): r is CompressTargetResult =>
  "reached_target" in r;

// Maps a user-entered KB value to the nearest backend preset that fits. Keep
// in sync with _TARGET_SIZES_BYTES in backend/app/api/tools_routes.py.
const CUSTOM_KB_LADDER: Array<[number, CompressTargetKey]> = [
  [50, "50kb"],
  [100, "100kb"],
  [200, "200kb"],
  [500, "500kb"],
  [1024, "1mb"],
  [2048, "2mb"],
  [5120, "5mb"],
  [10240, "10mb"],
  [16384, "16mb"],
];

const snapToPreset = (kb: number): CompressTargetKey =>
  CUSTOM_KB_LADDER.find(([cap]) => kb <= cap)?.[1] ?? "16mb";

export function CompressByOutcomeView() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<AnyResult | null>(null);
  const [customKb, setCustomKb] = useState("");

  const runTarget = async (key: CompressTargetKey, busyKey: string) => {
    if (!file) {
      toast.error("Drop a PDF first");
      return;
    }
    setBusy(busyKey);
    trackEvent("tool_started", { tool: "compress-pdf", target: key });
    try {
      const r = await compressPdfToTarget(file, key);
      setResult(r);
      const saved = Math.max(0, file.size - r.size_bytes);
      const pct = file.size > 0 ? Math.round((saved / file.size) * 100) : 0;
      toast.success(
        r.reached_target
          ? `Compressed to ${formatBytes(r.size_bytes)} (${pct}% smaller)`
          : `Best effort: ${formatBytes(r.size_bytes)}. Target was tight, see details.`,
      );
    } catch (err) {
      trackEvent("tool_failed", { tool: "compress-pdf", target: key });
      toast.error(err instanceof ApiError ? err.message : "Compression failed");
    } finally {
      setBusy(null);
    }
  };

  const runQuality = async () => {
    if (!file) {
      toast.error("Drop a PDF first");
      return;
    }
    setBusy("quality");
    trackEvent("tool_started", { tool: "compress-pdf", mode: "quality" });
    try {
      const r = await compressPdfQuick(file, "low");
      setResult(r);
      const saved = Math.max(0, file.size - r.size_bytes);
      const pct = file.size > 0 ? Math.round((saved / file.size) * 100) : 0;
      toast.success(`Compressed at best quality: ${formatBytes(r.size_bytes)} (${pct}% smaller)`);
    } catch (err) {
      trackEvent("tool_failed", { tool: "compress-pdf", mode: "quality" });
      toast.error(err instanceof ApiError ? err.message : "Compression failed");
    } finally {
      setBusy(null);
    }
  };

  const runCustom = async () => {
    const n = Number(customKb);
    if (!Number.isFinite(n) || n < 50) {
      toast.error("Custom target must be at least 50 KB");
      return;
    }
    if (n > 20000) {
      toast.error("Custom target must be at most 20 MB (20000 KB)");
      return;
    }
    await runTarget(snapToPreset(n), "custom");
  };

  return (
    <ToolShell
      title="Compress PDF"
      subtitle="Pick where you're sending it. We'll shrink your PDF to fit, so you don't have to guess what 'Light' or 'Maximum' means."
      icon={Wand2}
      sideCard={
        <>
          <Card>
            <CardContent className="text-sm text-muted-foreground space-y-2 pt-6">
              <p className="text-foreground font-medium">How this works</p>
              <p>We iteratively rasterize and re-encode pages until the file fits your chosen size limit. Text stays selectable; image quality scales down as needed.</p>
            </CardContent>
          </Card>
          <Card className="border-amber-300/40 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="text-sm text-muted-foreground">
              <strong className="text-foreground">Privacy:</strong> processed in memory, auto-deleted in 1 hour.
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="space-y-6">
        <FileDrop
          label="Drop your PDF"
          hint="Any PDF up to 100 MB. Multi-page works."
          accept={{ "application/pdf": [".pdf"] }}
          file={file}
          onChange={(f) => {
            setFile(f);
            setResult(null);
          }}
          testId="compress-file"
          className="max-w-xl"
        />

        {file && (
          <div className="text-sm text-muted-foreground">
            Original size: <span className="text-foreground font-medium">{formatBytes(file.size)}</span>
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-3">Where are you sending this PDF?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {OUTCOMES.map((o) => {
              const Icon = o.icon;
              const busyKey = o.kind === "quality" ? "quality" : o.key;
              const isBusy = busy === busyKey;
              return (
                <button
                  key={o.kind === "quality" ? "quality" : o.key}
                  type="button"
                  disabled={!file || busy !== null}
                  onClick={() => (o.kind === "quality" ? runQuality() : runTarget(o.key, o.key))}
                  data-testid={`outcome-${o.kind === "quality" ? "quality" : o.key}`}
                  className={cn(
                    "group relative text-left rounded-2xl border bg-gradient-to-br p-4 transition",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
                    o.tone,
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-background/80 backdrop-blur">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{o.cap}</p>
                    </div>
                  </div>
                  {isBusy && (
                    <p className="mt-3 text-xs text-foreground/80 animate-pulse">Compressing…</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <details className="max-w-2xl rounded-2xl border border-border bg-card/40 p-4">
          <summary className="cursor-pointer text-sm font-medium select-none">
            Advanced: set a custom target size
          </summary>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={50}
              max={20000}
              step={50}
              placeholder="e.g. 150"
              value={customKb}
              onChange={(e) => setCustomKb(e.target.value)}
              className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="custom-kb-input"
            />
            <span className="text-sm text-muted-foreground">KB</span>
            <Button
              size="sm"
              onClick={runCustom}
              disabled={!file || busy !== null || !customKb}
              isLoading={busy === "custom"}
              data-testid="custom-kb-button"
            >
              Compress to size
            </Button>
            <span className="text-xs text-muted-foreground">Between 50 KB and 20 MB.</span>
          </div>
        </details>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={
              <span className="text-xs">
                Original {formatBytes(result.original_size_bytes)} {">"}{" "}
                <span className="text-foreground font-medium">{formatBytes(result.size_bytes)}</span>
                {isTargetResult(result) && !result.reached_target && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400">
                    target not reached, returned smallest possible
                  </span>
                )}
              </span>
            }
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={result.output_id}
            onDismiss={() => setResult(null)}
            tool="compress-pdf"
            testId="compress-result"
          />
        )}
      </div>
    </ToolShell>
  );
}
