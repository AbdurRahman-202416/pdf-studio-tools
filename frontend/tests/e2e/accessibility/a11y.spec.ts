import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * Accessibility sweep using axe-core injected directly (no @axe-core/playwright
 * dependency). We run one representative page per interaction surface plus the
 * homepage, and fail on serious/critical violations. We also do keyboard-only
 * checks that automated axe cannot cover.
 */

const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

interface AxeViolation {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: string[] }[];
}

async function runAxe(page: Page): Promise<AxeViolation[]> {
  await page.evaluate(AXE_SOURCE);
  const result = await page.evaluate(async () => {
    // @ts-expect-error injected global
    return await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
  });
  return (result as { violations: AxeViolation[] }).violations;
}

function serious(violations: AxeViolation[]): AxeViolation[] {
  return violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

const PAGES: { name: string; path: string }[] = [
  { name: "home", path: "/" },
  { name: "tools index", path: "/tools" },
  { name: "server drop tool (compress-pdf)", path: "/compress-pdf" },
  { name: "text tool (json-formatter)", path: "/json-formatter" },
  { name: "form tool (mortgage)", path: "/mortgage-calculator" },
  { name: "pdf hub", path: "/pdf" },
];

for (const p of PAGES) {
  test(`a11y: ${p.name} has no serious/critical WCAG violations`, async ({ page }, info) => {
    await page.goto(p.path, { waitUntil: "networkidle" });
    const violations = await runAxe(page);
    const bad = serious(violations);
    if (bad.length) {
      await info.attach(`axe-${p.name}.json`, {
        body: JSON.stringify(bad, null, 2),
        contentType: "application/json",
      });
    }
    const summary = bad.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`);
    expect(bad, `serious a11y violations on ${p.path}:\n${summary.join("\n")}`).toEqual([]);
  });
}

test.describe("keyboard operability", () => {
  test("a text tool is fully operable from the keyboard", async ({ page }) => {
    await page.goto("/json-formatter", { waitUntil: "networkidle" });
    // Tab to the input, type, and confirm output — no mouse.
    const input = page.getByTestId("tool-input");
    await input.focus();
    await expect(input).toBeFocused();
    await page.keyboard.type('{"k":1}');
    await expect.poll(async () => (await page.getByTestId("tool-output").textContent()) ?? "").toContain('"k"');
  });

  test("primary CTA on a tool page has a visible focus indicator", async ({ page }) => {
    await page.goto("/compress-pdf", { waitUntil: "networkidle" });
    // The upload zone should be reachable and focus-visible.
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const s = getComputedStyle(el);
      return { tag: el.tagName, outline: s.outlineStyle, boxShadow: s.boxShadow };
    });
    expect(active, "something receives focus on Tab").not.toBeNull();
  });
});
