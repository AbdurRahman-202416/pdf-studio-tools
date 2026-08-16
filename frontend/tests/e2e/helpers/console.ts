import type { Page, TestInfo } from "@playwright/test";

/**
 * Attach console-error and page-error collectors to a page.
 *
 * Returns a live array; assert it is empty at the end of a test. We ignore a
 * small allowlist of noise that is not the app's fault (favicon during dev,
 * third-party ad/analytics scripts that are env-gated off in test, and
 * ResizeObserver loop warnings which are benign and browser-emitted).
 */
const IGNORE = [
  /favicon/i,
  /ResizeObserver loop/i,
  /Failed to load resource.*(adsbygoogle|googlesyndication|plausible|vercel-insights|va\.vercel)/i,
  /net::ERR_(BLOCKED_BY_CLIENT|NAME_NOT_RESOLVED).*(adservice|googlesyndication|plausible)/i,
  /Download the React DevTools/i,
];

export interface ConsoleTracker {
  errors: string[];
  pageErrors: string[];
}

export function trackConsole(page: Page): ConsoleTracker {
  const t: ConsoleTracker = { errors: [], pageErrors: [] };
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (IGNORE.some((re) => re.test(text))) return;
    t.errors.push(text);
  });
  page.on("pageerror", (err) => {
    const text = `${err.name}: ${err.message}`;
    if (IGNORE.some((re) => re.test(text))) return;
    t.pageErrors.push(text);
  });
  return t;
}

/** Save a JSON artifact of collected errors when a test fails, for triage. */
export async function attachConsole(t: ConsoleTracker, info: TestInfo): Promise<void> {
  if (t.errors.length || t.pageErrors.length) {
    await info.attach("console-errors.json", {
      body: JSON.stringify(t, null, 2),
      contentType: "application/json",
    });
  }
}
