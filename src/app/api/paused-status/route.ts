import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ paused: process.env.APP_PAUSED === "true" });
  } catch {
    return NextResponse.json({ paused: false });
  }
}
