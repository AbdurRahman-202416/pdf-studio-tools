"use client";

import { useCallback, useState } from "react";
import { Check, Copy, ExternalLink, ScanLine, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolShell } from "@/features/tools/components/ToolShell";

const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

/** Decoded QR payloads have recognisable prefixes worth labelling. */
function classify(text: string): { kind: string; url?: string } {
  if (/^https?:\/\//i.test(text)) return { kind: "Link", url: text };
  if (/^WIFI:/i.test(text)) return { kind: "WiFi network" };
  if (/^BEGIN:VCARD/i.test(text)) return { kind: "Contact card" };
  if (/^mailto:/i.test(text)) return { kind: "Email address" };
  if (/^tel:/i.test(text)) return { kind: "Phone number" };
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) return { kind: "Link (non-web scheme)" };
  return { kind: "Text" };
}

export function QrScannerView() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const onPick = useCallback(async (f: File | null) => {
    setFile(f);
    setResult(null);
    setError(null);
    if (!f) return;

    setBusy(true);
    try {
      const [{ default: jsQR }, bmp] = await Promise.all([
        import("jsqr"),
        createImageBitmap(f),
      ]);
      const c = document.createElement("canvas");
      c.width = bmp.width;
      c.height = bmp.height;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas is unavailable in this browser.");
      ctx.drawImage(bmp, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      bmp.close();

      const found = jsQR(data.data, data.width, data.height, {
        inversionAttempts: "attemptBoth",
      });
      if (found?.data) {
        setResult(found.data);
        toast.success("QR code decoded");
      } else {
        setError(
          "No QR code found in that image. Crop tightly around the whole code - all three corner squares must be visible - and try a sharper capture.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "That image could not be read.");
    } finally {
      setBusy(false);
    }
  }, []);

  const info = result ? classify(result) : null;

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <ToolShell
      title="QR Scanner"
      subtitle="Read a QR code out of a screenshot or photo. Decoding happens in your browser - nothing is uploaded."
      icon={ScanLine}
      badge="In your browser"
    >
      <div className="space-y-6">
        <FileDrop
          label="QR Scanner"
          accept={ACCEPT}
          file={file}
          onChange={onPick}
          testId="qr-scan-input"
          hint="A screenshot or photo containing the code. It never leaves your device."
        />

        {busy && <p className="text-sm text-muted-foreground">Decoding…</p>}

        {error && (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground" role="alert">
            {error}
          </p>
        )}

        {result && info && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4" data-testid="qr-scan-result" aria-live="polite">
            <div>
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {info.kind}
              </span>
              <p className="tabular mt-1 break-all text-sm">{result}</p>
            </div>

            {info.url && (
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3.5">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Read the address before you open it. QR codes are a common phishing route
                  precisely because the destination cannot be checked by eye.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={copy} data-testid="qr-scan-copy">
                {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              {info.url && (
                <a href={info.url} target="_blank" rel="noopener noreferrer nofollow">
                  <Button>
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    Open link
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
