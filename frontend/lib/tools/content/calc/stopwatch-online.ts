import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "stopwatch-online",
  primaryKeyword: "online stopwatch",
  metaDescription: "Free online stopwatch with lap times. Accurate to a hundredth of a second, even with the tab in the background.",
  relatedKeywords: [
    "stopwatch with laps",
    "online timer stopwatch",
    "lap timer",
    "start stop timer",
  ],
  faqs: [
    { q: "How precise is it?", a: "Displayed to a hundredth of a second. The underlying measurement uses the system clock, so it does not drift while the tab is backgrounded." },
    { q: "What does the lap button record?", a: "The total elapsed time at that moment, plus the split since the previous lap - both are shown." },
    { q: "Can I pause and resume?", a: "Yes. Elapsed time accumulates across pauses rather than restarting." },
    { q: "Is anything saved?", a: "No. Reloading the page clears everything - nothing is stored or transmitted." },
  ],
  howTo: [
    { name: "Press start", text: "Timing begins immediately." },
    { name: "Record laps", text: "Each lap shows the total and the split from the previous one." },
    { name: "Pause or reset", text: "Elapsed time accumulates across pauses." },
  ],
  seoCopy:
    "A stopwatch with lap timing, displayed to a hundredth of a second. Elapsed time is measured against the system clock rather than by counting timer callbacks, so it stays accurate even when the tab is in the background - which is where most browser stopwatches quietly fall apart, since browsers throttle background timers heavily. Each lap records both the total elapsed time and the split since the previous lap, and pausing accumulates rather than restarting.",
};
