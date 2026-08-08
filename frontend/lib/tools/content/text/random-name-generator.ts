import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "random-name-generator",
  primaryKeyword: "random name generator",
  metaDescription: "Free random name generator for test data, characters and mock-ups. Generates as many as you need instantly.",
  relatedKeywords: [
    "fake name generator",
    "test data names",
    "character name generator",
    "placeholder names",
  ],
  faqs: [
    { q: "What are these for?", a: "Seeding a test database, filling a design mock-up, or naming characters - anywhere you need plausible names without using real people's." },
    { q: "Are they real people?", a: "No. They are assembled from a list of common first and last names, so any resemblance to a real person is coincidence." },
    { q: "Can I generate a lot at once?", a: "Yes, up to a hundred at a time, one per line and ready to paste into a fixture or seed script." },
    { q: "Are the names diverse?", a: "The pool leans toward short, neutral English names that read well in an interface. For locale-specific test data you will want a dedicated dataset." },
  ],
  howTo: [
    { name: "Choose how many", text: "Up to a hundred at once." },
    { name: "Generate", text: "Drawn randomly from first and last name pools." },
    { name: "Copy the list", text: "One per line, ready for a seed script." },
  ],
  seoCopy:
    "Generate plausible placeholder names for test data, design mock-ups and character naming, without borrowing a real person's. Names are assembled at random from pools of common first and last names, so any match to someone real is coincidence. The pool leans deliberately toward short, neutral names that sit well in an interface without drawing attention - if you need locale-specific or culturally varied test data, a dedicated dataset will serve you better.",
};
