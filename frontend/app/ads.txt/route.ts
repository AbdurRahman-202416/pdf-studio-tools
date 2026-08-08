import { ADSENSE_CLIENT } from "@/components/ads/config";

/**
 * AdSense requires /ads.txt at the site root listing the publisher id, or it
 * limits ad serving. Derived from the same env var as the loader so the two
 * can never disagree, and a 404 (not an empty 200) when ads are off.
 */
export function GET() {
  if (!ADSENSE_CLIENT) return new Response("Not found", { status: 404 });

  const pub = ADSENSE_CLIENT.replace(/^ca-/, "");
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain" },
  });
}
