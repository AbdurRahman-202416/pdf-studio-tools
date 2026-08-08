"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import { ToolShell } from "@/features/tools/components/ToolShell";

/**
 * Password strength estimation.
 *
 * Deliberately not a "does it have a symbol?" checker - those reward
 * `P@ssw0rd1`, which is one of the first things any cracker tries. This
 * estimates the search space, then penalises the patterns that collapse it:
 * dictionary words, keyboard runs, repeats, dates and leetspeak substitution.
 */
const COMMON = new Set([
  "password","123456","123456789","qwerty","abc123","111111","letmein","monkey",
  "dragon","football","iloveyou","admin","welcome","login","princess","solo",
  "master","sunshine","shadow","superman","qazwsx","trustno1","passw0rd","baseball",
]);

const KEYBOARD_RUNS = ["qwerty","asdf","zxcv","1234","qwertz","azerty","poiuy","0987"];

interface Assessment {
  bits: number;
  label: string;
  tone: "weak" | "fair" | "good" | "strong";
  crackTime: string;
  findings: { ok: boolean; text: string }[];
}

function assess(pw: string): Assessment | null {
  if (!pw) return null;

  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;

  let bits = pool > 1 ? Math.log2(pool) * pw.length : 0;
  const findings: { ok: boolean; text: string }[] = [];

  const lower = pw.toLowerCase();
  // Strip leetspeak before dictionary matching - c0ff33 is not a novel password.
  const deleet = lower.replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e")
                      .replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t").replace(/@/g, "a");

  const isCommon = [...COMMON].some((w) => deleet.includes(w));
  if (isCommon) {
    bits = Math.min(bits, 18);
    findings.push({ ok: false, text: "Contains a very common password. This is guessed almost instantly." });
  }

  const keyboard = KEYBOARD_RUNS.some((r) => lower.includes(r));
  if (keyboard) {
    bits -= 12;
    findings.push({ ok: false, text: "Contains a keyboard run like 'qwerty' or '1234'." });
  }

  if (/(.)\1{2,}/.test(pw)) {
    bits -= 8;
    findings.push({ ok: false, text: "Has a character repeated three or more times." });
  }

  if (/(19|20)\d{2}/.test(pw)) {
    bits -= 7;
    findings.push({ ok: false, text: "Contains something that looks like a year." });
  }

  if (/^[A-Z][a-z]+\d{1,4}[!@#$]?$/.test(pw)) {
    bits -= 10;
    findings.push({
      ok: false,
      text: "Follows the Capital-word-then-digits-then-symbol pattern, which crackers try first.",
    });
  }

  if (pw.length < 12) {
    findings.push({ ok: false, text: "Under 12 characters. Length beats complexity every time." });
  } else {
    findings.push({ ok: true, text: `${pw.length} characters long.` });
  }

  if (pool >= 62) findings.push({ ok: true, text: "Mixes letter cases and digits." });
  if (/[^a-zA-Z0-9]/.test(pw)) findings.push({ ok: true, text: "Includes a symbol." });
  if (!isCommon && !keyboard && pw.length >= 16) {
    findings.push({ ok: true, text: "No obvious dictionary word or pattern detected." });
  }

  bits = Math.max(0, bits);

  // ~10 billion guesses/sec — a realistic offline rate against a fast hash.
  const seconds = Math.pow(2, bits) / 1e10;
  const crackTime =
    seconds < 1 ? "instantly" :
    seconds < 60 ? `${Math.round(seconds)} seconds` :
    seconds < 3600 ? `${Math.round(seconds / 60)} minutes` :
    seconds < 86400 ? `${Math.round(seconds / 3600)} hours` :
    seconds < 31_536_000 ? `${Math.round(seconds / 86400)} days` :
    seconds < 31_536_000 * 1000 ? `${Math.round(seconds / 31_536_000)} years` :
    seconds < 31_536_000 * 1e9 ? `${Math.round(seconds / 31_536_000 / 1e6)} million years` :
    "longer than the age of the universe";

  const tone: Assessment["tone"] =
    bits < 40 ? "weak" : bits < 60 ? "fair" : bits < 80 ? "good" : "strong";
  const label = { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" }[tone];

  return { bits, label, tone, crackTime, findings };
}

const TONE_VAR: Record<string, string> = {
  weak: "var(--destructive)",
  fair: "var(--primary)",
  good: "var(--primary)",
  strong: "var(--success)",
};

export function PasswordStrengthView() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const result = useMemo(() => assess(pw), [pw]);

  return (
    <ToolShell
      title="Password Strength Checker"
      subtitle="Estimates how long a password would actually survive - and says why, not just a colour bar."
      icon={ShieldCheck}
      badge="In your browser"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Password to check</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="Type or paste a password"
                data-testid="pw-input"
                aria-label="Password to check"
                className={`tabular ${inp} pr-11`}
              />
              <button
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <p className="rounded-xl border border-border bg-background p-3.5 text-xs text-muted-foreground leading-relaxed">
            This runs entirely in your browser and nothing is transmitted or stored — but as a
            general habit, do not paste a password you actually use into any website.
          </p>
        </div>

        {result && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5" data-testid="pw-result" aria-live="polite">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span
                className="rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  background: `rgb(${TONE_VAR[result.tone]} / 0.14)`,
                  color: `rgb(${TONE_VAR[result.tone]})`,
                }}
                data-testid="pw-label"
              >
                {result.label}
              </span>
              <span className="tabular text-sm text-muted-foreground">
                {Math.round(result.bits)} bits of entropy
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${Math.min(100, (result.bits / 100) * 100)}%`,
                  background: `rgb(${TONE_VAR[result.tone]})`,
                }}
              />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Estimated time to crack offline
              </p>
              <p className="tabular mt-1 text-2xl font-medium" data-testid="pw-time">
                {result.crackTime}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Assuming ~10 billion guesses per second against a fast hash.
              </p>
            </div>

            <ul className="space-y-1.5 border-t border-border pt-4">
              {result.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: f.ok ? "rgb(var(--success))" : "rgb(var(--destructive))" }}
                  />
                  <span className={f.ok ? "text-muted-foreground" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
