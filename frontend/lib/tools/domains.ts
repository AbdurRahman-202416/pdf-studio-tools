import type { Domain } from "@/lib/tools/types";

/**
 * Domain hubs.
 *
 * These are the internal-link distributors: tools live at root slugs (better
 * for ranking), and hubs are what tie them into a crawlable structure and give
 * a human somewhere to browse when they don't know the tool's name.
 *
 * `segment` is the URL because "developer" reads better than "code" to a
 * visitor, while the registry keeps the shorter internal name.
 */
export interface DomainHub {
  domain: Domain;
  segment: string;
  title: string;
  heading: string;
  intro: string;
  metaDescription: string;
}

export const DOMAIN_HUBS: DomainHub[] = [
  {
    domain: "pdf",
    segment: "pdf",
    title: "PDF Tools",
    heading: "PDF tools that do one thing well",
    intro:
      "Compress, convert, merge, split, protect and sign PDFs. No signup, no daily cap, no watermark on anything. Files are processed on our server and deleted an hour later.",
    metaDescription:
      "Free PDF tools - compress, merge, split, rotate, convert to Word, Excel and JPG, OCR, lock, unlock and sign. No signup, no watermark, no daily limit.",
  },
  {
    domain: "image",
    segment: "image",
    title: "Image Tools",
    heading: "Image tools that never upload your photos",
    intro:
      "Compress, resize, crop, watermark and convert between JPG, PNG, WebP and ICO - all of it inside your browser, so the picture never leaves your device. HEIC is the one exception, because no browser outside Safari can decode it.",
    metaDescription:
      "Free image tools - compress, resize, crop, watermark, and convert JPG, PNG, WebP, HEIC and ICO. Runs in your browser, so nothing is uploaded.",
  },
  {
    domain: "code",
    segment: "developer",
    title: "Developer Tools",
    heading: "Developer tools with no server in the middle",
    intro:
      "Format JSON, decode a JWT, hash a string, test a regex, diff two files. Every one of these runs locally, which means you can paste production data into them without it going anywhere.",
    metaDescription:
      "Free developer tools - JSON formatter, Base64, JWT decoder, hash generator, UUID, regex tester, diff checker and more. All run in your browser.",
  },
  {
    domain: "text",
    segment: "text",
    title: "Text Tools",
    heading: "Text tools for the fiddly jobs",
    intro:
      "Count words, change case, strip duplicates, sort lines, generate placeholder copy. Small jobs that are annoying by hand and instant here.",
    metaDescription:
      "Free text tools - word and character counter, case converter, duplicate remover, line sorter and lorem ipsum generator. No signup.",
  },
  {
    domain: "color",
    segment: "color",
    title: "Color Tools",
    heading: "Colour tools that speak CSS",
    intro:
      "Convert between HEX, RGB, HSL and OKLCH, pull exact values out of an image, and check contrast against WCAG. The accent colours on this site were generated with these.",
    metaDescription:
      "Free colour tools - HEX to RGB, HSL and OKLCH converter, colour picker from image, palette extractor and WCAG contrast checker.",
  },
  {
    domain: "security",
    segment: "security",
    title: "Security Tools",
    heading: "Security tools that never see your data",
    intro:
      "Passwords and secrets should not travel across a network to be generated. These run entirely on your device - you can disconnect from the internet and they still work.",
    metaDescription:
      "Free security tools - strong random password and passphrase generator using your browser's cryptographic randomness. Nothing is transmitted.",
  },
  {
    domain: "convert",
    segment: "convert",
    title: "Converters",
    heading: "Converters for the everyday units",
    intro:
      "Timestamps, dates and the other small conversions you end up doing in a search bar. Instant, and correct about timezones.",
    metaDescription:
      "Free converters - Unix timestamp to date, epoch converter and more. Handles seconds, milliseconds and real timezone rules.",
  },
  {
    domain: "calc",
    segment: "calculator",
    title: "Calculators & Everyday Tools",
    heading: "Calculators that show their working",
    intro:
      "Mortgages, loans, percentages, dates, BMI and GPA - each showing the breakdown underneath the answer, because a bare number is not much use when money is involved. Plus the timers and fair random draws you end up needing alongside them.",
    metaDescription:
      "Free calculators and everyday tools - mortgage, loan EMI, percentage, age, BMI, GPA, unit converter, timers, dice and random pickers. No signup.",
  },
  {
    domain: "data",
    segment: "data",
    title: "Data Tools",
    heading: "Data tools for tabular odds and ends",
    intro: "Move between CSV, JSON and the formats spreadsheets actually export.",
    metaDescription:
      "Free data tools - convert between CSV and JSON, format and validate structured data. Runs in your browser.",
  },
];

const bySegment = new Map(DOMAIN_HUBS.map((h) => [h.segment, h]));
const byDomain = new Map(DOMAIN_HUBS.map((h) => [h.domain, h]));

export function getHubBySegment(segment: string): DomainHub | undefined {
  return bySegment.get(segment);
}

export function getHubForDomain(domain: Domain): DomainHub | undefined {
  return byDomain.get(domain);
}
