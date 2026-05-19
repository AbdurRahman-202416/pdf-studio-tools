import { Globe2, Lock, ShieldCheck, Timer } from "lucide-react";

const items = [
  { Icon: Timer, label: "Files auto-delete in 1 hour" },
  { Icon: ShieldCheck, label: "No signup required, ever" },
  { Icon: Globe2, label: "Works with Bangla & 100+ languages" },
  { Icon: Lock, label: "Free forever, no watermark" },
] as const;

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
