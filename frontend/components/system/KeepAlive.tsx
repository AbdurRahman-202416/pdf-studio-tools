"use client";

import { useEffect } from "react";

import { API_BASE } from "@/services/api";

const PING_KEY = "pdf-tool-last-ping";
const PING_INTERVAL_MS = 5 * 60 * 1000;

export function KeepAlive() {
  useEffect(() => {
    try {
      const last = Number(sessionStorage.getItem(PING_KEY) || 0);
      if (Date.now() - last < PING_INTERVAL_MS) return;
      sessionStorage.setItem(PING_KEY, String(Date.now()));
    } catch {
      // sessionStorage unavailable — ping anyway
    }
    fetch(`${API_BASE}/health`, { cache: "no-store", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
