import { expect, test, type Page, type Request } from "@playwright/test";
import { FILES, TEXT } from "../helpers/files";
import { clientTools } from "../helpers/registry";
import { typeInto } from "../helpers/text-tool";

/**
 * The product's headline privacy claim: client-runtime tools never upload the
 * file/content. We prove it by recording every outbound request while a client
 * tool actually processes real input, and asserting none carries a body to a
 * non-allowlisted host (analytics/ads are allowed; the API host is NOT).
 */

const API_HOSTS = ["127.0.0.1:8001", "localhost:8001", "api."];

function recordUploads(page: Page): Request[] {
  const uploads: Request[] = [];
  page.on("request", (req) => {
    const method = req.method();
    if (method !== "POST" && method !== "PUT") return;
    const url = req.url();
    // Any POST/PUT to the backend API host is a potential file upload.
    if (API_HOSTS.some((h) => url.includes(h))) uploads.push(req);
  });
  return uploads;
}

test.describe("client tools never upload to the backend", () => {
  test("image tool (jpg-to-png) processes locally with zero backend calls", async ({ page }) => {
    const uploads = recordUploads(page);
    await page.goto("/jpg-to-png", { waitUntil: "networkidle" });
    await page.getByTestId("jpg-to-png-input-input").setInputFiles(FILES.jpg());
    await page.getByTestId("jpg-to-png-run").click();
    await expect(page.getByTestId("jpg-to-png-result")).toBeVisible({ timeout: 15_000 });
    expect(uploads.map((r) => r.url()), "no backend upload from a client image tool").toEqual([]);
  });

  test("developer tool (json-formatter) processes locally with zero backend calls", async ({ page }) => {
    const uploads = recordUploads(page);
    await page.goto("/json-formatter", { waitUntil: "networkidle" });
    await typeInto(page, TEXT.validJson);
    expect(uploads.map((r) => r.url())).toEqual([]);
  });

  test("QR generator (secrets-adjacent) never transmits the encoded payload", async ({ page }) => {
    const bodies: string[] = [];
    page.on("request", (req) => {
      if (req.method() === "POST") bodies.push(req.postData() ?? "");
    });
    await page.goto("/qr-code-generator", { waitUntil: "networkidle" });
    const secret = "hunter2-secret-payload";
    // Default kind is "url" → the qr-url field is the visible one.
    await page.getByTestId("qr-url").fill(`https://x.test/${secret}`);
    await expect(page.getByTestId("qr-result")).toBeVisible({ timeout: 10_000 });
    expect(bodies.some((b) => b.includes(secret)), "secret must not be POSTed anywhere").toBe(false);
  });

  test("password generator output is never sent over the network", async ({ page }) => {
    const posts: string[] = [];
    page.on("request", (req) => {
      if (["POST", "PUT"].includes(req.method())) posts.push(req.postData() ?? "");
    });
    await page.goto("/password-generator", { waitUntil: "networkidle" });
    await page.getByTestId("regenerate").click();
    const pw = await page.getByTestId("password-output").inputValue().catch(async () =>
      (await page.getByTestId("password-output").textContent()) ?? "",
    );
    expect(pw.length).toBeGreaterThan(4);
    expect(posts.some((b) => b.includes(pw)), "password must not leave the browser").toBe(false);
  });
});

test.describe("registry ↔ runtime consistency", () => {
  test("no client-runtime tool declares a backend endpoint", () => {
    const offenders = clientTools.filter((t) => t.backendEndpoint);
    expect(offenders.map((t) => t.slug)).toEqual([]);
  });
});
