import type { LucideIcon } from "lucide-react";

import { domainStyle } from "@/lib/tool-style";
import type { Domain } from "@/lib/tools/types";

interface ToolIconProps {
  /** Drives the chip colour. Colour encodes the domain, not the individual tool. */
  domain: Domain;
  icon: LucideIcon;
  /** Pixel size of the chip (square). Defaults to 56. */
  size?: number;
  className?: string;
}

/**
 * Icon chip used on tool cards.
 *
 * A 135° gradient in the tool's domain hue with a soft specular highlight and
 * a shadow tinted to match - so a grid of cards reads as a colour-coded map of
 * the catalogue rather than a bag of unrelated colours.
 */
export function ToolIcon({ domain, icon: Icon, size = 56, className }: ToolIconProps) {
  const s = domainStyle(domain);
  const iconSize = Math.round(size * 0.45);

  return (
    <div
      className={`relative shrink-0 grid place-items-center text-white ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        backgroundImage: `radial-gradient(circle at 30% 22%, rgba(255,255,255,0.40), transparent 58%), linear-gradient(135deg, ${s.from} 0%, ${s.to} 100%)`,
        boxShadow: [
          `0 12px 24px -10px ${s.shadow}`,
          "0 1px 2px rgba(0,0,0,0.10)",
          "inset 0 1px 0 rgba(255,255,255,0.22)",
        ].join(", "),
      }}
      aria-hidden
    >
      <Icon
        width={iconSize}
        height={iconSize}
        strokeWidth={2}
        style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.16))" }}
      />
    </div>
  );
}
