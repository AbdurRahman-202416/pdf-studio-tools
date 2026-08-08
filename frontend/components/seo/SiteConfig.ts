import { brand } from "@/brand.config";

/**
 * Site metadata, derived from brand.config.ts.
 *
 * Do not put the product name here as a literal - it lives in exactly one
 * place, and scripts/check-brand.mjs fails the build if a copy reappears.
 * Keywords stay here because they are SEO data, not identity.
 */
export const siteConfig = {
  name: brand.name,
  shortName: brand.shortName,
  description: brand.description,
  tagline: brand.tagline,
  url: brand.url,
  locale: brand.locale,
  twitter: brand.twitter,
  themeColorLight: brand.themeColorLight,
  themeColorDark: brand.themeColorDark,
  brandInk: brand.brandInk,
  brandInkDark: brand.brandInkDark,
  contactEmail: brand.contactEmail,
  author: brand.author,
  keywords: [
    "free online tools",
    "compress pdf online free",
    "merge pdf online",
    "pdf to word",
    "pdf to excel",
    "pdf to jpg converter",
    "sign pdf online",
    "unlock pdf",
    "compress image online",
    "resize image online",
    "png to jpg converter",
    "webp converter",
    "heic to jpg",
    "qr code generator",
    "barcode generator",
    "password generator",
    "hex to rgb converter",
    "unix timestamp converter",
    "free pdf tools online",
    "online image tools",
    "smallpdf alternative",
    "ilovepdf alternative",
  ],
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "",
} as const;
