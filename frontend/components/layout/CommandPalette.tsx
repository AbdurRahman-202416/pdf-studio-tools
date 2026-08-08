"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X, Zap } from "lucide-react";

import { getToolIcon } from "@/lib/seo/tool-icons";
import { domainStyle } from "@/lib/tool-style";
import { tools as allTools } from "@/lib/tools";
import { searchTools } from "@/lib/tools/search";
import type { ToolMeta } from "@/lib/tools/types";

const TOOL_COUNT = allTools.length;

/**
 * Short category labels for the result chips.
 *
 * Explicit rather than derived from the hub titles - "Calculators & Everyday
 * Tools" is right for a page heading and far too long for an inline chip.
 */
const DOMAIN_LABEL: Record<string, string> = {
  pdf: "PDF",
  image: "Image",
  calc: "Calculator",
  code: "Developer",
  text: "Text",
  data: "Data",
  color: "Colour",
  security: "Security",
  convert: "Convert",
};

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="tabular rounded border border-border px-1 py-px text-[10px] leading-none">
      {children}
    </kbd>
  );
}

/**
 * Cmd/Ctrl-K palette.
 *
 * At 37+ tools this is the primary navigation, not a convenience: no grid or
 * menu stays scannable at this size. Searching covers names, blurbs, domains
 * and file extensions, so typing "png" or "iphone" finds the right tool.
 */
/**
 * Event used to open the palette from elsewhere on the page.
 *
 * The dialog is mounted exactly once (in the Navbar). Rendering a second
 * <CommandPalette> for the hero meant two dialogs mounted, two ⌘K listeners,
 * and two overlapping overlays on open - so additional entry points are plain
 * buttons that dispatch this instead.
 */
export const OPEN_PALETTE_EVENT = "open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}

/** Large search field for the hero. Opens the single shared palette. */
export function CommandPaletteHeroTrigger() {
  return (
    <button
      onClick={openCommandPalette}
      data-testid="palette-hero"
      aria-label="Search all tools"
      className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_rgb(var(--primary)/0.25)]"
    >
      <Search aria-hidden className="h-5 w-5 shrink-0 text-primary" />
      <span className="flex-1 truncate text-base text-muted-foreground">
        {`Search ${TOOL_COUNT} tools - try “compress”, “png” or “mortgage”`}
      </span>
      <kbd className="tabular hidden shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground sm:block">
        ⌘K
      </kbd>
    </button>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = searchTools(query, 8);

  // Keep the highlight in range as results shrink, without an effect.
  const clamped = Math.min(active, Math.max(0, results.length - 1));

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // "/" is a common shortcut, but not while typing in a field.
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) close();
    }
    const onOpenRequest = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenRequest);
    };
  }, [open, close]);

  // Body scroll lock is a DOM side effect, so it belongs in an effect. State
  // resets do not - they happen in `close()` below, because the repo lints
  // react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = useCallback(
    (tool: ToolMeta) => {
      close();
      router.push(`/${tool.slug}`);
    },
    [router, close],
  );

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const t = results[clamped];
      if (t) go(t);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-testid="palette-trigger"
        aria-label="Search tools"
        className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
      >
        <Search aria-hidden className="h-3.5 w-3.5" />
        <span>Search tools</span>
        <kbd className="tabular rounded border border-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      {/*
        Portalled to <body> deliberately.
        The palette is mounted inside the Navbar, and the Navbar carries
        `backdrop-blur`. A backdrop-filter ancestor establishes a containing
        block for fixed-position descendants, so `fixed inset-0` resolved
        against the 66px-tall header instead of the viewport - which clipped
        the dialog and cut the search field in half.
      */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 px-3 pt-[6vh] pb-6 backdrop-blur-sm sm:px-4 sm:pt-[10vh]"
          onClick={close}
          role="presentation"
        >
          <div
            className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            style={{ ["--ring" as string]: "var(--muted-foreground)" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search tools"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 sm:gap-3 sm:px-4">
              <Search aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder={`Search ${TOOL_COUNT} tools - try "png", "iphone", or "mortgage"`}
                data-testid="palette-input"
                aria-label="Search tools"
                aria-activedescendant={results[clamped] ? `palette-${results[clamped].slug}` : undefined}
                data-palette-input
                className="w-full min-w-0 bg-transparent py-3.5 text-base outline-none placeholder:text-muted-foreground sm:py-4"
              />
              <kbd className="tabular hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
                esc
              </kbd>
              {/* Touch users have no esc key - they need a real target. */}
              <button
                onClick={close}
                aria-label="Close search"
                data-testid="palette-close"
                className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>

            <p className="shrink-0 px-4 pt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {query.trim()
                ? `${results.length} ${results.length === 1 ? "result" : "results"}`
                : "Popular across every category"}
            </p>

            <ul ref={listRef} className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Nothing matches “{query}”. Try a file type, like{" "}
                  <span className="tabular">webp</span> or <span className="tabular">docx</span>.
                </li>
              )}
              {results.map((t, i) => {
                const Icon = getToolIcon(t.iconName);
                const s = domainStyle(t.domain);
                return (
                  <li
                    key={t.slug}
                    id={`palette-${t.slug}`}
                    role="option"
                    aria-selected={i === clamped}
                    data-domain={t.domain}
                  >
                    <button
                      onClick={() => go(t)}
                      // onMouseMove, not onMouseEnter: with a stationary
                      // pointer, re-rendering the list fires mouseenter on
                      // whichever row lands under the cursor and steals the
                      // selection from the top match - so Enter opened the
                      // wrong tool. Requiring actual movement fixes that.
                      onMouseMove={() => setActive(i)}
                      data-testid={`palette-result-${t.slug}`}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                        i === clamped ? "bg-[rgb(var(--primary)/0.12)]" : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                        style={{ backgroundImage: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                          <span className="truncate text-sm font-medium">{t.cardTitle}</span>
                          {/* Category label - the fastest way to convey breadth
                              while someone is scanning the list. */}
                          <span className="hidden shrink-0 rounded-full bg-[rgb(var(--primary)/0.14)] px-1.5 py-px text-[10px] font-medium text-[rgb(var(--primary))] min-[420px]:inline">
                            {DOMAIN_LABEL[t.domain] ?? t.domain}
                          </span>
                          {t.runtime === "client" && (
                            <span
                              className="hidden shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground sm:flex"
                              title="Runs entirely in your browser"
                            >
                              <Zap aria-hidden className="h-2.5 w-2.5" /> browser
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {t.cardBlurb}
                        </span>
                      </span>
                      {i === clamped && (
                        <CornerDownLeft aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-3 py-2.5 text-[11px] text-muted-foreground sm:px-4">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Kbd>↑</Kbd><Kbd>↓</Kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>↵</Kbd> open
                </span>
                <span className="hidden items-center gap-1 sm:flex">
                  <Kbd>esc</Kbd> close
                </span>
              </span>
              <Link href="/tools" onClick={close} className="hover:text-foreground">
                Browse all {TOOL_COUNT} →
              </Link>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
