import { NextResponse } from "next/server";
import { guarded, jsonError } from "@/lib/api";
import { deleteMeeting, updateMeeting } from "@/lib/db";
import { updateMeetingBody, uuid } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = guarded(async (request: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  const updated = await updateMeeting(id.data, updateMeetingBody.parse(await request.json()));
  return updated ? NextResponse.json(updated) : jsonError("Not found", 404);
});

export const DELETE = guarded(async (_req: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  return (await deleteMeeting(id.data)) ? NextResponse.json({ ok: true }) : jsonError("Not found", 404);
});
