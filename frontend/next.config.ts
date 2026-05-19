import type { NextConfig } from "next";

/**
 * URL redirects.
 *
 * The site canonicalised every tool route from a long keyword-y slug
 * (`/tools/compress-pdf-without-losing-quality`) to a clean top-level
 * slug (`/compress-pdf`). We keep all legacy slugs working with a 308
 * (permanent) redirect so external links and prior search-engine
 * indexes don't 404.
 */
const REDIRECTS: Array<{ from: string; to: string }> = [
  // ---- canonical clean routes (legacy /tools/<long-slug> → /<clean>) ----
  { from: "/tools/compress-pdf-without-losing-quality", to: "/compress-pdf" },
  { from: "/tools/merge-large-pdf-files-online", to: "/merge-pdf" },
  { from: "/tools/pdf-to-jpg-high-quality", to: "/pdf-to-jpg" },
  { from: "/tools/password-protect-pdf-online", to: "/lock-pdf" },
  { from: "/tools/unlock-pdf-with-password-online", to: "/unlock-pdf" },
  { from: "/tools/pdf-ocr-online-free", to: "/pdf-ocr" },
  { from: "/tools/id-card-to-pdf", to: "/nid-combine" },
  { from: "/tools/passport-photo-to-pdf", to: "/passport-photo-pdf" },
  { from: "/tools/pdf-to-excel-converter", to: "/pdf-to-excel" },

  // ---- earlier short aliases also redirected (defensive) ----
  { from: "/tools/bangla-ocr", to: "/pdf-ocr" },
  { from: "/tools/nid-combine", to: "/nid-combine" },
  { from: "/tools/bank-to-excel", to: "/pdf-to-excel" },
  { from: "/tools/pdf-to-jpg", to: "/pdf-to-jpg" },
  { from: "/tools/pdf-lock", to: "/lock-pdf" },
  { from: "/tools/photo-to-pdf", to: "/passport-photo-pdf" },
  { from: "/tools/govt-forms", to: "/compress-pdf-to-100kb" },

  // ---- clean-slug aliases users frequently type ----
  { from: "/compress", to: "/compress-pdf" },
  { from: "/merge", to: "/merge-pdf" },
  { from: "/ocr", to: "/pdf-ocr" },
  { from: "/sign", to: "/sign-pdf" },
];

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return REDIRECTS.map(({ from, to }) => ({
      source: from,
      destination: to,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/widget/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          { key: "X-Frame-Options", value: "ALLOWALL" },
        ],
      },
      {
        source: "/((?!widget).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
