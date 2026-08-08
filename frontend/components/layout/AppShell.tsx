"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isWidget = pathname.startsWith("/widget");

  if (isWidget) {
    return <main className="max-w-2xl mx-auto w-full">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        {/*
          `min-w-0` is load-bearing. As a flex child, main defaults to
          `min-width: auto`, so any wide descendant - the carousel track, a long
          code block, a wide table - forces the whole page past the viewport
          instead of being clipped or scrolled inside its own container.
        */}
        <main className="min-w-0 flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
