import { NextResponse } from "next/server";
import { guarded, jsonError } from "@/lib/api";
import { deleteContact, getContact, setPhoto, updateContact } from "@/lib/db";
import { updateContactBody, uuid } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = guarded(async (_req: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  const contact = await getContact(id.data);
  return contact ? NextResponse.json(contact) : jsonError("Not found", 404);
});

export const PATCH = guarded(async (request: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  const { contact, photo_data_url, remove_photo } = updateContactBody.parse(await request.json());
  const updated = Object.keys(contact).length ? await updateContact(id.data, contact) : await getContact(id.data);
  if (!updated) return jsonError("Not found", 404);
  if (photo_data_url) await setPhoto(id.data, photo_data_url);
  else if (remove_photo) await setPhoto(id.data, null);
  return NextResponse.json({ ok: true });
});

export const DELETE = guarded(async (_req: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  return (await deleteContact(id.data)) ? NextResponse.json({ ok: true }) : jsonError("Not found", 404);
});
