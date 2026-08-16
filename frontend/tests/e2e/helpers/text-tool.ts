import { expect, type Page } from "@playwright/test";

const PLACEHOLDER = /Output appears here|Press Generate/i;

/**
 * Fill a TextToolView input and wait for the debounced compute to produce real
 * output. Defends against the hydration race where the first `input` event is
 * lost if React has not attached its onChange handler yet, by re-filling.
 */
export async function typeInto(page: Page, value: string): Promise<void> {
  const input = page.getByTestId("tool-input");
  await page.waitForLoadState("networkidle").catch(() => {});
  await input.fill(value);
  if (value.trim() === "") {
    await page.waitForTimeout(400);
    return;
  }
  await expect
    .poll(
      async () => {
        const out = (await page.getByTestId("tool-output").textContent())?.trim() ?? "";
        if (PLACEHOLDER.test(out) || out === "") {
          await input.fill("");
          await input.fill(value);
        }
        return out;
      },
      { timeout: 30_000, intervals: [300, 600, 1000] },
    )
    .not.toMatch(PLACEHOLDER);
}

export async function readOutput(page: Page): Promise<string> {
  return (await page.getByTestId("tool-output").textContent())?.trim() ?? "";
}
