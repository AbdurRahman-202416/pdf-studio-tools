import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "age-calculator",
  primaryKeyword: "age calculator",
  metaDescription: "Free age calculator. Exact age in years, months and days, plus total weeks, days and hours, and the next birthday countdown.",
  relatedKeywords: [
    "date of birth calculator",
    "how old am i",
    "age in days",
    "birthday countdown",
  ],
  faqs: [
    { q: "How is the age worked out?", a: "Calendar-accurately. Days are borrowed from the actual previous month rather than assuming 30, so the result matches how people count age." },
    { q: "Can I get my age on a past or future date?", a: "Yes - change the 'age as of' field to any date. Useful for eligibility cutoffs and forms." },
    { q: "Are leap years handled?", a: "Yes, they fall out of real date arithmetic. A 29 February birthday counts its next birthday as 1 March in non-leap years." },
    { q: "Why does the month count look odd near month end?", a: "Because months are unequal. Someone born on the 31st has no 31st in February, and every system resolves that differently - this one borrows from the preceding month's real length." },
  ],
  howTo: [
    { name: "Enter the date of birth", text: "Any date in the past." },
    { name: "Optionally change the 'as of' date", text: "Defaults to today; set it for eligibility checks." },
    { name: "Read the breakdown", text: "Years/months/days, plus total months, weeks, days and hours." },
  ],
  seoCopy:
    "Work out an exact age in years, months and days, along with the totals in months, weeks, days and hours, and how long remains until the next birthday. The arithmetic is calendar-accurate: days are borrowed from the real length of the preceding month rather than assuming a flat thirty, and leap years fall out correctly. You can also set the comparison date to something other than today, which is what you need when checking an eligibility cutoff or filling in a form dated in the past.",
};
