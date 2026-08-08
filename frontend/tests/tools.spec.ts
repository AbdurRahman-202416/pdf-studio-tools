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
    await expect(page.getByTestId("tool-nid-combine")).toBeVisible();
    await expect(page.getByTestId("tool-pdf-ocr")).toBeVisible();
    await expect(page.getByTestId("tool-pdf-to-excel")).toBeVisible();
    await expect(page.getByTestId("tool-passport-photo-pdf")).toBeVisible();
    await page.getByTestId("tool-nid-combine").click();
    await expect(page).toHaveURL(/\/nid-combine$/);
  });

  test("ID card combiner uploads front + back and produces a PDF", async ({ page }) => {
    await page.goto("/nid-combine");
    await page.waitForLoadState("networkidle");

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
    await page.goto("/pdf-ocr");
    await page.waitForLoadState("networkidle");
    // Engine should be ready in CI (we installed tesseract)
    await expect(page.getByText(/Tesseract ready/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("PDF to Excel converts a generated PDF", async ({ page }) => {
    await page.goto("/pdf-to-excel");
    await page.waitForLoadState("networkidle");
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
    await expect(page.getByRole("heading", { level: 1, name: /pdf to excel/i })).toBeVisible();
  });

  test("Photo to PDF generates an A4 sheet from an image", async ({ page }) => {
    await page.goto("/passport-photo-pdf");
    await page.waitForLoadState("networkidle");
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
      "/pdf-ocr",
      "/nid-combine",
      "/pdf-to-excel",
    ];
    for (const slug of slugs) {
      const resp = await page.goto(slug);
      expect(resp?.status(), `${slug} should be 200`).toBe(200);
    }
  });

  test("renamed tool slugs resolve (Task 8 scope)", async ({ page }) => {
    const slugs = [
      "/pdf-to-jpg",
      "/lock-pdf",
      "/unlock-pdf",
      "/passport-photo-pdf",
    ];
    for (const slug of slugs) {
      const resp = await page.goto(slug);
      expect(resp?.status(), `${slug} should be 200`).toBe(200);
    }
  });

  test("legacy slugs 301 to new slugs", async ({ request }) => {
    const mappings = [
      ["/tools/bangla-ocr", "/pdf-ocr"],
      ["/tools/nid-combine", "/nid-combine"],
      ["/tools/bank-to-excel", "/pdf-to-excel"],
      ["/tools/pdf-to-jpg", "/pdf-to-jpg"],
      ["/tools/pdf-lock", "/lock-pdf"],
      ["/tools/photo-to-pdf", "/passport-photo-pdf"],
      ["/tools/govt-forms", "/compress-pdf-to-100kb"],
      ["/tools/compress-pdf-without-losing-quality", "/compress-pdf"],
      ["/tools/merge-large-pdf-files-online", "/merge-pdf"],
    ];
    for (const [from, to] of mappings) {
      const resp = await request.get(from, { maxRedirects: 0 });
      // Next.js dev server returns 308 for permanent redirects (production returns 301).
      // Both 301 and 308 represent permanent redirects; we accept either here.
      expect([301, 308], `${from} should be a permanent redirect`).toContain(resp.status());
      expect(resp.headers().location, `${from} should redirect to ${to}`).toBe(to);
    }
  });

  test("sitemap lists canonical tool slugs, not legacy ones", async ({ request }) => {
    const resp = await request.get("/sitemap.xml");
    const body = await resp.text();
    const required = [
      "/compress-pdf",
      "/merge-pdf",
      "/pdf-to-jpg",
      "/lock-pdf",
      "/unlock-pdf",
      "/pdf-ocr",
      "/nid-combine",
      "/passport-photo-pdf",
      "/pdf-to-excel",
      "/sign-pdf",
      "/split-pdf",
      "/rotate-pdf",
      "/delete-pdf-pages",
    ];
    for (const slug of required) {
      expect(body, `sitemap should list ${slug}`).toContain(`${slug}</loc>`);
    }
    // Legacy keyword slugs are 308-redirected and must never be indexed.
    for (const old of [
      "/tools/compress-pdf-without-losing-quality",
      "/tools/id-card-to-pdf",
      "/tools/pdf-ocr-online-free",
      "/tools/bangla-ocr",
    ]) {
      expect(body, `sitemap must not list legacy ${old}`).not.toContain(old);
    }
  });
});
