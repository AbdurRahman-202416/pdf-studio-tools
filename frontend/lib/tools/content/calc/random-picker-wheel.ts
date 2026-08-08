import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "random-picker-wheel",
  primaryKeyword: "random picker wheel",
  metaDescription: "Free random picker. Paste your options, get a fair winner - built on cryptographic randomness, not Math.random.",
  relatedKeywords: [
    "spin the wheel",
    "random name picker",
    "decision wheel",
    "raffle picker",
    "pick a winner",
  ],
  faqs: [
    { q: "Is the draw actually fair?", a: "Yes. Every option has an exactly equal chance, drawn from the browser's cryptographic generator with rejection sampling so there is no bias toward the start of the list." },
    { q: "Can I remove the winner between draws?", a: "Yes - turn on 'remove the winner' and run repeated draws to pick several people without repeats." },
    { q: "How many options can I add?", a: "As many as you like, one per line. Paste a whole list straight in." },
    { q: "Is my list stored?", a: "No. It lives in the page while it is open and is never sent anywhere." },
  ],
  howTo: [
    { name: "Paste your options", text: "One per line - names, prizes, anything." },
    { name: "Pick a winner", text: "A short pause, then a fair draw." },
    { name: "Optionally remove winners", text: "For drawing several without repeats." },
  ],
  seoCopy:
    "Paste a list of options and draw a winner fairly. Every entry has an exactly equal chance, because the draw uses the browser's cryptographic generator with rejection sampling - a plain modulo of a random number subtly favours the start of a list, which is the kind of bias nobody notices and everybody would object to. Turn on the remove-winner option to draw several in a row without repeats, which is what raffles and classroom selection usually need.",
};
