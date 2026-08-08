"use client";

import { useEffect, useMemo, useState } from "react";

import { ToolShell } from "@/features/tools/components/ToolShell";
import { getToolIcon } from "@/lib/seo/tool-icons";
import type { CalcOutput } from "@/lib/tools/client/calc";

type Mod = typeof import("@/lib/tools/client/calc");

type FieldKind = "number" | "date" | "select" | "money" | "percent";

interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  default: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  choices?: { value: string; label: string }[];
  /** Only render when another field holds this value. */
  showIf?: { key: string; equals: string };
  /** Quick-set buttons under the field, e.g. common tip percentages. */
  presets?: { value: string; label: string }[];
}

interface Config {
  title: string;
  subtitle: string;
  iconName: string;
  fields: Field[];
  compute: (m: Mod, v: Record<string, string>) => CalcOutput;
}

const today = () => new Date().toISOString().slice(0, 10);

const CURRENCY: Field = {
  key: "currency",
  label: "Currency",
  kind: "select",
  default: "USD",
  choices: [
    { value: "USD", label: "USD $" },
    { value: "GBP", label: "GBP £" },
    { value: "EUR", label: "EUR €" },
    { value: "CAD", label: "CAD $" },
    { value: "AUD", label: "AUD $" },
    { value: "INR", label: "INR ₹" },
    { value: "BDT", label: "BDT ৳" },
  ],
};

export const CALCULATORS: Record<string, Config> = {
  "mortgage-calculator": {
    title: "Mortgage Calculator",
    subtitle: "Monthly payment including tax and insurance, with the total interest laid out.",
    iconName: "Home",
    fields: [
      { key: "price", label: "Home price", kind: "money", default: "350000", min: 0 },
      { key: "downPct", label: "Down payment", kind: "percent", default: "20", min: 0, max: 100, step: 0.5 },
      { key: "rate", label: "Interest rate (APR)", kind: "percent", default: "6.5", min: 0, max: 30, step: 0.05 },
      { key: "years", label: "Term", kind: "number", default: "30", min: 1, max: 50, suffix: "years",
        presets: [{ value: "15", label: "15 yr" }, { value: "20", label: "20 yr" }, { value: "30", label: "30 yr" }] },
      { key: "tax", label: "Property tax", kind: "money", default: "3600", min: 0, suffix: "per year" },
      { key: "insurance", label: "Home insurance", kind: "money", default: "1200", min: 0, suffix: "per year" },
      CURRENCY,
    ],
    compute: (m, v) => m.mortgage(v),
  },
  "loan-emi-calculator": {
    title: "Loan EMI Calculator",
    subtitle: "Equated monthly instalment, total interest and what the loan really costs.",
    iconName: "Landmark",
    fields: [
      { key: "principal", label: "Loan amount", kind: "money", default: "20000", min: 0 },
      { key: "rate", label: "Interest rate (annual)", kind: "percent", default: "9", min: 0, max: 60, step: 0.1 },
      { key: "months", label: "Term", kind: "number", default: "60", min: 1, max: 480, suffix: "months",
        presets: [{ value: "12", label: "1 yr" }, { value: "36", label: "3 yr" }, { value: "60", label: "5 yr" }, { value: "120", label: "10 yr" }] },
      CURRENCY,
    ],
    compute: (m, v) => m.loanEmi(v),
  },
  "percentage-calculator": {
    title: "Percentage Calculator",
    subtitle: "The three questions people actually ask, in one place.",
    iconName: "Percent",
    fields: [
      { key: "mode", label: "What do you want?", kind: "select", default: "of", choices: [
        { value: "of", label: "What is X% of Y?" },
        { value: "isWhatPercent", label: "X is what percent of Y?" },
        { value: "change", label: "Percentage increase / decrease" },
      ]},
      { key: "a", label: "X", kind: "number", default: "15", step: 0.01 },
      { key: "b", label: "Y", kind: "number", default: "200", step: 0.01 },
    ],
    compute: (m, v) => m.percentage(v),
  },
  "age-calculator": {
    title: "Age Calculator",
    subtitle: "Exact age in years, months and days - and how long until the next birthday.",
    iconName: "Cake",
    fields: [
      { key: "birth", label: "Date of birth", kind: "date", default: "1995-06-15" },
      { key: "on", label: "Age as of", kind: "date", default: today() },
    ],
    compute: (m, v) => m.age(v),
  },
  "date-difference-calculator": {
    title: "Date Difference Calculator",
    subtitle: "Days between two dates, including a weekdays-only count.",
    iconName: "CalendarDays",
    fields: [
      { key: "from", label: "From", kind: "date", default: today() },
      { key: "to", label: "To", kind: "date", default: today() },
    ],
    compute: (m, v) => m.dateDifference(v),
  },
  "bmi-calculator": {
    title: "BMI Calculator",
    subtitle: "Body mass index in metric or imperial, with the healthy weight range for your height.",
    iconName: "HeartPulse",
    fields: [
      { key: "unit", label: "Units", kind: "select", default: "metric", choices: [
        { value: "metric", label: "Metric (kg / cm)" },
        { value: "imperial", label: "Imperial (lb / ft-in)" },
      ]},
      { key: "weightKg", label: "Weight", kind: "number", default: "70", min: 1, max: 500, suffix: "kg", showIf: { key: "unit", equals: "metric" } },
      { key: "heightCm", label: "Height", kind: "number", default: "175", min: 50, max: 260, suffix: "cm", showIf: { key: "unit", equals: "metric" } },
      { key: "weightLb", label: "Weight", kind: "number", default: "154", min: 1, max: 1100, suffix: "lb", showIf: { key: "unit", equals: "imperial" } },
      { key: "heightFt", label: "Height (feet)", kind: "number", default: "5", min: 1, max: 8, suffix: "ft", showIf: { key: "unit", equals: "imperial" } },
      { key: "heightIn", label: "Height (inches)", kind: "number", default: "9", min: 0, max: 11, suffix: "in", showIf: { key: "unit", equals: "imperial" } },
    ],
    compute: (m, v) => m.bmi(v),
  },
  "discount-calculator": {
    title: "Discount Calculator",
    subtitle: "What you actually pay after a percentage off, with optional sales tax.",
    iconName: "Tag",
    fields: [
      { key: "price", label: "Original price", kind: "money", default: "120", min: 0 },
      { key: "pct", label: "Discount", kind: "percent", default: "25", min: 0, max: 100, step: 1,
        presets: [{ value: "10", label: "10%" }, { value: "20", label: "20%" }, { value: "25", label: "25%" }, { value: "50", label: "50%" }, { value: "70", label: "70%" }] },
      { key: "tax", label: "Sales tax", kind: "percent", default: "0", min: 0, max: 40, step: 0.25 },
      CURRENCY,
    ],
    compute: (m, v) => m.discount(v),
  },
  "tip-calculator": {
    title: "Tip Calculator",
    subtitle: "Tip, total and the split per person - the bit everyone does badly at the table.",
    iconName: "HandCoins",
    fields: [
      { key: "bill", label: "Bill amount", kind: "money", default: "80", min: 0 },
      { key: "pct", label: "Tip", kind: "percent", default: "18", min: 0, max: 100, step: 1,
        presets: [{ value: "10", label: "10%" }, { value: "15", label: "15%" }, { value: "18", label: "18%" }, { value: "20", label: "20%" }, { value: "25", label: "25%" }] },
      { key: "people", label: "Split between", kind: "number", default: "1", min: 1, max: 100, suffix: "people" },
      CURRENCY,
    ],
    compute: (m, v) => m.tip(v),
  },
};

