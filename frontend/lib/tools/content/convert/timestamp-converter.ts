import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "timestamp-converter",
  primaryKeyword: "unix timestamp converter",
  metaDescription: "Convert Unix timestamps to human-readable dates and back. Handles seconds and milliseconds, any timezone, with a live clock.",
  relatedKeywords: [
    "epoch converter",
    "unix time to date",
    "timestamp to date",
    "milliseconds to date",
    "epoch time",
  ],
  faqs: [
    { q: "Seconds or milliseconds - how do I tell?", a: "By length. A seconds timestamp for a current date is 10 digits; milliseconds is 13. The tool detects this automatically, and you can override it." },
    { q: "What is the Unix epoch?", a: "Midnight UTC on 1 January 1970. Every Unix timestamp counts the seconds elapsed since that instant, which is why timestamps are timezone-free until you format them." },
    { q: "Does this handle timezones and daylight saving?", a: "Yes. Pick any timezone and the conversion uses the real historical rules for that zone, including daylight saving shifts." },
    { q: "What is the 2038 problem?", a: "Systems storing timestamps in a signed 32-bit integer overflow on 19 January 2038. Anything using 64-bit integers, which is now standard, is unaffected." },
  ],
  howTo: [
    { name: "Paste a timestamp or pick a date", text: "Seconds and milliseconds are both detected automatically." },
    { name: "Choose a timezone", text: "Conversions use real historical rules, including daylight saving." },
    { name: "Copy the result", text: "Read it back as ISO 8601, RFC 2822 or a plain readable date." },
  ],
  seoCopy:
    "Convert Unix timestamps into readable dates and back again, in seconds or milliseconds - the tool tells the two apart by length, since a current seconds timestamp is 10 digits and milliseconds is 13. A Unix timestamp counts from midnight UTC on 1 January 1970, which makes it timezone-free until you format it, so you can pick any timezone here and the conversion applies that zone's real historical rules including daylight saving shifts. A live clock shows the current epoch value.",
};
