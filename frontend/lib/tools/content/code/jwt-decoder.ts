import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "jwt-decoder",
  primaryKeyword: "jwt decoder online",
  metaDescription: "Free JWT decoder. Read a token's header, claims and expiry in your browser - the token is never transmitted or logged.",
  relatedKeywords: [
    "decode jwt",
    "jwt token decoder",
    "json web token decoder",
    "jwt parser online",
  ],
  faqs: [
    { q: "Does this verify the signature?", a: "No, and no browser tool honestly can without your secret or public key. This decodes and displays the token so you can read the claims. Verification has to happen server-side where the key lives." },
    { q: "Is it safe to paste a real token here?", a: "Safer than most alternatives, because decoding happens locally and nothing is sent or logged. That said, a JWT is a live credential until it expires - if you have pasted one into any online tool, treat it as exposed and rotate it." },
    { q: "What do iat and exp mean?", a: "Issued-at and expiry, both Unix timestamps in seconds. They're shown as readable dates here, and an expired token is flagged." },
    { q: "Why are there three parts?", a: "Header, payload and signature, joined with dots and each Base64url-encoded. Only the first two carry readable JSON; the third is the cryptographic proof." },
  ],
  howTo: [
    { name: "Paste the token", text: "All three dot-separated parts. Decoding happens in your browser." },
    { name: "Read the header and payload", text: "Both are shown as formatted JSON, with the algorithm called out." },
    { name: "Check the timestamps", text: "Issued-at and expiry are converted to readable dates, and expired tokens are marked." },
  ],
  seoCopy:
    "Decode a JSON Web Token and read its header and claims without sending it anywhere. The three dot-separated parts are Base64url-encoded header, payload and signature; only the first two contain readable JSON, and this tool formats both, converts the iat and exp timestamps into readable dates, and flags a token that has already expired. It does not verify the signature - no browser tool can do that honestly without your key, and verification belongs on the server. Treat any token you paste into an online tool as exposed.",
};
