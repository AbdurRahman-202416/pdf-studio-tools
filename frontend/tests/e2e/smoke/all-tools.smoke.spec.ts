import { expect, test } from "@playwright/test";
import { attachConsole, trackConsole } from "../helpers/console";
import { liveTools, tools } from "../helpers/registry";

/**
 * Registry-driven smoke over every live tool. This suite needs no backend and
 * no uploads: it proves each tool route renders, is unique-H1'd, canonicalised,
 * discoverable, and free of console errors. It scales automatically with the
 * catalogue.
 */
test.describe("smoke: every tool route", () => {
  for (const t of liveTools) {
    test(`${t.slug} renders cleanly`, async ({ page }, info) => {
      const console = trackConsole(page);
      const resp = await page.goto(`/${t.slug}`, { waitUntil: "domcontentloaded" });
      expect(resp?.status(), `${t.slug} HTTP status`).toBe(200);

      // Exactly one H1, and it is non-empty.
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      expect((await h1.textContent())?.trim().length, `${t.slug} H1 text`).toBeGreaterThan(0);

      // Self-referencing canonical present.
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      const href = await canonical.getAttribute("href");
      expect(href, `${t.slug} canonical`).toContain(`/${t.slug}`);

      // Title is set.
      expect((await page.title()).length, `${t.slug} title`).toBeGreaterThan(0);

      await page.waitForTimeout(150); // let any deferred client init log
      await attachConsole(console, info);
      expect(console.pageErrors, `${t.slug} uncaught page errors`).toEqual([]);
      expect(console.errors, `${t.slug} console errors`).toEqual([]);
    });
  }
});

test.describe("smoke: catalogue integrity", () => {
  test("registry has the expected shape", () => {
    expect(tools.length).toBeGreaterThanOrEqual(58);
    // Every server tool declares an endpoint; every client tool does not.
    for (const t of tools) {
      if (t.runtime === "server") expect(t.backendEndpoint, `${t.slug} endpoint`).toBeTruthy();
      if (t.runtime === "client") expect(t.backendEndpoint, `${t.slug} no endpoint`).toBeFalsy();
    }
  });

  test("every live tool is discoverable on /tools", async ({ page }) => {
    await page.goto("/tools");
    // The index renders a card testid per tool; assert each live tool appears.
    const missing: string[] = [];
    for (const t of liveTools) {
      const card = page.getByTestId(`tool-${t.slug}`);
      if ((await card.count()) === 0) missing.push(t.slug);
    }
    expect(missing, "tools absent from /tools index").toEqual([]);
  });
});
