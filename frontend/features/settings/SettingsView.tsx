"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { API_BASE } from "@/services/api";
import { usePDFStore } from "@/store/pdfStore";

const HEALTH_URL = `${API_BASE}/health`;

const STATUS_MESSAGE = {
  ok: "Everything's working. Your files are processed on the server and auto-deleted within an hour.",
  down: "Can't reach the processing server right now. Tools won't work until it's back.",
  checking: "Checking the server, this only takes a moment.",
} as const;

const STATUS_LABEL = {
  ok: "Connected",
  down: "Offline",
  checking: "Checking",
} as const;

export function SettingsView() {
  const recent = usePDFStore((s) => s.recent);
  const clearFiles = usePDFStore((s) => s.clearFiles);

  const [apiHealth, setApiHealth] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    let cancelled = false;
    fetch(HEALTH_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then(() => !cancelled && setApiHealth("ok"))
      .catch(() => !cancelled && setApiHealth("down"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure preferences and inspect connection status.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">
              Switch between light, dark, and system preference.
            </p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service status</CardTitle>
        </CardHeader>
        <CardContent>
          <span
            data-testid="api-status"
            className={
              apiHealth === "ok"
                ? "inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success"
                : apiHealth === "down"
                  ? "inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                  : "inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs"
            }
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiHealth === "ok"
                  ? "bg-success"
                  : apiHealth === "down"
                    ? "bg-destructive"
                    : "bg-muted-foreground"
              }`}
            />
            {STATUS_LABEL[apiHealth]}
          </span>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {STATUS_MESSAGE[apiHealth]}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {recent.length} processed file{recent.length === 1 ? "" : "s"} remembered
            locally for quick re-download.
          </p>
          <Button
            variant="outline"
            data-testid="clear-storage"
            onClick={() => {
              clearFiles();
              localStorage.removeItem("pdf-tool-store");
              toast.success("Local storage cleared");
            }}
          >
            Clear local cache
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
