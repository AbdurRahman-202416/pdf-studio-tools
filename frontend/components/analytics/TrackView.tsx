"use client";

import { useEffect, useRef } from "react";

import { trackEvent } from "@/lib/track";

/**
 * Fires a single page-view product event on mount (StrictMode-safe). Used to
 * record `tool_view` / `category_view` so organic landings can be correlated
 * with completions once an analytics sink is configured. Sends only the low
 * cardinality id/category — never any user input.
 */
export function TrackView({
  event,
  id,
}: {
  event: "tool_view" | "category_view";
  id: string;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(event, event === "tool_view" ? { tool: id } : { category: id });
  }, [event, id]);
  return null;
}
