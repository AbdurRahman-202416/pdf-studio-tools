/**
 * Calculator maths.
 *
 * Pure functions, no dependencies, no network. Each returns a headline figure
 * plus the breakdown rows the UI shows underneath, because a bare number with
 * no working shown is not much use on a mortgage or a GPA.
 */

export interface CalcOutput {
  /** The one big number. */
  headline: string;
  headlineLabel: string;
  /** Supporting figures, in display order. */
  rows: { label: string; value: string; hint?: string }[];
  /** Shown as a caveat under the result. */
  note?: string;
}

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

const num = (n: number, dp = 2) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: dp }).format(
    Number.isFinite(n) ? n : 0,
  );

/* -------------------------------- Mortgage -------------------------------- */

export function mortgage(v: Record<string, number | string>): CalcOutput {
  const price = Number(v.price) || 0;
  const downPct = Number(v.downPct) || 0;
  const rate = Number(v.rate) || 0;
  const years = Number(v.years) || 0;
  const taxYear = Number(v.tax) || 0;
  const insYear = Number(v.insurance) || 0;
  const currency = String(v.currency || "USD");

  const down = price * (downPct / 100);
  const principal = Math.max(0, price - down);
  const n = years * 12;
  const r = rate / 100 / 12;

  // Standard amortisation. r === 0 would divide by zero, so handle it.
  const pi = r === 0 ? (n ? principal / n : 0) : (principal * r) / (1 - Math.pow(1 + r, -n));
  const monthlyExtras = taxYear / 12 + insYear / 12;
  const total = pi * n;

  return {
    headline: money(pi + monthlyExtras, currency),
    headlineLabel: "Estimated monthly payment",
    rows: [
      { label: "Principal & interest", value: money(pi, currency) },
      { label: "Property tax", value: money(taxYear / 12, currency), hint: "per month" },
      { label: "Home insurance", value: money(insYear / 12, currency), hint: "per month" },
      { label: "Loan amount", value: money(principal, currency) },
      { label: "Down payment", value: money(down, currency), hint: `${num(downPct, 1)}%` },
      { label: "Total interest", value: money(total - principal, currency), hint: `over ${years} years` },
      { label: "Total of payments", value: money(total, currency) },
    ],
    note:
      "An estimate of principal, interest, tax and insurance. It excludes PMI, HOA fees and closing costs, which a lender's quote will include.",
  };
}

/* ------------------------------- Loan / EMI -------------------------------- */

export function loanEmi(v: Record<string, number | string>): CalcOutput {
  const principal = Number(v.principal) || 0;
  const rate = Number(v.rate) || 0;
  const months = Number(v.months) || 0;
  const currency = String(v.currency || "USD");

  const r = rate / 100 / 12;
  const emi = r === 0 ? (months ? principal / months : 0) : (principal * r) / (1 - Math.pow(1 + r, -months));
  const total = emi * months;

  return {
    headline: money(emi, currency),
    headlineLabel: "Monthly instalment (EMI)",
    rows: [
      { label: "Amount borrowed", value: money(principal, currency) },
      { label: "Total interest", value: money(total - principal, currency) },
      { label: "Total repayable", value: money(total, currency) },
      { label: "Term", value: `${num(months, 0)} months`, hint: `${num(months / 12, 1)} years` },
      {
        label: "Interest as % of loan",
        value: principal ? `${num(((total - principal) / principal) * 100, 1)}%` : "0%",
      },
    ],
  };
}

/* -------------------------------- Percentage ------------------------------- */

