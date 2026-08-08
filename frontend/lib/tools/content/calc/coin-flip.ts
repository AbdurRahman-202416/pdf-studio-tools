import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "coin-flip",
  primaryKeyword: "coin flip online",
  metaDescription: "Free online coin flip. Genuinely random heads or tails using your browser's cryptographic randomness.",
  relatedKeywords: [
    "flip a coin",
    "heads or tails",
    "coin toss online",
    "random coin flip",
  ],
  faqs: [
    { q: "Is it actually random?", a: "Yes. It uses crypto.getRandomValues, the browser's cryptographically secure generator - not Math.random, which is seeded and predictable." },
    { q: "Can I flip several at once?", a: "Yes. Set the count and you get every individual result plus a total of heads." },
    { q: "Is a real coin 50/50?", a: "Almost. Physical coins have a very slight bias from their weight distribution and the way they are caught. A cryptographic generator does not." },
    { q: "Does it remember previous flips?", a: "A short history is kept in the page while it is open. Nothing is stored or sent anywhere." },
  ],
  howTo: [
    { name: "Choose how many flips", text: "One, or a batch." },
    { name: "Press flip", text: "The draw uses cryptographic randomness." },
    { name: "Read the result", text: "With a running history of recent flips." },
  ],
  seoCopy:
    "Flip a coin online with genuinely random results, drawn from your browser's cryptographically secure generator rather than Math.random - which is seeded, predictable, and unsuitable for anything where the outcome matters. You can flip several at once and see both the individual results and the total heads. A small point of trivia: a physical coin is not quite 50/50, carrying a slight bias from its weight distribution and how it is caught, whereas a cryptographic draw genuinely is.",
};
