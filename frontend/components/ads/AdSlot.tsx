"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { ADSENSE_CLIENT, ADSENSE_SLOTS, type AdPlacement } from "./config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * One responsive AdSense unit, keyed by placement name rather than raw slot id
 * so pages never carry ad-network identifiers.
 *
 * Renders nothing until both the publisher id and this placement's slot id are
 * configured, so the component can sit in the tree of a non-monetised deploy
 * with zero DOM or network cost. `min-height` reserves space up front - a unit
 * that pops in and shoves the FAQ down is a CLS regression AdSense itself
 * penalises.
 */
export function AdSlot({ placement }: { placement: AdPlacement }) {
  const slot = ADSENSE_SLOTS[placement];
  const pathname = usePathname() ?? "";
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Guard against the dev double-invoke and client-side re-renders; pushing
    // twice for one <ins> makes AdSense log errors and blank the unit.
    if (!ref.current || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Blocked or failed loader - the empty container keeps its reserved
      // height and stays visually silent.
    }
  }, []);

  if (!ADSENSE_CLIENT || !slot || pathname.startsWith("/widget")) return null;

  return (
    <div className="min-h-[90px] w-full overflow-hidden">
      <ins
        ref={ref}
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
