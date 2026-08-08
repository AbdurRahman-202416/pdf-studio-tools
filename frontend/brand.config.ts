/**
 * ============================================================================
 *  THE ONLY PLACE THE PRODUCT'S NAME AND IDENTITY IS WRITTEN.
 * ============================================================================
 *
 * Change a value here and it changes everywhere: page titles, metadata, the
 * logo wordmark, the footer, OG images, JSON-LD, the PWA manifest, comparison
 * pages, blog prose and tool copy.
 *
 * Nothing else in the codebase should contain the brand name as a literal
 * string. `npm run build` runs scripts/check-brand.mjs first, which fails the
 * build if one reappears - so this cannot silently drift again.
 *
 * Rules of thumb when editing:
 *   - `name` is the display name, used mid-sentence in prose too.
 *   - `shortName` has no space; it is what the PWA and tight UI slots use.
 *   - `domain` drives the default email and canonical URL fallback.
 *   - Anything env-backed below can be overridden per-deploy without a commit.
 *
 * Prose in MDX blog posts uses the token {{brand}}, substituted at render.
 */

const NAME = "PDF Studio";
const DOMAIN = "pdfstudio.app";

export const brand = {
  /** Display name. Used in titles, headings and mid-sentence in copy. */
  name: NAME,

  /** No-space variant for the PWA manifest and narrow UI. */
  shortName: NAME.replace(/\s+/g, ""),

  /** Bare domain, no protocol. Drives the default contact address. */
  domain: DOMAIN,

  /** Overridable per deployment without touching this file. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || `https://${DOMAIN}`).replace(/\/+$/, ""),

  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || `hello@${DOMAIN}`,

  /** Handle including the @, or an empty string to omit Twitter metadata. */
  twitter: "@pdfstudio",

  /** Person or company credited in the footer and on /about. */
  author: "Abdur Rahman",

  locale: "en_US",
  /**
   * Brand ink for the logo and wordmark.
   *
   * Near-neutral on purpose. The 9 domain hues sit at every 40 degrees, so
   * there is no free hue for a brand colour - it has to differ by chroma
   * instead. At C=0.02 this is ~8x less saturated than any domain accent and
   * can never be mistaken for one.
   *
   * Note this is NOT the browser theme-color; that follows the page surface
   * per colour scheme (see app/layout.tsx).
   */
  brandInk: "#2B343D",
  brandInkDark: "#DEE5EE",

  /** Browser chrome, matched to the page surface so it blends rather than announces. */
  themeColorLight: "#F4F5F7",
  themeColorDark: "#0C0E13",

  tagline: "Every file tool you need. Free, fast, watermark-free.",

  description:
    "Free online tools for PDFs, images, colours and code - compress, convert, resize, OCR, QR codes, and developer utilities. No signup, no watermark, most run entirely in your browser.",
} as const;

export type Brand = typeof brand;
