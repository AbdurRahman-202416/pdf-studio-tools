import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "bmi-calculator",
  primaryKeyword: "bmi calculator",
  metaDescription: "Free BMI calculator in metric or imperial, with your category and the healthy weight range for your height.",
  relatedKeywords: [
    "body mass index calculator",
    "bmi chart",
    "healthy weight calculator",
    "bmi metric imperial",
  ],
  faqs: [
    { q: "What do the categories mean?", a: "Below 18.5 underweight, 18.5-24.9 healthy, 25-29.9 overweight, 30 and above obese. These are the WHO thresholds for adults." },
    { q: "Is BMI accurate for everyone?", a: "No. It ignores muscle mass and body composition entirely, so muscular people routinely read as overweight, and it is not designed for children, pregnancy or the very elderly." },
    { q: "Why show a weight range?", a: "Because a single number is less actionable than knowing what range corresponds to a healthy BMI at your specific height." },
    { q: "Should I act on this?", a: "Treat it as one rough screening signal, not a diagnosis. Waist measurement and body composition tell you more, and a doctor can interpret all of it together." },
  ],
  howTo: [
    { name: "Choose metric or imperial", text: "Both are supported; switch at any time." },
    { name: "Enter height and weight", text: "The result updates as you type." },
    { name: "Read the category and range", text: "Plus the healthy weight range for your height." },
  ],
  seoCopy:
    "Calculate body mass index in either metric or imperial units, with the WHO category and - more usefully - the actual weight range that corresponds to a healthy BMI at your height. BMI is worth understanding for what it is not: it takes no account of muscle mass, bone density or body composition, which is why athletes frequently register as overweight, and it was never designed for children, pregnancy or the very elderly. It is a population-level screening tool, not a diagnosis.",
};
