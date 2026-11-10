import { NextResponse } from "next/server";
import { guarded, jsonError } from "@/lib/api";
import { addMeeting, getContact } from "@/lib/db";
import { meetingFields, uuid } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const POST = guarded(async (request: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  const meeting = meetingFields.parse(await request.json());
  if (!(await getContact(id.data))) return jsonError("Not found", 404);
  const created = await addMeeting({ contact_id: id.data, ...meeting });
  return NextResponse.json(created, { status: 201 });
});
