import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Email capture + contact relay.
 *
 * The browser never talks to the storage backend directly. This route forwards
 * to a Google Apps Script Web App (LEADS_WEBHOOK_URL) that appends subscribers
 * to a Google Sheet and emails the site owner. The Sheet ID and any Gmail
 * access live inside the Apps Script, never in this app or the client bundle.
 *
 * It reports success ONLY when the webhook confirms it. With no webhook
 * configured, or on any webhook failure, it returns an error so the UI never
 * tells someone they subscribed when nothing was stored.
 *
 * See docs/EMAIL_SUBSCRIPTION_SETUP.md for the one-time setup.
 */
const HOOK_URL = process.env.LEADS_WEBHOOK_URL;
/** Optional shared secret; only enforced if also set as a Script Property. */
const HOOK_TOKEN = process.env.LEADS_WEBHOOK_TOKEN;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBHOOK_TIMEOUT_MS = 10_000;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    source?: string;
    message?: string;
  };

  // Normalize before validating and storing, so "A@X.com " and "a@x.com" are
  // one subscriber.
  const email = (body.email ?? "").trim().toLowerCase();
  const source = (body.source ?? "footer").slice(0, 80);
  const message = body.message ? body.message.slice(0, 4000) : undefined;

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  // No destination configured — do NOT pretend it worked.
  if (!HOOK_URL) {
    console.error("[leads] LEADS_WEBHOOK_URL is not set; cannot store subscriber.");
    return NextResponse.json(
      { error: "Subscriptions are temporarily unavailable." },
      { status: 503 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(HOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        source,
        message,
        token: HOOK_TOKEN,
        t: new Date().toISOString(),
      }),
      signal: controller.signal,
      // Apps Script answers on a 302 -> googleusercontent.com; follow it.
      redirect: "follow",
    });

    // The Apps Script Web App returns { success: boolean, ... }.
    const data = (await res.json().catch(() => null)) as
      | { success?: boolean; duplicate?: boolean }
      | null;

    if (!res.ok || !data?.success) {
      console.error("[leads] webhook did not confirm success:", res.status);
      return NextResponse.json({ error: "Could not subscribe right now." }, { status: 502 });
    }

    // duplicate === true still means the user is on the list; treat as success.
    return NextResponse.json({ ok: true });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    console.error("[leads] webhook error:", aborted ? "timeout" : err);
    return NextResponse.json({ error: "Could not subscribe right now." }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
