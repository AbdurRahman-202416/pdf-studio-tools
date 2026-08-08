"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, Ruler } from "lucide-react";

import { ToolShell } from "@/features/tools/components/ToolShell";

type Mod = typeof import("@/lib/tools/client/calc");

const CATEGORIES = [
  { key: "length", label: "Length" },
  { key: "weight", label: "Weight" },
  { key: "temperature", label: "Temperature" },
  { key: "volume", label: "Volume" },
  { key: "area", label: "Area" },
  { key: "speed", label: "Speed" },
  { key: "data", label: "Data" },
  { key: "time", label: "Time" },
];

/** Sensible starting pair per category - the conversion people actually want. */
const DEFAULTS: Record<string, [string, string]> = {
  length: ["Centimetre", "Inch"],
  weight: ["Kilogram", "Pound"],
  temperature: ["Celsius", "Fahrenheit"],
  volume: ["Litre", "Gallon (US)"],
  area: ["Square metre", "Square foot"],
  speed: ["Kilometres per hour", "Miles per hour"],
  data: ["Megabyte", "Gigabyte"],
  time: ["Hour", "Minute"],
};

export function UnitConverterView() {
  const [mod, setMod] = useState<Mod | null>(null);
  const [category, setCategory] = useState("length");
  const [from, setFrom] = useState(DEFAULTS.length![0]);
  const [to, setTo] = useState(DEFAULTS.length![1]);
  const [value, setValue] = useState("1");

  useEffect(() => {
    let live = true;
    import("@/lib/tools/client/calc").then((m) => live && setMod(m));
    return () => {
      live = false;
    };
  }, []);

  const unitList = !mod
    ? []
    : category === "temperature"
      ? [...mod.TEMPERATURE_UNITS]
      : Object.keys(mod.UNITS[category]?.units ?? {});

  function pickCategory(next: string) {
    setCategory(next);
    const [a, b] = DEFAULTS[next] ?? ["", ""];
    setFrom(a);
    setTo(b);
  }

  const n = Number(value);
  const converted = mod && Number.isFinite(n) ? mod.convertUnit(n, category, from, to) : NaN;

  // Very large and very small results need exponent notation to stay readable.
  const display = !Number.isFinite(converted)
    ? "-"
    : Math.abs(converted) !== 0 && (Math.abs(converted) < 1e-4 || Math.abs(converted) >= 1e9)
      ? converted.toExponential(6)
      : new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(converted);

  return (
    <ToolShell
      title="Unit Converter"
      subtitle="Length, weight, temperature, volume, area, speed, data and time - in one place."
      icon={Ruler}
      badge="In your browser"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              role="tab"
              aria-selected={category === c.key}
              onClick={() => pickCategory(c.key)}
              data-testid={`cat-${c.key}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                category === c.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="space-y-1.5">
              <label htmlFor="uc-value" className="text-xs font-medium text-muted-foreground">
                From
              </label>
              <input
                id="uc-value"
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                data-testid="uc-value"
                className={`tabular ${inp}`}
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                aria-label="Convert from"
                data-testid="uc-from"
                className={inp}
              >
                {unitList.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              aria-label="Swap units"
              data-testid="uc-swap"
              className="mb-1 grid h-10 w-10 shrink-0 place-items-center self-center rounded-full border border-border transition hover:border-primary/40 hover:text-primary sm:self-end"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">To</span>
              <output
                data-testid="uc-result"
                aria-live="polite"
                className="tabular block w-full truncate rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-[rgb(var(--primary))]"
              >
                {display}
              </output>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                aria-label="Convert to"
                data-testid="uc-to"
                className={inp}
              >
                {unitList.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {Number.isFinite(converted) && (
            <p className="tabular mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
              {value} {from} = {display} {to}
            </p>
          )}
        </div>

        {category === "data" && (
          <p className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground leading-relaxed">
            Uses binary units (1 KB = 1024 bytes), which is how operating systems report file sizes.
            Drive manufacturers use decimal (1 KB = 1000 bytes) - that discrepancy is why a
            &ldquo;1 TB&rdquo; disk shows as about 931 GB.
          </p>
        )}
      </div>
    </ToolShell>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
