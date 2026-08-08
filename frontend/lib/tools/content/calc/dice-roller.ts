import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "dice-roller",
  primaryKeyword: "dice roller online",
  metaDescription: "Free online dice roller. Roll any number of dice with any number of sides - d4 through d100, D&D ready.",
  relatedKeywords: [
    "roll dice online",
    "d20 roller",
    "virtual dice",
    "dnd dice roller",
  ],
  faqs: [
    { q: "Which dice are supported?", a: "Any. The standard polyhedral set - d4, d6, d8, d10, d12, d20 and d100 - is one tap, and you can type any number of sides." },
    { q: "Can I roll multiple dice?", a: "Yes. Set the count and you get each individual roll plus the total, which is what tabletop games need." },
    { q: "Is it fair?", a: "Yes - uniformly random via the browser's cryptographic generator, with rejection sampling so no face is favoured. Physical dice are usually slightly biased by their manufacturing." },
    { q: "Does it handle modifiers like 2d6+3?", a: "Not as notation. Roll the dice and add the modifier yourself - the total is shown separately from the individual rolls." },
  ],
  howTo: [
    { name: "Set the number of dice", text: "And how many sides each has." },
    { name: "Roll", text: "Cryptographically random, uniformly distributed." },
    { name: "Read the total", text: "Individual rolls shown alongside the sum." },
  ],
  seoCopy:
    "Roll any number of dice with any number of sides, from the standard polyhedral set through to d100 and beyond. Each roll uses your browser's cryptographic generator with rejection sampling, which means every face is genuinely equally likely - worth noting because real dice are usually very slightly biased by moulding and pip placement. Individual results and the total are shown separately, which is what tabletop play needs.",
};
