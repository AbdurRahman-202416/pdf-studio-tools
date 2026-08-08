"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Barcode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { downloadBlob } from "@/lib/utils";

const FORMATS = [
  { value: "CODE128", label: "CODE128", hint: "Letters and numbers. The flexible default." },
  { value: "EAN13", label: "EAN-13", hint: "Retail products. 12 digits, check digit added." },
  { value: "UPC", label: "UPC-A", hint: "North American retail. 11 digits." },
  { value: "EAN8", label: "EAN-8", hint: "Small retail packaging. 7 digits." },
  { value: "CODE39", label: "CODE39", hint: "Older industrial scanners." },
  { value: "ITF14", label: "ITF-14", hint: "Shipping cartons. 13 digits." },
  { value: "MSI", label: "MSI", hint: "Inventory and warehouse shelving." },
  { value: "pharmacode", label: "Pharmacode", hint: "Pharmaceutical packaging. 3-131070." },
];

const DEFAULTS: Record<string, string> = {
  CODE128: "PDFSTUDIO-001",
  EAN13: "590123412345",
  UPC: "01234567890",
  EAN8: "9638507",
  CODE39: "ABC-123",
  ITF14: "1540014128876",
  MSI: "1234567",
  pharmacode: "1234",
};

export function BarcodeGeneratorView() {
  const [format, setFormat] = useState("CODE128");
  const [value, setValue] = useState(DEFAULTS.CODE128!);
  const [showText, setShowText] = useState(true);
  const [height, setHeight] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const render = useCallback(async () => {
    const el = svgRef.current;
    if (!el) return;
    if (!value.trim()) {
      setError(null);
      setReady(false);
      el.innerHTML = "";
      return;
    }
    try {
      const JsBarcode = (await import("jsbarcode")).default;
      JsBarcode(el, value, {
        format,
        displayValue: showText,
        height,
        margin: 10,
        lineColor: "#14161C",
        background: "#FFFFFF",
        font: "monospace",
        fontSize: 16,
        valid: (ok: boolean) => {
          if (!ok) throw new Error("invalid");
        },
      });
      setError(null);
      setReady(true);
    } catch {
      const f = FORMATS.find((x) => x.value === format);
      setError(`"${value}" isn't valid for ${f?.label ?? format}. ${f?.hint ?? ""}`);
      setReady(false);
      el.innerHTML = "";
    }
  }, [format, value, showText, height]);

  useEffect(() => {
    const t = setTimeout(render, 120);
    return () => clearTimeout(t);
  }, [render]);

  function download(kind: "svg" | "png") {
    const el = svgRef.current;
    if (!el || !ready) return;
    const source = new XMLSerializer().serializeToString(el);

    if (kind === "svg") {
      downloadBlob(new Blob([source], { type: "image/svg+xml" }), `barcode-${value}.svg`);
      toast.success("Downloaded SVG");
      return;
    }

    // Rasterise the SVG through an image so the PNG matches exactly what is shown.
    const img = new Image();
    const svgUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(source)))}`;
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width * 2;
      c.height = img.height * 2;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => {
        if (!b) return;
        downloadBlob(b, `barcode-${value}.png`);
        toast.success("Downloaded PNG");
      });
    };
    img.src = svgUrl;
  }

  const current = FORMATS.find((f) => f.value === format);

  return (
    <ToolShell
      title="Barcode Generator"
      subtitle="Validated as you type, with any required check digit computed for you."
      icon={Barcode}
      badge="In your browser"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Symbology</span>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                setValue(DEFAULTS[e.target.value] ?? "");
              }}
              data-testid="barcode-format"
              aria-label="Symbology"
              className={inp}
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {current && <span className="text-xs text-muted-foreground">{current.hint}</span>}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Value</span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
              data-testid="barcode-value"
              aria-label="Barcode value"
              aria-invalid={!!error}
              className={`tabular ${inp}`}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                Bar height <span className="tabular text-foreground">{height}</span>
              </span>
              <input
                type="range"
                min={30}
                max={160}
                value={height}
                onChange={(e) => setHeight(+e.target.value)}
                aria-label="Bar height"
                className="w-full accent-[rgb(var(--primary))]"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 self-end text-sm">
              <input
                type="checkbox"
                checked={showText}
                onChange={(e) => setShowText(e.target.checked)}
                className="h-4 w-4 accent-[rgb(var(--primary))]"
              />
              Print the value underneath
            </label>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert" data-testid="barcode-error">
              {error}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="grid min-h-[140px] place-items-center rounded-xl bg-white p-4">
            <svg ref={svgRef} data-testid="barcode-svg" role="img" aria-label={`Barcode for ${value}`} />
          </div>
          {ready && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => download("png")} data-testid="barcode-download-png">
                Download PNG
              </Button>
              <Button onClick={() => download("svg")} data-testid="barcode-download-svg">
                Download SVG
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Keep the white space either side when printing, and never scale width and height
            independently - both are the usual reasons a barcode stops scanning.
          </p>
        </div>
      </div>
    </ToolShell>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
