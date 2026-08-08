"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Coins, Dices, Hash, Shuffle, Users } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolShell } from "@/features/tools/components/ToolShell";

/**
 * Randomiser tools.
 *
 * All draws use crypto.getRandomValues, not Math.random. That matters more than
 * it sounds for the picker wheel: people use these for giveaways and classroom
 * selection, where a predictable generator is a fairness problem.
 */
function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) return min;
  const limit = Math.floor(0x1_0000_0000 / range) * range;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0]! < limit) return min + (buf[0]! % range);
  }
}

const FIRST = "Alex,Sam,Jordan,Taylor,Casey,Riley,Morgan,Avery,Quinn,Rowan,Skyler,Emerson,Finley,Harper,Kai,Logan,Micah,Noel,Parker,Reese,Sage,Toby,Wren,Zara,Ada,Grace,Linus,Marie,Nikola,Rosalind".split(",");
const LAST = "Hart,Vale,Brooks,Quinn,Marsh,Frost,Blake,Reed,Shaw,Lane,Cross,Field,Stone,Wells,Bright,Chase,Dale,Ellis,Ford,Gray,Hale,Irving,Keller,Lowe,Mercer,North,Orton,Pike,Rhodes,Sterling".split(",");

type Mode = "coin" | "dice" | "number" | "name" | "wheel";

const CONFIG: Record<string, { mode: Mode; title: string; subtitle: string; icon: typeof Coins }> = {
  "coin-flip": {
    mode: "coin",
    title: "Coin Flip",
    subtitle: "A genuinely random heads or tails, with a running tally.",
    icon: Coins,
  },
  "dice-roller": {
    mode: "dice",
    title: "Dice Roller",
    subtitle: "Roll any number of dice with any number of sides. D&D-friendly.",
    icon: Dices,
  },
  "random-number-generator": {
    mode: "number",
    title: "Random Number Generator",
    subtitle: "Pick numbers in a range, with or without repeats.",
    icon: Hash,
  },
  "random-name-generator": {
    mode: "name",
    title: "Random Name Generator",
    subtitle: "Placeholder names for test data, characters and mock-ups.",
    icon: Users,
  },
  "random-picker-wheel": {
    mode: "wheel",
    title: "Random Picker Wheel",
    subtitle: "Paste your options, pick a winner. Fair draws for giveaways and classrooms.",
    icon: Shuffle,
  },
};

