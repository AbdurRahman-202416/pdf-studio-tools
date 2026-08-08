import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "base64-encode-decode",
  primaryKeyword: "base64 encode decode online",
  metaDescription: "Free Base64 encoder and decoder. UTF-8 safe both ways, with URL-safe output. Runs in your browser so nothing is transmitted.",
  relatedKeywords: [
    "base64 decoder",
    "base64 encoder",
    "base64 to text",
    "url safe base64",
    "decode base64 online",
  ],
  faqs: [
    { q: "Is Base64 encryption?", a: "No, and this matters. Base64 is an encoding, not a cipher - anyone can decode it instantly. Never use it to protect a secret; it exists to move binary data safely through text-only channels." },
    { q: "What is URL-safe Base64?", a: "Standard Base64 uses + and /, which have meaning inside a URL. The URL-safe variant swaps them for - and _ and drops the trailing padding, so the string survives being put in a query parameter." },
    { q: "Why did my emoji or accented text break elsewhere?", a: "Because most naive implementations use btoa directly, which only handles Latin-1. This one encodes to UTF-8 bytes first, so any character survives the round trip." },
    { q: "Do I need the padding characters?", a: "Decoders usually accept a string without trailing = signs, and this one restores them automatically. Some strict parsers do require them, so keep the padding if you are handing the value to something you don't control." },
  ],
  howTo: [
    { name: "Choose encode or decode", text: "The tool handles both directions." },
    { name: "Paste your text or Base64", text: "UTF-8 is handled correctly in both directions." },
    { name: "Copy the result", text: "Switch to URL-safe output if the value is going into a query string." },
  ],
  seoCopy:
    "Encode text to Base64 and decode it back, correctly handling UTF-8 so emoji and accented characters survive the round trip - something naive implementations using btoa directly get wrong, because that function only understands Latin-1. A URL-safe mode swaps the + and / characters for - and _ and drops padding, which is what you need when the value goes into a query string. Worth repeating: Base64 is an encoding, not encryption. Anyone can reverse it instantly, so never use it to hide a secret.",
};
