import { NextResponse } from "next/server";

export const runtime = "nodejs";

const HOOK_URL = process.env.LEADS_WEBHOOK_URL;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    source?: string;
  };
  const { email, source } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!HOOK_URL) {
    // No webhook configured, accept gracefully so the UI works locally.
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    await fetch(HOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        source: source ?? "footer",
        t: Date.now(),
      }),
    });
  } catch {
    return NextResponse.json({ error: "Could not store email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
