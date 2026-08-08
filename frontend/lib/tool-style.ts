import type { Domain } from "@/lib/tools/types";

/**
 * Domain palette for icon chips.
 *
 * Previously this was a hand-picked hue per slug - a rainbow that carried no
 * meaning and needed a new entry for every tool added. Now colour comes from
 * the tool's domain, so it encodes the catalogue's structure, stays correct as
 * the catalogue grows, and needs no maintenance.
 *
 * Endpoints are the same OKLCH family as the --primary accents in globals.css,
 * at fixed chroma, so the chips are siblings of the page accent rather than a
 * separate palette.
 */
export interface DomainStyle {
  from: string;
  to: string;
  shadow: string;
}

const STYLES: Record<Domain, DomainStyle> = {
  pdf: { from: "#D95544", to: "#7F2117", shadow: "rgba(217,85,68, 0.38)" },
  text: { from: "#C56E00", to: "#723500", shadow: "rgba(197,110,0, 0.38)" },
  calc: { from: "#8E8D00", to: "#4D4C00", shadow: "rgba(142,141,0, 0.38)" },
  convert: { from: "#03A14A", to: "#005A1C", shadow: "rgba(3,161,74, 0.38)" },
  data: { from: "#00A49D", to: "#005B57", shadow: "rgba(0,164,157, 0.38)" },
  security: { from: "#0095D7", to: "#00517F", shadow: "rgba(0,149,215, 0.38)" },
  code: { from: "#5F7CEB", to: "#2E3F8D", shadow: "rgba(95,124,235, 0.38)" },
  image: { from: "#A564D1", to: "#5D2E7B", shadow: "rgba(165,100,209, 0.38)" },
  color: { from: "#CD5394", to: "#772151", shadow: "rgba(205,83,148, 0.38)" },
};

export function domainStyle(domain: Domain): DomainStyle {
  return STYLES[domain] ?? STYLES.pdf;
}
