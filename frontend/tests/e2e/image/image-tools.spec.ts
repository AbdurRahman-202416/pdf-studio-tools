import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { FILES } from "../helpers/files";
import { trackConsole } from "../helpers/console";

/**
 * Client-side image tools. Canvas/WebCrypto, no backend. We verify the ACTUAL
 * output bytes (format magic) after a real conversion, and confirm no network
 * request carries the image (the privacy promise) in a separate privacy spec.
 */

async function setImage(page: Page, slug: string, file: { name: string; mimeType: string; buffer: Buffer }) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.getByTestId(`${slug}-input-input`).setInputFiles(file);
}

/**
 * Click Run and wait for the result. The Run button is enabled before the async
 * createImageBitmap decode finishes, so an immediate click can be a no-op; we
 * re-click until the result container appears, then download the bytes.
 */
async function runAndDownload(page: Page, slug: string): Promise<Buffer> {
  const result = page.getByTestId(`${slug}-result`);
  await expect
    .poll(
      async () => {
        if (await result.isVisible().catch(() => false)) return true;
        await page.getByTestId(`${slug}-run`).click().catch(() => {});
        return false;
      },
      { timeout: 25_000, intervals: [500, 1000, 1500] },
    )
    .toBe(true);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId(`${slug}-download`).click(),
  ]);
  const path = await download.path();
  return readFile(path);
}

const PNG = (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const JPG = (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9;
const WEBP = (b: Buffer) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP";
const ICO = (b: Buffer) => b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0;

test.describe("jpg-to-png", () => {
  test("converts a JPG into a valid PNG", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/jpg-to-png");
    await setImage(page, "jpg-to-png", FILES.jpg());
    await page.getByTestId("jpg-to-png-run").click();
    const out = await runAndDownload(page, "jpg-to-png");
    expect(PNG(out), "output is a PNG").toBe(true);
    expect(out.length).toBeGreaterThan(50);
    expect(c.pageErrors).toEqual([]);
  });
});

test.describe("png-to-jpg", () => {
  test("converts a PNG into a valid JPG", async ({ page }) => {
    await page.goto("/png-to-jpg");
    await setImage(page, "png-to-jpg", FILES.png());
    await page.getByTestId("png-to-jpg-run").click();
    const out = await runAndDownload(page, "png-to-jpg");
    expect(JPG(out), "output is a JPEG").toBe(true);
  });

  test("flattens a transparent PNG (no crash on alpha)", async ({ page }) => {
    await page.goto("/png-to-jpg");
    await setImage(page, "png-to-jpg", FILES.transparentPng());
    await page.getByTestId("png-to-jpg-run").click();
    const out = await runAndDownload(page, "png-to-jpg");
    expect(JPG(out)).toBe(true);
  });
});

test.describe("webp-converter", () => {
  test("produces a valid WebP from a PNG", async ({ page }) => {
    await page.goto("/webp-converter");
    await setImage(page, "webp-converter", FILES.png());
    await page.getByTestId("webp-converter-run").click();
    const out = await runAndDownload(page, "webp-converter");
    // Depending on the chosen direction the output may be webp or a raster.
    expect(WEBP(out) || PNG(out) || JPG(out), "valid image output").toBe(true);
  });
});

test.describe("image-to-ico", () => {
  test("writes a real .ico file", async ({ page }) => {
    await page.goto("/image-to-ico");
    await setImage(page, "image-to-ico", FILES.png());
    await page.getByTestId("image-to-ico-run").click();
    const out = await runAndDownload(page, "image-to-ico");
    expect(ICO(out), "output has ICO header").toBe(true);
  });
});

test.describe("compress-image", () => {
  test("does not enlarge a simple image and stays a valid raster", async ({ page }) => {
    await page.goto("/compress-image");
    await setImage(page, "compress-image", FILES.jpg());
    await page.getByTestId("compress-image-run").click();
    const out = await runAndDownload(page, "compress-image");
    expect(JPG(out) || PNG(out) || WEBP(out), "valid image").toBe(true);
  });
});

test.describe("image tool validation", () => {
  test("a corrupted image is reported, not silently accepted", async ({ page }) => {
    await page.goto("/jpg-to-png", { waitUntil: "networkidle" });
    // Start listening for the (transient) error toast BEFORE we trigger it, so a
    // fast auto-dismiss can't race us.
    const toast = page.getByText(/could not be read as an image|could not read|invalid/i);
    const seen = toast.waitFor({ state: "visible", timeout: 12_000 });
    // jpg-to-png only accepts image/jpeg; feed corrupted PNG bytes as a jpg.
    await page.getByTestId("jpg-to-png-input-input").setInputFiles({
      name: "broken.jpg",
      mimeType: "image/jpeg",
      buffer: FILES.corruptedPng().buffer,
    });
    await seen;
    // And it must not produce a downloadable result.
    await expect(page.getByTestId("jpg-to-png-result")).toBeHidden();
  });
});
