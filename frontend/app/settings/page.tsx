import type { Metadata } from "next";

import { SettingsView } from "@/features/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings",
  description:
    `Configure ${brand.name} preferences, theme, and inspect backend API connection status.`,
  alternates: { canonical: "/settings" },
  openGraph: {
    title: `Settings · ${brand.name}`,
    description: "Configure preferences and inspect connection status.",
  },
};
import { brand } from "@/brand.config";

export default function SettingsPage() {
  return <SettingsView />;
}
