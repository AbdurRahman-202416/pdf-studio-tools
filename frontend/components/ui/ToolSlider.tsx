"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";

import { ToolIcon } from "@/components/brand/ToolIcon";
import { cn } from "@/lib/utils";
import { getToolIcon } from "@/lib/seo/tool-icons";
import type { ToolMeta } from "@/lib/tools/types";

/**
 * Curated tool carousel.
 *
 * Purely presentational - it takes the tools it should show and derives
 * nothing. Sliders are for curated subsets only (featured, trending); the full
 * catalogue is always a plain server-rendered grid, because a carousel hides
 * links from crawlers and from anyone who does not think to scroll it.
 *
 * Accessibility:
 * - real <Link> anchors, so every slide is keyboard-reachable and indexable
 * - left/right arrows move the carousel when it has focus
 * - auto-advance pauses on hover, focus and touch, and stops entirely under
 *   `prefers-reduced-motion`
 * - marked aria-roledescription="carousel" with a live region for slide changes
 */
interface ToolSliderProps {
  tools: ToolMeta[];
  /** Accessible name, e.g. "Popular tools". */
  label: string;
  /** ms between auto-advances. 0 disables auto-advance. */
  interval?: number;
  className?: string;
}

export function ToolSlider({ tools, label, interval = 4500, className }: ToolSliderProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(1);
  const trackRef = useRef<HTMLUListElement>(null);

  // How many cards fit. Matches the Tailwind breakpoints used on the slides.
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 4 : w >= 768 ? 3 : w >= 520 ? 2 : 1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const pages = Math.max(1, Math.ceil(tools.length / perView));
  const page = Math.min(index, pages - 1);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + pages) % pages),
    [pages],
  );

  // Auto-advance. Disabled outright when the user prefers reduced motion -
  // movement they did not ask for is the whole thing that setting is about.
  useEffect(() => {
    if (reduceMotion || paused || interval <= 0 || pages < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % pages), interval);
    return () => clearInterval(id);
  }, [reduceMotion, paused, interval, pages]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  }

  if (!tools.length) return null;

  return (
    <section
      className={cn("relative min-w-0", className)}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onKeyDown={onKeyDown}
      data-testid="tool-slider"
    >
      {/*
        `min-w-0` matters: the track's slides are `shrink-0`, so without it the
        flex `min-width: auto` default lets their intrinsic width propagate up
        and force the whole page layout wider than the viewport.
      */}
      <div className="min-w-0 overflow-hidden">
        <motion.ul
          ref={trackRef}
          className="flex"
          animate={{ x: `-${page * 100}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 34 }
          }
          drag={pages > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            // A deliberate flick, not an accidental nudge.
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
        >
          {tools.map((t, i) => {
            const Icon = getToolIcon(t.iconName);
            const visible = Math.floor(i / perView) === page;
            return (
              <li
                key={t.slug}
                className="w-full shrink-0 px-1.5 min-[520px]:w-1/2 md:w-1/3 lg:w-1/4"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${tools.length}`}
                aria-hidden={!visible}
              >
                <Link
                  href={`/${t.slug}`}
                  data-domain={t.domain}
                  data-testid={`slide-${t.slug}`}
                  tabIndex={visible ? undefined : -1}
                  className="group block h-full"
                  draggable={false}
                >
                  <article className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 pl-[calc(1.25rem+3px)] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_-12px_rgb(var(--primary)/0.30)]">
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-[3px] bg-primary opacity-70 transition-opacity group-hover:opacity-100"
                    />
                    <div className="flex items-start justify-between gap-3">
                      {Icon && (
                        <ToolIcon
                          domain={t.domain}
                          icon={Icon}
                          size={44}
                          className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
                        />
                      )}
                      <ArrowRight
                        aria-hidden
                        className="mt-2 h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100"
                      />
                    </div>
                    <h3 className="font-display mt-3 text-base font-medium tracking-tight">
                      {t.cardTitle}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {t.cardBlurb}
                    </p>
                    {t.runtime === "client" && (
                      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[rgb(var(--primary)/0.10)] px-2 py-0.5 text-[10px] font-medium text-[rgb(var(--primary))]">
                        <Zap aria-hidden className="h-2.5 w-2.5" /> Never uploaded
                      </span>
                    )}
                  </article>
                </Link>
              </li>
            );
          })}
        </motion.ul>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => go(-1)}
            aria-label="Previous tools"
            data-testid="slider-prev"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition hover:border-primary/40 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex gap-1.5" role="tablist" aria-label={`${label} pages`}>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === page}
                aria-label={`Page ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === page ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Next tools"
            data-testid="slider-next"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition hover:border-primary/40 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <span aria-live="polite" className="sr-only">
        {`Showing page ${page + 1} of ${pages}`}
      </span>
    </section>
  );
}
