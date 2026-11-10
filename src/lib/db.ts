import "server-only";
import { env } from "./env";
import type { Contact, ContactDetail, ContactSummary, Meeting, MeetingWithContact } from "./types";

export class DbError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

async function rest<T>(method: Method, path: string, body?: unknown, prefer?: string): Promise<T> {
  const e = env();
  const headers: Record<string, string> = {
    apikey: e.SUPABASE_PUBLISHABLE_KEY,
    "x-app-key": e.APP_DB_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  // Legacy anon keys are JWTs and also go in Authorization; new sb_publishable_ keys must not.
  if (e.SUPABASE_PUBLISHABLE_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${e.SUPABASE_PUBLISHABLE_KEY}`;
  if (prefer) headers.Prefer = prefer;

  const res = await fetch(`${e.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new DbError(`Database request failed (${res.status}): ${text.slice(0, 200)}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Strip characters that have meaning in PostgREST filter syntax. */
export function sanitizeSearch(q: string): string {
  return q
    .replace(/[^\p{L}\p{N}\s@.'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

const SUMMARY_COLS =
  "id,name,headline,company,location,tags,linkedin_url,instagram_handle,whatsapp_phone,has_photo,notes,created_at,last_met_on,meeting_count,last_context";

export async function listContacts(q?: string): Promise<ContactSummary[]> {
  let path = `wdimt_contact_summaries?select=${SUMMARY_COLS}&order=last_met_on.desc.nullslast,created_at.desc&limit=500`;
  const term = q ? sanitizeSearch(q) : "";
  if (term) {
    const v = encodeURIComponent(`*${term}*`);
    path += `&or=(name.ilike.${v},company.ilike.${v},headline.ilike.${v},notes.ilike.${v},location.ilike.${v},last_context.ilike.${v})`;
  }
  return rest<ContactSummary[]>("GET", path);
}

export async function findMatches(f: {
  linkedin_url?: string | null;
  instagram_handle?: string | null;
  whatsapp_phone?: string | null;
  email?: string | null;
  name?: string | null;
}): Promise<Pick<ContactSummary, "id" | "name" | "headline" | "last_met_on">[]> {
  const ors: string[] = [];
  const eq = (col: string, v: string) => ors.push(`${col}.eq.${encodeURIComponent(`"${v.replace(/"/g, "")}"`)}`);
  if (f.linkedin_url) eq("linkedin_url", f.linkedin_url);
  if (f.instagram_handle) eq("instagram_handle", f.instagram_handle);
  if (f.whatsapp_phone) eq("whatsapp_phone", f.whatsapp_phone);
  if (f.name) {
    const term = sanitizeSearch(f.name);
    if (term) ors.push(`name.ilike.${encodeURIComponent(term)}`);
  }
  if (ors.length === 0) return [];
  return rest("GET", `wdimt_contact_summaries?select=id,name,headline,last_met_on&or=(${ors.join(",")})&limit=5`);
}

export async function getContact(id: string): Promise<ContactDetail | null> {
  const rows = await rest<ContactDetail[]>(
    "GET",
    `wdimt_contacts?id=eq.${encodeURIComponent(id)}&select=*,meetings:wdimt_meetings(*)&meetings.order=met_on.desc,created_at.desc`,
  );
  return rows[0] ?? null;
}

export type ContactInput = Partial<
  Pick<
    Contact,
    | "name"
    | "headline"
    | "company"
    | "location"
    | "notes"
    | "tags"
    | "linkedin_url"
    | "instagram_handle"
    | "whatsapp_phone"
    | "email"
    | "website_url"
  >
>;

export async function createContact(input: ContactInput & { name: string }): Promise<Contact> {
  const rows = await rest<Contact[]>("POST", "wdimt_contacts", input, "return=representation");
  const row = rows[0];
  if (!row) throw new DbError("Insert returned no row", 500);
  return row;
}

export async function updateContact(id: string, input: ContactInput & { has_photo?: boolean }): Promise<Contact | null> {
  const rows = await rest<Contact[]>("PATCH", `wdimt_contacts?id=eq.${encodeURIComponent(id)}`, input, "return=representation");
  return rows[0] ?? null;
}

export async function deleteContact(id: string): Promise<boolean> {
  const rows = await rest<Contact[]>("DELETE", `wdimt_contacts?id=eq.${encodeURIComponent(id)}`, undefined, "return=representation");
  return rows.length > 0;
}

export async function addMeeting(input: { contact_id: string; met_on: string; context?: string | null; notes?: string | null }): Promise<Meeting> {
  const rows = await rest<Meeting[]>("POST", "wdimt_meetings", input, "return=representation");
  const row = rows[0];
  if (!row) throw new DbError("Insert returned no row", 500);
  return row;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const rows = await rest<Meeting[]>("DELETE", `wdimt_meetings?id=eq.${encodeURIComponent(id)}`, undefined, "return=representation");
  return rows.length > 0;
}

export async function listMeetings(opts: { date?: string; limit: number }): Promise<MeetingWithContact[]> {
  let path = `wdimt_meetings?select=*,contacts:wdimt_contacts(id,name,headline,company,has_photo)&order=met_on.desc,created_at.desc&limit=${opts.limit}`;
  if (opts.date) path += `&met_on=eq.${opts.date}`;
  return rest<MeetingWithContact[]>("GET", path);
}

export async function setPhoto(contactId: string, dataUrl: string | null): Promise<void> {
  if (dataUrl) {
    await rest("POST", "wdimt_contact_photos?on_conflict=contact_id", { contact_id: contactId, data_url: dataUrl }, "resolution=merge-duplicates,return=minimal");
  } else {
    await rest("DELETE", `wdimt_contact_photos?contact_id=eq.${encodeURIComponent(contactId)}`);
  }
  await updateContact(contactId, { has_photo: Boolean(dataUrl) });
}

export async function getPhoto(contactId: string): Promise<string | null> {
  const rows = await rest<{ data_url: string }[]>("GET", `wdimt_contact_photos?contact_id=eq.${encodeURIComponent(contactId)}&select=data_url`);
  return rows[0]?.data_url ?? null;
}

/** Real round-trip through RLS: proves the DB is up AND the app key is accepted. */
export async function pingDb(): Promise<"connected" | "unauthorized" | "error"> {
  try {
    const ok = await rest<boolean>("POST", "rpc/wdimt_app_key_check", {});
    return ok === true ? "connected" : "unauthorized";
  } catch {
    return "error";
  }
}
