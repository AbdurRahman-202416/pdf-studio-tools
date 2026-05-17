"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { API_BASE } from "@/services/api";
import { usePDFStore } from "@/store/pdfStore";

export function SettingsView() {
  const recent = usePDFStore((s) => s.recent);
  const clearFiles = usePDFStore((s) => s.clearFiles);

  const [apiHealth, setApiHealth] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/health`)
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
          <CardTitle>API connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
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
              {apiHealth === "ok"
                ? "Connected"
                : apiHealth === "down"
                  ? "Offline"
                  : "Checking…"}
            </span>
            <code className="rounded-md bg-muted px-2 py-1 text-xs">{API_BASE}</code>
          </div>
          <p className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-2">
            <Info className="h-3.5 w-3.5" /> Set <code>NEXT_PUBLIC_API_BASE_URL</code> to
            point at a remote backend.
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
