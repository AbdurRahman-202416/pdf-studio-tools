"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Layers, Settings as Cog, Wrench, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { brand } from "@/brand.config";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/tools", label: "Tools", Icon: Wrench },
  { href: "/workspace", label: "Workspace", Icon: Layers },
  { href: "/settings", label: "Settings", Icon: Cog },
];

// The brand renders as "first word plain, rest gradient" - derived from
// brand.config so check-brand.mjs keeps the name out of source literals.
const [brandHead, ...brandRest] = brand.name.split(" ");

/**
 * The drawer half of MobileNav, split into its own module so framer-motion
 * stays out of the shared layout bundle. MobileNav dynamic-imports this on
 * first open; until then no route pays for the animation library.
 */
export function MobileNavDrawer({
  open,
  pathname,
  onClose,
}: {
  open: boolean;
  pathname: string | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                {brandHead}
                <span className="gradient-text">{brandRest.join(" ")}</span>
              </span>
              <button
                aria-label="Close menu"
                onClick={onClose}
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
                    onClick={onClose}
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
              <p>{brand.name}</p>
              <p className="opacity-70">Files auto-delete in 1 hour.</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
