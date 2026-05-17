"use client";

import { useState } from "react";
import { Check, Copy, Facebook, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  text: string;
  url?: string;
}

export function ShareButtons({ text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");

  const enc = (s: string) => encodeURIComponent(s);
  const twitter = `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(shareUrl)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`;
  const whatsapp = `https://wa.me/?text=${enc(text + " " + shareUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const btnClass =
    "inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Share:</span>
      <button onClick={copy} className={btnClass} aria-label="Copy link">
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <a
        href={twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-3.5 w-3.5" /> Twitter
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </a>
      <a
        href={facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-3.5 w-3.5" /> Facebook
      </a>
    </div>
  );
}
