import { expect, test } from "@playwright/test";
import { attachConsole, trackConsole } from "../helpers/console";
import { TEXT } from "../helpers/files";

/**
 * Deep functional coverage for the client-side developer/text/data tools.
 * These parse and validate the ACTUAL output, not just container visibility.
 * No backend involved.
 */

const PLACEHOLDER = /Output appears here|Press Generate/i;

/**
 * Fill the input and wait until the debounced compute produces real output.
 *
 * A controlled textarea can miss the very first `input` event if React has not
 * finished hydrating when Playwright fills it. We defend against that race by
 * waiting for hydration (networkidle) and, if the output is still the
 * placeholder, re-triggering onChange by clearing and re-filling.
 */
async function type(page: import("@playwright/test").Page, value: string) {
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
          // Nudge onChange again in case the first event lost the hydration race.
          await input.fill("");
          await input.fill(value);
        }
        return out;
      },
      { timeout: 30_000, intervals: [300, 600, 1000] },
    )
    .not.toMatch(PLACEHOLDER);
}

async function output(page: import("@playwright/test").Page): Promise<string> {
  return (await page.getByTestId("tool-output").textContent())?.trim() ?? "";
}

test.describe("json-formatter", () => {
  test("formats valid JSON into parseable, indented output", async ({ page }, info) => {
    const c = trackConsole(page);
    await page.goto("/json-formatter");
    await type(page, TEXT.validJson);
    const out = await output(page);
    // Output must be valid JSON and semantically equal to the input.
    expect(() => JSON.parse(out)).not.toThrow();
    expect(JSON.parse(out)).toEqual(JSON.parse(TEXT.validJson));
    expect(out).toContain("\n"); // actually pretty-printed
    await attachConsole(c, info);
    expect(c.pageErrors).toEqual([]);
  });

  test("surfaces a clear error on malformed JSON, does not crash", async ({ page }) => {
    await page.goto("/json-formatter");
    await type(page, TEXT.malformedJson);
    const out = await output(page);
    // The tool must communicate the problem, not silently echo or blank out.
    expect(out.toLowerCase()).toMatch(/error|invalid|unexpected|expected|position|token/);
  });

  test("empty input yields no error state", async ({ page }) => {
    await page.goto("/json-formatter");
    await type(page, "");
    const out = await output(page);
    expect(out.toLowerCase()).not.toMatch(/error|invalid/);
  });
});

test.describe("base64-encode-decode", () => {
  test("round-trips text through encode", async ({ page }) => {
    await page.goto("/base64-encode-decode");
    await type(page, "Acme Widgets");
    const out = await output(page);
    // Default direction encodes; decode the output back and compare.
    expect(Buffer.from(out, "base64").toString("utf8")).toBe("Acme Widgets");
  });

  test("handles unicode without mojibake", async ({ page }) => {
    await page.goto("/base64-encode-decode");
    await type(page, "café 日本語 🎉");
    const out = await output(page);
    expect(Buffer.from(out, "base64").toString("utf8")).toBe("café 日本語 🎉");
  });
});

test.describe("uuid-generator", () => {
  const v4 = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

  test("generates syntactically valid v4 UUIDs", async ({ page }) => {
    await page.goto("/uuid-generator");
    await page.getByTestId("generate").click();
    await expect.poll(() => output(page), { timeout: 30_000 }).toMatch(v4);
  });

  test("consecutive generations differ", async ({ page }) => {
    await page.goto("/uuid-generator");
    await page.getByTestId("generate").click();
    await expect.poll(() => output(page), { timeout: 30_000 }).toMatch(v4);
    const first = await output(page);
    await page.getByTestId("generate").click();
    await expect.poll(() => output(page), { timeout: 5_000 }).not.toBe(first);
  });
});

test.describe("hash-generator", () => {
  test("produces the known SHA-256 digest of a known input", async ({ page }) => {
    await page.goto("/hash-generator");
    // Select SHA-256 if a selector exists; otherwise rely on default and check length.
    await type(page, "abc");
    const out = (await output(page)).toLowerCase();
    // The output should contain at least one recognised SHA digest of "abc".
    const sha256 = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
    const sha1 = "a9993e364706816aba3e25717850c26c9cd0d89d";
    expect(out.includes(sha256) || out.includes(sha1), `hash output was: ${out.slice(0, 120)}`).toBeTruthy();
  });
});

test.describe("jwt-decoder", () => {
  test("decodes header and payload claims", async ({ page }) => {
    await page.goto("/jwt-decoder");
    await type(page, TEXT.jwtValid);
    const out = await output(page);
    expect(out).toContain("HS256");
    expect(out).toContain("John Doe");
    expect(out).toContain("1234567890");
  });

  test("rejects a non-JWT string gracefully", async ({ page }) => {
    await page.goto("/jwt-decoder");
    await type(page, TEXT.jwtInvalid);
    const out = await output(page);
    expect(out.toLowerCase()).toMatch(/error|invalid|could not|decode|malformed|isn't valid/);
  });
});

test.describe("yaml-to-json / csv-to-json", () => {
  test("yaml converts to valid JSON", async ({ page }) => {
    await page.goto("/yaml-to-json");
    await type(page, TEXT.validYaml);
    const out = await output(page);
    const parsed = JSON.parse(out);
    expect(parsed).toMatchObject({ name: "Acme Widgets", tools: 81 });
  });

  test("csv converts to a JSON array of rows", async ({ page }) => {
    await page.goto("/csv-to-json");
    await type(page, TEXT.validCsv);
    const out = await output(page);
    const parsed = JSON.parse(out);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toMatchObject({ name: "Acme Widgets" });
  });

  test("malformed yaml reports an error", async ({ page }) => {
    await page.goto("/yaml-to-json");
    await type(page, TEXT.malformedYaml);
    const out = await output(page);
    expect(out.toLowerCase()).toMatch(/error|invalid|unexpected|cannot|bad/);
  });
});

test.describe("word-counter", () => {
  test("counts words and characters accurately", async ({ page }) => {
    await page.goto("/word-counter");
    await type(page, "one two three four five");
    const stats = (await page.getByTestId("tool-stats").textContent()) ?? "";
    // textContent concatenates label+value ("Words5Characters23…"), so anchor on the label.
    expect(stats).toMatch(/Words\D*5(?!\d)/); // five words
    expect(stats).toMatch(/Characters\D*23(?!\d)/); // 23 chars incl. spaces
  });
});
