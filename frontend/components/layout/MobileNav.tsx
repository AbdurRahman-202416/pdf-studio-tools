"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

/**
 * Loaded on first tap, not at layout mount: the drawer is the only place the
 * shared layout touched framer-motion, which put a ~130KB animation chunk on
 * every route - including pages with no animation at all.
 */
const MobileNavDrawer = dynamic(
  () => import("./MobileNavDrawer").then((m) => m.MobileNavDrawer),
  // ssr:false makes this a genuinely on-demand chunk. Without it, next/dynamic
  // still emits the drawer (and its framer-motion dependency, ~110KB gzip) as
  // an async script on every route for hydration parity - the whole point was
  // to keep it off pages that never open the menu. The drawer only ever renders
  // after a tap, always client-side, so dropping SSR changes nothing visible.
  { ssr: false },
);

export function MobileNav() {
  const [open, setOpen] = useState(false);
  // Latched on first open so the drawer stays mounted afterwards - it must
  // survive `open` flipping false for AnimatePresence to play the exit slide.
  const [everOpened, setEverOpened] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Auto-close when route changes (sync state in render, React 19 pattern).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        aria-label="Open menu"
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
        onClick={() => {
          setEverOpened(true);
          setOpen(true);
        }}
        data-testid="mobile-nav-open"
      >
        <Menu className="h-4 w-4" />
      </button>
      {everOpened && (
        <MobileNavDrawer open={open} pathname={pathname} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
