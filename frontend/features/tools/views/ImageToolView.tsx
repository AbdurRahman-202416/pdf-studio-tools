"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Crop, Image as ImageIcon, Repeat, Scaling, Type, Wand2, AppWindow } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolShell } from "@/features/tools/components/ToolShell";
import { cn } from "@/lib/utils";

const IMAGE_ACCEPT: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

type Mode =
  | "preset"
  | "compress"
  | "resize"
  | "convert"
  | "crop"
  | "watermark"
  | "ico";

interface Preset {
  label: string;
  w: number;
  h: number;
  hint?: string;
}

interface Config {
  mode: Mode;
  presets?: Preset[];
  title: string;
  subtitle: string;
  icon: typeof Wand2;
  accept: Record<string, string[]>;
  /** Fixed output type for pure converters. */
  to?: "image/jpeg" | "image/png" | "image/webp";
  extension?: string;
}

const CONFIG: Record<string, Config> = {
  "compress-image": {
    mode: "compress",
    title: "Compress Image",
    subtitle:
      "Pick a target size or a quality level. Everything happens in your browser - the photo is never uploaded.",
    icon: Wand2,
    accept: IMAGE_ACCEPT,
  },
  "resize-image": {
    mode: "resize",
    title: "Resize Image",
    subtitle:
      "Set exact pixel dimensions. Aspect ratio stays locked unless you unlock it, so nothing comes out stretched.",
    icon: Scaling,
    accept: IMAGE_ACCEPT,
  },
  "jpg-to-png": {
    mode: "convert",
    title: "JPG to PNG",
    subtitle: "Lossless from here on - re-saving a PNG will not degrade it further.",
    icon: ImageIcon,
    accept: { "image/jpeg": [".jpg", ".jpeg"] },
    to: "image/png",
    extension: "png",
  },
  "png-to-jpg": {
    mode: "convert",
    title: "PNG to JPG",
    subtitle:
      "JPG has no transparency, so pick the colour that replaces it. Usually much smaller for photographs.",
    icon: ImageIcon,
    accept: { "image/png": [".png"] },
    to: "image/jpeg",
    extension: "jpg",
  },
  "webp-converter": {
    mode: "convert",
    title: "WebP Converter",
    subtitle:
      "Convert to WebP for the web, or back to JPG/PNG when something old refuses to open it.",
    icon: Repeat,
    accept: IMAGE_ACCEPT,
    to: "image/webp",
    extension: "webp",
  },
  "crop-image": {
    mode: "crop",
    title: "Crop Image",
    subtitle: "Lossless - the pixels you keep are copied untouched, never re-compressed.",
    icon: Crop,
    accept: IMAGE_ACCEPT,
  },
  "watermark-image": {
    mode: "watermark",
    title: "Watermark Image",
    subtitle: "Stamp text across a photo. Tiled marks are much harder to remove than a corner one.",
    icon: Type,
    accept: IMAGE_ACCEPT,
  },
  "social-media-image-resizer": {
    mode: "preset",
    title: "Social Media Image Resizer",
    subtitle:
      "Exact dimensions for every platform, so nothing gets cropped badly by the upload form.",
    icon: Scaling,
    accept: IMAGE_ACCEPT,
    presets: [
      { label: "Instagram post (square)", w: 1080, h: 1080 },
      { label: "Instagram portrait", w: 1080, h: 1350 },
      { label: "Instagram story / Reel", w: 1080, h: 1920 },
      { label: "Facebook post", w: 1200, h: 630 },
      { label: "Facebook cover", w: 851, h: 315 },
      { label: "YouTube thumbnail", w: 1280, h: 720, hint: "16:9, under 2 MB" },
      { label: "YouTube channel art", w: 2560, h: 1440 },
      { label: "X / Twitter post", w: 1600, h: 900 },
      { label: "X / Twitter header", w: 1500, h: 500 },
      { label: "LinkedIn banner", w: 1584, h: 396 },
      { label: "LinkedIn post", w: 1200, h: 627 },
      { label: "Pinterest pin", w: 1000, h: 1500 },
    ],
  },
  "photo-resizer-for-print": {
    mode: "preset",
    title: "Photo Resizer for Print",
    subtitle:
      "Standard print and ID sizes at 300 DPI, which is what a lab needs for a sharp print.",
    icon: Crop,
    accept: IMAGE_ACCEPT,
    presets: [
      { label: "4x6 inch print", w: 1200, h: 1800, hint: "300 DPI" },
      { label: "5x7 inch print", w: 1500, h: 2100, hint: "300 DPI" },
      { label: "8x10 inch print", w: 2400, h: 3000, hint: "300 DPI" },
      { label: "A4", w: 2480, h: 3508, hint: "300 DPI" },
      { label: "A5", w: 1748, h: 2480, hint: "300 DPI" },
      { label: "Passport 35x45 mm", w: 413, h: 531, hint: "UK/EU/most" },
      { label: "US passport 2x2 inch", w: 600, h: 600, hint: "300 DPI" },
      { label: "Visa 50x50 mm", w: 591, h: 591, hint: "300 DPI" },
      { label: "ID 25x35 mm", w: 295, h: 413, hint: "300 DPI" },
    ],
  },
  "image-to-ico": {
    mode: "ico",
    title: "Convert to ICO",
    subtitle: "Builds a real multi-resolution .ico containing 16, 32, 48 and 256px versions.",
    icon: AppWindow,
    accept: IMAGE_ACCEPT,
  },
};

