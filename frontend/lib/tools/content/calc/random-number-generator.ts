import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "random-number-generator",
  primaryKeyword: "random number generator",
  metaDescription: "Free random number generator. Pick numbers in any range, with or without repeats, using cryptographic randomness.",
  relatedKeywords: [
    "random number picker",
    "lottery number generator",
    "pick a random number",
    "rng online",
  ],
  faqs: [
    { q: "Is this suitable for a giveaway?", a: "Yes. Draws come from the browser's cryptographic generator, so the result cannot be predicted or influenced - which is exactly what a fair draw needs." },
    { q: "What does 'no repeats' do?", a: "Draws without replacement, like a lottery. Each number can only come up once in a batch." },
    { q: "Can the range be negative?", a: "Yes, any range works, and the order of the two bounds does not matter." },
    { q: "Why not Math.random?", a: "Because it is seeded and predictable - fine for a shuffle animation, unsuitable for anything with a prize attached." },
  ],
  howTo: [
    { name: "Set the range", text: "Any minimum and maximum, negatives included." },
    { name: "Choose how many", text: "And whether repeats are allowed." },
    { name: "Generate", text: "Every draw uses cryptographic randomness." },
  ],
  seoCopy:
    "Generate random numbers in any range, optionally without repeats, using your browser's cryptographically secure generator. That distinction matters whenever something is at stake: Math.random is seeded and predictable, which is fine for a shuffle animation and unsuitable for a giveaway or a fair selection. The no-repeats mode draws without replacement the way a lottery does, so each number can only appear once in a batch.",
};
