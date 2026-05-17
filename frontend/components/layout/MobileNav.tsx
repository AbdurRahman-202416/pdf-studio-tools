"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Layers, Menu, Settings as Cog, Wrench, X } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/tools", label: "Tools", Icon: Wrench },
  { href: "/workspace", label: "Workspace", Icon: Layers },
  { href: "/settings", label: "Settings", Icon: Cog },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
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
        onClick={() => setOpen(true)}
        data-testid="mobile-nav-open"
      >
        <Menu className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              className="fixed top-0 left-0 z-50 h-dvh w-72 max-w-[85vw] bg-background border-r border-border p-4 md:hidden flex flex-col shadow-xl"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold tracking-tight">
                  PDF<span className="gradient-text">Studio</span>
                </span>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="space-y-1">
                {items.map(({ href, label, Icon }) => {
                  const active =
                    href === "/" ? pathname === "/" : pathname?.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto text-xs text-muted-foreground">
                <p>PDF Studio</p>
                <p className="opacity-70">Files auto-delete in 1 hour.</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
