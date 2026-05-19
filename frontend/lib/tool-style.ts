/**
 * Per-tool icon palette. Curated (not random rainbow) — each slug gets a
 * distinct hue that hints at the tool's purpose. The colorful chips give
 * the otherwise-restrained "Document Atelier" surface a tactile, 3D feel.
 *
 * `from` / `to` define a 135° linear gradient. `shadow` is a tailwind
 * shadow color token used for the colored drop-shadow.
 */
export interface ToolStyle {
  from: string;
  to: string;
  shadow: string;
}

const DEFAULT_STYLE: ToolStyle = {
  from: "#a16207",
  to: "#7c2d12",
  shadow: "rgba(161, 98, 7, 0.35)",
};

const STYLES: Record<string, ToolStyle> = {
  "compress-pdf-without-losing-quality": {
    from: "#6366f1",
    to: "#312e81",
    shadow: "rgba(99, 102, 241, 0.45)",
  },
  "merge-large-pdf-files-online": {
    from: "#10b981",
    to: "#065f46",
    shadow: "rgba(16, 185, 129, 0.45)",
  },
  "pdf-to-jpg-high-quality": {
    from: "#fb7185",
    to: "#9f1239",
    shadow: "rgba(251, 113, 133, 0.45)",
  },
  "password-protect-pdf-online": {
    from: "#475569",
    to: "#1e293b",
    shadow: "rgba(71, 85, 105, 0.45)",
  },
  "unlock-pdf-with-password-online": {
    from: "#f59e0b",
    to: "#92400e",
    shadow: "rgba(245, 158, 11, 0.45)",
  },
  "pdf-ocr-online-free": {
    from: "#a855f7",
    to: "#581c87",
    shadow: "rgba(168, 85, 247, 0.45)",
  },
  "id-card-to-pdf": {
    from: "#06b6d4",
    to: "#155e75",
    shadow: "rgba(6, 182, 212, 0.45)",
  },
  "passport-photo-to-pdf": {
    from: "#ec4899",
    to: "#9d174d",
    shadow: "rgba(236, 72, 153, 0.45)",
  },
  "pdf-to-excel-converter": {
    from: "#22c55e",
    to: "#14532d",
    shadow: "rgba(34, 197, 94, 0.45)",
  },
};

export function toolStyle(slug: string): ToolStyle {
  return STYLES[slug] ?? DEFAULT_STYLE;
}
