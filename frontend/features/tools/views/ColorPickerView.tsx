"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Copy, Pipette } from "lucide-react";
import { toast } from "sonner";

import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolShell } from "@/features/tools/components/ToolShell";

const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

interface Picked {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
}

export function ColorPickerView() {
  const [file, setFile] = useState<File | null>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [swatches, setSwatches] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onPick = useCallback(async (f: File | null) => {
    setFile(f);
    setPicked(null);
    setSwatches([]);
    if (!f) return;

    try {
      const [bmp, colour] = await Promise.all([
        createImageBitmap(f),
        import("@/lib/tools/client/color"),
      ]);
      const c = canvasRef.current;
      if (!c) return;
      // Cap the working size: a 48MP photo would allocate ~190MB of pixel data
      // for no benefit, since we only ever sample single pixels from it.
      const scale = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
      c.width = Math.round(bmp.width * scale);
      c.height = Math.round(bmp.height * scale);
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(bmp, 0, 0, c.width, c.height);
      bmp.close();

      const data = ctx.getImageData(0, 0, c.width, c.height);
      setSwatches(colour.palette(data.data, 6));
    } catch {
      toast.error("That image could not be read.");
    }
  }, []);

  const sample = useCallback(async (ev: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = c.getBoundingClientRect();
    const x = Math.round(((ev.clientX - rect.left) / rect.width) * c.width);
    const y = Math.round(((ev.clientY - rect.top) / rect.height) * c.height);
    const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;

    const colour = await import("@/lib/tools/client/color");
    setPicked(colour.format({ r: r!, g: g!, b: b!, a: a! / 255 }));
  }, []);

  async function copy(v: string, k: string) {
    await navigator.clipboard.writeText(v);
    setCopied(k);
    toast.success("Copied");
    setTimeout(() => setCopied((c) => (c === k ? null : c)), 1200);
  }

  return (
    <ToolShell
      title="Color Picker"
      subtitle="Click any pixel for its exact value, or lift a palette from the whole picture."
      icon={Pipette}
      badge="In your browser"
    >
      <div className="space-y-6">
        <FileDrop
          label="Color Picker"
          accept={ACCEPT}
          file={file}
          onChange={onPick}
          testId="picker-input"
          hint="Read locally from a canvas - the image never leaves your device."
        />

        <div className={file ? "space-y-6" : "hidden"}>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold">Click anywhere to sample</p>
            <canvas
              ref={canvasRef}
              onClick={sample}
              data-testid="picker-canvas"
              className="max-h-[420px] w-auto max-w-full cursor-crosshair rounded-xl border border-border"
            />
          </div>

          {picked && (
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]" data-testid="picker-result">
              <div
                className="h-28 sm:h-full rounded-2xl border border-border"
                style={{ background: picked.hex }}
                aria-label={`Picked colour ${picked.hex}`}
              />
              <div className="space-y-2">
                {(["hex", "rgb", "hsl", "oklch"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => copy(picked[k], k)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-left transition hover:border-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {k}
                      </span>
                      <span className="tabular block truncate text-sm">{picked[k]}</span>
                    </span>
                    {copied === k ? (
                      <Check className="h-4 w-4 shrink-0 text-[rgb(var(--success))]" />
                    ) : (
                      <Copy className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {swatches.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3" data-testid="picker-palette">
              <p className="text-sm font-semibold">Dominant colours</p>
              <div className="flex flex-wrap gap-2">
                {swatches.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => copy(hex, hex)}
                    className="group flex items-center gap-2 rounded-xl border border-border bg-background py-1.5 pl-1.5 pr-3 transition hover:border-primary/40"
                  >
                    <span
                      className="h-7 w-7 rounded-lg border border-border"
                      style={{ background: hex }}
                    />
                    <span className="tabular text-xs">{hex}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
