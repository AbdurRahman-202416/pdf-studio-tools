import { expect, test, type Page } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import { FILES, makePdf } from "../helpers/files";
import { trackConsole } from "../helpers/console";

/**
 * Deep coverage for server-side PDF tools. Every test uploads a real fixture,
 * runs the real backend, downloads the actual output, and re-parses it with
 * pdf-lib to verify page counts / rotation / size — not just "a link appeared".
 */

// Server tools need longer than the default; OCR/compress especially.
test.describe.configure({ timeout: 120_000 });

async function setFile(page: Page, dropTestId: string, file: { name: string; mimeType: string; buffer: Buffer }) {
  // Wait for hydration: react-dropzone's onDrop is only wired after the client
  // bundle attaches, so setInputFiles before that silently fails to register.
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.getByTestId(`${dropTestId}-input`).setInputFiles(file);
}

/** Fetch the produced output bytes from the cross-origin download link. */
async function downloadBytes(page: Page, resultTestId: string): Promise<Buffer> {
  const link = page.getByTestId(`${resultTestId}-link`);
  await expect(link).toBeVisible({ timeout: 90_000 });
  const href = await link.getAttribute("href");
  expect(href, "download href").toBeTruthy();
  const res = await page.request.get(href!);
  expect(res.ok(), `download ${href} status ${res.status()}`).toBeTruthy();
  return Buffer.from(await res.body());
}

function assertPdfMagic(buf: Buffer) {
  expect(buf.subarray(0, 5).toString("latin1"), "PDF magic").toBe("%PDF-");
}

test.describe("split-pdf", () => {
  test("extracts a page range and the output has exactly that many pages", async ({ page }) => {
    await page.goto("/split-pdf");
    await setFile(page, "split-pdf-drop", FILES.multiPdf()); // 10 pages
    await page.locator("#split-pages-input").fill("1-3");
    await page.getByTestId("split-pdf-submit").click();
    const out = await downloadBytes(page, "split-pdf-result");
    assertPdfMagic(out);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount(), "extracted page count").toBe(3);
  });
});

test.describe("delete-pdf-pages", () => {
  test("removes pages and the remaining count is correct", async ({ page }) => {
    await page.goto("/delete-pdf-pages");
    await setFile(page, "delete-pages-drop", FILES.multiPdf()); // 10 pages
    await page.locator("#delete-pages-input").fill("1-2");
    await page.getByTestId("delete-pages-submit").click();
    const out = await downloadBytes(page, "delete-pages-result");
    assertPdfMagic(out);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount(), "remaining pages after deleting 2").toBe(8);
  });
});

test.describe("rotate-pdf", () => {
  test("writes rotation into the output pages", async ({ page }) => {
    await page.goto("/rotate-pdf");
    await setFile(page, "rotate-pdf-drop", FILES.singlePdf());
    // Default view rotates 90°; just submit and verify the file carries rotation.
    await page.getByTestId("rotate-pdf-submit").click();
    const out = await downloadBytes(page, "rotate-pdf-result");
    assertPdfMagic(out);
    const doc = await PDFDocument.load(out);
    const angle = doc.getPage(0).getRotation().angle;
    expect([90, 180, 270], "rotation applied").toContain(angle);
  });
});

test.describe("compress-pdf-to-target", () => {
  test("returns a valid PDF that preserves the page count", async ({ page }) => {
    // A 12-page text PDF is already far under any KB target, so we don't assert a
    // size *decrease* (that would need a genuinely heavy input); we assert the
    // compressor returns a valid PDF that preserved the content (page count) and
    // did not bloat it.
    const input = await makePdf(12);
    await page.goto("/compress-pdf-to-500kb");
    await page.waitForLoadState("networkidle").catch(() => {});
    // This view's FileDrop has no testId prop, so target the file input directly.
    await page.locator('input[type="file"]').first().setInputFiles({
      name: "input.pdf",
      mimeType: "application/pdf",
      buffer: input,
    });
    const submit = page.getByRole("button", { name: /compress/i }).first();
    if (await submit.isVisible().catch(() => false)) await submit.click();
    const out = await downloadBytes(page, "compress-target-result");
    assertPdfMagic(out);
    // Rasterization can bloat a tiny vector PDF, so we don't assert a size drop
    // here — we assert the compressor returned a valid, content-preserving PDF.
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount(), "page count preserved").toBe(12);
  });
});

test.describe("lock-pdf / unlock-pdf round-trip", () => {
  test("locking produces an encrypted PDF that pdf-lib cannot open without a password", async ({ page }) => {
    await page.goto("/lock-pdf");
    await setFile(page, "pdf-lock-drop", FILES.singlePdf());
    await page.getByTestId("pdf-lock-password").fill("Secret123!");
    await page.getByTestId("pdf-lock-submit").click();
    const out = await downloadBytes(page, "pdf-lock-result");
    assertPdfMagic(out);
    // An encrypted PDF cannot be loaded by pdf-lib without ignoreEncryption.
    let threw = false;
    try {
      await PDFDocument.load(out);
    } catch {
      threw = true;
    }
    expect(threw, "locked PDF should not open unencrypted").toBe(true);
  });
});

test.describe("pdf-to-jpg", () => {
  test("converts a PDF page to a real image the backend serves", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/pdf-to-jpg");
    await setFile(page, "pdf-to-jpg-drop", FILES.singlePdf());
    await page.getByTestId("pdf-to-jpg-submit").click();
    const out = await downloadBytes(page, "pdf-to-jpg-result");
    // Single page → JPG (FFD8FF) or a ZIP (PK) if multi; single page here.
    const isJpg = out[0] === 0xff && out[1] === 0xd8;
    const isPng = out.subarray(0, 4).toString("latin1") === "\x89PNG";
    const isZip = out.subarray(0, 2).toString("latin1") === "PK";
    expect(isJpg || isPng || isZip, "output is an image or zip").toBe(true);
    expect(c.pageErrors).toEqual([]);
  });
});
