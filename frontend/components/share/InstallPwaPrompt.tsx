"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/track";
import { brand } from "@/brand.config";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISSED_KEY = "pdf-studio-pwa-prompt-dismissed";

/**
 * Bottom-right "Install app" chip that appears once the browser dispatches
 * `beforeinstallprompt`. We defer to the browser's own install gesture so
 * we never nag users on mobile Safari (which doesn't fire the event) and
 * never re-prompt after dismissal. Fires analytics events on prompt + install.
 */
export function InstallPwaPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISSED_KEY) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      trackEvent("pwa_install_prompted");
    };
    const onInstalled = () => {
      setInstalled(true);
      trackEvent("pwa_installed");
    };

    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !evt) return null;

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    }
    setEvt(null);
  };

  const install = async () => {
    try {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      if (outcome === "dismissed") dismiss();
      else setEvt(null);
    } catch {
      dismiss();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl border border-border bg-card shadow-lg p-3">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
          <Download className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install {brand.name}</p>
          <p className="text-xs text-muted-foreground">One tap to launch, works offline too</p>
          <div className="mt-2 flex items-center gap-2">
            <Button size="sm" onClick={install}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