export function percentage(v: Record<string, number | string>): CalcOutput {
  const mode = String(v.mode || "of");
  const a = Number(v.a) || 0;
  const b = Number(v.b) || 0;

  if (mode === "isWhatPercent") {
    const pct = b === 0 ? 0 : (a / b) * 100;
    return {
      headline: `${num(pct)}%`,
      headlineLabel: `${num(a)} is this percent of ${num(b)}`,
      rows: [
        { label: "Calculation", value: `${num(a)} ÷ ${num(b)} × 100` },
        { label: "As a fraction", value: b === 0 ? "-" : num(a / b, 4) },
      ],
    };
  }

  if (mode === "change") {
    const diff = b - a;
    const pct = a === 0 ? 0 : (diff / a) * 100;
    return {
      headline: `${diff >= 0 ? "+" : ""}${num(pct)}%`,
      headlineLabel: diff >= 0 ? "Percentage increase" : "Percentage decrease",
      rows: [
        { label: "Absolute change", value: num(diff) },
        { label: "From", value: num(a) },
        { label: "To", value: num(b) },
      ],
      note:
        a === 0
          ? "Percentage change from zero is undefined - any increase is infinite in percentage terms."
          : undefined,
    };
  }

  const result = (a / 100) * b;
  return {
    headline: num(result),
    headlineLabel: `${num(a)}% of ${num(b)}`,
    rows: [
      { label: "Calculation", value: `${num(a)} ÷ 100 × ${num(b)}` },
      { label: "Remaining", value: num(b - result), hint: `${num(100 - a)}% of ${num(b)}` },
    ],
  };
}

/* ----------------------------------- Age ----------------------------------- */

/**
 * Parse a date-only string at LOCAL midnight.
 *
 * `new Date("1990-08-08")` is UTC midnight, but the calendar math below reads
 * it back with local getters - west of UTC that shifts every date one day
 * earlier, so ages and day counts were off by one for the Americas.
 */
function parseLocalDate(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(s);
}

export function age(v: Record<string, number | string>): CalcOutput {
  const birth = parseLocalDate(String(v.birth || ""));
  const now = new Date();
  // Local midnight, so "next birthday" compares date-to-date; comparing
  // against the current time-of-day made the "Today 🎉" branch unreachable.
  const on = v.on
    ? parseLocalDate(String(v.on))
    : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (Number.isNaN(birth.getTime())) {
    return { headline: "-", headlineLabel: "Enter a date of birth", rows: [] };
  }
  if (birth > on) {
    return {
      headline: "-",
      headlineLabel: "That date is in the future",
      rows: [],
      note: "Pick a date of birth on or before the comparison date.",
    };
  }

  // Calendar-accurate: borrow days from the previous month, not a fixed 30.
  let years = on.getFullYear() - birth.getFullYear();
  let months = on.getMonth() - birth.getMonth();
  let days = on.getDate() - birth.getDate();
  if (days < 0) {
    months--;
    days += new Date(on.getFullYear(), on.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Round, not floor: both dates are local midnight, so the difference is an
  // exact day multiple except across a DST change (±1h).
  const totalDays = Math.round((on.getTime() - birth.getTime()) / 86400000);

  const next = new Date(on.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < on) next.setFullYear(next.getFullYear() + 1);
  const untilNext = Math.round((next.getTime() - on.getTime()) / 86400000);

  return {
    headline: `${years} years, ${months} months, ${days} days`,
    headlineLabel: "Age",
    rows: [
      { label: "In months", value: num(years * 12 + months, 0) },
      { label: "In weeks", value: num(Math.floor(totalDays / 7), 0) },
      { label: "In days", value: num(totalDays, 0) },
      { label: "In hours", value: num(totalDays * 24, 0) },
      {
        label: "Next birthday",
        value: untilNext === 0 ? "Today 🎉" : `in ${untilNext} days`,
        hint: next.toDateString(),
      },
    ],
  };
}

/* ------------------------------ Date difference ---------------------------- */

export function dateDifference(v: Record<string, number | string>): CalcOutput {
  const from = parseLocalDate(String(v.from || ""));
  const to = parseLocalDate(String(v.to || ""));
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return { headline: "-", headlineLabel: "Pick both dates", rows: [] };
  }
  const [a, b] = from <= to ? [from, to] : [to, from];
  const days = Math.round((b.getTime() - a.getTime()) / 86400000);

  // Business days: walk the range, skipping Saturday and Sunday.
  let business = 0;
  const cur = new Date(a);
  while (cur < b) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) business++;
    cur.setDate(cur.getDate() + 1);
  }

  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let rem = b.getDate() - a.getDate();
  if (rem < 0) {
    months--;
    rem += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    headline: `${num(days, 0)} days`,
    headlineLabel: "Between the two dates",
    rows: [
      { label: "Calendar breakdown", value: `${years}y ${months}m ${rem}d` },
      { label: "Weeks", value: num(days / 7, 1) },
      { label: "Weekdays only", value: num(business, 0), hint: "excludes Sat & Sun" },
      { label: "Hours", value: num(days * 24, 0) },
      { label: "Inclusive of both days", value: num(days + 1, 0), hint: "days" },
    ],
  };
}

