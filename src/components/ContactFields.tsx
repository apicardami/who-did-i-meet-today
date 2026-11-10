"use client";

import { useState } from "react";
import Field from "./Field";
import { FORM_COPY } from "@/lib/constants";

export interface ContactDraft {
  name: string;
  headline: string;
  company: string;
  location: string;
  notes: string;
  tags: string;
  linkedin_url: string;
  instagram_handle: string;
  whatsapp_phone: string;
  email: string;
  website_url: string;
}

export const emptyDraft: ContactDraft = {
  name: "",
  headline: "",
  company: "",
  location: "",
  notes: "",
  tags: "",
  linkedin_url: "",
  instagram_handle: "",
  whatsapp_phone: "",
  email: "",
  website_url: "",
};

export function draftToPayload(d: ContactDraft) {
  return {
    name: d.name.trim(),
    headline: d.headline,
    company: d.company,
    location: d.location,
    notes: d.notes,
    tags: d.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    linkedin_url: d.linkedin_url,
    instagram_handle: d.instagram_handle,
    whatsapp_phone: d.whatsapp_phone,
    email: d.email,
    website_url: d.website_url,
  };
}

interface Props {
  draft: ContactDraft;
  set: <K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) => void;
  showNotes?: boolean;
  defaultOpen?: boolean;
}

export default function ContactFields({ draft, set, showNotes = true, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-4">
      <Field label={FORM_COPY.name} value={draft.name} onChange={(v) => set("name", v)} required maxLength={120} autoComplete="off" />
      <Field label={FORM_COPY.headline} value={draft.headline} onChange={(v) => set("headline", v)} placeholder={FORM_COPY.headlinePlaceholder} maxLength={200} />
      {showNotes && (
        <Field label={FORM_COPY.notes} value={draft.notes} onChange={(v) => set("notes", v)} placeholder={FORM_COPY.notesPlaceholder} multiline maxLength={4000} />
      )}
      <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} className="rounded-xl border border-line bg-card/60 px-3">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-canal">{FORM_COPY.moreDetails}</summary>
        <div className="flex flex-col gap-4 pb-4 pt-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={FORM_COPY.company} value={draft.company} onChange={(v) => set("company", v)} maxLength={120} />
            <Field label={FORM_COPY.location} value={draft.location} onChange={(v) => set("location", v)} placeholder={FORM_COPY.locationPlaceholder} maxLength={120} />
          </div>
          <Field label={FORM_COPY.tags} value={draft.tags} onChange={(v) => set("tags", v)} placeholder={FORM_COPY.tagsPlaceholder} />
          <Field label={FORM_COPY.linkedin} value={draft.linkedin_url} onChange={(v) => set("linkedin_url", v)} type="url" inputMode="url" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={FORM_COPY.instagram} value={draft.instagram_handle} onChange={(v) => set("instagram_handle", v)} placeholder="@handle" />
            <Field label={FORM_COPY.whatsapp} value={draft.whatsapp_phone} onChange={(v) => set("whatsapp_phone", v)} type="tel" inputMode="tel" placeholder="+507 6123 4567" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={FORM_COPY.email} value={draft.email} onChange={(v) => set("email", v)} type="email" inputMode="email" />
            <Field label={FORM_COPY.website} value={draft.website_url} onChange={(v) => set("website_url", v)} type="url" inputMode="url" />
          </div>
        </div>
      </details>
    </div>
  );
}
