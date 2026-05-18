import type { NextConfig } from "next";

const REDIRECTS: Array<{ from: string; to: string }> = [
  { from: "/tools/bangla-ocr", to: "/tools/pdf-ocr-online-free" },
  { from: "/tools/nid-combine", to: "/tools/id-card-to-pdf" },
  { from: "/tools/bank-to-excel", to: "/tools/pdf-to-excel-converter" },
  { from: "/tools/pdf-to-jpg", to: "/tools/pdf-to-jpg-high-quality" },
  { from: "/tools/pdf-lock", to: "/tools/password-protect-pdf-online" },
  { from: "/tools/photo-to-pdf", to: "/tools/passport-photo-to-pdf" },
  { from: "/tools/govt-forms", to: "/tools" },
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
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;
