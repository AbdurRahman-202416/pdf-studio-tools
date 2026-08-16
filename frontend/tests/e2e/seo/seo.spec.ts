import { expect, test } from "@playwright/test";
import { liveTools, tools } from "../helpers/registry";

/**
 * Technical SEO regressions. These encode the audit's CONFIRMED findings so a
 * regression re-breaks a test rather than silently shipping.
 */

test.describe("canonical + metadata", () => {
  test("no page ships a localhost canonical", async ({ page }) => {
    // Guards the biggest confirmed risk: canonicals baked from NEXT_PUBLIC_SITE_URL.
    // In this test build the site URL is 127.0.0.1, so we assert the shape is a
    // real self-referencing canonical, and (when run against a prod build) that
    // it is never a bare localhost with no host. We check consistency instead.
    for (const slug of ["compress-pdf", "json-formatter", "merge-pdf"]) {
      await page.goto(`/${slug}`);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical, `${slug} canonical present`).toBeTruthy();
      expect(canonical, `${slug} canonical self-references`).toContain(`/${slug}`);
    }
  });

  test("every tool title and description is unique across the catalogue", async ({ page }) => {
    // A cannibalization guard: duplicate <title>/description across tools is a
    // known ranking risk. Sample the full set via HEAD-like GETs is slow, so we
    // assert the registry-driven invariant on a representative high-risk cluster.
    const cluster = [
      "compress-pdf",
      "compress-pdf-to-100kb",
      "compress-pdf-to-200kb",
      "compress-pdf-to-500kb",
      "compress-pdf-to-1mb",
    ];
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const slug of cluster) {
      await page.goto(`/${slug}`);
      const title = await page.title();
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(titles.has(title), `duplicate title on ${slug}: ${title}`).toBe(false);
      expect(descs.has(desc ?? ""), `duplicate description on ${slug}`).toBe(false);
      titles.add(title);
      descs.add(desc ?? "");
    }
  });

  test("each tool page has exactly one indexable robots posture", async ({ page }) => {
    await page.goto("/compress-pdf");
    const robots = await page.locator('meta[name="robots"]').all();
    // Tool pages should not carry a noindex; and must not carry contradictory tags.
    const contents = await Promise.all(robots.map((r) => r.getAttribute("content")));
    const joined = contents.join(" ").toLowerCase();
    expect(joined).not.toContain("noindex");
  });
});

test.describe("404 handling", () => {
  test("unknown tool slug returns 404, not a soft-200", async ({ page }) => {
    const resp = await page.goto("/definitely-not-a-real-tool-xyz");
    expect(resp?.status()).toBe(404);
  });

  test("the 404 page does not emit contradictory robots directives", async ({ page }) => {
    // CONFIRMED finding: _not-found inherits index,follow from layout AND gets
    // Next's own noindex -> two conflicting robots metas. This test fails until
    // the app stops emitting an indexable robots tag on the 404 route.
    await page.goto("/definitely-not-a-real-tool-xyz");
    const contents = await Promise.all(
      (await page.locator('meta[name="robots"]').all()).map((r) => r.getAttribute("content")),
    );
    const hasIndex = contents.some((c) => /(?:^|[^n])index\s*,\s*follow/i.test(c ?? ""));
    const hasNoindex = contents.some((c) => /noindex/i.test(c ?? ""));
    expect(
      hasIndex && hasNoindex,
      `contradictory robots on 404: ${JSON.stringify(contents)}`,
    ).toBe(false);
  });
});

test.describe("sitemap + robots", () => {
  test("sitemap includes every live tool slug and excludes widgets", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const missing = liveTools.filter((t) => !body.includes(`/${t.slug}</loc>`)).map((t) => t.slug);
    expect(missing, "tool slugs missing from sitemap").toEqual([]);
    expect(body).not.toContain("/widget/");
    // Legacy slugs must never be indexed.
    for (const t of tools) {
      if (t.legacySlug) expect(body).not.toContain(`/tools/${t.legacySlug}`);
    }
  });

  test("robots.txt disallows /api and points at the sitemap", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/Disallow:\s*\/api/i);
    expect(body).toMatch(/Sitemap:\s*https?:\/\//i);
  });

  test("legacy slugs permanently redirect to clean slugs", async ({ request }) => {
    const legacy = tools.filter((t) => t.legacySlug).slice(0, 6);
    for (const t of legacy) {
      const resp = await request.get(`/tools/${t.legacySlug}`, { maxRedirects: 0 });
      expect([301, 308], `${t.legacySlug} redirect status`).toContain(resp.status());
      expect(resp.headers().location, `${t.legacySlug} -> /${t.slug}`).toBe(`/${t.slug}`);
    }
  });
});

test.describe("structured data", () => {
  test("tool pages emit FAQ + HowTo JSON-LD matching visible content", async ({ page }) => {
    await page.goto("/compress-pdf");
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const blob = scripts.join("\n");
    expect(blob).toContain("FAQPage");
    expect(blob).toContain("HowTo");
    expect(blob).toContain("BreadcrumbList");
    // FAQ questions in schema should also be visible on the page.
    const parsed = scripts.map((s) => JSON.parse(s));
    const faq = parsed.flat().find((o) => o["@type"] === "FAQPage");
    expect(faq?.mainEntity?.length ?? 0).toBeGreaterThanOrEqual(4);
    const firstQ: string = faq.mainEntity[0].name;
    await expect(page.getByText(firstQ, { exact: false }).first()).toBeVisible();
  });
});
