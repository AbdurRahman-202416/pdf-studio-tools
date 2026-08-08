"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // Dark by default. A returning visitor's saved choice (persisted under
      // "pdf-tool-theme") still wins; this is only the first-visit default.
      theme: "dark",
      setTheme: (t) => set({ theme: t }),
    }),
    { name: "pdf-tool-theme" },
  ),
);

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
}
