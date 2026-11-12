import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, jsonError } from "@/lib/api";
import { getContact, setPhoto } from "@/lib/db";
import { fetchProfilePhoto } from "@/lib/profilePhoto";
import { uuid } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Ctx = { params: Promise<{ id: string }> };

const body = z.object({ replace: z.boolean().optional() });

/** One user-triggered attempt to copy the photo from the contact's own LinkedIn / Instagram link. */
export const POST = guarded(async (request: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  const { replace } = body.parse(await request.json().catch(() => ({})));
  const contact = await getContact(id.data);
  if (!contact) return jsonError("Not found", 404);
  if (!contact.linkedin_url && !contact.instagram_handle) return NextResponse.json({ status: "no_link" });
  if (contact.has_photo && !replace) return NextResponse.json({ status: "exists" });
  const photo = await fetchProfilePhoto(contact);
  if (!photo) return NextResponse.json({ status: "no_image" });
  await setPhoto(id.data, photo);
  return NextResponse.json({ status: "saved" });
});
