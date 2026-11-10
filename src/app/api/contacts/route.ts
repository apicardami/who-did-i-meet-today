import { NextResponse } from "next/server";
import { guarded } from "@/lib/api";
import { addMeeting, createContact, listContacts, setPhoto } from "@/lib/db";
import { createContactBody } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = guarded(async (request: Request) => {
  const q = new URL(request.url).searchParams.get("q") ?? undefined;
  return NextResponse.json(await listContacts(q));
});

export const POST = guarded(async (request: Request) => {
  const { contact, photo_data_url, meeting } = createContactBody.parse(await request.json());
  const created = await createContact(contact);
  if (photo_data_url) await setPhoto(created.id, photo_data_url);
  if (meeting) await addMeeting({ contact_id: created.id, ...meeting });
  return NextResponse.json({ id: created.id }, { status: 201 });
});
