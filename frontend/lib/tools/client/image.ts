/**
 * Canvas-based image operations.
 *
 * Every function here runs in the browser: the file is decoded to a bitmap,
 * drawn to an offscreen canvas and re-encoded. Nothing is uploaded, which is
 * both the privacy story and the reason these tools cost nothing to run.
 *
 * Imported dynamically by the image tool view, so none of this ships to a page
 * that does not use it.
 */

export type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

export interface ImageResult {
  blob: Blob;
  width: number;
  height: number;
  /** Source byte count, so the UI can show a before/after comparison. */
  originalBytes: number;
}

/** Decode a File into a bitmap without going through the DOM. */
export async function decode(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

function canvasOf(width: number, height: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(width));
  c.height = Math.max(1, Math.round(height));
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas: c, ctx };
}

function toBlob(canvas: HTMLCanvasElement, type: OutputFormat, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode the image."))),
      type,
      quality,
    );
  });
}

/**
 * JPEG has no alpha channel, so transparent pixels must become something.
 * Filling explicitly avoids the black backgrounds you get by default.
 */
function fillBackground(ctx: CanvasRenderingContext2D, w: number, h: number, colour: string) {
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, w, h);
}

export interface ConvertOptions {
  format: OutputFormat;
  quality?: number;
  /** Used when converting something with alpha into JPEG. */
  background?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export async function convert(file: File, opts: ConvertOptions): Promise<ImageResult> {
  const bmp = await decode(file);
  let { width, height } = bmp;

  if (opts.maxWidth || opts.maxHeight) {
    const scale = Math.min(
      opts.maxWidth ? opts.maxWidth / width : Infinity,
      opts.maxHeight ? opts.maxHeight / height : Infinity,
      1,
    );
    width *= scale;
    height *= scale;
  }

  const { canvas, ctx } = canvasOf(width, height);
  if (opts.format === "image/jpeg") {
    fillBackground(ctx, canvas.width, canvas.height, opts.background ?? "#FFFFFF");
  }
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();

  const blob = await toBlob(canvas, opts.format, opts.quality);
  return { blob, width: canvas.width, height: canvas.height, originalBytes: file.size };
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  /** When true (default) the missing dimension is derived from the source ratio. */
  lockAspect?: boolean;
  format?: OutputFormat;
  quality?: number;
}

export async function resize(file: File, opts: ResizeOptions): Promise<ImageResult> {
  const bmp = await decode(file);
  const ratio = bmp.width / bmp.height;
  let w = opts.width ?? 0;
  let h = opts.height ?? 0;

  if (opts.lockAspect !== false) {
    if (w && !h) h = w / ratio;
    else if (h && !w) w = h * ratio;
    else if (w && h) h = w / ratio;
  }
  if (!w) w = bmp.width;
  if (!h) h = bmp.height;

  const format = opts.format ?? (file.type as OutputFormat) ?? "image/png";
  const { canvas, ctx } = canvasOf(w, h);
  if (format === "image/jpeg") fillBackground(ctx, canvas.width, canvas.height, "#FFFFFF");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();

  const blob = await toBlob(canvas, format, opts.quality);
  return { blob, width: canvas.width, height: canvas.height, originalBytes: file.size };
}

/**
 * Compress to a byte target by binary-searching the quality setting.
 *
 * Encoding is the expensive step, so the search is capped at 7 probes - enough
 * to land within a few percent of the target without a noticeable wait.
 */
export async function compressToTarget(
  file: File,
  targetBytes: number,
  format: OutputFormat = "image/jpeg",
): Promise<ImageResult & { quality: number; reachedTarget: boolean }> {
  const bmp = await decode(file);
  const { canvas, ctx } = canvasOf(bmp.width, bmp.height);
  if (format === "image/jpeg") fillBackground(ctx, canvas.width, canvas.height, "#FFFFFF");
  ctx.drawImage(bmp, 0, 0);
  bmp.close();

  let lo = 0.05;
  let hi = 0.98;
  let best = await toBlob(canvas, format, hi);
  let bestQ = hi;
  let reached = best.size <= targetBytes;

  if (!reached) {
    // If no probe ever lands under the target, fall back to the smallest
    // encode seen - the old code kept the q=0.98 initial blob, silently
    // returning the LARGEST file it produced.
    let smallest = best;
    let smallestQ = bestQ;
    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2;
      const candidate = await toBlob(canvas, format, mid);
      if (candidate.size < smallest.size) {
        smallest = candidate;
        smallestQ = mid;
      }
      if (candidate.size > targetBytes) {
        hi = mid;
      } else {
        lo = mid;
        best = candidate;
        bestQ = mid;
        reached = true;
      }
    }
    if (!reached) {
      best = smallest;
      bestQ = smallestQ;
    }
  }

