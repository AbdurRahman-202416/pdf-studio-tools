"use client";

import { useCallback, useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { downloadBlob } from "@/lib/utils";

type Kind = "text" | "url" | "wifi" | "vcard";
type Ecc = "L" | "M" | "Q" | "H";

/** Escaping matters here - an unescaped ; or : silently truncates the payload. */
function esc(s: string) {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

function buildPayload(kind: Kind, f: Record<string, string>): string {
  if (kind === "url") {
    const v = f.url?.trim() ?? "";
    if (!v) return "";
    return /^[a-z]+:\/\//i.test(v) ? v : `https://${v}`;
  }
  if (kind === "wifi") {
    if (!f.ssid) return "";
    const auth = f.encryption || "WPA";
    return `WIFI:T:${auth};S:${esc(f.ssid)};${auth === "nopass" ? "" : `P:${esc(f.password ?? "")};`}${f.hidden === "yes" ? "H:true;" : ""};`;
  }
  if (kind === "vcard") {
    if (!f.name) return "";
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${f.name}`,
      `FN:${f.name}`,
      f.org ? `ORG:${f.org}` : "",
      f.phone ? `TEL:${f.phone}` : "",
      f.email ? `EMAIL:${f.email}` : "",
      f.url ? `URL:${f.url}` : "",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return f.text ?? "";
}

export function QrGeneratorView() {
  const [kind, setKind] = useState<Kind>("url");
  const [fields, setFields] = useState<Record<string, string>>({
    url: "",
    text: "",
    encryption: "WPA",
  });
  const [ecc, setEcc] = useState<Ecc>("M");
  const [size, setSize] = useState(512);
  const [dark, setDark] = useState("#14161C");
  const [light, setLight] = useState("#FFFFFF");
  const [margin, setMargin] = useState(2);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = buildPayload(kind, fields);
  const set = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));

  const render = useCallback(async () => {
    if (!payload) {
      setPngUrl(null);
      setSvg(null);
      setError(null);
      return;
    }
    try {
      const QR = (await import("qrcode")).default;
      const opts = {
        errorCorrectionLevel: ecc,
        margin,
        width: size,
        color: { dark, light },
      } as const;
      const dataUrl = await QR.toDataURL(payload, opts);
      const svgStr = await QR.toString(payload, { ...opts, type: "svg" });
      setPngUrl(dataUrl);
      setSvg(svgStr);
      setError(null);
    } catch (e) {
      // Overflow is the common one: too much data for the chosen ECC level.
      setError(
        e instanceof Error && /too (long|big)|code length overflow/i.test(e.message)
          ? "That's more data than a QR code can hold at this error-correction level. Shorten it, or drop the level to L."
          : "Could not generate that QR code.",
      );
      setPngUrl(null);
      setSvg(null);
    }
  }, [payload, ecc, margin, size, dark, light]);

  useEffect(() => {
    const t = setTimeout(render, 150);
    return () => clearTimeout(t);
  }, [render]);

  function downloadSvg() {
    if (!svg) return;
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
    toast.success("Downloaded SVG");
  }

  return (
    <ToolShell
      title="QR Code Generator"
      subtitle="Encodes your data directly - no redirect, no tracking, and nothing that can expire."
      icon={QrCode}
      badge="In your browser"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="QR content type">
              {(["url", "text", "wifi", "vcard"] as const).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={kind === k}
                  onClick={() => setKind(k)}
                  data-testid={`kind-${k}`}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    kind === k
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {{ url: "Link", text: "Text", wifi: "WiFi", vcard: "Contact" }[k]}
                </button>
              ))}
            </div>

            {kind === "url" && (
              <F label="Destination URL">
                <input
                  value={fields.url ?? ""}
                  onChange={(e) => set("url", e.target.value)}
                  placeholder="example.com/page"
                  data-testid="qr-url"
                  aria-label="Destination URL"
                  className={inp}
                />
              </F>
            )}
            {kind === "text" && (
              <F label="Text">
                <textarea
                  value={fields.text ?? ""}
                  onChange={(e) => set("text", e.target.value)}
                  rows={4}
                  data-testid="qr-text"
                  aria-label="Text"
                  className={inp}
                />
              </F>
            )}
            {kind === "wifi" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Network name (SSID)">
                  <input value={fields.ssid ?? ""} onChange={(e) => set("ssid", e.target.value)} aria-label="SSID" data-testid="qr-ssid" className={inp} />
                </F>
                <F label="Password">
                  <input value={fields.password ?? ""} onChange={(e) => set("password", e.target.value)} aria-label="WiFi password" className={inp} />
                </F>
                <F label="Security">
                  <select value={fields.encryption} onChange={(e) => set("encryption", e.target.value)} aria-label="Security" className={inp}>
                    <option value="WPA">WPA/WPA2/WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Open (no password)</option>
                  </select>
                </F>
              </div>
            )}
            {kind === "vcard" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Full name"><input value={fields.name ?? ""} onChange={(e) => set("name", e.target.value)} aria-label="Full name" data-testid="qr-name" className={inp} /></F>
                <F label="Organisation"><input value={fields.org ?? ""} onChange={(e) => set("org", e.target.value)} aria-label="Organisation" className={inp} /></F>
                <F label="Phone"><input value={fields.phone ?? ""} onChange={(e) => set("phone", e.target.value)} aria-label="Phone" className={inp} /></F>
                <F label="Email"><input value={fields.email ?? ""} onChange={(e) => set("email", e.target.value)} aria-label="Email" className={inp} /></F>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold">Appearance</p>
            <F label="Error correction">
              <select value={ecc} onChange={(e) => setEcc(e.target.value as Ecc)} aria-label="Error correction" className={inp}>
                <option value="L">L - about 7% recoverable, simplest pattern</option>
                <option value="M">M - about 15%, a good default</option>
                <option value="Q">Q - about 25%</option>
                <option value="H">H - about 30%, use behind a centre logo</option>
              </select>
            </F>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Size (px)" value={String(size)}>
                <input type="range" min={128} max={1024} step={64} value={size} onChange={(e) => setSize(+e.target.value)} aria-label="Size" className="w-full accent-[rgb(var(--primary))]" />
              </F>
              <F label="Quiet zone" value={String(margin)}>
                <input type="range" min={0} max={8} value={margin} onChange={(e) => setMargin(+e.target.value)} aria-label="Quiet zone" className="w-full accent-[rgb(var(--primary))]" />
              </F>
              <F label="Foreground"><input type="color" value={dark} onChange={(e) => setDark(e.target.value)} aria-label="Foreground colour" className="h-10 w-20 rounded-lg border border-border bg-background" /></F>
              <F label="Background"><input type="color" value={light} onChange={(e) => setLight(e.target.value)} aria-label="Background colour" className="h-10 w-20 rounded-lg border border-border bg-background" /></F>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 text-center" data-testid="qr-result">
            {pngUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={pngUrl} alt="Generated QR code" className="mx-auto w-full max-w-[240px] rounded-lg" />
            ) : (
              <div className="grid h-[240px] place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                {error ? "Nothing to show" : "Your QR code appears here"}
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {pngUrl && (
            <div className="flex flex-col gap-2">
              <a href={pngUrl} download="qr-code.png" data-testid="qr-download-png">
                <Button className="w-full">Download PNG</Button>
              </a>
              <Button onClick={downloadSvg} className="w-full" data-testid="qr-download-svg">
                Download SVG
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                SVG stays sharp at any print size. Test with a real phone before printing a batch.
              </p>
            </div>
          )}
        </aside>
      </div>
    </ToolShell>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function F({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        {label}
        {value && <span className="tabular text-foreground">{value}</span>}
      </span>
      {children}
    </label>
  );
}
