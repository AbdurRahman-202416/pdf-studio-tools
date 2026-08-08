import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "hash-generator",
  primaryKeyword: "sha256 hash generator online",
  metaDescription: "Free hash generator - SHA-1, SHA-256, SHA-384 and SHA-512 via your browser's WebCrypto. Nothing is uploaded.",
  relatedKeywords: [
    "sha256 generator",
    "sha512 hash",
    "md5 alternative",
    "checksum generator",
    "hash text online",
  ],
  faqs: [
    { q: "Why is there no MD5?", a: "Because the browser's WebCrypto deliberately omits it, and so do we. MD5 has been broken for collision resistance since 2004 and should not be used for anything security-related. If you need it for a legacy checksum, use a local tool." },
    { q: "Which algorithm should I pick?", a: "SHA-256 for almost everything. SHA-512 is not meaningfully more secure for typical use and produces a longer digest. SHA-1 is included only for checking against legacy systems - do not use it for anything new." },
    { q: "Can I hash a password with this?", a: "You can, but you shouldn't store the result. Passwords need a slow, salted algorithm such as bcrypt, scrypt or Argon2. A raw SHA-256 of a password is trivially brute-forced." },
    { q: "Is my input sent anywhere?", a: "No. Hashing uses crypto.subtle in your browser - there is no network request, and the page keeps working with the connection cut." },
  ],
  howTo: [
    { name: "Paste your text", text: "It stays on your device; hashing uses the browser's WebCrypto." },
    { name: "Pick an algorithm", text: "SHA-256 is the sensible default." },
    { name: "Copy the digest", text: "Shown as lowercase hexadecimal, the usual interchange format." },
  ],
  seoCopy:
    "Generate SHA-1, SHA-256, SHA-384 and SHA-512 digests using your browser's own WebCrypto implementation, with no network request involved. MD5 is absent on purpose: WebCrypto omits it, and it has been broken for collision resistance since 2004. SHA-256 is the right default for almost everything. One important caveat - a raw hash is not password storage. Passwords need a slow, salted algorithm like bcrypt, scrypt or Argon2, because a plain SHA-256 of a password can be brute-forced at enormous speed.",
};
