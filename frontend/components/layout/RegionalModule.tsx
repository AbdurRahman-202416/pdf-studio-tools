"use client";

import { useSyncExternalStore } from "react";

import type { Region } from "@/lib/tools/types";

/**
 * Renders its children only for visitors in the given regions.
 *
 * The catalogue keeps genuinely regional tools (NID combine, the 100KB govt
 * portal compressor, passport photo sheets) because that traffic is real and
 * valuable - but showing "Made for Bangladesh" to a visitor in Ohio costs us
 * the audience we're trying to reach. So the tools stay and the regional
 * framing becomes conditional.
 *
 * Region comes from the browser's IANA timezone rather than a geo header on
 * purpose: reading `headers()` server-side opts the whole route out of static
 * rendering, and turning the homepage dynamic to hide one promo section is a
 * bad trade. Timezone is accurate enough for this, needs no infrastructure,
 * and keeps the page prerendered.
 *
 * Rendering nothing until mounted also means crawlers index the global page,
 * which is what we want.
 */
const REGION_ZONES: Record<string, string[]> = {
  BD: ["Asia/Dhaka"],
  IN: ["Asia/Kolkata", "Asia/Calcutta"],
  US: [
    "America/New_York", "America/Chicago", "America/Denver", "America/Phoenix",
    "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu",
  ],
  EU: [
    "Europe/London", "Europe/Dublin", "Europe/Lisbon", "Europe/Madrid",
    "Europe/Paris", "Europe/Brussels", "Europe/Amsterdam", "Europe/Berlin",
    "Europe/Rome", "Europe/Vienna", "Europe/Prague", "Europe/Warsaw",
    "Europe/Stockholm", "Europe/Oslo", "Europe/Copenhagen", "Europe/Helsinki",
    "Europe/Athens", "Europe/Bucharest", "Europe/Budapest", "Europe/Zurich",
  ],
  global: [],
};

/** Timezone never changes during a session, so this store never notifies. */
const subscribe = () => () => {};
const getClientZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
};
/** Empty on the server, so SSR and the first client render agree. */
const getServerZone = () => "";

export function RegionalModule({
  regions,
  children,
}: {
  regions: Region[];
  children: React.ReactNode;
}) {
  const zone = useSyncExternalStore(subscribe, getClientZone, getServerZone);
  if (!zone) return null;

  const allowed = regions.flatMap((r) => REGION_ZONES[r] ?? []);
  if (!allowed.includes(zone)) return null;

  return <>{children}</>;
}
