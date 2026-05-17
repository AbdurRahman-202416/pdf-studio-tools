import type { Metadata } from "next";

import { SettingsView } from "@/features/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Configure PDF Studio preferences, theme, and inspect backend API connection status.",
  alternates: { canonical: "/settings" },
  openGraph: {
    title: "Settings · PDF Studio",
    description: "Configure preferences and inspect connection status.",
  },
};

export default function SettingsPage() {
  return <SettingsView />;
}
