import { expect, test } from "@playwright/test";
import { makeSamplePDF } from "./fixtures/make-pdf";

test.describe("PDF Studio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/workspace");
  });

  test("landing page links to workspace", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /PDF toolkit/i })).toBeVisible();
    await page.getByTestId("cta-workspace").click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByTestId("upload-zone")).toBeVisible();
  });

  test("uploads a single PDF, shows pages, downloads merged result", async ({ page }) => {
    const bytes = await makeSamplePDF("Alpha", 3);

    await page.getByTestId("upload-input").setInputFiles({
      name: "alpha.pdf",
      mimeType: "application/pdf",
      buffer: bytes,
    });

    await expect(page.getByTestId("file-card")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("file-card").locator("[data-testid=page-thumb]")).toHaveCount(3);
    await expect(page.getByTestId("selected-panel")).toBeVisible();

    // 3 pages selected by default → merge
    await page.getByTestId("merge-button").click();
    await expect(page.getByTestId("download-section")).toBeVisible({ timeout: 20_000 });

    const link = page.getByTestId("download-link");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\/api\/download\//);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      link.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test("supports multiple uploads, deselect, and re-merge", async ({ page }) => {
    const a = await makeSamplePDF("Alpha", 2);
    const b = await makeSamplePDF("Beta", 2);

    await page.getByTestId("upload-input").setInputFiles([
      { name: "alpha.pdf", mimeType: "application/pdf", buffer: a },
      { name: "beta.pdf", mimeType: "application/pdf", buffer: b },
    ]);

    await expect(page.getByTestId("file-card")).toHaveCount(2, { timeout: 25_000 });
    await expect(page.getByTestId("selected-grid").locator("[data-testid=page-thumb]")).toHaveCount(4);

    // deselect all of first file via its toggle
    await page.getByTestId("file-card").first().getByTestId("toggle-select-all").click();
    await expect(page.getByTestId("selected-grid").locator("[data-testid=page-thumb]")).toHaveCount(2);

    await page.getByTestId("merge-button").click();
    await expect(page.getByTestId("download-section")).toBeVisible({ timeout: 20_000 });
  });

  test("compression generates a downloadable result", async ({ page }) => {
    const bytes = await makeSamplePDF("Gamma", 2);

    await page.getByTestId("upload-input").setInputFiles({
      name: "gamma.pdf",
      mimeType: "application/pdf",
      buffer: bytes,
    });

    await expect(page.getByTestId("compression-panel")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("preset-high").click();
    await expect(page.getByTestId("preset-high")).toHaveAttribute("aria-pressed", "true");

    await page.getByTestId("compress-button").click();
    await expect(page.getByTestId("download-section")).toBeVisible({ timeout: 30_000 });
  });

  test("page selection toggles and order updates", async ({ page }) => {
    const bytes = await makeSamplePDF("Delta", 3);
    await page.getByTestId("upload-input").setInputFiles({
      name: "delta.pdf",
      mimeType: "application/pdf",
      buffer: bytes,
    });

    await expect(page.getByTestId("file-card")).toBeVisible({ timeout: 20_000 });

    // Initially all selected
    await expect(page.getByTestId("selected-grid").locator("[data-testid=page-thumb]")).toHaveCount(3);

    // Deselect page 1 (first thumb in the file grid)
    await page
      .getByTestId("file-card")
      .locator("[data-testid=page-thumb]")
      .first()
      .click();

    await expect(page.getByTestId("selected-grid").locator("[data-testid=page-thumb]")).toHaveCount(2);

    // Re-select
    await page
      .getByTestId("file-card")
      .locator("[data-testid=page-thumb]")
      .first()
      .click();
    await expect(page.getByTestId("selected-grid").locator("[data-testid=page-thumb]")).toHaveCount(3);
  });

  test("remove file confirmation modal", async ({ page }) => {
    const bytes = await makeSamplePDF("Eps", 1);
    await page.getByTestId("upload-input").setInputFiles({
      name: "eps.pdf",
      mimeType: "application/pdf",
      buffer: bytes,
    });

    await expect(page.getByTestId("file-card")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("remove-file").click();
    await expect(page.getByTestId("confirm-remove")).toBeVisible();
    await page.getByTestId("confirm-remove-button").click();
    await expect(page.getByTestId("file-card")).toHaveCount(0);
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });

  test("dark mode toggle adds .dark class", async ({ page }) => {
    await page.getByTestId("theme-dark").click();
    await expect.poll(async () => {
      return await page.evaluate(() => document.documentElement.classList.contains("dark"));
    }).toBe(true);
    await page.getByTestId("theme-light").click();
    await expect.poll(async () => {
      return await page.evaluate(() => document.documentElement.classList.contains("dark"));
    }).toBe(false);
  });

  test("rejects non-PDF files with a toast", async ({ page }) => {
    await page.getByTestId("upload-input").setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello world"),
    });
    await expect(page.getByText(/only PDF files are allowed/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("file-card")).toHaveCount(0);
  });

  test("responsive – mobile viewport keeps upload visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("upload-zone")).toBeVisible();
    await expect(page.getByTestId("sidebar")).toBeHidden();
  });

  test("settings page reports API connection", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("api-status")).toContainText(/Connected|Checking/);
    // Eventually shows connected
    await expect(page.getByTestId("api-status")).toContainText(/Connected/, { timeout: 10_000 });
  });
});
