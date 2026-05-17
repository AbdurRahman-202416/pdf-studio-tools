import { NextResponse, type NextRequest } from "next/server";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];
const COOKIE_TTL_DAYS = 30;

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const captured: Record<string, string> = {};

  for (const key of UTM_KEYS) {
    const v = url.searchParams.get(key);
    if (v) captured[key] = v;
  }

  if (Object.keys(captured).length === 0) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const maxAge = COOKIE_TTL_DAYS * 24 * 60 * 60;
  for (const [k, v] of Object.entries(captured)) {
    res.cookies.set(k, v, {
      maxAge,
      sameSite: "lax",
      httpOnly: false,
    });
  }
  return res;
}

export const config = {
  matcher: [
    // Skip Next.js internals, api, static files, sitemap, robots, og
    "/((?!_next/|api/|og|sitemap.xml|robots.txt|favicon.ico|.*\\.[\\w]+$).*)",
  ],
};
