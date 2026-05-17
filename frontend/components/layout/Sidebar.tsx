"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  Settings,
  Sparkles,
  Layers,
  History,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { usePDFStore } from "@/store/pdfStore";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/workspace", label: "Workspace", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const recent = usePDFStore((s) => s.recent);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <aside
      data-testid="sidebar"
      className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card/40 px-3 py-6 sticky top-16 self-start h-[calc(100vh-4rem)]"
    >
      <div className="px-2 mb-5 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" /> Tools
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        <div className="px-2 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <History className="h-3.5 w-3.5" /> Recent
        </div>
        <ul className="flex flex-col gap-1 max-h-[300px] overflow-auto pr-1">
          {recent.length === 0 && (
            <li className="px-2 py-1.5 text-xs text-muted-foreground">No recent output yet.</li>
          )}
          {recent.map((r) => (
            <li
              key={r.output_id}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-muted/70"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate" title={r.filename}>{r.filename}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto px-2 pt-6 text-xs text-muted-foreground">
        <p>PDF Studio v1.0</p>
        <p className="opacity-70">Files auto-expire after 1 hour.</p>
      </div>
    </aside>
  );
}
