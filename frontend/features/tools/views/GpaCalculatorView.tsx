"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolShell } from "@/features/tools/components/ToolShell";
import type { CalcOutput } from "@/lib/tools/client/calc";

type Mod = typeof import("@/lib/tools/client/calc");

interface Row {
  id: number;
  name: string;
  grade: string;
  credits: string;
}

let nextId = 1;
const blank = (): Row => ({ id: nextId++, name: "", grade: "A", credits: "3" });

export function GpaCalculatorView() {
  const [mod, setMod] = useState<Mod | null>(null);
  const [rows, setRows] = useState<Row[]>(() => [blank(), blank(), blank()]);

  useEffect(() => {
    let live = true;
    import("@/lib/tools/client/calc").then((m) => live && setMod(m));
    return () => {
      live = false;
    };
  }, []);

  const result: CalcOutput | null = mod
    ? mod.gpa(rows.map((r) => ({ grade: r.grade, credits: Number(r.credits) || 0 })))
    : null;

  const grades = mod ? Object.keys(mod.GRADE_POINTS) : [];

  function update(id: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <ToolShell
      title="GPA Calculator"
      subtitle="Credit-weighted grade point average on the US 4.0 scale."
      icon={GraduationCap}
      badge="In your browser"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="hidden gap-3 px-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:grid sm:grid-cols-[1fr_110px_90px_36px]">
              <span>Course (optional)</span>
              <span>Grade</span>
              <span>Credits</span>
              <span />
            </div>

            {rows.map((r, i) => (
              <div key={r.id} className="grid gap-3 sm:grid-cols-[1fr_110px_90px_36px]">
                <input
                  value={r.name}
                  onChange={(e) => update(r.id, { name: e.target.value })}
                  placeholder={`Course ${i + 1}`}
                  aria-label={`Course ${i + 1} name`}
                  className={inp}
                />
                <select
                  value={r.grade}
                  onChange={(e) => update(r.id, { grade: e.target.value })}
                  aria-label={`Course ${i + 1} grade`}
                  data-testid={`grade-${i}`}
                  className={inp}
                >
                  {grades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  max={12}
                  step={0.5}
                  value={r.credits}
                  onChange={(e) => update(r.id, { credits: e.target.value })}
                  aria-label={`Course ${i + 1} credits`}
                  data-testid={`credits-${i}`}
                  className={`tabular ${inp}`}
                />
                <button
                  onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.id !== r.id) : rs))}
                  aria-label={`Remove course ${i + 1}`}
                  disabled={rows.length === 1}
                  className="grid h-10 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-destructive/40 hover:text-destructive disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <Button onClick={() => setRows((rs) => [...rs, blank()])} data-testid="add-course">
              <Plus className="mr-1.5 h-4 w-4" /> Add course
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <div
            className="rounded-2xl border border-border bg-card p-6"
            data-testid="calc-result"
            aria-live="polite"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {result?.headlineLabel ?? "Grade point average"}
            </p>
            <p
              className="tabular mt-1 text-4xl font-medium tracking-tight text-[rgb(var(--primary))]"
              data-testid="calc-headline"
            >
              {result?.headline ?? "-"}
            </p>
            {result?.rows.length ? (
              <dl className="mt-5 space-y-2.5 border-t border-border pt-4">
                {result.rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-sm text-muted-foreground">{r.label}</dt>
                    <dd className="tabular shrink-0 text-sm font-medium">{r.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          {result?.note && (
            <p className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground leading-relaxed">
              {result.note}
            </p>
          )}
        </aside>
      </div>
    </ToolShell>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
