"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/track";

interface EmailCaptureProps {
  source?: string;
}

export function EmailCapture({ source = "footer" }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (!res.ok) throw new Error("Failed");
      trackEvent("email_captured", { source });
      setDone(true);
      toast.success("Thanks! We'll let you know.");
    } catch {
      toast.error("Couldn't subscribe just now, try again later.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p className="text-xs text-success inline-flex items-center gap-1.5">
        <Mail className="h-3.5 w-3.5" /> You&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        required
        aria-label="Email address"
      />
      <Button
        type="submit"
        variant="primary"
        isLoading={busy}
        disabled={busy}
        size="sm"
        aria-label="Subscribe"
      >
        <Send className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </form>
  );
}
