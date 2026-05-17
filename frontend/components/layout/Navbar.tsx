"use client";

import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <MobileNav />
          <Logo size={36} />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition">
            Home
          </Link>
          <Link href="/tools" className="hover:text-foreground transition">
            Tools
          </Link>
          <Link href="/workspace" className="hover:text-foreground transition">
            Workspace
          </Link>
          <Link href="/settings" className="hover:text-foreground transition">
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
