import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "loan-emi-calculator",
  primaryKeyword: "loan emi calculator",
  metaDescription: "Free EMI calculator. Monthly instalment, total interest and total repayable for any loan amount, rate and term.",
  relatedKeywords: [
    "emi calculator",
    "personal loan calculator",
    "car loan calculator",
    "monthly instalment calculator",
  ],
  faqs: [
    { q: "What does EMI stand for?", a: "Equated Monthly Instalment - a fixed monthly payment covering both interest and principal, sized so the loan clears exactly at the end of the term." },
    { q: "Why is early EMI mostly interest?", a: "Interest is charged on the outstanding balance, which is highest at the start. The split shifts toward principal as the balance falls, which is why paying extra early saves disproportionately." },
    { q: "Does a longer term save money?", a: "It lowers the monthly payment and raises the total cost. The 'interest as % of loan' row makes that trade explicit." },
    { q: "Is this flat rate or reducing balance?", a: "Reducing balance, which is what banks actually use. A flat-rate quote of the same percentage costs substantially more - be careful comparing the two." },
  ],
  howTo: [
    { name: "Enter the amount and rate", text: "Annual interest rate, entered as a percentage." },
    { name: "Set the term in months", text: "One, three, five and ten year presets are one click." },
    { name: "Read the total cost", text: "EMI, total interest and total repayable together." },
  ],
  seoCopy:
    "Calculate the equated monthly instalment for any loan, along with the total interest and total repayable - the figures that show what borrowing actually costs rather than just what it costs each month. The calculation uses reducing-balance interest, which is what banks genuinely apply; a flat-rate quote at the same headline percentage works out considerably more expensive, and comparing the two directly is a common and costly mistake. The interest-as-percentage-of-loan row makes the trade-off between term and total cost explicit.",
};
