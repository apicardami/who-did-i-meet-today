import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { logger, errorMessage } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("logout failed", { error: errorMessage(err) });
    return NextResponse.json({ error: "Sign-out failed" }, { status: 500 });
  }
}
