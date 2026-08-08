import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/Card";
import { roadmap, type Status } from "@/content/roadmap";
import { cn } from "@/lib/utils";
import { brand } from "@/brand.config";

export const metadata: Metadata = {
  title: "Roadmap – What's shipped, in progress, and coming",
  description:
    `Transparent product roadmap for ${brand.name}. See which PDF tools are live, which are being built, and which are under consideration.`,
  alternates: { canonical: "/roadmap" },
  openGraph: {
    title: `Roadmap · ${brand.name}`,
    description: `Public roadmap for ${brand.name}.`,
    url: "/roadmap",
    images: [
      {
        url: "/og?title=Roadmap&subtitle=What%27s+shipped%2C+in+progress%2C+and+coming",
        width: 1200,
        height: 630,
      },
    ],
  },
};

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  shipped: { label: "Shipped", className: "bg-success/15 text-success" },
  "in-progress": { label: "In progress", className: "bg-primary/15 text-primary" },
  planned: {
    label: "Planned",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  considering: { label: "Considering", className: "bg-muted text-muted-foreground" },
};

const STATUS_ORDER: Status[] = ["shipped", "in-progress", "planned", "considering"];

export default function RoadmapPage() {
  const grouped: Record<Status, typeof roadmap> = {
    shipped: [],
    "in-progress": [],
    planned: [],
    considering: [],
  };
  for (const item of roadmap) grouped[item.status].push(item);

  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Roadmap</h1>
        <p className="mt-2 text-muted-foreground">
          What&apos;s live, what we&apos;re building, and what we&apos;re thinking
          about. Have an idea? Drop us a note via the email capture in the footer.
        </p>
      </header>
      {STATUS_ORDER.map((s) => {
        const items = grouped[s];
        if (items.length === 0) return null;
        return (
          <section key={s} className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {STATUS_CONFIG[s].label}
              <span className="text-xs text-muted-foreground">({items.length})</span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.title}>
                  <Card>
                    <CardContent className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide shrink-0",
                            STATUS_CONFIG[s].className,
                          )}
                        >
                          {STATUS_CONFIG[s].label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
