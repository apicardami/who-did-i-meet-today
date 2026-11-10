import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "node:crypto";
import { z } from "zod";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";
import { logger, errorMessage } from "@/lib/logger";

const body = z.object({ password: z.string().min(1).max(200) });

function sameSecret(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  try {
    const parsed = body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Password required" }, { status: 400 });

    if (!sameSecret(parsed.data.password, env().APP_PASSWORD)) {
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }
    const session = await getSession();
    session.authed = true;
    await session.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("login failed", { error: errorMessage(err) });
    return NextResponse.json({ error: "Sign-in unavailable" }, { status: 500 });
  }
}
