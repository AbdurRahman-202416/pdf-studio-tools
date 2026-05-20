"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Layers,
  Lock,
  Merge,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Merge,
    title: "Merge PDFs",
    description:
      "Combine multiple PDFs into one, picking exactly the pages you need.",
  },
  {
    icon: Wand2,
    title: "Smart compression",
    description:
      "Three presets, Light, Balanced, and Maximum, to fit any sharing scenario.",
  },
  {
    icon: Layers,
    title: "Page-level control",
    description:
      "Preview, select, reorder, and rotate pages with smooth drag & drop.",
  },
  {
    icon: Zap,
    title: "Blazing fast",
    description: "FastAPI + PyMuPDF backend processes documents in seconds.",
  },
  {
    icon: Lock,
    title: "Private by default",
    description: "Files auto-expire after one hour. No accounts, no tracking.",
  },
  {
    icon: Sparkles,
    title: "Beautiful UI",
    description:
      "Dark mode, animations, keyboard accessibility, production-grade UX.",
  },
];

export function FeaturesAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <section id="features" aria-labelledby="features-trigger" className="space-y-8">
      <div className="flex justify-center">
        <button
          type="button"
          id="features-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="features-panel"
          data-testid="features-toggle"
          className="group inline-flex items-center gap-3 rounded-full border border-border bg-card pl-5 pr-2 py-2 text-sm font-medium text-foreground/90 hover:border-primary/40 hover:bg-accent/50 transition"
        >
          <span>
            {/* {open ? "Hide" : "Show"}
            {" "} */}
            why people choose us?
          </span>
          <span
            className={`grid h-8 w-8 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="features-panel"
            key="features-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-10 pt-2">
              <div className="text-center max-w-2xl mx-auto">
                <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                  What&rsquo;s inside
                </span>
                <h2 className="font-display mt-3 text-4xl sm:text-5xl font-medium tracking-tight">
                  Everything you need
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  From quick merges to fine-grained page control - all in one workspace.
                </p>
              </div>
              <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-border rounded-2xl overflow-hidden border border-border">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      className="group relative bg-card p-6 sm:p-7 transition-colors hover:bg-accent/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="h-px flex-1 bg-border" />
                        <Icon className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <h3 className="font-display mt-5 text-2xl font-medium tracking-tight">
                        {f.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {f.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
