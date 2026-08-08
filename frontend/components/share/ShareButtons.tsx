"use client";

import { useState } from "react";
import { Check, Copy, Facebook, MessageCircle, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";

import { trackEvent } from "@/lib/track";
import { brand } from "@/brand.config";

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

  const hasNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const nativeShare = async () => {
    try {
      await navigator.share({ title: brand.name, text, url: shareUrl });
      trackEvent("tool_shared", { channel: "native" });
    } catch {
      // user cancelled
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      trackEvent("tool_shared", { channel: "copy" });
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
      {hasNativeShare && (
        <button onClick={nativeShare} className={btnClass} aria-label="Share">
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      )}
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
        onClick={() => trackEvent("tool_shared", { channel: "twitter" })}
      >
        <Twitter className="h-3.5 w-3.5" /> Twitter
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Share on WhatsApp"
        onClick={() => trackEvent("tool_shared", { channel: "whatsapp" })}
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </a>
      <a
        href={facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Share on Facebook"
        onClick={() => trackEvent("tool_shared", { channel: "facebook" })}
      >
        <Facebook className="h-3.5 w-3.5" /> Facebook
      </a>
    </div>
  );
}
