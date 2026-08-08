import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "cron-expression-generator",
  primaryKeyword: "cron expression explained",
  metaDescription: "Free cron expression explainer. Paste a schedule and read back in plain English exactly when it runs.",
  relatedKeywords: [
    "cron generator",
    "crontab explained",
    "cron schedule",
    "cron syntax",
    "what does this cron do",
  ],
  faqs: [
    { q: "What are the five fields?", a: "Minute, hour, day of month, month and day of week, in that order. An asterisk means every value; */n means every n." },
    { q: "How do day-of-month and day-of-week interact?", a: "Confusingly. In standard cron, if both are set to something other than *, the job runs when EITHER matches - not both. That surprises almost everyone, so avoid setting both." },
    { q: "Which timezone does a cron run in?", a: "The system timezone of whatever runs it, which is often UTC on a server and local time on your laptop. That difference is the single most common reason a schedule fires at an unexpected hour." },
    { q: "Does this support the seconds field?", a: "No. The six-field form with seconds is a Quartz and Spring extension, not standard cron. This explains the five-field POSIX form." },
  ],
  howTo: [
    { name: "Paste a cron expression", text: "Five fields: minute, hour, day of month, month, day of week." },
    { name: "Read the description", text: "Plain English, with each field broken out separately." },
    { name: "Check the timezone", text: "Cron runs in the system timezone of the machine executing it, not yours." },
  ],
  seoCopy:
    "Paste a cron expression and read back, in plain English, when it actually runs - with each of the five fields broken out so you can see which one is wrong. Two things catch people out regularly. First, if day-of-month and day-of-week are both set to something other than an asterisk, standard cron runs the job when EITHER matches, not both. Second, a cron runs in the system timezone of the machine executing it, which is usually UTC on a server, and that is the most common reason a job fires at an unexpected hour.",
};