export function RandomizerView({ slug }: { slug: string }) {
  const cfg = CONFIG[slug] ?? CONFIG["coin-flip"]!;
  const [result, setResult] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);

  // Per-mode options
  const [count, setCount] = useState(1);
  const [sides, setSides] = useState(6);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [unique, setUnique] = useState(false);
  const [options, setOptions] = useState("Alice\nBob\nCharlie\nDana");
  const [removeWinner, setRemoveWinner] = useState(false);

  const entries = useMemo(
    () => options.split("\n").map((s) => s.trim()).filter(Boolean),
    [options],
  );

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(() => {
    if (cfg.mode === "coin") {
      const flips = Array.from({ length: count }, () => (randomInt(0, 1) ? "Heads" : "Tails"));
      setResult(flips.length === 1 ? flips[0]! : `${flips.filter((f) => f === "Heads").length} heads`);
      setDetail(flips.length > 1 ? flips.join(" · ") : "");
      setHistory((h) => [...flips, ...h].slice(0, 30));
      return;
    }

    if (cfg.mode === "dice") {
      const rolls = Array.from({ length: count }, () => randomInt(1, sides));
      const total = rolls.reduce((a, b) => a + b, 0);
      setResult(String(total));
      setDetail(count > 1 ? `${count}d${sides} → ${rolls.join(" + ")}` : `d${sides}`);
      setHistory((h) => [`${count}d${sides}: ${total}`, ...h].slice(0, 30));
      return;
    }

    if (cfg.mode === "number") {
      const lo = Math.min(min, max);
      const hi = Math.max(min, max);
      if (unique && count > hi - lo + 1) {
        setResult("-");
        setDetail(`Cannot pick ${count} unique numbers from ${hi - lo + 1} possibilities.`);
        return;
      }
      const picked: number[] = [];
      const seen = new Set<number>();
      while (picked.length < count) {
        const n = randomInt(lo, hi);
        if (unique && seen.has(n)) continue;
        seen.add(n);
        picked.push(n);
      }
      setResult(picked.join(", "));
      setDetail(`${count} number${count === 1 ? "" : "s"} between ${lo} and ${hi}`);
      setHistory((h) => [picked.join(", "), ...h].slice(0, 30));
      return;
    }

    if (cfg.mode === "name") {
      const names = Array.from(
        { length: count },
        () => `${FIRST[randomInt(0, FIRST.length - 1)]} ${LAST[randomInt(0, LAST.length - 1)]}`,
      );
      setResult(names.join("\n"));
      setDetail("");
      return;
    }

    // wheel — a short suspense delay, then a fair pick
    if (!entries.length) {
      setResult("-");
      setDetail("Add at least one option.");
      return;
    }
    setSpinning(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const winner = entries[randomInt(0, entries.length - 1)]!;
      setResult(winner);
      setDetail(`Picked from ${entries.length} option${entries.length === 1 ? "" : "s"}`);
      setHistory((h) => [winner, ...h].slice(0, 30));
      setSpinning(false);
      if (removeWinner) {
        setOptions((o) =>
          o.split("\n").filter((l) => l.trim() !== winner).join("\n"),
        );
      }
    }, 700);
  }, [cfg.mode, count, sides, min, max, unique, entries, removeWinner]);

  return (
    <ToolShell title={cfg.title} subtitle={cfg.subtitle} icon={cfg.icon} badge="In your browser">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold">Options</p>

          {cfg.mode === "wheel" ? (
            <>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  One option per line ({entries.length})
                </span>
                <textarea
                  rows={10}
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  data-testid="wheel-options"
                  aria-label="Options, one per line"
                  className={`tabular ${inp}`}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={removeWinner}
                  onChange={(e) => setRemoveWinner(e.target.checked)}
                  className="h-4 w-4 accent-[rgb(var(--primary))]"
                />
                Remove the winner after each pick
              </label>
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Num label={cfg.mode === "name" ? "How many names" : "How many"} value={count} set={setCount} min={1} max={100} testId="rand-count" />
              {cfg.mode === "dice" && <Num label="Sides per die" value={sides} set={setSides} min={2} max={1000} testId="rand-sides" />}
              {cfg.mode === "number" && (
                <>
                  <Num label="Minimum" value={min} set={setMin} min={-1000000} max={1000000} testId="rand-min" />
                  <Num label="Maximum" value={max} set={setMax} min={-1000000} max={1000000} testId="rand-max" />
                </>
              )}
            </div>
          )}

          {cfg.mode === "number" && (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={unique}
                onChange={(e) => setUnique(e.target.checked)}
                className="h-4 w-4 accent-[rgb(var(--primary))]"
              />
              No repeats (like a lottery draw)
            </label>
          )}

          {cfg.mode === "dice" && (
            <div className="flex flex-wrap gap-1.5">
              {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => setSides(s)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                    sides === s
                      ? "border-primary/40 bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  d{s}
                </button>
              ))}
            </div>
          )}

          <Button onClick={run} disabled={spinning} data-testid="rand-go" className="w-full sm:w-auto">
            {spinning ? "Picking…" : cfg.mode === "coin" ? "Flip" : cfg.mode === "dice" ? "Roll" : "Pick"}
          </Button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 text-center" aria-live="polite">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Result</p>
            <p
              className="tabular mt-2 whitespace-pre-wrap break-words text-3xl font-medium tracking-tight text-[rgb(var(--primary))]"
              data-testid="rand-result"
            >
              {spinning ? "…" : result || "-"}
            </p>
            {detail && <p className="tabular mt-2 text-xs text-muted-foreground">{detail}</p>}
          </div>

          {history.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Recent</p>
                <button onClick={() => setHistory([])} className="text-xs text-primary hover:underline">
                  Clear
                </button>
              </div>
              <p className="tabular mt-2 text-xs text-muted-foreground leading-relaxed">
                {history.join(" · ")}
              </p>
            </div>
          )}

          <p className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground leading-relaxed">
            Draws use your browser&apos;s cryptographic randomness, not <code>Math.random</code> —
            which matters if you&apos;re running a giveaway.
          </p>
        </aside>
      </div>
    </ToolShell>
  );
}

function Num({
  label, value, set, min, max, testId,
}: {
  label: string; value: number; set: (n: number) => void; min: number; max: number; testId: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => set(Number(e.target.value) || 0)}
        data-testid={testId}
        aria-label={label}
        className={`tabular ${inp}`}
      />
    </label>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
