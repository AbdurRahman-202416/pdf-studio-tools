import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 3100;
const BACKEND_PORT = process.env.E2E_BACKEND_PORT ? Number(process.env.E2E_BACKEND_PORT) : 8001;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const API_BASE_URL = `http://127.0.0.1:${BACKEND_PORT}/api`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
