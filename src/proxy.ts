import { NextResponse, type NextRequest } from "next/server";
import { getIronSession, nextProxyCookies } from "iron-session";
import { SESSION_COOKIE, type SessionData } from "@/lib/session-shared";

const PUBLIC_PAGES = new Set(["/login", "/privacy", "/terms"]);
const PUBLIC_API = new Set(["/api/health", "/api/paused-status", "/api/interest", "/api/auth/login"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PAGES.has(pathname) || PUBLIC_API.has(pathname)) return NextResponse.next();

  const response = NextResponse.next();
  let authed = false;
  try {
    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length >= 32) {
      const session = await getIronSession<SessionData>(nextProxyCookies(request, response), {
        password: secret,
        cookieName: SESSION_COOKIE,
        ttl: 60 * 60 * 24 * 90,
      });
      authed = session.authed === true;
    }
  } catch {
    authed = false;
  }
  if (authed) return response;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|manifest.webmanifest).*)"],
};
