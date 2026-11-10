import { NextResponse } from "next/server";
import { pingDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await pingDb();
    if (db === "connected") return NextResponse.json({ status: "ok", db: "connected" });
    return NextResponse.json({ status: "degraded", db }, { status: 503 });
  } catch {
    return NextResponse.json({ status: "degraded", db: "error" }, { status: 503 });
  }
}
