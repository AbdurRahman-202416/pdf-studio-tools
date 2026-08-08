import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "password-generator",
  primaryKeyword: "strong random password generator",
  metaDescription: "Generate strong random passwords in your browser. Cryptographically secure, never sent anywhere, with a realistic strength estimate.",
  relatedKeywords: [
    "random password generator",
    "secure password maker",
    "passphrase generator",
    "strong password online",
  ],
  faqs: [
    { q: "Where is the randomness from?", a: "The browser's crypto.getRandomValues, which is a cryptographically secure generator. It is not Math.random, which is predictable and must never be used for passwords." },
    { q: "Is the password sent to a server?", a: "Never. It is generated on your device and there is no network request involved - you can disconnect from the internet and this page still works." },
    { q: "Should I use a long passphrase or a short complex password?", a: "Length beats complexity. A four or five word passphrase is both easier to remember and harder to crack than a short string of symbols, which is why the passphrase mode exists here." },
    { q: "What length should I use?", a: "16 characters or more for anything that matters, and never reuse one across sites. A password manager makes both of those painless." },
  ],
  howTo: [
    { name: "Choose a length and character set", text: "Or switch to passphrase mode for words you can actually remember." },
    { name: "Generate", text: "Randomness comes from the browser's cryptographic generator, on your device." },
    { name: "Copy it", text: "Nothing is stored or transmitted. Reload the page and it is gone." },
  ],
  seoCopy:
    "Generate strong random passwords using the browser's own cryptographic randomness. Nothing is transmitted and nothing is stored - the page works with the network disconnected, which is the simplest possible proof that your password is not going anywhere. Length matters more than symbol soup: a four or five word passphrase is both easier to remember and harder to crack than a short string of punctuation, which is why passphrase mode is offered alongside character-based generation. Aim for at least 16 characters.",
};
