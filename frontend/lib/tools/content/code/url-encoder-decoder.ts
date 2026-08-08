import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "url-encoder-decoder",
  primaryKeyword: "url encoder decoder online",
  metaDescription: "Free URL encoder and decoder. Percent-encode query values or whole URLs, and decode them back. Runs in your browser.",
  relatedKeywords: [
    "percent encoding",
    "urlencode online",
    "decode url",
    "query string encoder",
    "uri encoder",
  ],
  faqs: [
    { q: "What's the difference between component and full URL mode?", a: "Component mode escapes everything that isn't safe inside a single query value, including & = ? and /. Full URL mode leaves the characters that give a URL its structure intact. Use component mode for a value, full mode for a whole address." },
    { q: "Why does a space become %20 sometimes and + other times?", a: "%20 is correct percent-encoding. The plus sign is a legacy convention from HTML form submission that only applies inside a query string. This tool emits %20 and accepts either when decoding." },
    { q: "Why did my URL break after encoding?", a: "Almost always because a whole URL was run through component mode, which escapes the slashes and colon that make it a URL. Switch to full URL mode." },
    { q: "Does it handle non-English characters?", a: "Yes. Characters are encoded as UTF-8 bytes, which is what every modern server expects." },
  ],
  howTo: [
    { name: "Pick a direction", text: "Encode or decode." },
    { name: "Choose the scope", text: "Component for a single query value, full URL to keep the structure intact." },
    { name: "Copy the result", text: "Non-English characters are handled as UTF-8 throughout." },
  ],
  seoCopy:
    "Percent-encode and decode URLs in your browser, choosing whether you are escaping a single query value or a whole address - a distinction that trips people up constantly. Component mode escapes everything unsafe inside a value, including ampersands, equals signs and slashes. Full URL mode leaves the characters that give a URL its structure alone. Running a complete URL through component mode is the usual reason an encoded link stops working. Non-English text is encoded as UTF-8 bytes, which is what every modern server expects.",
};
