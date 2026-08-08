import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "discount-calculator",
  primaryKeyword: "discount calculator percent off",
  metaDescription: "Free discount calculator. Work out the sale price after a percentage off, how much you save, and the total with tax.",
  relatedKeywords: [
    "percent off calculator",
    "sale price calculator",
    "how much do i save",
    "markdown calculator",
  ],
  faqs: [
    { q: "How do I stack two discounts?", a: "Apply them one after another, not added together. 20% then 10% off is 28% off in total, not 30% - the second applies to the already-reduced price." },
    { q: "Is tax charged before or after the discount?", a: "After, in almost every jurisdiction - you are taxed on what you actually pay. That is the order this calculator uses." },
    { q: "Can I work backwards from the sale price?", a: "Use the percentage calculator's change mode: enter the original and sale prices to get the discount percentage." },
    { q: "What is a good discount?", a: "Worth knowing that many 'was' prices are inflated reference prices. A big percentage off a number nobody paid is not a saving." },
  ],
  howTo: [
    { name: "Enter the original price", text: "And the discount percentage - common values are one click." },
    { name: "Add sales tax if relevant", text: "Applied after the discount, as it is in practice." },
    { name: "Read the final price", text: "With the amount saved shown separately." },
  ],
  seoCopy:
    "Work out what you actually pay after a percentage discount, how much you save, and the final total once sales tax is added - applied after the discount, which is the order used in practice almost everywhere. One thing worth knowing when comparing offers: stacked discounts multiply rather than add, so 20% off followed by another 10% off is a 28% reduction, not 30%, because the second percentage applies to the already-reduced price.",
};
