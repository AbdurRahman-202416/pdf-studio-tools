import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "tip-calculator",
  primaryKeyword: "tip calculator",
  metaDescription: "Free tip calculator. Tip amount, total and the per-person split - with the common percentages one tap away.",
  relatedKeywords: [
    "gratuity calculator",
    "split bill calculator",
    "tip percentage",
    "restaurant tip calculator",
  ],
  faqs: [
    { q: "How much should I tip?", a: "In the US, 15-20% is standard for restaurant service and 20% is increasingly the norm. In the UK and much of Europe 10-12.5% is typical and often already on the bill. In Japan tipping can cause offence." },
    { q: "Tip on the pre-tax or post-tax total?", a: "Pre-tax is the traditional convention and slightly cheaper. Many people simply tip on the total; either is accepted." },
    { q: "Is service charge the same as a tip?", a: "No. If a service charge is already on the bill, an additional tip is optional. Check before paying twice." },
    { q: "How does the split work?", a: "The total including tip is divided equally. The per-person tip is shown separately so everyone can see the split." },
  ],
  howTo: [
    { name: "Enter the bill", text: "The amount before tip." },
    { name: "Pick a tip percentage", text: "10, 15, 18, 20 and 25% are one tap." },
    { name: "Set the number of people", text: "The per-person total appears immediately." },
  ],
  seoCopy:
    "Work out the tip, the total and the per-person split, with the common percentages one tap away. Worth knowing that tipping norms differ sharply by country: 15-20% is standard in US restaurants with 20% increasingly expected, the UK and much of Europe sit around 10-12.5% and often add it to the bill already, and in Japan tipping can be taken as an insult. If a service charge already appears on your bill, an additional tip is optional - check before paying twice.",
};
