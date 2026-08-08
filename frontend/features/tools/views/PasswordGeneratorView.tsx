"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { ToolShell } from "@/features/tools/components/ToolShell";

type Mod = typeof import("@/lib/tools/client/secret");

export function PasswordGeneratorView() {
  const [mod, setMod] = useState<Mod | null>(null);
  const [mode, setMode] = useState<"password" | "passphrase">("password");
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  const [length, setLength] = useState(20);
  const [lowercase, setLowercase] = useState(true);
  const [uppercase, setUppercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);

  const [words, setWords] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [capitalise, setCapitalise] = useState(false);

  useEffect(() => {
    let live = true;
    import("@/lib/tools/client/secret").then((m) => live && setMod(m));
    return () => {
      live = false;
    };
  }, []);

  const generate = useCallback(() => {
    if (!mod) return "";
    return mode === "passphrase"
      ? mod.generatePassphrase(words, separator, capitalise)
      : mod.generatePassword({ length, lowercase, uppercase, digits, symbols, avoidAmbiguous });
  }, [
    mod, mode, words, separator, capitalise,
    length, lowercase, uppercase, digits, symbols, avoidAmbiguous,
  ]);

  /**
   * Regenerate when the options change, using React 19's set-state-in-render
   * rather than an effect - the repo lints `react-hooks/set-state-in-effect`,
   * and an effect here would also render one frame of a stale password.
   */
  const optionsKey = JSON.stringify([
    mode, words, separator, capitalise,
    length, lowercase, uppercase, digits, symbols, avoidAmbiguous,
    Boolean(mod),
  ]);
  const [lastKey, setLastKey] = useState<string | null>(null);
  if (mod && optionsKey !== lastKey) {
    setLastKey(optionsKey);
    setValue(generate());
    setCopied(false);
  }

  const regenerate = useCallback(() => {
    setValue(generate());
    setCopied(false);
  }, [generate]);

  const bits = mod
    ? mode === "passphrase"
      ? Math.log2(mod.PASSPHRASE_WORDLIST_SIZE) * words
      : mod.entropyBits(
          mod.alphabetSizeFor({ length, lowercase, uppercase, digits, symbols, avoidAmbiguous }),
          length,
        )
    : 0;
  const strength = mod ? mod.strengthLabel(bits) : { label: "-", tone: "weak" as const };
  const noSets = mode === "password" && !lowercase && !uppercase && !digits && !symbols;

  const TONE: Record<string, string> = {
    weak: "var(--destructive)",
    fair: "var(--primary)",
    good: "var(--primary)",
    strong: "var(--success)",
  };

  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied - it was never sent anywhere");
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolShell
      title="Password Generator"
      subtitle="Generated with your browser's cryptographic randomness. Nothing is transmitted or stored."
      icon={KeyRound}
      badge="In your browser"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Generator mode">
            {(["password", "passphrase"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                data-testid={`mode-${m}`}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "password" ? "Password" : "Passphrase"}
              </button>
            ))}
          </div>

          <div className="flex items-stretch gap-2">
            <output
              data-testid="password-output"
              aria-live="polite"
              className="tabular flex-1 break-all rounded-xl border border-border bg-background px-4 py-3.5 text-base"
            >
              {noSets ? "Select at least one character set" : value || "…"}
            </output>
            <button
              onClick={regenerate}
              aria-label="Generate a new one"
              data-testid="regenerate"
              className="grid w-12 shrink-0 place-items-center rounded-xl border border-border bg-background transition hover:border-primary/40 hover:text-primary"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={copy} disabled={!value || noSets} data-testid="copy-password">
              {copied ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" /> Copy
                </>
              )}
            </Button>
            <span className="flex items-center gap-2 text-sm">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  background: `rgb(${TONE[strength.tone]} / 0.14)`,
                  color: `rgb(${TONE[strength.tone]})`,
                }}
                data-testid="strength"
              >
                {strength.label}
              </span>
              <span className="tabular text-muted-foreground">
                {Math.round(bits)} bits of entropy
              </span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold">Options</p>

          {mode === "password" ? (
            <>
              <label className="block space-y-1.5">
                <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  Length <span className="tabular text-foreground">{length}</span>
                </span>
                <input
                  type="range"
                  min={6}
                  max={64}
                  value={length}
                  onChange={(e) => setLength(+e.target.value)}
                  aria-label="Length"
                  className="w-full accent-[rgb(var(--primary))]"
                />
              </label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Check2 label="Lowercase (a-z)" checked={lowercase} onChange={setLowercase} />
                <Check2 label="Uppercase (A-Z)" checked={uppercase} onChange={setUppercase} />
                <Check2 label="Digits (0-9)" checked={digits} onChange={setDigits} />
                <Check2 label="Symbols (!@#…)" checked={symbols} onChange={setSymbols} />
                <Check2
                  label="Avoid look-alikes (O/0, l/1)"
                  checked={avoidAmbiguous}
                  onChange={setAvoidAmbiguous}
                />
              </div>
            </>
          ) : (
            <>
              <label className="block space-y-1.5">
                <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  Words <span className="tabular text-foreground">{words}</span>
                </span>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={words}
                  onChange={(e) => setWords(+e.target.value)}
                  aria-label="Word count"
                  className="w-full accent-[rgb(var(--primary))]"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Separator</span>
                <input
                  value={separator}
                  maxLength={3}
                  onChange={(e) => setSeparator(e.target.value)}
                  aria-label="Separator"
                  className="tabular w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <Check2 label="Capitalise each word" checked={capitalise} onChange={setCapitalise} />
            </>
          )}
        </div>
      </div>
    </ToolShell>
  );
}

function Check2({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[rgb(var(--primary))]"
      />
      {label}
    </label>
  );
}
