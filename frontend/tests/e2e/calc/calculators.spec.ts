import { expect, test, type Page } from "@playwright/test";
import { byDomain } from "../helpers/registry";
import { trackConsole } from "../helpers/console";

/**
 * Calculators compute live from defaults. We validate known arithmetic where we
 * can, and prove every calc tool renders a result without crashing.
 */

async function headline(page: Page): Promise<string> {
  const h = page.getByTestId("calc-headline");
  await expect(h).toBeVisible({ timeout: 15_000 });
  return (await h.textContent())?.replace(/\s+/g, " ").trim() ?? "";
}

async function setField(page: Page, key: string, value: string) {
  const f = page.getByTestId(`calc-${key}`);
  await f.fill(value);
}

test.describe("known-arithmetic checks", () => {
  test("percentage: 15% of 200 = 30", async ({ page }) => {
    await page.goto("/percentage-calculator");
    await setField(page, "a", "15");
    await setField(page, "b", "200");
    await expect.poll(() => headline(page)).toMatch(/\b30\b/);
  });

  test("bmi: 70kg / 175cm ≈ 22.9", async ({ page }) => {
    await page.goto("/bmi-calculator");
    await setField(page, "weightKg", "70");
    await setField(page, "heightCm", "175");
    await expect.poll(() => headline(page)).toMatch(/22\.[89]/);
  });

  test("mortgage: defaults yield a positive monthly payment", async ({ page }) => {
    await page.goto("/mortgage-calculator");
    // Compute runs after the lazy calc module loads; poll past the "-" placeholder.
    await expect.poll(() => headline(page), { timeout: 20_000 }).toMatch(/[0-9],?[0-9]/);
    const out = await headline(page);
    expect(out.toLowerCase()).not.toContain("nan");
    expect(out).not.toBe("-");
  });

  test("percentage handles divide-by-zero without NaN/Infinity", async ({ page }) => {
    await page.goto("/percentage-calculator");
    // "X is what percent of Y" with Y = 0 must not print NaN/Infinity.
    await page.getByTestId("calc-mode").selectOption("isWhatPercent").catch(() => {});
    await setField(page, "a", "5");
    await setField(page, "b", "0");
    await page.waitForTimeout(500);
    const body = (await page.locator('[data-testid="calc-result"]').innerText().catch(() => "")).toLowerCase();
    expect(body).not.toContain("nan");
    expect(body).not.toContain("infinity");
  });
});

test.describe("every calculator renders a result", () => {
  for (const t of byDomain("calc")) {
    test(`${t.slug} computes without crashing`, async ({ page }) => {
      const c = trackConsole(page);
      await page.goto(`/${t.slug}`);
      // Most calculators show a result from defaults; some (randomizers/timers)
      // need a trigger button.
      const result = page.getByTestId("calc-result");
      const go = page.getByTestId("rand-go");
      if (await go.isVisible().catch(() => false)) await go.click();
      // Result or a headline should appear; if neither testid exists it's a
      // non-calc "calc" tool (timer/stopwatch) — assert the page has an H1.
      const hasResult = await result.isVisible({ timeout: 8_000 }).catch(() => false);
      if (!hasResult) {
        await expect(page.locator("h1")).toHaveCount(1);
      }
      expect(c.pageErrors, `${t.slug} page errors`).toEqual([]);
    });
  }
});