const KB = 1024;
function fmtBytes(n: number) {
  if (n < KB) return `${n} B`;
  if (n < KB * KB) return `${(n / KB).toFixed(1)} KB`;
  return `${(n / KB / KB).toFixed(2)} MB`;
}

interface Result {
  url: string;
  bytes: number;
  originalBytes: number;
  width: number;
  height: number;
  filename: string;
}

export function ImageToolView({ slug }: { slug: string }) {
  const cfg = CONFIG[slug] ?? CONFIG["compress-image"]!;
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  // Per-mode options, deliberately flat so the panel stays simple.
  const [quality, setQuality] = useState(80);
  const [targetKb, setTargetKb] = useState<number | "">("");
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [lockAspect, setLockAspect] = useState(true);
  const [background, setBackground] = useState("#FFFFFF");
  const [outFormat, setOutFormat] = useState<"image/webp" | "image/jpeg" | "image/png">(
    cfg.to ?? "image/jpeg",
  );
  const [wmText, setWmText] = useState("© Your Name");
  const [wmOpacity, setWmOpacity] = useState(38);
  const [wmTile, setWmTile] = useState(true);
  const [cropPct, setCropPct] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [presetIndex, setPresetIndex] = useState(0);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");

  const objectUrl = useRef<string | null>(null);

  // The per-run revoke only covers re-runs; without this, navigating away
  // leaked the last result blob for the lifetime of the document.
  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  const onPick = useCallback(async (f: File | null) => {
    setResult(null);
    setFile(f);
    if (!f) {
      setDims(null);
      return;
    }
    try {
      const bmp = await createImageBitmap(f);
      setDims({ w: bmp.width, h: bmp.height });
      // Always reseed on a new file. Keeping the previous image's values meant
      // swapping a 4000x3000 photo for an 800x600 one silently upscaled it 5x.
      setWidth(bmp.width);
      setHeight(bmp.height);
      bmp.close();
    } catch {
      toast.error("That file could not be read as an image.");
      setFile(null);
    }
  }, []);

  async function run() {
    if (!file) return;
    setBusy(true);
    try {
      const img = await import("@/lib/tools/client/image");
      let blob: Blob;
      let w = dims?.w ?? 0;
      let h = dims?.h ?? 0;
      let ext = cfg.extension ?? "png";

      if (cfg.mode === "compress") {
        if (targetKb !== "" && Number(targetKb) > 0) {
          const out = await img.compressToTarget(file, Number(targetKb) * KB, "image/jpeg");
          if (!out.reachedTarget) {
            toast.warning(
              `Couldn't get under ${targetKb} KB even at minimum quality - this is the smallest JPEG possible at full resolution (${Math.round(out.blob.size / KB)} KB). Try resizing the image first.`,
            );
          }
          blob = out.blob;
          w = out.width;
          h = out.height;
        } else {
          const out = await img.convert(file, { format: "image/jpeg", quality: quality / 100 });
          blob = out.blob;
          w = out.width;
          h = out.height;
        }
        ext = "jpg";
      } else if (cfg.mode === "preset") {
        const p = cfg.presets![presetIndex]!;
        // "cover" crops to fill the target exactly - what social platforms expect.
        // "contain" letterboxes instead, so nothing is lost.
        const out = await img.fitTo(file, p.w, p.h, fitMode, quality / 100);
        blob = out.blob;
        w = out.width;
        h = out.height;
        ext = (file.type.split("/")[1] ?? "png").replace("jpeg", "jpg");
      } else if (cfg.mode === "resize") {
        const out = await img.resize(file, {
          width: width === "" ? undefined : Number(width),
          height: height === "" ? undefined : Number(height),
          lockAspect,
          quality: quality / 100,
        });
        blob = out.blob;
        w = out.width;
        h = out.height;
        ext = (file.type.split("/")[1] ?? "png").replace("jpeg", "jpg");
      } else if (cfg.mode === "convert") {
        const fmt = slug === "webp-converter" ? outFormat : cfg.to!;
        const out = await img.convert(file, {
          format: fmt,
          quality: quality / 100,
          background,
        });
        blob = out.blob;
        w = out.width;
        h = out.height;
        ext = fmt.split("/")[1]!.replace("jpeg", "jpg");
      } else if (cfg.mode === "crop") {
        const sw = dims?.w ?? 0;
        const sh = dims?.h ?? 0;
        const out = await img.crop(file, {
          x: Math.round((cropPct.x / 100) * sw),
          y: Math.round((cropPct.y / 100) * sh),
          width: Math.round((cropPct.w / 100) * sw),
          height: Math.round((cropPct.h / 100) * sh),
        });
        blob = out.blob;
        w = out.width;
        h = out.height;
        ext = (file.type.split("/")[1] ?? "png").replace("jpeg", "jpg");
      } else if (cfg.mode === "watermark") {
        const out = await img.watermark(file, {
          text: wmText,
          opacity: wmOpacity / 100,
          tile: wmTile,
        });
        blob = out.blob;
        w = out.width;
        h = out.height;
        ext = (file.type.split("/")[1] ?? "png").replace("jpeg", "jpg");
      } else {
        blob = await img.toIco(file);
        ext = "ico";
        // An .ico holds several resolutions at once, so a single "width x height"
        // would be misleading. Suppress the dimensions readout for this mode.
        w = 0;
        h = 0;
      }

      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = URL.createObjectURL(blob);
      const base = file.name.replace(/\.[^.]+$/, "");
      setResult({
        url: objectUrl.current,
        bytes: blob.size,
        originalBytes: file.size,
        width: w,
        height: h,
        filename: `${base}.${ext}`,
      });
      toast.success(`${cfg.title} complete`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong processing that image.");
    } finally {
      setBusy(false);
    }
  }

  const delta = result ? 1 - result.bytes / result.originalBytes : 0;

  return (
    <ToolShell title={cfg.title} subtitle={cfg.subtitle} icon={cfg.icon} badge="In your browser">
      <div className="space-y-6">
        <FileDrop
          label={cfg.title}
          accept={cfg.accept}
          file={file}
          onChange={onPick}
          testId={`${slug}-input`}
          hint={
            dims
              ? `${dims.w} × ${dims.h} · ${fmtBytes(file?.size ?? 0)}`
              : "JPG, PNG or WebP. Nothing is uploaded - this runs in your browser."
          }
        />

        {file && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
            <p className="text-sm font-semibold">Options</p>

            {cfg.mode === "compress" && (
              <>
                <Field label="Quality" value={`${quality}`}>
                  <input
                    type="range"
                    min={10}
                    max={98}
                    value={quality}
                    onChange={(e) => setQuality(+e.target.value)}
                    className="w-full accent-[rgb(var(--primary))]"
                    aria-label="Quality"
                  />
                </Field>
                <Field label="Or target size (KB)">
                  <input
                    type="number"
                    min={5}
                    placeholder="e.g. 200"
                    value={targetKb}
                    onChange={(e) => setTargetKb(e.target.value === "" ? "" : +e.target.value)}
                    className={inputCls}
                    aria-label="Target size in KB"
                  />
                </Field>
              </>
            )}

            {cfg.mode === "preset" && (
              <>
                <Field label="Target size">
                  <select
                    value={presetIndex}
                    onChange={(e) => setPresetIndex(Number(e.target.value))}
                    className={inputCls}
                    aria-label="Target size"
                    data-testid="preset-select"
                  >
                    {cfg.presets!.map((p, i) => (
                      <option key={p.label} value={i}>
                        {p.label} — {p.w}x{p.h}
                        {p.hint ? ` (${p.hint})` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="If the aspect ratio differs">
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as "cover" | "contain")}
                    className={inputCls}
                    aria-label="Fit mode"
                  >
                    <option value="cover">Crop to fill (no bars)</option>
                    <option value="contain">Fit inside (adds bars)</option>
                  </select>
                </Field>
                <Field label="Quality" value={`${quality}`}>
                  <input type="range" min={40} max={98} value={quality}
                    onChange={(e) => setQuality(+e.target.value)}
                    className="w-full accent-[rgb(var(--primary))]" aria-label="Quality" />
                </Field>
              </>
            )}

            {cfg.mode === "resize" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Width (px)">
                    <input
                      type="number"
                      min={1}
                      value={width}
                      onChange={(e) => {
                        const v = e.target.value === "" ? "" : +e.target.value;
                        setWidth(v);
                        if (lockAspect && v !== "" && dims)
                          setHeight(Math.round((v * dims.h) / dims.w));
                      }}
                      className={inputCls}
                      aria-label="Width in pixels"
                    />
                  </Field>
                  <Field label="Height (px)">
                    <input
                      type="number"
                      min={1}
                      value={height}
                      onChange={(e) => {
                        const v = e.target.value === "" ? "" : +e.target.value;
                        setHeight(v);
                        if (lockAspect && v !== "" && dims)
                          setWidth(Math.round((v * dims.w) / dims.h));
                      }}
                      className={inputCls}
                      aria-label="Height in pixels"
                    />
                  </Field>
                </div>
                <Toggle checked={lockAspect} onChange={setLockAspect} label="Lock aspect ratio" />
              </>
            )}

            {cfg.mode === "convert" && (
              <>
                {slug === "webp-converter" && (
                  <Field label="Convert to">
                    <select
                      value={outFormat}
                      onChange={(e) => setOutFormat(e.target.value as typeof outFormat)}
                      className={inputCls}
                      aria-label="Output format"
                    >
                      <option value="image/webp">WebP</option>
                      <option value="image/jpeg">JPG</option>
                      <option value="image/png">PNG</option>
                    </select>
                  </Field>
                )}
                {(cfg.to === "image/jpeg" || outFormat === "image/jpeg") && (
                  <Field label="Background for transparent areas">
                    <input
                      type="color"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      className="h-10 w-20 rounded-lg border border-border bg-background"
                      aria-label="Background colour"
                    />
                  </Field>
                )}
                {outFormat !== "image/png" && cfg.to !== "image/png" && (
                  <Field label="Quality" value={`${quality}`}>
                    <input
                      type="range"
                      min={10}
                      max={98}
                      value={quality}
                      onChange={(e) => setQuality(+e.target.value)}
                      className="w-full accent-[rgb(var(--primary))]"
                      aria-label="Quality"
                    />
                  </Field>
                )}
              </>
            )}

            {cfg.mode === "crop" && (
              <div className="grid grid-cols-2 gap-3">
                {(["x", "y", "w", "h"] as const).map((k) => (
                  <Field
                    key={k}
                    label={{ x: "Left %", y: "Top %", w: "Width %", h: "Height %" }[k]}
                  >
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={cropPct[k]}
                      onChange={(e) => setCropPct({ ...cropPct, [k]: +e.target.value })}
                      className={inputCls}
                      aria-label={k}
                    />
                  </Field>
                ))}
              </div>
            )}

            {cfg.mode === "watermark" && (
              <>
                <Field label="Watermark text">
                  <input
                    value={wmText}
                    onChange={(e) => setWmText(e.target.value)}
                    className={inputCls}
                    aria-label="Watermark text"
                  />
                </Field>
                <Field label="Opacity" value={`${wmOpacity}%`}>
                  <input
                    type="range"
                    min={5}
                    max={90}
                    value={wmOpacity}
                    onChange={(e) => setWmOpacity(+e.target.value)}
                    className="w-full accent-[rgb(var(--primary))]"
                    aria-label="Opacity"
                  />
                </Field>
                <Toggle checked={wmTile} onChange={setWmTile} label="Tile across the whole image" />
              </>
            )}

            {cfg.mode === "ico" && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Writes 16, 32, 48 and 256&nbsp;pixel versions into one file. Start from a square
                image for the cleanest result.
              </p>
            )}

            <Button
              onClick={run}
              disabled={busy || (cfg.mode === "watermark" && !wmText.trim())}
              data-testid={`${slug}-run`}
              className="w-full sm:w-auto"
            >
              {busy ? "Working…" : cfg.title}
            </Button>
          </div>
        )}

        {result && (
          <div
            className="rounded-2xl border border-border bg-card p-5 space-y-4"
            data-testid={`${slug}-result`}
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Stat label="Before" value={fmtBytes(result.originalBytes)} />
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
              <Stat label="After" value={fmtBytes(result.bytes)} />
              {delta > 0.01 && (
                <span className="tabular rounded-full bg-[rgb(var(--primary)/0.12)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--primary))]">
                  −{Math.round(delta * 100)}%
                </span>
              )}
              {result.width > 0 && (
                <Stat label="Dimensions" value={`${result.width} × ${result.height}`} />
              )}
            </div>

            {!result.filename.endsWith(".ico") && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={result.url}
                alt="Result preview"
                className="max-h-80 w-auto rounded-xl border border-border"
              />
            )}

            <a href={result.url} download={result.filename} data-testid={`${slug}-download`}>
              <Button className="w-full sm:w-auto">Download {result.filename}</Button>
            </a>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className={cn("tabular text-sm font-medium")}>{value}</span>
    </span>
  );
}
