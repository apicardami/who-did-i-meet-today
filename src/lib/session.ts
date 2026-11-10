import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { env } from "./env";

import { SESSION_COOKIE, type SessionData } from "./session-shared";

export { SESSION_COOKIE, type SessionData };

export function sessionOptions(): SessionOptions {
  return {
    password: env().SESSION_SECRET,
    cookieName: SESSION_COOKIE,
    ttl: 60 * 60 * 24 * 90,
    cookieOptions: { secure: process.env.NODE_ENV === "production", httpOnly: true, sameSite: "lax", path: "/" },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

/** Use in every data route handler as a second line of defense behind proxy.ts. */
export async function isAuthed(): Promise<boolean> {
  try {
    const s = await getSession();
    return s.authed === true;
  } catch {
    return false;
  }
}