export function CalculatorView({ slug }: { slug: string }) {
  const cfg = CALCULATORS[slug];
  const [mod, setMod] = useState<Mod | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((CALCULATORS[slug]?.fields ?? []).map((f) => [f.key, f.default])),
  );

  useEffect(() => {
    let live = true;
    import("@/lib/tools/client/calc").then((m) => live && setMod(m));
    return () => {
      live = false;
    };
  }, []);

  const result = useMemo(
    () => (mod && cfg ? cfg.compute(mod, values) : null),
    [mod, cfg, values],
  );

  if (!cfg) return null;
  const Icon = getToolIcon(cfg.iconName) ?? getToolIcon("Percent")!;
  const visible = cfg.fields.filter(
    (f) => !f.showIf || values[f.showIf.key] === f.showIf.equals,
  );

  return (
    <ToolShell title={cfg.title} subtitle={cfg.subtitle} icon={Icon} badge="In your browser">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
          {visible.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label
                htmlFor={`f-${f.key}`}
                className="flex items-center justify-between text-xs font-medium text-muted-foreground"
              >
                {f.label}
                {f.suffix && <span>{f.suffix}</span>}
              </label>

              {f.kind === "select" ? (
                <select
                  id={`f-${f.key}`}
                  value={values[f.key] ?? f.default}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  data-testid={`calc-${f.key}`}
                  className={inp}
                >
                  {f.choices!.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              ) : (
                <div className="relative">
                  {f.kind === "percent" && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  )}
                  <input
                    id={`f-${f.key}`}
                    type={f.kind === "date" ? "date" : "number"}
                    inputMode={f.kind === "date" ? undefined : "decimal"}
                    min={f.min}
                    max={f.max}
                    step={f.step ?? (f.kind === "money" ? 1 : undefined)}
                    value={values[f.key] ?? f.default}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    data-testid={`calc-${f.key}`}
                    className={`tabular ${inp} ${f.kind === "percent" ? "pr-8" : ""}`}
                  />
                </div>
              )}

              {f.presets && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {f.presets.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setValues({ ...values, [f.key]: p.value })}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                        values[f.key] === p.value
                          ? "border-primary/40 bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))]"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div
            className="rounded-2xl border border-border bg-card p-6"
            data-testid="calc-result"
            aria-live="polite"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {result?.headlineLabel ?? "Result"}
            </p>
            <p
              className="tabular mt-1 text-3xl font-medium tracking-tight text-[rgb(var(--primary))]"
              data-testid="calc-headline"
            >
              {result?.headline ?? "-"}
            </p>

            {result?.rows.length ? (
              <dl className="mt-5 space-y-2.5 border-t border-border pt-4">
                {result.rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-sm text-muted-foreground">
                      {r.label}
                      {r.hint && (
                        <span className="ml-1.5 text-[11px] opacity-70">({r.hint})</span>
                      )}
                    </dt>
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
