"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

const TOPICS = [
  "Something is broken",
  "Request a tool",
  "Privacy or data question",
  "Partnership or advertising",
  "Something else",
];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [message, setMessage] = useState("");
  // Bots fill every field they find; humans never see this one.
  const [honeypot, setHoneypot] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("That email address doesn't look right.");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Please add a little more detail so we can actually help.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: `contact:${topic}`, message }),
      });
      if (!res.ok) throw new Error("Could not send that message.");
      setSent(true);
      toast.success("Message sent - we'll reply by email.");
    } catch {
      toast.error("Could not send that. Email us directly and we'll pick it up.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div
        className="rounded-3xl border border-border bg-card p-8 text-center"
        data-testid="contact-sent"
        aria-live="polite"
      >
        <h2 className="font-display text-2xl font-medium tracking-tight">Thanks - that&apos;s in.</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We reply to every message, usually within a couple of days. Check the address you gave us.
        </p>
        <Button className="mt-5" onClick={() => setSent(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5">
      <h2 className="font-display text-2xl font-medium tracking-tight">Send a message</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Your email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            data-testid="contact-email"
            className={inp}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Topic</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            data-testid="contact-topic"
            className={inp}
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Message</span>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What happened, which tool, and what you expected instead."
          data-testid="contact-message"
          className={inp}
        />
      </label>

      {/* Honeypot - visually hidden, not display:none, so bots still fill it. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>
          Company website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={busy} data-testid="contact-submit">
          <Send className="mr-1.5 h-4 w-4" />
          {busy ? "Sending…" : "Send message"}
        </Button>
        <p className="text-xs text-muted-foreground">
          We use your address to reply, and nothing else.
        </p>
      </div>
    </form>
  );
}

const inp =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