/* ----------------------------------- BMI ----------------------------------- */

export function bmi(v: Record<string, number | string>): CalcOutput {
  const unit = String(v.unit || "metric");
  let kg: number;
  let m: number;

  if (unit === "imperial") {
    const lb = Number(v.weightLb) || 0;
    const ft = Number(v.heightFt) || 0;
    const inch = Number(v.heightIn) || 0;
    kg = lb * 0.45359237;
    m = (ft * 12 + inch) * 0.0254;
  } else {
    kg = Number(v.weightKg) || 0;
    m = (Number(v.heightCm) || 0) / 100;
  }

  const value = m > 0 ? kg / (m * m) : 0;
  const category =
    value === 0 ? "-" :
    value < 18.5 ? "Underweight" :
    value < 25 ? "Healthy weight" :
    value < 30 ? "Overweight" : "Obese";

  const lo = m > 0 ? 18.5 * m * m : 0;
  const hi = m > 0 ? 24.9 * m * m : 0;
  const fmtW = (x: number) => (unit === "imperial" ? `${num(x / 0.45359237, 1)} lb` : `${num(x, 1)} kg`);

  return {
    headline: value ? num(value, 1) : "-",
    headlineLabel: `BMI · ${category}`,
    rows: [
      { label: "Category", value: category },
      { label: "Healthy range for your height", value: value ? `${fmtW(lo)} – ${fmtW(hi)}` : "-" },
      { label: "Underweight", value: "below 18.5" },
      { label: "Healthy", value: "18.5 – 24.9" },
      { label: "Overweight", value: "25 – 29.9" },
      { label: "Obese", value: "30 and above" },
    ],
    note:
      "BMI ignores muscle mass, bone density and body composition, so athletes often read as overweight. It is a population screening tool, not a diagnosis - talk to a doctor about your own health.",
  };
}

/* -------------------------------- Discount --------------------------------- */

export function discount(v: Record<string, number | string>): CalcOutput {
  const price = Number(v.price) || 0;
  const pct = Number(v.pct) || 0;
  const taxPct = Number(v.tax) || 0;
  const currency = String(v.currency || "USD");

  const saved = price * (pct / 100);
  const afterDiscount = price - saved;
  const tax = afterDiscount * (taxPct / 100);

  return {
    headline: money(afterDiscount + tax, currency),
    headlineLabel: taxPct ? "Final price incl. tax" : "Final price",
    rows: [
      { label: "Original price", value: money(price, currency) },
      { label: "You save", value: money(saved, currency), hint: `${num(pct, 1)}% off` },
      { label: "After discount", value: money(afterDiscount, currency) },
      ...(taxPct ? [{ label: `Tax (${num(taxPct, 2)}%)`, value: money(tax, currency) }] : []),
    ],
  };
}

/* ----------------------------------- Tip ----------------------------------- */

export function tip(v: Record<string, number | string>): CalcOutput {
  const bill = Number(v.bill) || 0;
  const pct = Number(v.pct) || 0;
  const people = Math.max(1, Number(v.people) || 1);
  const currency = String(v.currency || "USD");

  const tipAmount = bill * (pct / 100);
  const total = bill + tipAmount;

  return {
    headline: money(total / people, currency),
    headlineLabel: people > 1 ? `Each person pays (${people} people)` : "Total to pay",
    rows: [
      { label: "Bill", value: money(bill, currency) },
      { label: `Tip (${num(pct, 1)}%)`, value: money(tipAmount, currency) },
      { label: "Total", value: money(total, currency) },
      ...(people > 1
        ? [{ label: "Tip per person", value: money(tipAmount / people, currency) }]
        : []),
    ],
  };
}

/* ------------------------------- Unit converter ---------------------------- */

