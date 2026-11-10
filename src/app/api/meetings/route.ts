import { NextResponse } from "next/server";
import { guarded, jsonError } from "@/lib/api";
import { listMeetings } from "@/lib/db";
import { isoDate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = guarded(async (request: Request) => {
  const sp = new URL(request.url).searchParams;
  const date = sp.get("date");
  if (date && !isoDate.safeParse(date).success) return jsonError("Invalid date", 400);
  const limit = Math.min(Math.max(Number(sp.get("limit") ?? "40") || 40, 1), 200);
  return NextResponse.json(await listMeetings({ date: date ?? undefined, limit }));
});
