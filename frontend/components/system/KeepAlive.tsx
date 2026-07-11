"use client";

import { useEffect } from "react";

import { API_BASE } from "@/services/api";

// Render's free tier sleeps after inactivity and takes ~30-60s to wake on the
// first request. We fire a single /health ping on the visitor's first landing
// — on ANY route (home, a tool, blog…) since this mounts in the root layout —
// so the backend is already waking by the time they actually use a tool.
// Once per browser session is enough; we never ping again.
const PING_KEY = "pdf-tool-pinged";

export function KeepAlive() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(PING_KEY)) return; // already woke it this session
      sessionStorage.setItem(PING_KEY, "1");
    } catch {
      // sessionStorage unavailable — fall through and ping once anyway
    }
    fetch(`${API_BASE}/health`, { cache: "no-store", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
