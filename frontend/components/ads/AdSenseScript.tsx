"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

import { ADSENSE_CLIENT } from "./config";

/**
 * Loads the AdSense bootstrap once per page, and only when a publisher id is
 * configured (`NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`). With the
 * env var unset this renders nothing, so non-monetised deploys ship zero
 * third-party JS.
 *
 * Widget routes are excluded on purpose: they render inside other people's
 * pages, and serving ads into a third-party iframe violates AdSense policy.
 */
export function AdSenseScript() {
  const pathname = usePathname() ?? "";
  if (!ADSENSE_CLIENT || pathname.startsWith("/widget")) return null;

  return (
    <Script
      id="adsense-loader"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
