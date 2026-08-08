import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "yaml-to-json",
  primaryKeyword: "yaml to json converter",
  metaDescription: "Free YAML to JSON converter, and JSON back to YAML. Real parse errors instead of guesses. Runs in your browser.",
  relatedKeywords: [
    "json to yaml",
    "convert yaml",
    "yaml parser online",
    "yaml converter",
    "yml to json",
  ],
  faqs: [
    { q: "Why does my YAML fail on a colon?", a: "Because a colon followed by a space starts a key. A value containing one - a URL, a time - has to be quoted, and that is the single most common YAML error." },
    { q: "What happened to my comments?", a: "JSON has no comment syntax, so they are dropped in the YAML-to-JSON direction. There is no way to preserve them." },
    { q: "Why did 'no' become false?", a: "YAML's older spec treats yes, no, on and off as booleans. Quote them if you meant the strings. This catches out anyone writing country codes, where NO means Norway." },
    { q: "Is indentation really significant?", a: "Completely - and tabs are forbidden, only spaces. Mixed indentation is the second most common reason a YAML file won't parse." },
  ],
  howTo: [
    { name: "Pick a direction", text: "YAML to JSON, or JSON back to YAML." },
    { name: "Paste your document", text: "Parsing happens in your browser." },
    { name: "Copy the result", text: "Errors report the line, so you can find the real problem." },
  ],
  seoCopy:
    "Convert YAML to JSON and back in your browser, with genuine parse errors rather than a vague failure. A few YAML behaviours account for most problems: a colon followed by a space starts a key, so URLs and times must be quoted; indentation is significant and tabs are forbidden entirely; and the older spec treats yes, no, on and off as booleans, which surprises anyone writing NO for Norway. Comments cannot survive the trip to JSON, because JSON has no syntax for them.",
};
