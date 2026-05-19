import type { LucideIcon } from "lucide-react";

import { toolStyle } from "@/lib/tool-style";

interface ToolIconProps {
  /** Tool slug — drives the per-tool color palette */
  slug: string;
  icon: LucideIcon;
  /** Pixel size of the chip (square). Defaults to 56. */
  size?: number;
  className?: string;
}

/**
 * 3D-feeling icon chip used on tool cards.
 *
 * Stacks: specular highlight (radial top-left) over a 135° gradient body,
 * with an inset top-edge glow and inset bottom shadow for tactile depth,
 * plus a colored drop shadow.
 */
export function ToolIcon({ slug, icon: Icon, size = 56, className }: ToolIconProps) {
  const s = toolStyle(slug);
  const iconSize = Math.round(size * 0.45);

  return (
    <div
      className={`relative shrink-0 grid place-items-center text-white ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        backgroundImage: `radial-gradient(circle at 30% 22%, rgba(255,255,255,0.55), transparent 55%), linear-gradient(135deg, ${s.from} 0%, ${s.to} 100%)`,
        boxShadow: [
          `0 12px 24px -10px ${s.shadow}`,
          "0 2px 4px rgba(0,0,0,0.12)",
          "inset 0 1px 0 rgba(255,255,255,0.28)",
          "inset 0 -10px 18px -10px rgba(0,0,0,0.25)",
        ].join(", "),
      }}
      aria-hidden
    >
      <Icon
        width={iconSize}
        height={iconSize}
        strokeWidth={2.2}
        style={{
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
        }}
      />
    </div>
  );
}
