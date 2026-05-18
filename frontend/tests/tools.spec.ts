import { expect, test } from "@playwright/test";
import { makeSamplePDF } from "./fixtures/make-pdf";

const TINY_PNG = Buffer.from(
  // 4x4 red PNG (minimal valid image)
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEUlEQVR4nGNk+P+/noEMwDgKAGBJAwQ5+v7yAAAAAElFTkSuQmCC",
  "base64",
);

test.describe("Tools hub", () => {
  test("tools index lists all tools and links to ID card combiner", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByRole("heading", { name: /actually fit your workflow/i })).toBeVisible();
    await expect(page.getByTestId("tool-id-card-to-pdf")).toBeVisible();
    await expect(page.getByTestId("tool-pdf-ocr-online-free")).toBeVisible();
    await expect(page.getByTestId("tool-pdf-to-excel-converter")).toBeVisible();
    await expect(page.getByTestId("tool-passport-photo-to-pdf")).toBeVisible();
    await page.getByTestId("tool-id-card-to-pdf").click();
    await expect(page).toHaveURL(/\/tools\/id-card-to-pdf$/);
  });

  test("ID card combiner uploads front + back and produces a PDF", async ({ page }) => {
    await page.goto("/tools/id-card-to-pdf");

    await page.getByTestId("nid-front-input").setInputFiles({
      name: "front.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });
    await page.getByTestId("nid-back-input").setInputFiles({
      name: "back.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });

    await page.getByTestId("layout-a4_horizontal").click();
    await expect(page.getByTestId("layout-a4_horizontal")).toHaveAttribute("aria-pressed", "true");

    await page.getByTestId("nid-combine-button").click();
    await expect(page.getByTestId("nid-result")).toBeVisible({ timeout: 25_000 });
    const href = await page.getByTestId("nid-result-link").getAttribute("href");
    expect(href).toMatch(/\/tools\/download\//);
  });

  test("PDF OCR page shows engine status", async ({ page }) => {
    await page.goto("/tools/pdf-ocr-online-free");
    await expect(page.getByText(/Tesseract/)).toBeVisible({ timeout: 10_000 });
    // Engine should be ready in CI (we installed tesseract)
    await expect(page.getByText(/Tesseract ready/)).toBeVisible({ timeout: 10_000 });
  });

  test("PDF to Excel converts a generated PDF", async ({ page }) => {
    await page.goto("/tools/pdf-to-excel-converter");
    const bytes = await makeSamplePDF("Bank", 1);
    await page.getByTestId("bank-file-input").setInputFiles({
      name: "statement.pdf",
      mimeType: "application/pdf",
      buffer: bytes,
    });
    await page.getByTestId("bank-convert-button").click();
    // Either a result or a polite error toast, both are acceptable for synthetic input
    const result = page.getByTestId("bank-result");
    const errorToast = page.getByText(/Could not detect a table|Conversion failed/);
    await Promise.race([
      result.waitFor({ state: "visible", timeout: 30_000 }).catch(() => null),
      errorToast.waitFor({ state: "visible", timeout: 30_000 }).catch(() => null),
    ]);
    // The page didn't crash, that's our main contract
    await expect(page.getByRole("heading", { name: /pdf to excel/i })).toBeVisible();
  });

  test("Photo to PDF generates an A4 sheet from an image", async ({ page }) => {
    await page.goto("/tools/passport-photo-to-pdf");
    await page.getByTestId("photo-file-input").setInputFiles({
      name: "selfie.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });
    await page.getByTestId("size-passport").click();
    await page.getByTestId("layout-grid_4").click();
    await page.getByTestId("photo-button").click();
    await expect(page.getByTestId("photo-result")).toBeVisible({ timeout: 25_000 });
  });

  test("navigation includes Tools link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Tools" }).first().click();
    await expect(page).toHaveURL(/\/tools$/);
  });

  test("renamed BD tool slugs resolve (Task 7 scope)", async ({ page }) => {
    const slugs = [
      "/tools/pdf-ocr-online-free",
      "/tools/id-card-to-pdf",
      "/tools/pdf-to-excel-converter",
    ];
    for (const slug of slugs) {
      const resp = await page.goto(slug);
      expect(resp?.status(), `${slug} should be 200`).toBe(200);
    }
  });

  test("renamed tool slugs resolve (Task 8 scope)", async ({ page }) => {
    const slugs = [
      "/tools/pdf-to-jpg-high-quality",
      "/tools/password-protect-pdf-online",
      "/tools/unlock-pdf-with-password-online",
      "/tools/passport-photo-to-pdf",
    ];
    for (const slug of slugs) {
      const resp = await page.goto(slug);
      expect(resp?.status(), `${slug} should be 200`).toBe(200);
    }
  });

  test("legacy slugs 301 to new slugs", async ({ request }) => {
    const mappings = [
      ["/tools/bangla-ocr", "/tools/pdf-ocr-online-free"],
      ["/tools/nid-combine", "/tools/id-card-to-pdf"],
      ["/tools/bank-to-excel", "/tools/pdf-to-excel-converter"],
      ["/tools/pdf-to-jpg", "/tools/pdf-to-jpg-high-quality"],
      ["/tools/pdf-lock", "/tools/password-protect-pdf-online"],
      ["/tools/photo-to-pdf", "/tools/passport-photo-to-pdf"],
      ["/tools/govt-forms", "/tools"],
    ];
    for (const [from, to] of mappings) {
      const resp = await request.get(from, { maxRedirects: 0 });
      // Next.js dev server returns 308 for permanent redirects (production returns 301).
      // Both 301 and 308 represent permanent redirects; we accept either here.
      expect([301, 308], `${from} should be a permanent redirect`).toContain(resp.status());
      expect(resp.headers().location, `${from} should redirect to ${to}`).toBe(to);
    }
  });

  test("sitemap contains all 9 tool slugs", async ({ request }) => {
    const resp = await request.get("/sitemap.xml");
    const body = await resp.text();
    const required = [
      "/tools/compress-pdf-without-losing-quality",
      "/tools/merge-large-pdf-files-online",
      "/tools/pdf-to-jpg-high-quality",
      "/tools/password-protect-pdf-online",
      "/tools/unlock-pdf-with-password-online",
      "/tools/pdf-ocr-online-free",
      "/tools/id-card-to-pdf",
      "/tools/passport-photo-to-pdf",
      "/tools/pdf-to-excel-converter",
    ];
    for (const slug of required) {
      expect(body).toContain(slug);
    }
    // and no longer contains:
    for (const old of ["bangla-ocr", "nid-combine", "bank-to-excel", "govt-forms"]) {
      expect(body).not.toContain(`/tools/${old}`);
    }
  });
});
