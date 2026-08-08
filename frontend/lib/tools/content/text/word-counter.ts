import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "word-counter",
  primaryKeyword: "word counter online free",
  metaDescription: "Free word and character counter with sentence, paragraph and reading-time estimates. Live as you type, nothing uploaded.",
  relatedKeywords: [
    "character counter",
    "word count tool",
    "letter counter",
    "reading time calculator",
    "count words online",
  ],
  faqs: [
    { q: "Does it count characters with and without spaces?", a: "Both, because different limits mean different things. Twitter-style limits count everything; some academic and form limits exclude spaces." },
    { q: "How is reading time calculated?", a: "At roughly 200 words per minute, the usual estimate for adult silent reading of general prose. Technical material runs slower, so treat it as a floor." },
    { q: "What counts as a sentence?", a: "A run of text ending in a full stop, question mark or exclamation mark. Abbreviations like 'e.g.' will inflate the count slightly - no counter avoids that entirely." },
    { q: "Is my text stored anywhere?", a: "No. Counting happens as you type, in your browser, and nothing is sent or saved. Close the tab and it is gone." },
  ],
  howTo: [
    { name: "Paste or type your text", text: "Counting updates live as you go." },
    { name: "Read the breakdown", text: "Words, characters with and without spaces, sentences, paragraphs and lines." },
    { name: "Check the reading time", text: "Estimated at about 200 words per minute." },
  ],
  seoCopy:
    "Count words, characters, sentences, paragraphs and lines as you type, with a reading-time estimate based on roughly 200 words per minute - the usual figure for adult silent reading of general prose, and a floor rather than a ceiling for technical material. Characters are reported both with and without spaces, because different limits mean different things: social platforms count everything, while some academic and form limits exclude whitespace. Nothing is uploaded or stored - close the tab and the text is gone.",
};
