import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "color-converter",
  primaryKeyword: "hex to rgb color converter",
  metaDescription: "Convert colours between HEX, RGB, HSL and OKLCH. Paste any format, get every other one, with a live preview and contrast check.",
  relatedKeywords: [
    "rgb to hex",
    "hsl to hex",
    "hex to rgb",
    "oklch converter",
    "css color converter",
  ],
  faqs: [
    { q: "Which format should I use in CSS?", a: "HEX and RGB are universally understood. HSL is easier to reason about when building variations, since you adjust lightness directly. OKLCH is the most perceptually accurate and is supported in every current browser." },
    { q: "What makes OKLCH better than HSL?", a: "In HSL, two colours with the same lightness value can look wildly different in brightness. OKLCH is built on human perception, so equal lightness actually looks equal - which is why palettes generated in OKLCH stay consistent." },
    { q: "Does it handle transparency?", a: "Yes. Alpha is preserved across formats, so 8-digit HEX, rgba and hsla all round-trip correctly." },
    { q: "Why does my converted colour look slightly different?", a: "Rounding. HEX stores 8 bits per channel, so converting through a format with finer precision and back can shift a value by one. The difference is not visible." },
  ],
  howTo: [
    { name: "Paste any colour", text: "HEX, RGB, HSL or OKLCH - the format is detected automatically." },
    { name: "Read every other format", text: "All conversions update live, with a preview swatch." },
    { name: "Copy what you need", text: "One click copies a ready-to-paste CSS value." },
  ],
  seoCopy:
    "Convert a colour between HEX, RGB, HSL and OKLCH by pasting any one of them - the format is detected automatically and everything else updates live, alpha included. OKLCH is worth learning if you build palettes: in HSL two colours sharing a lightness value can look completely different in brightness, whereas OKLCH is built on human perception, so equal lightness actually looks equal. That is exactly why the domain accent colours on this site are generated in OKLCH rather than picked by hand.",
};
