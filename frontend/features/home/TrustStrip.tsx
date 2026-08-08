import { Globe2, Lock, MonitorSmartphone, ShieldCheck, Timer } from "lucide-react";

import { tools } from "@/lib/tools";

/**
 * Credibility strip, aimed at a first-time US/UK visitor.
 *
 * The strongest claim goes first and it is a real one: most of the catalogue
 * never uploads anything. The count is read from the registry rather than
 * written down, so it cannot drift.
 *
 * This used to lead with "Works with Bangla & 100+ languages". Multilingual
 * support is a genuine strength, but leading a global homepage with one
 * specific language reads as regional - so the general claim stays here and
 * the regional framing lives behind RegionalModule.
 */
const clientCount = tools.filter((t) => t.runtime === "client").length;

const items = [
  { Icon: MonitorSmartphone, label: `${clientCount} tools run in your browser` },
  { Icon: Timer, label: "Files auto-delete in 1 hour" },
  { Icon: ShieldCheck, label: "No signup required, ever" },
  { Icon: Lock, label: "Free forever, no watermark" },
] as const;

void Globe2;

export function TrustStrip() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border bg-card/60 p-4">
      {items.map(({ Icon, label }) => (
        <li key={label} className="flex items-center gap-3 text-sm">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-medium text-foreground">{label}</span>
        </li>
      ))}
    </ul>
  );
}
