import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "countdown-timer",
  primaryKeyword: "countdown timer online",
  metaDescription: "Free online countdown timer with an audible alert. Stays accurate even when the tab is in the background.",
  relatedKeywords: [
    "online timer",
    "pomodoro timer",
    "kitchen timer online",
    "set a timer",
  ],
  faqs: [
    { q: "Does it keep time if I switch tabs?", a: "Yes. Timing is derived from the system clock rather than by counting interval ticks, so background throttling does not cause drift. Tick-counting timers lose minutes over a long run." },
    { q: "Will I hear an alert?", a: "Yes, a short tone plays when the countdown reaches zero, generated in the browser so it works offline. Your tab needs to be allowed to play audio." },
    { q: "Is there a Pomodoro preset?", a: "25 minutes is one of the presets, alongside 1, 3, 5, 10, 15, 45 and 60." },
    { q: "Does it keep running if I close the tab?", a: "No. Nothing is stored, so closing the page ends the timer." },
  ],
  howTo: [
    { name: "Set a duration", text: "Type it, or use one of the presets." },
    { name: "Start", text: "Pause and resume at any time." },
    { name: "Listen for the alert", text: "A tone plays at zero, with a progress bar throughout." },
  ],
  seoCopy:
    "A countdown timer with an audible alert that stays accurate even when the tab is in the background. That last part is less trivial than it sounds: browsers throttle background tabs to as little as one timer callback per second, so a timer that counts interval ticks drifts badly over a long run. This one derives elapsed time from the system clock each frame, which means backgrounding the tab costs nothing. The alert tone is generated in the browser, so it works offline.",
};
