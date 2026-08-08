/**
 * Colour parsing and conversion, including OKLCH.
 *
 * OKLCH matters here for the same reason it is used to generate this site's
 * domain accents: in HSL, two colours sharing a lightness value can look
 * completely different in brightness, whereas OKLCH is built on human
 * perception so equal lightness actually reads as equal.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const hex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");

/** Accepts hex (3/4/6/8), rgb(), rgba(), hsl(), hsla() and oklch(). */
export function parse(input: string): Rgb | null {
  const s = input.trim().toLowerCase();

  const h = s.match(/^#?([0-9a-f]{3,8})$/i);
  if (h) {
    const v = h[1]!;
    const ex = (i: number) => parseInt(v[i]! + v[i]!, 16);
    if (v.length === 3) return { r: ex(0), g: ex(1), b: ex(2), a: 1 };
    if (v.length === 4) return { r: ex(0), g: ex(1), b: ex(2), a: ex(3) / 255 };
    if (v.length === 6)
      return {
        r: parseInt(v.slice(0, 2), 16),
        g: parseInt(v.slice(2, 4), 16),
        b: parseInt(v.slice(4, 6), 16),
        a: 1,
      };
    if (v.length === 8)
      return {
        r: parseInt(v.slice(0, 2), 16),
        g: parseInt(v.slice(2, 4), 16),
        b: parseInt(v.slice(4, 6), 16),
        a: parseInt(v.slice(6, 8), 16) / 255,
      };
    return null;
  }

  const nums = (str: string) =>
    (str.match(/-?[\d.]+%?/g) ?? []).map((n) =>
      n.endsWith("%") ? parseFloat(n) / 100 : parseFloat(n),
    );

  if (s.startsWith("rgb")) {
    const [r, g, b, a] = nums(s);
    if (r === undefined || g === undefined || b === undefined) return null;
    return { r: r <= 1 && s.includes("%") ? r * 255 : r, g: g <= 1 && s.includes("%") ? g * 255 : g, b: b <= 1 && s.includes("%") ? b * 255 : b, a: a ?? 1 };
  }

  if (s.startsWith("hsl")) {
    const [hh, ss, ll, a] = nums(s);
    if (hh === undefined || ss === undefined || ll === undefined) return null;
    return { ...hslToRgb(hh, ss > 1 ? ss / 100 : ss, ll > 1 ? ll / 100 : ll), a: a ?? 1 };
  }

  if (s.startsWith("oklch")) {
    const [l, c, hh, a] = nums(s);
    if (l === undefined || c === undefined || hh === undefined) return null;
    return { ...oklchToRgb(l > 1 ? l / 100 : l, c, hh), a: a ?? 1 };
  }

  return null;
}

export function hslToRgb(h: number, s: number, l: number): Omit<Rgb, "a"> {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const seg = Math.floor(h / 60) % 6;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][seg]!;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function rgbToHsl({ r, g, b }: Omit<Rgb, "a">) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  if (d) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return { h, s, l };
}

const srgb = (x: number) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(clamp(x), 1 / 2.4) - 0.055;
const linear = (x: number) =>
  x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);

export function oklchToRgb(L: number, C: number, H: number): Omit<Rgb, "a"> {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const bb = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3;
  return {
    r: srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) * 255,
    g: srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) * 255,
    b: srgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) * 255,
  };
}

export function rgbToOklch({ r, g, b }: Omit<Rgb, "a">) {
  const R = linear(r / 255);
  const G = linear(g / 255);
  const B = linear(b / 255);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bc = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, Bc);
  let H = (Math.atan2(Bc, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

/** Relative luminance, for WCAG contrast. */
export function luminance({ r, g, b }: Omit<Rgb, "a">) {
  return 0.2126 * linear(r / 255) + 0.7152 * linear(g / 255) + 0.0722 * linear(b / 255);
}

export function contrast(a: Omit<Rgb, "a">, b: Omit<Rgb, "a">) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function format(c: Rgb) {
  const { h, s, l } = rgbToHsl(c);
  const { L, C, H } = rgbToOklch(c);
  const alpha = c.a < 1 ? c.a : 1;
  return {
    hex: `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${alpha < 1 ? hex2(alpha * 255) : ""}`.toUpperCase(),
    rgb:
      alpha < 1
        ? `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${+alpha.toFixed(3)})`
        : `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`,
    hsl:
      alpha < 1
        ? `hsla(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${+alpha.toFixed(3)})`
        : `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
    oklch: `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)}${alpha < 1 ? ` / ${+alpha.toFixed(3)}` : ""})`,
  };
}

/**
 * Dominant colours, via a coarse RGB histogram.
 *
 * Full k-means would be more accurate but is far slower on a large photo;
 * bucketing to a 32-level grid gets visually the same palette instantly.
 */
export function palette(data: Uint8ClampedArray, count = 6): string[] {
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! < 128) continue;
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += r;
    e.g += g;
    e.b += b;
    buckets.set(key, e);
  }
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((e) => `#${hex2(e.r / e.n)}${hex2(e.g / e.n)}${hex2(e.b / e.n)}`.toUpperCase());
}
