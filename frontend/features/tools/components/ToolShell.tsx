"use client";

import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ToolShellProps {
  title: string;
  subtitle?: React.ReactNode;
  badge?: string;
  icon: LucideIcon;
  /** @deprecated retained for prop-compatibility; the new design renders a neutral chip. */
  gradient?: string;
  children: React.ReactNode;
  sideCard?: React.ReactNode;
}

export function ToolShell({
  title,
  subtitle,
  badge,
  icon: Icon,
  children,
  sideCard,
}: ToolShellProps) {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All tools
        </Link>

        <div className="mt-5 flex flex-wrap items-start gap-3 sm:gap-4">
          <div className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground/80">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight leading-[1.05] break-words">
                {title}
              </h1>
              {badge && (
                <span className="shrink-0 rounded-full border border-primary/30 bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={cn("grid gap-6", sideCard ? "lg:grid-cols-[1fr,320px]" : "")}>
        <div>{children}</div>
        {sideCard && <aside className="space-y-4">{sideCard}</aside>}
      </div>
    </div>
  );
}
