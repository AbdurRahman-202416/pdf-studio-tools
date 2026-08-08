import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "unit-converter",
  primaryKeyword: "unit converter online",
  metaDescription: "Free unit converter for length, weight, temperature, volume, area, speed, data and time. Instant, in your browser.",
  relatedKeywords: [
    "metric converter",
    "cm to inches",
    "kg to pounds",
    "celsius to fahrenheit",
    "measurement converter",
  ],
  faqs: [
    { q: "Which units are covered?", a: "Length, weight, temperature, volume, area, speed, digital storage and time - metric and imperial together, including the separate US and UK gallon and pint." },
    { q: "Why do US and UK pints differ?", a: "They are genuinely different measures. A US pint is about 473 ml, a UK pint about 568 ml - roughly 20% larger. Both are listed separately." },
    { q: "Is temperature converted differently?", a: "Yes. Temperature scales have different zero points, so they need an offset as well as a ratio - it cannot be done with a simple multiplier like the others." },
    { q: "Are data units binary or decimal?", a: "Binary, so 1 KB is 1024 bytes - the way operating systems report file sizes. Drive manufacturers use decimal, which is why a '1 TB' disk shows as roughly 931 GB." },
  ],
  howTo: [
    { name: "Pick a category", text: "Length, weight, temperature, volume, area, speed, data or time." },
    { name: "Choose the units", text: "Swap the two with one button." },
    { name: "Read the result", text: "Converts as you type, with exponent notation for very large or small values." },
  ],
  seoCopy:
    "Convert between units of length, weight, temperature, volume, area, speed, digital storage and time, with metric and imperial listed side by side. A few details this gets right that catch people out: US and UK pints and gallons are genuinely different measures and are listed separately, temperature needs an offset rather than a simple multiplier because the scales have different zero points, and digital storage uses binary units the way operating systems report them - which is why a drive sold as 1 TB shows up as about 931 GB.",
};
