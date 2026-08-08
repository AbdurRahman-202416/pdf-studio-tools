import "server-only";

import { listSlugs } from "@/lib/blog";
import { REDIRECTS } from "@/lib/redirects";
import { RESERVED_SLUGS, tools } from "@/lib/tools";
import { allToolContent } from "@/lib/tools/content";
import { DOMAIN_HUBS } from "@/lib/tools/domains";
import { RELATED_ARTICLES } from "@/lib/tools/related-articles";

/**
 * Registry invariants, enforced at build time.
 *
 * This is called from the `/[slug]` route's generateStaticParams, so a
 * violation fails `next build` - and therefore CI - rather than sitting in a
 * test file that nothing runs. (The previous lib/seo/tool-registry.test.ts was
 * never wired to a runner: there is no `npm run test`, and CI only does lint +
 * build.)
 */
export async function validateRegistry(): Promise<void> {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(msg);

  const slugs = tools.map((t) => t.slug);
  const reserved = new Set<string>(RESERVED_SLUGS);

  // --- identity ---
  const seenSlug = new Set<string>();
  for (const t of tools) {
    if (!/^[a-z0-9-]+$/.test(t.slug)) err(`slug is not URL-safe: "${t.slug}"`);
    if (seenSlug.has(t.slug)) err(`duplicate slug: "${t.slug}"`);
    seenSlug.add(t.slug);
    if (reserved.has(t.slug)) {
      err(`tool "${t.slug}" claims RESERVED_SLUGS entry - it would shadow a real page`);
    }
    if (!t.id) err(`missing id: "${t.slug}"`);
    if (!t.cardTitle) err(`missing cardTitle: "${t.slug}"`);
    if (!t.cardBlurb) err(`missing cardBlurb: "${t.slug}"`);
    if (t.runtime === "server" && !t.backendEndpoint) {
      err(`server tool "${t.slug}" has no backendEndpoint`);
    }
    if (t.runtime === "client" && t.backendEndpoint) {
      err(`client tool "${t.slug}" declares a backendEndpoint`);
    }
  }

  // --- legacy slugs ---
  const seenLegacy = new Set<string>();
  for (const t of tools) {
    if (!t.legacySlug) continue;
    if (seenLegacy.has(t.legacySlug)) err(`duplicate legacySlug: "${t.legacySlug}"`);
    seenLegacy.add(t.legacySlug);
    if (slugs.includes(t.legacySlug)) {
      err(`legacySlug "${t.legacySlug}" collides with a clean slug`);
    }
  }

  // Every legacySlug must have a matching redirect in lib/redirects.ts, or the
  // old /tools/<slug> URL silently 404s. And every redirect must land on a real
  // page (a registry slug or a hub segment), not a typo.
  const redirectFroms = new Set(REDIRECTS.map((r) => r.from));
  const hubSegments = new Set(DOMAIN_HUBS.map((h) => h.segment));
  for (const t of tools) {
    if (!t.legacySlug) continue;
    if (!redirectFroms.has(`/tools/${t.legacySlug}`)) {
      err(`legacySlug "${t.legacySlug}" has no "/tools/${t.legacySlug}" entry in lib/redirects.ts`);
    }
  }
  for (const r of REDIRECTS) {
    const target = r.to.replace(/^\//, "");
    if (!slugs.includes(target) && !hubSegments.has(target)) {
      err(`redirect "${r.from}" -> "${r.to}" targets neither a registry slug nor a hub segment`);
    }
  }

  // --- curated overrides point at real tools ---
  for (const t of tools) {
    for (const r of t.relatedOverride ?? []) {
      if (r === t.slug) err(`relatedOverride of "${t.slug}" includes itself`);
      if (!slugs.includes(r)) err(`relatedOverride "${r}" on "${t.slug}" does not exist`);
    }
  }

  // --- related-guide links point at real tools and real blog posts ---
  const toolSet = new Set(slugs);
  const blogSlugs = new Set(listSlugs());
  for (const [toolSlug, articles] of Object.entries(RELATED_ARTICLES)) {
    if (!toolSet.has(toolSlug)) {
      err(`RELATED_ARTICLES key "${toolSlug}" is not a tool slug`);
    }
    for (const a of articles) {
      if (!blogSlugs.has(a.slug)) {
        err(`related guide "${a.slug}" on "${toolSlug}" has no blog post`);
      }
    }
  }

  // --- content ---
  const content = await allToolContent();
  const bySlug = new Map(content.map((c) => [c.slug, c]));
  const seenMeta = new Map<string, string>();

  for (const t of tools) {
    const c = bySlug.get(t.slug);
    if (!c) {
      err(`no content module for "${t.slug}"`);
      continue;
    }
    if (!c.primaryKeyword) err(`missing primaryKeyword: "${t.slug}"`);

    if (c.metaDescription.length > 160) {
      err(`metaDescription is ${c.metaDescription.length} chars (max 160): "${t.slug}"`);
    }
    const dupe = seenMeta.get(c.metaDescription);
    if (dupe) err(`duplicate metaDescription on "${t.slug}" and "${dupe}"`);
    seenMeta.set(c.metaDescription, t.slug);

    if (c.faqs.length < 4) err(`only ${c.faqs.length} FAQs (min 4): "${t.slug}"`);
    if (c.howTo.length < 3) err(`only ${c.howTo.length} howTo steps (min 3): "${t.slug}"`);
    if (c.seoCopy.length < 300) {
      err(`seoCopy is ${c.seoCopy.length} chars (min 300): "${t.slug}"`);
    }
    if (c.relatedKeywords.length < 3 || c.relatedKeywords.length > 8) {
      err(`relatedKeywords must be 3-8, got ${c.relatedKeywords.length}: "${t.slug}"`);
    }
  }

  // --- curation coverage: warn, never fail ---
  const warnings: string[] = [];
  const featured = tools.filter((t) => t.featured);
  if (featured.length === 0) {
    warnings.push("No tools are marked `featured` - the homepage slider will be empty.");
  } else if (featured.length < 6) {
    warnings.push(`Only ${featured.length} featured tools; the homepage slider looks thin below 6.`);
  }
  const featuredDomains = new Set(featured.map((t) => t.domain));
  if (featured.length && featuredDomains.size < 3) {
    warnings.push(
      "Featured tools span fewer than 3 domains - the slider is meant to show the catalogue's breadth.",
    );
  }

  for (const domain of new Set(tools.map((t) => t.domain))) {
    const inDomain = tools.filter((t) => t.domain === domain);
    if (inDomain.length < 5) continue; // small domains skip the slider by design
    const trending = inDomain.filter((t) => t.trending).length;
    if (trending < 5) {
      warnings.push(
        `Domain "${domain}" has ${inDomain.length} tools but only ${trending} marked trending - ` +
          "its hub slider will be hidden (needs 5).",
      );
    }
  }

  for (const w of warnings) {
    console.warn(`  [tools] ${w}`);
  }

  if (errors.length) {
    throw new Error(
      `Tool registry validation failed (${errors.length} error${errors.length === 1 ? "" : "s"}):\n` +
        errors.map((e) => `  - ${e}`).join("\n"),
    );
  }
}
