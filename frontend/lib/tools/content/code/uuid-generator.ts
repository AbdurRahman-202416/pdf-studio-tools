import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "uuid-generator",
  primaryKeyword: "uuid generator v4 online",
  metaDescription: "Free UUID generator. Version 4 identifiers from your browser's cryptographic randomness - generate one or fifty at a time.",
  relatedKeywords: [
    "guid generator",
    "uuid v4",
    "random uuid",
    "generate uuid online",
    "unique id generator",
  ],
  faqs: [
    { q: "What is a version 4 UUID?", a: "One built almost entirely from random bits - 122 of its 128 are random, with the rest identifying the version and variant. That makes collisions effectively impossible without needing any central coordination." },
    { q: "Are these random enough to rely on?", a: "Yes. They come from crypto.randomUUID, which uses the platform's cryptographically secure generator - not Math.random." },
    { q: "Should I use a UUID as a database primary key?", a: "It works, but random UUIDs scatter inserts across a B-tree index, which hurts write performance at scale. UUIDv7 or a sequential ID is usually the better choice for a primary key." },
    { q: "What is the difference between UUID and GUID?", a: "Nothing meaningful. GUID is Microsoft's name for the same 128-bit identifier; the formats are interchangeable." },
  ],
  howTo: [
    { name: "Choose how many", text: "One, or up to fifty at a time." },
    { name: "Generate", text: "Each identifier comes from your browser's cryptographic randomness." },
    { name: "Copy the list", text: "One per line, ready to paste into a fixture or a seed script." },
  ],
  seoCopy:
    "Generate version 4 UUIDs using crypto.randomUUID, your browser's cryptographically secure generator - not Math.random, which is predictable. A v4 UUID carries 122 random bits, which makes collisions effectively impossible without any central coordination, and that is exactly why they are the default identifier for distributed systems. One caveat if you are choosing a database primary key: random UUIDs scatter inserts across the index and hurt write throughput at scale, where UUIDv7 or a sequential id behaves far better.",
};
