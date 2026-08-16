import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 3100;
const BACKEND_PORT = process.env.E2E_BACKEND_PORT ? Number(process.env.E2E_BACKEND_PORT) : 8001;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const API_BASE_URL = `http://127.0.0.1:${BACKEND_PORT}/api`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["json", { outputFile: "test-results/results.json" }]]
    : [["list"], ["html", { open: "never" }]],
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    // Legacy specs (kept green): the two original files at tests/*.spec.ts.
    {
      name: "legacy",
      testMatch: /tests\/(pdf-tool|tools)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Registry sweep + SEO + a11y: no uploads, no backend dependency for most.
    {
      name: "smoke",
      testMatch: /tests\/e2e\/smoke\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "seo",
      testMatch: /tests\/e2e\/seo\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "a11y",
      testMatch: /tests\/e2e\/accessibility\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Pure browser tools — could run with zero backend.
    {
      name: "client",
      testMatch: /tests\/e2e\/(developer|text|data|color|security|convert|calc|image)\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Server tools + fallback — need the FastAPI backend.
    {
      name: "server",
      testMatch: /tests\/e2e\/(pdf|failure)\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Mobile smoke over a representative slice.
    {
      name: "mobile",
      testMatch: /tests\/e2e\/(smoke|accessibility)\/.*\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: [
    {
      command: `bash -lc 'cd ../backend && source .venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port ${BACKEND_PORT} --log-level warning'`,
      url: `${API_BASE_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: `npx next dev -p ${PORT} -H 127.0.0.1`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_BASE_URL: API_BASE_URL,
      },
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
