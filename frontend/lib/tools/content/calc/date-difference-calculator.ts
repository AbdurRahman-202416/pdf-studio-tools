import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "date-difference-calculator",
  primaryKeyword: "days between two dates calculator",
  metaDescription: "Free date difference calculator. Days, weeks and months between two dates, with a separate weekdays-only count.",
  relatedKeywords: [
    "days between dates",
    "date duration calculator",
    "working days calculator",
    "how many days until",
  ],
  faqs: [
    { q: "Does it count both end dates?", a: "The main figure is the gap between them. An inclusive count, which is what you want for booking nights or leave, is shown as a separate row." },
    { q: "What counts as a weekday?", a: "Monday to Friday. Public holidays vary by country and are not deducted - subtract those yourself for a working-day total." },
    { q: "Does the order of the dates matter?", a: "No. Enter them either way round and the difference comes out positive." },
    { q: "Why do the month and day counts not divide evenly?", a: "Because months have different lengths. The calendar breakdown counts real months; the day total counts real days. Both are correct, they just answer different questions." },
  ],
  howTo: [
    { name: "Pick the two dates", text: "Order does not matter." },
    { name: "Read the totals", text: "Days, weeks, hours and a calendar years/months/days breakdown." },
    { name: "Check the weekday count", text: "Saturdays and Sundays excluded, shown separately." },
  ],
  seoCopy:
    "Count the days between two dates, with weeks, hours and a real calendar breakdown in years, months and days alongside. A separate weekdays-only figure excludes Saturdays and Sundays, which is what you need for project timelines and leave calculations - though public holidays vary by country and are not deducted, so subtract those yourself. An inclusive count that counts both end dates is shown separately too, because booking nights and counting notice periods need that rather than the plain gap.",
};
