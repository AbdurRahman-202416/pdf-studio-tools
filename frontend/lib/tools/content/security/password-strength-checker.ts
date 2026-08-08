import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "password-strength-checker",
  primaryKeyword: "password strength checker",
  metaDescription: "Free password strength checker. Estimates real crack time and explains exactly which patterns weaken your password.",
  relatedKeywords: [
    "how strong is my password",
    "password entropy",
    "password security test",
    "check password strength",
  ],
  faqs: [
    { q: "Is it safe to type a password here?", a: "The check runs entirely in your browser and nothing is transmitted or stored. Even so, the right habit is never to paste a password you actually use into any website - test a variation instead." },
    { q: "Why is P@ssw0rd1 rated weak?", a: "Because it is a dictionary word with predictable substitutions and a trailing digit - one of the first patterns any cracking tool tries. Symbol-counting checkers rate it strong, which is exactly why they are misleading." },
    { q: "What is entropy in bits?", a: "A measure of how many guesses are needed. Each extra bit doubles that. Below 40 bits falls quickly; above 80 is comfortable for anything that matters." },
    { q: "How is crack time estimated?", a: "Assuming roughly 10 billion guesses per second, which is realistic for an offline attack on a fast hash. A properly slow hash like bcrypt is far tougher, and online attacks are far slower still." },
  ],
  howTo: [
    { name: "Type or paste a password", text: "Nothing is sent anywhere - test a variation of yours, not the real one." },
    { name: "Read the estimate", text: "Strength, entropy in bits, and estimated offline crack time." },
    { name: "Check the findings", text: "Each weakening pattern is called out specifically, not just scored." },
  ],
  seoCopy:
    "Check how strong a password really is, with an estimate of how long it would survive an offline attack and a specific list of what weakens it. This is deliberately not a symbol-counting checker - those reward things like P@ssw0rd1, which is a dictionary word with predictable substitutions and among the first things any cracking tool tries. Instead it estimates the search space and then penalises the patterns that collapse it: common passwords, keyboard runs, repeated characters, years and the capital-word-digits-symbol shape.",
};
