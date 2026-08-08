"use client";

import { useEffect, useRef, useState } from "react";
import { Flag, Pause, Play, RotateCcw, Timer, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolShell } from "@/features/tools/components/ToolShell";

/**
 * Countdown and stopwatch.
 *
 * Timing is derived from Date.now() deltas rather than counting interval ticks.
 * setInterval drifts - browsers throttle background tabs to once a second or
 * less - so a tick-counting timer loses minutes over a long run. This reads the
 * clock each frame, so backgrounding the tab costs nothing.
 */
function format(ms: number, showMs = false): string {
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  const core = h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return showMs ? `${core}.${String(cs).padStart(2, "0")}` : core;
}

export function TimerView({ slug }: { slug: string }) {
  const isCountdown = slug === "countdown-timer";

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [mins, setMins] = useState(5);
  const [secs, setSecs] = useState(0);
  const [done, setDone] = useState(false);

  /** Time accumulated across previous start/pause cycles. */
  const baseRef = useRef(0);

  const targetMs = (mins * 60 + secs) * 1000;

  /**
   * One effect owns the whole loop.
   *
   * `tick` deliberately lives inside the effect rather than in a useCallback:
   * the React Compiler's immutability rule rejects reading and mutating refs
   * from a memoized callback, and keeping the loop self-contained is clearer
   * anyway. Elapsed time comes from the system clock each frame, so background
   * tab throttling causes no drift.
   */
  useEffect(() => {
    if (!running) return;

    const startedAt = Date.now();
    let frame = 0;

    const beep = () => {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch {
        /* audio is a nicety, never a failure */
      }
    };

    const tick = () => {
      const total = baseRef.current + (Date.now() - startedAt);
      if (isCountdown && total >= targetMs) {
        baseRef.current = targetMs;
        setElapsed(targetMs);
        setRunning(false);
        setDone(true);
        beep();
        return;
      }
      setElapsed(total);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      baseRef.current += Date.now() - startedAt;
    };
  }, [running, isCountdown, targetMs]);

  function reset() {
    setRunning(false);
    setElapsed(0);
    setDone(false);
    setLaps([]);
    baseRef.current = 0;
  }

  const display = isCountdown ? format(Math.max(0, targetMs - elapsed), true) : format(elapsed, true);
  const progress = isCountdown && targetMs ? Math.min(1, elapsed / targetMs) : 0;

  return (
    <ToolShell
      title={isCountdown ? "Countdown Timer" : "Online Stopwatch"}
      subtitle={
        isCountdown
          ? "Set a duration and get an audible alert. Accurate even if you switch tabs."
          : "Start, stop and record laps. Accurate even when the tab is in the background."
      }
      icon={isCountdown ? Timer : TimerReset}
      badge="In your browser"
    >
      <div className="space-y-5">
        {isCountdown && !running && elapsed === 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold">Duration</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Minutes</span>
                <input type="number" min={0} max={180} value={mins}
                  onChange={(e) => setMins(Number(e.target.value) || 0)}
                  data-testid="timer-mins" aria-label="Minutes" className={`tabular ${inp}`} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Seconds</span>
                <input type="number" min={0} max={59} value={secs}
                  onChange={(e) => setSecs(Number(e.target.value) || 0)}
                  data-testid="timer-secs" aria-label="Seconds" className={`tabular ${inp}`} />
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[1, 3, 5, 10, 15, 25, 45, 60].map((m) => (
                <button key={m} onClick={() => { setMins(m); setSecs(0); }}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                    mins === m && secs === 0
                      ? "border-primary/40 bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  {m} min
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p
            className="tabular text-5xl sm:text-7xl font-medium tracking-tight text-[rgb(var(--primary))]"
            data-testid="timer-display"
            aria-live="off"
            role="timer"
          >
            {display}
          </p>
          {done && (
            <p className="mt-3 text-sm font-medium" style={{ color: "rgb(var(--success))" }}>
              Time&apos;s up.
            </p>
          )}

          {isCountdown && (
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => { setDone(false); setRunning((r) => !r); }}
              disabled={isCountdown && targetMs === 0}
              data-testid="timer-toggle"
            >
              {running ? <><Pause className="mr-1.5 h-4 w-4" />Pause</> : <><Play className="mr-1.5 h-4 w-4" />Start</>}
            </Button>
            {!isCountdown && (
              <Button onClick={() => setLaps((l) => [elapsed, ...l])} disabled={!running} data-testid="timer-lap">
                <Flag className="mr-1.5 h-4 w-4" />Lap
              </Button>
            )}
            <Button onClick={reset} data-testid="timer-reset">
              <RotateCcw className="mr-1.5 h-4 w-4" />Reset
            </Button>
          </div>
        </div>

        {laps.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5" data-testid="timer-laps">
            <p className="mb-3 text-sm font-semibold">Laps</p>
            <ol className="space-y-1.5">
              {laps.map((t, i) => (
                <li key={i} className="tabular flex justify-between text-sm">
                  <span className="text-muted-foreground">Lap {laps.length - i}</span>
                  <span>{format(t, true)}</span>
                  <span className="text-muted-foreground">
                    +{format(t - (laps[i + 1] ?? 0), true)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
