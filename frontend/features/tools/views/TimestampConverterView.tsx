"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

import { ToolShell } from "@/features/tools/components/ToolShell";

/** A current seconds timestamp is 10 digits; milliseconds is 13. */
function detectUnit(raw: string): "s" | "ms" {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 12 ? "ms" : "s";
}

const ZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function TimestampConverterView() {
  const [raw, setRaw] = useState("");
  const [unit, setUnit] = useState<"s" | "ms" | "auto">("auto");
  const [zone, setZone] = useState("UTC");
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const localZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    [],
  );

  const date = useMemo(() => {
    const s = raw.trim();
    if (!s) return null;
    if (/^-?\d+$/.test(s)) {
      const u = unit === "auto" ? detectUnit(s) : unit;
      const ms = u === "ms" ? Number(s) : Number(s) * 1000;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [raw, unit]);

  const rows = useMemo(() => {
    if (!date) return null;
    const fmt = (tz: string) =>
      new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: tz,
      }).format(date);
    return {
      "Unix (seconds)": String(Math.floor(date.getTime() / 1000)),
      "Unix (milliseconds)": String(date.getTime()),
      "ISO 8601": date.toISOString(),
      "RFC 2822": date.toUTCString(),
      [`In ${zone}`]: fmt(zone),
      [`Your timezone (${localZone})`]: fmt(localZone),
    };
  }, [date, zone, localZone]);

  async function copy(v: string, k: string) {
    await navigator.clipboard.writeText(v);
    setCopied(k);
    toast.success("Copied");
    setTimeout(() => setCopied((c) => (c === k ? null : c)), 1200);
  }

  return (
    <ToolShell
      title="Timestamp Converter"
      subtitle="Unix epoch to readable dates and back. Seconds and milliseconds are detected by length."
      icon={Clock}
      badge="In your browser"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">Right now</span>
            <button
              onClick={() => setRaw(String(Math.floor(now / 1000)))}
              className="tabular text-sm font-medium text-primary hover:underline"
              data-testid="use-now"
            >
              {Math.floor(now / 1000)}
            </button>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Timestamp, or any date string
            </span>
            <input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="1786032707  ·  2026-08-06T16:11:47Z"
              spellCheck={false}
              data-testid="timestamp-input"
              aria-label="Timestamp or date"
              className="tabular w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Unit</span>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as typeof unit)}
                aria-label="Unit"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="auto">
                  Detect automatically{raw && /^-?\d+$/.test(raw.trim()) ? ` (${detectUnit(raw)})` : ""}
                </option>
                <option value="s">Seconds</option>
                <option value="ms">Milliseconds</option>
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Timezone</span>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                aria-label="Timezone"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {raw.trim() && !date && (
            <p className="text-sm text-destructive" role="alert">
              That isn&apos;t a timestamp or a date we can read. Try{" "}
              <span className="tabular">1786032707</span> or{" "}
              <span className="tabular">2026-08-06</span>.
            </p>
          )}
        </div>

        {rows && (
          <div className="space-y-2" data-testid="timestamp-result" aria-live="polite">
            {Object.entries(rows).map(([k, v]) => (
              <button
                key={k}
                onClick={() => copy(v, k)}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition hover:border-primary/40"
              >
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {k}
                  </span>
                  <span className="tabular block truncate text-sm">{v}</span>
                </span>
                {copied === k ? (
                  <Check className="h-4 w-4 shrink-0 text-[rgb(var(--success))]" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