  return {
    blob: best,
    width: canvas.width,
    height: canvas.height,
    originalBytes: file.size,
    quality: bestQ,
    reachedTarget: reached,
  };
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Lossless for the pixels kept - they are copied, not re-sampled. */
export async function crop(
  file: File,
  rect: CropRect,
  format?: OutputFormat,
  quality?: number,
): Promise<ImageResult> {
  const bmp = await decode(file);
  const fmt = format ?? (file.type as OutputFormat) ?? "image/png";
  const { canvas, ctx } = canvasOf(rect.width, rect.height);
  if (fmt === "image/jpeg") fillBackground(ctx, canvas.width, canvas.height, "#FFFFFF");
  ctx.drawImage(bmp, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  bmp.close();
  const blob = await toBlob(canvas, fmt, quality);
  return { blob, width: canvas.width, height: canvas.height, originalBytes: file.size };
}

export interface WatermarkOptions {
  text: string;
  opacity?: number;
  /** Font size as a fraction of the image's smaller edge, so it scales with the photo. */
  scale?: number;
  rotation?: number;
  colour?: string;
  tile?: boolean;
  position?: "center" | "bottom-right" | "bottom-left" | "top-right" | "top-left";
  format?: OutputFormat;
  quality?: number;
}

export async function watermark(file: File, opts: WatermarkOptions): Promise<ImageResult> {
  const bmp = await decode(file);
  const fmt = opts.format ?? (file.type as OutputFormat) ?? "image/png";
  const { canvas, ctx } = canvasOf(bmp.width, bmp.height);
  if (fmt === "image/jpeg") fillBackground(ctx, canvas.width, canvas.height, "#FFFFFF");
  ctx.drawImage(bmp, 0, 0);
  bmp.close();

  const size = Math.min(canvas.width, canvas.height) * (opts.scale ?? 0.08);
  ctx.font = `600 ${size}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = opts.colour ?? "#FFFFFF";
  ctx.globalAlpha = opts.opacity ?? 0.38;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // A dark edge keeps light text legible over a light photo.
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = Math.max(1, size * 0.03);

  const rot = ((opts.rotation ?? -30) * Math.PI) / 180;

  if (opts.tile) {
    const stepX = ctx.measureText(opts.text).width * 1.8;
    const stepY = size * 4;
    ctx.save();
    ctx.rotate(rot);
    // Rotating the context moves the visible area, so over-draw well past the edges.
    const reach = Math.hypot(canvas.width, canvas.height);
    for (let y = -reach; y < reach; y += stepY) {
      for (let x = -reach; x < reach; x += stepX) {
        ctx.strokeText(opts.text, x, y);
        ctx.fillText(opts.text, x, y);
      }
    }
    ctx.restore();
  } else {
    const pad = size;
    const pos: Record<string, [number, number]> = {
      center: [canvas.width / 2, canvas.height / 2],
      "bottom-right": [canvas.width - pad * 2, canvas.height - pad],
      "bottom-left": [pad * 2, canvas.height - pad],
      "top-right": [canvas.width - pad * 2, pad],
      "top-left": [pad * 2, pad],
    };
    const [x, y] = pos[opts.position ?? "center"] ?? pos.center;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeText(opts.text, 0, 0);
    ctx.fillText(opts.text, 0, 0);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  const blob = await toBlob(canvas, fmt, opts.quality);
  return { blob, width: canvas.width, height: canvas.height, originalBytes: file.size };
}

/**
 * Build a real multi-resolution .ico.
 *
 * An ICO is a small header plus a directory of entries, each pointing at an
 * embedded image. PNG-compressed entries are valid in every browser and OS
 * still in use, and are far smaller than the legacy BMP form.
 */
export async function toIco(file: File, sizes: number[] = [16, 32, 48, 256]): Promise<Blob> {
  const bmp = await decode(file);
  const pngs: Uint8Array[] = [];

  for (const s of sizes) {
    const { canvas, ctx } = canvasOf(s, s);
    // Letterbox rather than stretch, so non-square sources stay in proportion.
    const scale = Math.min(s / bmp.width, s / bmp.height);
    const w = bmp.width * scale;
    const h = bmp.height * scale;
    ctx.drawImage(bmp, (s - w) / 2, (s - h) / 2, w, h);
    const blob = await toBlob(canvas, "image/png");
    pngs.push(new Uint8Array(await blob.arrayBuffer()));
  }
  bmp.close();

  const header = 6;
  const dirEntry = 16;
  const offsetStart = header + dirEntry * pngs.length;
  const total = offsetStart + pngs.reduce((n, p) => n + p.length, 0);

  const buf = new ArrayBuffer(total);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type 1 = icon
  view.setUint16(4, pngs.length, true);

  let offset = offsetStart;
  pngs.forEach((png, i) => {
    const p = header + dirEntry * i;
    const s = sizes[i]!;
    bytes[p] = s >= 256 ? 0 : s; // 0 means 256
    bytes[p + 1] = s >= 256 ? 0 : s;
    bytes[p + 2] = 0; // palette colours
    bytes[p + 3] = 0; // reserved
    view.setUint16(p + 4, 1, true); // colour planes
    view.setUint16(p + 6, 32, true); // bits per pixel
    view.setUint32(p + 8, png.length, true);
    view.setUint32(p + 12, offset, true);
    bytes.set(png, offset);
    offset += png.length;
  });

  return new Blob([buf], { type: "image/x-icon" });
}

/**
 * Scale to an exact target size.
 *
 * `cover` fills the frame and crops the overflow, which is what social
 * platforms do to your upload anyway - doing it here means you choose what
 * gets cut. `contain` letterboxes onto white instead, losing nothing.
 */
export async function fitTo(
  file: File,
  targetW: number,
  targetH: number,
  mode: "cover" | "contain" = "cover",
  quality = 0.9,
): Promise<ImageResult> {
  const bmp = await decode(file);
  const format = (file.type as OutputFormat) || "image/jpeg";
  const { canvas, ctx } = canvasOf(targetW, targetH);

  if (format === "image/jpeg" || mode === "contain") {
    fillBackground(ctx, canvas.width, canvas.height, "#FFFFFF");
  }

  const scale =
    mode === "cover"
      ? Math.max(targetW / bmp.width, targetH / bmp.height)
      : Math.min(targetW / bmp.width, targetH / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;

  ctx.drawImage(bmp, (targetW - w) / 2, (targetH - h) / 2, w, h);
  bmp.close();

  const blob = await toBlob(canvas, format, quality);
  return { blob, width: targetW, height: targetH, originalBytes: file.size };
}
