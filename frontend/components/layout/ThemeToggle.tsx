"use client";

import { Moon, Sun, Monitor } from "lucide-react";

import { Tooltip } from "@/components/ui/Tooltip";
import { useThemeStore, type Theme } from "@/store/themeStore";
import { cn } from "@/lib/utils";

const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center rounded-full border border-border bg-card p-1"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <Tooltip key={opt.value} label={opt.label}>
            <button
              role="radio"
              aria-checked={active}
              aria-label={`${opt.label} theme`}
              onClick={() => setTheme(opt.value)}
              data-testid={`theme-${opt.value}`}
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors",
                active && "bg-primary text-primary-foreground shadow",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
