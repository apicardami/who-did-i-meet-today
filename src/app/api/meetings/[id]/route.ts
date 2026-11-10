import { NextResponse } from "next/server";
import { guarded, jsonError } from "@/lib/api";
import { deleteMeeting } from "@/lib/db";
import { uuid } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = guarded(async (_req: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  return (await deleteMeeting(id.data)) ? NextResponse.json({ ok: true }) : jsonError("Not found", 404);
});
