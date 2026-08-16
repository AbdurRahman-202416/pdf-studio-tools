import { expect, test, type Page } from "@playwright/test";
import { FILES } from "../helpers/files";

/**
 * Failure & fallback behaviour. We intercept the backend call to simulate the
 * failure modes a real user hits (500, offline, 413, slow) and assert the UI
 * recovers with a understandable message — never a permanent spinner, never a
 * raw stack trace, never a dead button.
 */

async function uploadSplit(page: Page) {
  await page.goto("/split-pdf");
  // Wait for hydration before touching the dropzone input (see pdf spec note).
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.getByTestId("split-pdf-drop-input").setInputFiles(FILES.singlePdf());
  await expect(page.getByTestId("split-pdf-submit")).toBeEnabled({ timeout: 15_000 });
  await page.locator("#split-pages-input").fill("1");
}

test.describe("backend failure modes on a server tool", () => {
  test("HTTP 500 shows an error, not a permanent spinner", async ({ page }) => {
    await uploadSplit(page);
    await page.route("**/tools/pdf/split", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: '{"detail":"Internal server error"}' }),
    );
    await page.getByTestId("split-pdf-submit").click();
    // An error surfaces (toast or inline) and the submit button becomes usable again.
    await expect(page.getByText(/error|failed|went wrong|try again/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("split-pdf-submit")).toBeEnabled({ timeout: 15_000 });
    // No raw stack trace / internal path leaked to the user.
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(body).not.toContain("traceback");
    expect(body).not.toMatch(/\/app\/storage\/|site-packages|\.py"/);
  });

  test("network offline is handled gracefully", async ({ page }) => {
    await uploadSplit(page);
    await page.route("**/tools/pdf/split", (route) => route.abort("failed"));
    await page.getByTestId("split-pdf-submit").click();
    await expect(page.getByText(/error|failed|went wrong|network|try again/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("split-pdf-submit")).toBeEnabled({ timeout: 15_000 });
  });

  test("413 payload-too-large surfaces a message", async ({ page }) => {
    await uploadSplit(page);
    await page.route("**/tools/pdf/split", (route) =>
      route.fulfill({ status: 413, contentType: "application/json", body: '{"detail":"File too large"}' }),
    );
    await page.getByTestId("split-pdf-submit").click();
    await expect(page.getByText(/error|failed|too large|went wrong/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("a slow backend does not lock the UI forever (no timeout is itself a finding)", async ({ page }) => {
    await uploadSplit(page);
    // Delay the response ~8s then 500. Assert the app eventually recovers.
    await page.route("**/tools/pdf/split", async (route) => {
      await new Promise((r) => setTimeout(r, 8000));
      await route.fulfill({ status: 500, contentType: "application/json", body: '{"detail":"Internal server error"}' });
    });
    // Listen for the (transient) error toast before triggering, so an auto-dismiss
    // after the 8s delay can't race the assertion.
    const err = page.getByText(/error|failed|went wrong/i).first();
    const seen = err.waitFor({ state: "visible", timeout: 25_000 });
    await page.getByTestId("split-pdf-submit").click();
    await seen;
  });
});

test.describe("client-side validation (PS-4 / PS-3 fixes)", () => {
  test("a wrong file type dropped on a PDF tool shows a clear rejection", async ({ page }) => {
    // FileDrop now wires onDropRejected → a toast. Previously this was silently
    // swallowed (PS-4). The rejection must be visible and understandable.
    await page.goto("/split-pdf");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.getByTestId("split-pdf-drop-input").setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("just some text, definitely not a pdf"),
    });
    await expect(page.getByText(/unsupported file type/i).first()).toBeVisible({ timeout: 8_000 });
    // And no file was accepted → submit stays disabled.
    await expect(page.getByTestId("split-pdf-submit")).toBeDisabled();
  });

  test("an empty (zero-byte) file is rejected with a clear message", async ({ page }) => {
    await page.goto("/split-pdf");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.getByTestId("split-pdf-drop-input").setInputFiles({
      name: "empty.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(0),
    });
    await expect(page.getByText(/empty/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test("a valid file is still accepted after a rejection (UI recovers)", async ({ page }) => {
    await page.goto("/split-pdf");
    await page.waitForLoadState("networkidle").catch(() => {});
    const input = page.getByTestId("split-pdf-drop-input");
    await input.setInputFiles({ name: "x.txt", mimeType: "text/plain", buffer: Buffer.from("nope") });
    await expect(page.getByText(/unsupported file type/i).first()).toBeVisible({ timeout: 8_000 });
    // Now a real PDF works.
    await input.setInputFiles(FILES.singlePdf());
    await expect(page.getByTestId("split-pdf-submit")).toBeEnabled({ timeout: 8_000 });
  });

  test("FINDING: spoofed-extension file (exe bytes named .pdf) is caught by the backend", async ({ page }) => {
    await page.goto("/split-pdf");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.getByTestId("split-pdf-drop-input").setInputFiles(FILES.spoofedPdf());
    await expect(page.getByTestId("split-pdf-submit")).toBeEnabled({ timeout: 15_000 });
    await page.locator("#split-pages-input").fill("1");
    await page.getByTestId("split-pdf-submit").click();
    // The backend validates %PDF magic → the user must see a clear rejection.
    await expect(page.getByText(/invalid|not a (valid )?pdf|failed|error/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("upload lifecycle: cancel + loading cleanup", () => {
  test("the user can cancel an in-flight request and the UI recovers", async ({ page }) => {
    await page.goto("/split-pdf");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.getByTestId("split-pdf-drop-input").setInputFiles(FILES.singlePdf());
    await expect(page.getByTestId("split-pdf-submit")).toBeEnabled({ timeout: 10_000 });
    await page.locator("#split-pages-input").fill("1");
    // Hold the response open so the request is genuinely in flight.
    let release: () => void = () => {};
    await page.route("**/tools/pdf/split", async (route) => {
      await new Promise<void>((r) => (release = r));
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await page.getByTestId("split-pdf-submit").click();
    // Cancel button appears while busy; clicking it aborts.
    const cancel = page.getByTestId("split-pdf-cancel");
    await expect(cancel).toBeVisible({ timeout: 10_000 });
    await cancel.click();
    // UI recovers: submit re-enabled, cancel gone, and NO error toast for a
    // user-initiated cancel.
    await expect(page.getByTestId("split-pdf-submit")).toBeEnabled({ timeout: 10_000 });
    await expect(cancel).toBeHidden();
    await expect(page.getByText(/failed|error|went wrong/i)).toHaveCount(0);
    release();
  });

  test("a backend error clears the loading state (no permanent spinner)", async ({ page }) => {
    await page.goto("/split-pdf");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.getByTestId("split-pdf-drop-input").setInputFiles(FILES.singlePdf());
    await expect(page.getByTestId("split-pdf-submit")).toBeEnabled({ timeout: 10_000 });
    await page.locator("#split-pages-input").fill("1");
    await page.route("**/tools/pdf/split", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: '{"detail":"Internal server error"}' }),
    );
    await page.getByTestId("split-pdf-submit").click();
    await expect(page.getByText(/error|failed|went wrong/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("split-pdf-submit")).toBeEnabled();
  });
});
