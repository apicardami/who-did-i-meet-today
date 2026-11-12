"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/Avatar";
import ContactFields, { draftToPayload, type ContactDraft } from "@/components/ContactFields";
import DateStamp from "@/components/DateStamp";
import Field from "@/components/Field";
import PhotoPicker from "@/components/PhotoPicker";
import { Empty, ErrorState, Loading } from "@/components/States";
import { useJson } from "@/components/useJson";
import { DETAIL_COPY, FORM_COPY, HOME_COPY } from "@/lib/constants";
import { friendlyDate, localIsoDate } from "@/lib/dates";
import { instagramLink, safeHref, whatsappLink } from "@/lib/links";
import type { ContactDetail } from "@/lib/types";

function toDraft(c: ContactDetail): ContactDraft {
  return {
    name: c.name,
    headline: c.headline ?? "",
    company: c.company ?? "",
    location: c.location ?? "",
    notes: c.notes ?? "",
    tags: c.tags.join(", "),
    linkedin_url: c.linkedin_url ?? "",
    instagram_handle: c.instagram_handle ?? "",
    whatsapp_phone: c.whatsapp_phone ?? "",
    email: c.email ?? "",
    website_url: c.website_url ?? "",
  };
}

const pill = "inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-canal hover:border-canal";

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state, reload } = useJson<ContactDetail>(`/api/contacts/${id}`);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ContactDraft | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metOn, setMetOn] = useState(localIsoDate());
  const [context, setContext] = useState("");
  const [meetNotes, setMeetNotes] = useState("");
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [mDraft, setMDraft] = useState({ met_on: "", context: "", notes: "" });

  const call = async (fn: () => Promise<Response>, after: () => void) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fn();
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? DETAIL_COPY.error);
      }
      after();
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : DETAIL_COPY.error);
    } finally {
      setBusy(false);
    }
  };

  if (state.status === "loading" || state.status === "error" || state.status === "missing") {
    return (
      <>
        <AppHeader />
        <main className="mx-auto w-full max-w-2xl px-4 pt-8">
          {state.status === "loading" && <Loading rows={2} />}
          {state.status === "error" && <ErrorState message={HOME_COPY.loadError} retry={reload} retryLabel={HOME_COPY.retry} />}
          {state.status === "missing" && <Empty message={DETAIL_COPY.notFound} />}
        </main>
      </>
    );
  }

  const c = state.data;
  const photoVersion = c.updated_at;

  const startEdit = () => {
    setDraft(toDraft(c));
    setPhoto(null);
    setRemovePhoto(false);
    setEditing(true);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    void call(
      () =>
        fetch(`/api/contacts/${c.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: draftToPayload(draft), photo_data_url: photo, remove_photo: removePhoto }),
        }),
      () => {
        setEditing(false);
        reload();
      },
    );
  };

  const remove = () => {
    if (!window.confirm(DETAIL_COPY.deleteConfirm)) return;
    void call(
      () => fetch(`/api/contacts/${c.id}`, { method: "DELETE" }),
      () => router.replace("/people"),
    );
  };

  const addMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    void call(
      () =>
        fetch(`/api/contacts/${c.id}/meetings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ met_on: metOn, context, notes: meetNotes }),
        }),
      () => {
        setContext("");
        setMeetNotes("");
        setMetOn(localIsoDate());
        reload();
      },
    );
  };

  const removeMeeting = (meetingId: string) => {
    if (!window.confirm(DETAIL_COPY.deleteMeetingConfirm)) return;
    void call(() => fetch(`/api/meetings/${meetingId}`, { method: "DELETE" }), reload);
  };

  const startEditMeeting = (m: ContactDetail["meetings"][number]) => {
    setMDraft({ met_on: m.met_on, context: m.context ?? "", notes: m.notes ?? "" });
    setEditingMeeting(m.id);
  };

  const saveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    void call(
      () =>
        fetch(`/api/meetings/${editingMeeting}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mDraft),
        }),
      () => {
        setEditingMeeting(null);
        reload();
      },
    );
  };

  const links: { href: string; label: string }[] = [];
  const li = safeHref(c.linkedin_url);
  if (li) links.push({ href: li, label: DETAIL_COPY.openLinkedIn });
  if (c.instagram_handle) links.push({ href: instagramLink(c.instagram_handle), label: DETAIL_COPY.openInstagram });
  if (c.whatsapp_phone) links.push({ href: whatsappLink(c.whatsapp_phone), label: DETAIL_COPY.openWhatsApp });
  if (c.email) links.push({ href: `mailto:${c.email}`, label: DETAIL_COPY.openEmail });
  const web = safeHref(c.website_url);
  if (web) links.push({ href: web, label: DETAIL_COPY.openWebsite });

  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pb-6 pt-6">
        <Link href="/people" className="inline-flex min-h-11 items-center self-start text-sm text-muted underline-offset-4 hover:underline">
          ← {DETAIL_COPY.back}
        </Link>

        {editing && draft ? (
          <form onSubmit={saveEdit} className="stub flex flex-col gap-5 p-4 sm:p-6">
            <PhotoPicker
              name={draft.name}
              value={photo}
              onChange={(v) => {
                setPhoto(v);
                if (v) setRemovePhoto(false);
              }}
              existingContactId={c.id}
              existingHasPhoto={c.has_photo && !removePhoto}
            />
            {c.has_photo && !removePhoto && photo === null && (
              <button type="button" onClick={() => setRemovePhoto(true)} className="self-start min-h-11 text-sm text-muted underline underline-offset-4">
                {FORM_COPY.removePhoto}
              </button>
            )}
            <ContactFields draft={draft} set={(k, v) => setDraft((d) => (d ? { ...d, [k]: v } : d))} defaultOpen />
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busy || !draft.name.trim()} className="min-h-12 rounded-xl bg-canal px-6 font-semibold text-canal-ink disabled:opacity-60">
                {busy ? FORM_COPY.saving : DETAIL_COPY.saveEdit}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="min-h-11 px-2 text-sm text-muted underline underline-offset-4">
                {DETAIL_COPY.cancelEdit}
              </button>
            </div>
          </form>
        ) : (
          <section aria-labelledby="person-name" className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <Avatar name={c.name} contactId={c.id} hasPhoto={c.has_photo} size={88} version={photoVersion} />
              <div className="min-w-0 flex-1">
                <h1 id="person-name" className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink">
                  {c.name}
                </h1>
                {(c.headline || c.company) && <p className="mt-1 text-base text-ink">{[c.headline, c.company].filter(Boolean).join(" · ")}</p>}
                {c.location && <p className="text-sm text-muted">{c.location}</p>}
              </div>
            </div>
            {c.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label={FORM_COPY.tags}>
                {c.tags.map((t) => (
                  <li key={t} className="rounded-full bg-wash px-3 py-1 text-xs font-medium text-canal">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={pill}>
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
            {c.notes && <p className="whitespace-pre-wrap rounded-xl border border-line bg-card p-3 text-sm text-ink">{c.notes}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={startEdit} className={pill}>
                {DETAIL_COPY.edit}
              </button>
              <button type="button" onClick={remove} disabled={busy} className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-danger hover:bg-wash">
                {DETAIL_COPY.delete}
              </button>
            </div>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
          </section>
        )}

        <section aria-labelledby="history-title">
          <h2 id="history-title" className="mb-3 font-display text-xl font-semibold text-ink">
            {DETAIL_COPY.history}
          </h2>
          {c.meetings.length === 0 ? (
            <Empty message={DETAIL_COPY.noHistory} />
          ) : (
            <ul className="flex flex-col gap-3">
              {c.meetings.map((m) =>
                editingMeeting === m.id ? (
                  <li key={m.id} className="stub p-3">
                    <form onSubmit={saveMeeting} className="flex flex-col gap-4">
                      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                        <Field label={FORM_COPY.metOn} value={mDraft.met_on} onChange={(v) => setMDraft((d) => ({ ...d, met_on: v }))} type="date" required />
                        <Field label={FORM_COPY.context} value={mDraft.context} onChange={(v) => setMDraft((d) => ({ ...d, context: v }))} placeholder={FORM_COPY.contextPlaceholder} maxLength={200} />
                      </div>
                      <Field label={FORM_COPY.notes} value={mDraft.notes} onChange={(v) => setMDraft((d) => ({ ...d, notes: v }))} placeholder={FORM_COPY.notesPlaceholder} multiline maxLength={4000} />
                      <div className="flex flex-wrap gap-3">
                        <button type="submit" disabled={busy || !mDraft.met_on} className="min-h-12 rounded-xl bg-canal px-6 font-semibold text-canal-ink disabled:opacity-60">
                          {busy ? FORM_COPY.saving : DETAIL_COPY.saveMeeting}
                        </button>
                        <button type="button" onClick={() => setEditingMeeting(null)} className="min-h-11 px-2 text-sm text-muted underline underline-offset-4">
                          {DETAIL_COPY.cancelEdit}
                        </button>
                      </div>
                    </form>
                  </li>
                ) : (
                  <li key={m.id} className="stub flex items-start gap-4 p-3">
                    <span className="flex w-16 justify-center">
                      <DateStamp date={m.met_on} size="sm" />
                    </span>
                    <div className="ml-2 min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">{friendlyDate(m.met_on)}</p>
                      {m.context && <p className="font-medium text-ink">{m.context}</p>}
                      {m.notes && <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{m.notes}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <button type="button" onClick={() => startEditMeeting(m)} disabled={busy} className="min-h-11 px-2 text-xs text-canal underline underline-offset-4">
                        {DETAIL_COPY.editMeeting}
                      </button>
                      <button type="button" onClick={() => removeMeeting(m.id)} disabled={busy} className="min-h-11 px-2 text-xs text-muted underline underline-offset-4">
                        {DETAIL_COPY.deleteMeeting}
                      </button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </section>

        <section aria-labelledby="add-meeting-title" className="rounded-[14px] border border-line bg-card p-4">
          <h2 id="add-meeting-title" className="mb-3 font-display text-lg font-semibold text-ink">
            {DETAIL_COPY.addMeeting}
          </h2>
          <form onSubmit={addMeeting} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <Field label={FORM_COPY.metOn} value={metOn} onChange={setMetOn} type="date" required />
              <Field label={FORM_COPY.context} value={context} onChange={setContext} placeholder={FORM_COPY.contextPlaceholder} maxLength={200} />
            </div>
            <Field label={FORM_COPY.notes} value={meetNotes} onChange={setMeetNotes} placeholder={FORM_COPY.notesPlaceholder} multiline maxLength={4000} />
            <button type="submit" disabled={busy} className="min-h-12 self-start rounded-xl bg-canal px-6 font-semibold text-canal-ink disabled:opacity-60">
              {busy ? FORM_COPY.saving : DETAIL_COPY.addMeetingSave}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