/** Factors to a base unit per category. Temperature is handled separately. */
export const UNITS: Record<string, { base: string; units: Record<string, number> }> = {
  length: {
    base: "m",
    units: {
      Millimetre: 0.001, Centimetre: 0.01, Metre: 1, Kilometre: 1000,
      Inch: 0.0254, Foot: 0.3048, Yard: 0.9144, Mile: 1609.344, "Nautical mile": 1852,
    },
  },
  weight: {
    base: "kg",
    units: {
      Milligram: 0.000001, Gram: 0.001, Kilogram: 1, Tonne: 1000,
      Ounce: 0.028349523125, Pound: 0.45359237, Stone: 6.35029318,
    },
  },
  volume: {
    base: "L",
    units: {
      Millilitre: 0.001, Litre: 1, "Cubic metre": 1000,
      "Teaspoon (US)": 0.00492892, "Tablespoon (US)": 0.0147868, "Cup (US)": 0.236588,
      "Pint (US)": 0.473176, "Quart (US)": 0.946353, "Gallon (US)": 3.785412,
      "Pint (UK)": 0.568261, "Gallon (UK)": 4.54609,
    },
  },
  area: {
    base: "m²",
    units: {
      "Square metre": 1, "Square kilometre": 1_000_000, Hectare: 10_000,
      "Square foot": 0.09290304, "Square yard": 0.83612736, Acre: 4046.8564224,
    },
  },
  speed: {
    base: "m/s",
    units: {
      "Metres per second": 1, "Kilometres per hour": 0.277778,
      "Miles per hour": 0.44704, Knot: 0.514444,
    },
  },
  data: {
    base: "byte",
    units: {
      Byte: 1, Kilobyte: 1024, Megabyte: 1024 ** 2, Gigabyte: 1024 ** 3,
      Terabyte: 1024 ** 4, Bit: 0.125,
    },
  },
  time: {
    base: "s",
    units: {
      Millisecond: 0.001, Second: 1, Minute: 60, Hour: 3600,
      Day: 86400, Week: 604800, Year: 31_557_600,
    },
  },
};

export const TEMPERATURE_UNITS = ["Celsius", "Fahrenheit", "Kelvin"] as const;

export function convertTemperature(value: number, from: string, to: string): number {
  // Normalise to Celsius, then out.
  const c = from === "Fahrenheit" ? (value - 32) * (5 / 9) : from === "Kelvin" ? value - 273.15 : value;
  if (to === "Fahrenheit") return c * (9 / 5) + 32;
  if (to === "Kelvin") return c + 273.15;
  return c;
}

export function convertUnit(value: number, category: string, from: string, to: string): number {
  if (category === "temperature") return convertTemperature(value, from, to);
  const table = UNITS[category];
  if (!table) return value;
  const f = table.units[from];
  const t = table.units[to];
  if (!f || !t) return value;
  return (value * f) / t;
}

/* ----------------------------------- GPA ----------------------------------- */

/** US 4.0 scale. Other systems differ, which the UI says explicitly. */
export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

export function gpa(rows: { grade: string; credits: number }[]): CalcOutput {
  const valid = rows.filter((r) => r.grade in GRADE_POINTS && r.credits > 0);
  const credits = valid.reduce((s, r) => s + r.credits, 0);
  const points = valid.reduce((s, r) => s + GRADE_POINTS[r.grade]! * r.credits, 0);
  const value = credits ? points / credits : 0;

  const standing =
    !credits ? "-" :
    value >= 3.7 ? "Summa/Magna cum laude range" :
    value >= 3.5 ? "Cum laude range" :
    value >= 3.0 ? "Good standing" :
    value >= 2.0 ? "Satisfactory" : "Below typical graduation requirement";

  return {
    headline: credits ? value.toFixed(2) : "-",
    headlineLabel: "Grade point average",
    rows: [
      { label: "Courses counted", value: String(valid.length) },
      { label: "Total credits", value: num(credits, 1) },
      { label: "Total grade points", value: num(points, 2) },
      { label: "Standing", value: standing },
    ],
    note:
      "Uses the US 4.0 scale with +/- grades. Institutions differ - some ignore +/-, some use a 5.0 weighted scale for honours courses, and UK/EU systems do not use GPA at all. Check your own registrar's table.",
  };
}
