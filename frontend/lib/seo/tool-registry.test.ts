import { toolRegistry, getTool, type ToolEntry } from "./tool-registry";

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
  assert(t.relatedKeywords.length >= 3, `relatedKeywords < 3 for ${t.slug}`);
  assert(t.relatedKeywords.length <= 5, `relatedKeywords > 5 for ${t.slug}`);
  assert(!!t.category, `category missing for ${t.slug}`);
  assert(!!t.backendEndpoint, `backendEndpoint missing for ${t.slug}`);
  assert(t.faqs.length >= 3, `faqs < 3 for ${t.slug}`);
}

// Slugs are unique
const slugs = toolRegistry.map((t) => t.slug);
assert(new Set(slugs).size === slugs.length, "duplicate slug");

// getTool round-trips
for (const t of toolRegistry) {
  const found = getTool(t.slug);
  assert(found?.slug === t.slug, `getTool failed for ${t.slug}`);
}

// govt-forms is GONE
assert(!toolRegistry.find((t) => t.slug.includes("govt-forms")), "govt-forms still in registry");
assert(!toolRegistry.find((t) => t.slug.includes("nid-combine")), "old nid-combine slug still in registry");
assert(!toolRegistry.find((t) => t.slug.includes("bangla-ocr")), "old bangla-ocr slug still in registry");
assert(!toolRegistry.find((t) => t.slug.includes("bank-to-excel")), "old bank-to-excel slug still in registry");

console.log(`OK — ${toolRegistry.length} tools validated`);
