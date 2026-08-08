import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "mortgage-calculator",
  primaryKeyword: "mortgage calculator",
  metaDescription: "Free mortgage calculator. Monthly payment with property tax and insurance, plus total interest over the full term.",
  relatedKeywords: [
    "home loan calculator",
    "monthly mortgage payment",
    "house payment calculator",
    "mortgage interest calculator",
  ],
  faqs: [
    { q: "What does the monthly figure include?", a: "Principal, interest, and one-twelfth of your annual property tax and home insurance. It excludes PMI, HOA fees and closing costs, so a lender's quote will be a little higher." },
    { q: "Why does a 30-year loan cost so much more than a 15-year?", a: "Because interest accrues on the outstanding balance for twice as long. On a typical loan the 30-year option can cost more than double the total interest, even though the monthly payment is lower." },
    { q: "Do I need 20% down?", a: "No, but below 20% most US lenders add private mortgage insurance, which this calculator does not include. That is usually 0.5-1.5% of the loan per year until you reach 20% equity." },
    { q: "Is the rate the same as APR?", a: "Close but not identical. APR folds in certain lender fees, so it runs slightly higher than the headline interest rate. Use the APR here for a more realistic figure." },
  ],
  howTo: [
    { name: "Enter the price and deposit", text: "The down payment is entered as a percentage of the price." },
    { name: "Add your rate and term", text: "15, 20 and 30 year presets are one click." },
    { name: "Read the breakdown", text: "Monthly payment, total interest and total of payments, all shown together." },
  ],
  seoCopy:
    "Work out a realistic monthly mortgage payment including principal, interest, property tax and home insurance - not just the principal-and-interest figure most calculators stop at. The breakdown shows total interest over the full term, which is the number that actually reveals what a longer loan costs: stretching from 15 to 30 years can more than double the interest paid even though each payment is smaller. PMI, HOA fees and closing costs are excluded, so a lender's quote will run slightly higher.",
};
