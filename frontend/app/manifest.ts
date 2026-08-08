import type { MetadataRoute } from "next";

import { siteConfig } from "@/components/seo/SiteConfig";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: siteConfig.themeColorLight,
    categories: ["productivity", "utilities"],
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "Compress PDF", short_name: "Compress", url: "/compress-pdf" },
      { name: "Merge PDF", short_name: "Merge", url: "/merge-pdf" },
      { name: "PDF OCR", short_name: "OCR", url: "/pdf-ocr" },
      { name: "Sign PDF", short_name: "Sign", url: "/sign-pdf" },
    ],
  };
}
