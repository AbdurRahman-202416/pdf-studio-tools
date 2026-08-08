"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Palette } from "lucide-react";
import { toast } from "sonner";

import { ToolShell } from "@/features/tools/components/ToolShell";

type Formats = { hex: string; rgb: string; hsl: string; oklch: string };
type Mod = typeof import("@/lib/tools/client/color");

const SAMPLES = ["#C04637", "oklch(0.62 0.15 225)", "rgb(75 124 0)", "hsl(315 40% 52%)"];

export function ColorConverterView() {
  const [input, setInput] = useState("#4E68CE");
  const [mod, setMod] = useState<Mod | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // The colour maths is a separate chunk; nothing else on the site needs it.
  useEffect(() => {
    let live = true;
    import("@/lib/tools/client/color").then((m) => live && setMod(m));
    return () => {
      live = false;
    };
  }, []);

  const parsed = useMemo(() => (mod ? mod.parse(input) : null), [mod, input]);
  const out: Formats | null = useMemo(
    () => (mod && parsed ? mod.format(parsed) : null),
    [mod, parsed],
  );

  const contrastWhite = useMemo(
    () => (mod && parsed ? mod.contrast(parsed, { r: 255, g: 255, b: 255 }) : 0),
    [mod, parsed],
  );
  const contrastBlack = useMemo(
    () => (mod && parsed ? mod.contrast(parsed, { r: 0, g: 0, b: 0 }) : 0),
    [mod, parsed],
  );

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    toast.success("Copied");
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
  }

  return (
    <ToolShell
      title="Color Converter"
      subtitle="Paste HEX, RGB, HSL or OKLCH - every other format updates live, alpha included."
      icon={Palette}
      badge="In your browser"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Any colour value</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              data-testid="color-input"
              aria-label="Colour value"
              aria-invalid={!parsed}
              className="tabular w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="tabular rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
              >
                {s}
              </button>
            ))}
          </div>

          {!parsed && input.trim() !== "" && (
            <p className="text-sm text-destructive" role="alert">
              That isn&apos;t a colour we recognise. Try a form like{" "}
              <span className="tabular">#4E68CE</span>,{" "}
              <span className="tabular">rgb(78 104 206)</span> or{" "}
              <span className="tabular">oklch(0.55 0.16 270)</span>.
            </p>
          )}
        </div>

        {out && (
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]" data-testid="color-result">
            <div
              className="h-32 sm:h-full rounded-2xl border border-border"
              style={{ background: out.hex }}
              aria-label={`Preview of ${out.hex}`}
            />
            <div className="space-y-2">
              {(["hex", "rgb", "hsl", "oklch"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => copy(out[k], k)}
                  data-testid={`copy-${k}`}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition hover:border-primary/40"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {k}
                    </span>
                    <span className="tabular block truncate text-sm">{out[k]}</span>
                  </span>
                  {copied === k ? (
                    <Check className="h-4 w-4 shrink-0 text-[rgb(var(--success))]" />
                  ) : (
                    <Copy className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                  )}
                </button>
              ))}

              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Contrast
                </span>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  <span>
                    on white{" "}
                    <span className="tabular font-medium">{contrastWhite.toFixed(2)}:1</span>{" "}
                    <Badge pass={contrastWhite >= 4.5} />
                  </span>
                  <span>
                    on black{" "}
                    <span className="tabular font-medium">{contrastBlack.toFixed(2)}:1</span>{" "}
                    <Badge pass={contrastBlack >= 4.5} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

function Badge({ pass }: { pass: boolean }) {
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
      style={{
        background: pass ? "rgb(var(--success) / 0.14)" : "rgb(var(--destructive) / 0.12)",
        color: pass ? "rgb(var(--success))" : "rgb(var(--destructive))",
      }}
    >
      {pass ? "AA" : "fails AA"}
    </span>
  );
}
