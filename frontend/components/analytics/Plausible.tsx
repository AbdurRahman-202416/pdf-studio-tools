import Script from "next/script";

import { siteConfig } from "@/components/seo/SiteConfig";

export function Plausible() {
  if (!siteConfig.plausibleDomain) return null;
  return (
    <Script
      defer
      data-domain={siteConfig.plausibleDomain}
      src="https://plausible.io/js/script.tagged-events.outbound-links.js"
      strategy="afterInteractive"
    />
  );
}
