import { toolRegistry, getTool, resolveCleanSlug, type ToolEntry } from "./tool-registry";

// Compile-time contract: ensures ToolEntry stays assignable from registry entries.
const _entry: ToolEntry = toolRegistry[0]!;
void _entry;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
}

// Every entry has the required fields
for (const t of toolRegistry) {
  assert(!!t.slug, `slug missing: ${JSON.stringify(t)}`);
  assert(/^[a-z0-9-]+$/.test(t.slug), `slug invalid format: ${t.slug}`);
  assert(!!t.displayName, `displayName missing for ${t.slug}`);
  assert(!!t.primaryKeyword, `primaryKeyword missing for ${t.slug}`);
  assert(!!t.metaDescription, `metaDescription missing for ${t.slug}`);
  assert(t.metaDescription.length <= 175, `metaDescription too long for ${t.slug}`);
  assert(t.relatedKeywords.length >= 3, `relatedKeywords < 3 for ${t.slug}`);
  assert(t.relatedKeywords.length <= 8, `relatedKeywords > 8 for ${t.slug}`);
  assert(!!t.category, `category missing for ${t.slug}`);
  assert(!!t.backendEndpoint, `backendEndpoint missing for ${t.slug}`);
  assert(t.faqs.length >= 3, `faqs < 3 for ${t.slug}`);
  assert(t.howTo.length >= 3, `howTo < 3 for ${t.slug}`);
  assert(t.relatedSlugs.length >= 2, `relatedSlugs < 2 for ${t.slug}`);
  assert(!!t.seoCopy, `seoCopy missing for ${t.slug}`);
}

// Slugs are unique
const slugs = toolRegistry.map((t) => t.slug);
assert(new Set(slugs).size === slugs.length, "duplicate slug");

// Legacy slugs are unique and never collide with clean slugs
const legacySlugs = toolRegistry.flatMap((t) => (t.legacySlug ? [t.legacySlug] : []));
assert(new Set(legacySlugs).size === legacySlugs.length, "duplicate legacySlug");
for (const ls of legacySlugs) {
  assert(!slugs.includes(ls), `legacySlug collides with a clean slug: ${ls}`);
}

// getTool round-trips on both clean and legacy slugs
for (const t of toolRegistry) {
  assert(getTool(t.slug)?.slug === t.slug, `getTool failed for clean slug ${t.slug}`);
  if (t.legacySlug) {
    assert(getTool(t.legacySlug)?.slug === t.slug, `getTool legacy failed for ${t.legacySlug}`);
    assert(resolveCleanSlug(t.legacySlug) === t.slug, `resolveCleanSlug failed for ${t.legacySlug}`);
  }
}

// All relatedSlugs point to real tools
for (const t of toolRegistry) {
  for (const r of t.relatedSlugs) {
    assert(!!getTool(r), `relatedSlugs entry "${r}" on ${t.slug} does not exist`);
    assert(r !== t.slug, `relatedSlugs of ${t.slug} includes itself`);
  }
}

// Each of the user-mandated clean routes exists
const REQUIRED = [
  "compress-pdf",
  "merge-pdf",
  "pdf-to-jpg",
  "lock-pdf",
  "unlock-pdf",
  "pdf-ocr",
  "nid-combine",
  "passport-photo-pdf",
  "pdf-to-excel",
  "pdf-to-word",
  "word-to-pdf",
  "jpg-to-pdf",
  "compress-pdf-to-100kb",
  "sign-pdf",
];
for (const slug of REQUIRED) {
  assert(!!getTool(slug), `required clean slug missing: ${slug}`);
}

console.log(`OK — ${toolRegistry.length} tools validated`);
