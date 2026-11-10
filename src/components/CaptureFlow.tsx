"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContactFields, { draftToPayload, emptyDraft, type ContactDraft } from "./ContactFields";
import Field from "./Field";
import PhotoPicker from "./PhotoPicker";
import { ENRICH_COPY, FORM_COPY, HOME_COPY } from "@/lib/constants";
import { classifyInput } from "@/lib/links";
import type { ProfileCandidate } from "@/lib/candidates";
import ProfilePicker, { type SearchState } from "./ProfilePicker";
import { localIsoDate, friendlyDate } from "@/lib/dates";
import type { EnrichResult } from "@/lib/types";

type Phase = "input" | "looking" | "choose" | "review" | "saving";

export default function CaptureFlow({ onSaved }: { onSaved: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<EnrichResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft);
  const [photo, setPhoto] = useState<string | null>(null);
  const [metOn, setMetOn] = useState(localIsoDate());
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const [searchedName, setSearchedName] = useState("");

  const set = <K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const reset = () => {
    setPhase("input");
    setQuery("");
    setResult(null);
    setNotice(null);
    setDraft(emptyDraft);
    setPhoto(null);
    setMetOn(localIsoDate());
    setContext("");
    setError(null);
    setSearch({ status: "idle" });
    setSearchedName("");
  };

  const startBlank = () => {
    setResult(null);
    setNotice(null);
    setDraft(emptyDraft);
    setPhase("review");
  };

  /** Runs link-preview enrichment and moves to the review card. `known` (from a picked search result) wins for name. */
  const enrichAndReview = async (input: string, known?: { name: string; headline?: string | null }) => {
    setPhase("looking");
    setError(null);
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) throw new Error("lookup failed");
      const r = (await res.json()) as EnrichResult;
      setResult(r);
      setNotice(r.message);
      setDraft({
        ...emptyDraft,
        name: known?.name || r.name || "",
        headline: r.headline ?? known?.headline ?? "",
        company: r.company ?? "",
        location: r.location ?? "",
        linkedin_url: r.linkedin_url ?? "",
        instagram_handle: r.instagram_handle ?? "",
        whatsapp_phone: r.whatsapp_phone ?? "",
        email: r.email ?? "",
        website_url: r.website_url ?? "",
      });
      setPhoto(r.photo_data_url);
    } catch {
      setNotice(ENRICH_COPY.error);
      setDraft({ ...emptyDraft, name: known?.name ?? (/^https?:|\//.test(input) ? "" : input.trim()), headline: known?.headline ?? "" });
    }
    setPhase("review");
  };

  const runSearch = async (name: string, hint: string | null) => {
    setSearch({ status: "loading" });
    try {
      const res = await fetch("/api/search-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hint }),
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (res.status === 503) {
        setSearch({ status: "not_configured" });
        return;
      }
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as { candidates: ProfileCandidate[] };
      setSearch({ status: "ready", candidates: data.candidates });
    } catch {
      setSearch({ status: "error" });
    }
  };

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = query.trim();
    if (!input) return;
    if (classifyInput(input).kind === "name") {
      setSearchedName(input);
      setPhase("choose");
      await runSearch(input, null);
      return;
    }
    await enrichAndReview(input);
  };

  const pickCandidate = (c: ProfileCandidate) => {
    void enrichAndReview(c.url, { name: c.name ?? searchedName, headline: c.headline });
  };

  const continueWithName = () => {
    void enrichAndReview(searchedName, { name: searchedName });
  };

  const addToExisting = async (contactId: string) => {
    setPhase("saving");
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${contactId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ met_on: metOn, context, notes: draft.notes }),
      });
      if (!res.ok) throw new Error("save failed");
      reset();
      onSaved();
    } catch {
      setError(FORM_COPY.saveError);
      setPhase("review");
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setPhase("saving");
    setError(null);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: draftToPayload(draft),
          photo_data_url: photo,
          meeting: { met_on: metOn, context, notes: null },
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? FORM_COPY.saveError);
      }
      reset();
      onSaved();
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : FORM_COPY.saveError);
      setPhase("review");
    }
  };

  if (phase === "choose") {
    return (
      <ProfilePicker
        name={searchedName}
        state={search}
        onPick={pickCandidate}
        onNone={continueWithName}
        onSearchAgain={(hint) => void runSearch(searchedName, hint)}
        onCancel={reset}
      />
    );
  }

  if (phase === "input" || phase === "looking") {
    return (
      <section aria-labelledby="capture-title" className="fade-in">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mola">{HOME_COPY.eyebrow}</p>
        <h1 id="capture-title" className="mt-1 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          {HOME_COPY.title}
        </h1>
        <form onSubmit={lookup} className="mt-6 flex flex-col gap-3">
          <label htmlFor="capture-input" className="text-sm text-muted">
            {HOME_COPY.inputLabel}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="capture-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={HOME_COPY.inputPlaceholder}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={500}
              className="min-h-12 flex-1 rounded-xl border-2 border-line bg-card px-4 text-base text-ink placeholder:text-muted/80 focus:border-canal focus:outline-none"
            />
            <button
              type="submit"
              disabled={phase === "looking" || !query.trim()}
              className="min-h-12 rounded-xl bg-canal px-6 font-semibold text-canal-ink transition-opacity disabled:opacity-60"
            >
              {phase === "looking" ? HOME_COPY.lookingUp : HOME_COPY.lookup}
            </button>
          </div>
          <button type="button" onClick={startBlank} className="self-start min-h-11 text-sm font-medium text-canal underline underline-offset-4">
            {HOME_COPY.orPhoto}
          </button>
        </form>
      </section>
    );
  }

  const matches = result?.matches ?? [];
  const saving = phase === "saving";

  return (
    <section aria-labelledby="review-title" className="stub stub-form fade-in p-4 sm:p-6 sm:pl-28">
      <div className="absolute right-4 top-4 sm:left-5 sm:right-auto sm:top-5">
        <span className="stamp inline-flex h-14 w-14 flex-col items-center justify-center text-center text-[9px] font-bold uppercase leading-tight tracking-wider">
          {friendlyDate(metOn)}
        </span>
      </div>
      <h2 id="review-title" className="font-display text-2xl font-semibold text-ink">
        {FORM_COPY.heading}
      </h2>
      {notice && (
        <p role="status" className={`mt-2 text-sm ${result?.status === "full" ? "text-canal" : "text-muted"}`}>
          {notice}
        </p>
      )}

      {matches.length > 0 && (
        <div className="mt-4 rounded-xl border border-mola/50 bg-wash p-3">
          <p className="text-sm font-semibold text-ink">{FORM_COPY.matchHeading}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {matches.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => addToExisting(m.id)}
                  className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-left text-sm hover:border-canal disabled:opacity-60"
                >
                  {FORM_COPY.matchAction} <strong>{m.name}</strong>
                  {m.headline ? <span className="text-muted"> · {m.headline}</span> : null}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">{FORM_COPY.matchOr}</p>
        </div>
      )}

      <form onSubmit={save} className="mt-5 flex flex-col gap-5">
        <PhotoPicker name={draft.name} value={photo} onChange={setPhoto} />
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <Field label={FORM_COPY.metOn} value={metOn} onChange={setMetOn} type="date" required />
          <Field label={FORM_COPY.context} value={context} onChange={setContext} placeholder={FORM_COPY.contextPlaceholder} maxLength={200} />
        </div>
        <ContactFields draft={draft} set={set} />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || !draft.name.trim()}
            className="min-h-12 rounded-xl bg-canal px-6 font-semibold text-canal-ink disabled:opacity-60"
          >
            {saving ? FORM_COPY.saving : FORM_COPY.save}
          </button>
          <button type="button" onClick={reset} disabled={saving} className="min-h-11 px-2 text-sm text-muted underline underline-offset-4">
            {FORM_COPY.cancel}
          </button>
        </div>
      </form>
    </section>
  );
}
