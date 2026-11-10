"use client";

import { useEffect, useState } from "react";
import Field from "./Field";
import { FORM_COPY, SEARCH_COPY } from "@/lib/constants";
import type { ProfileCandidate } from "@/lib/candidates";

export type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; candidates: ProfileCandidate[] }
  | { status: "not_configured" }
  | { status: "error" };

interface Props {
  name: string;
  state: SearchState;
  onPick: (c: ProfileCandidate) => void;
  onNone: () => void;
  onSearchAgain: (hint: string | null) => void;
  onCancel: () => void;
}

function displayPath(c: ProfileCandidate): string {
  if (c.source === "instagram" && c.handle) return `@${c.handle}`;
  try {
    const u = new URL(c.url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return c.url;
  }
}

export default function ProfilePicker({ name, state, onPick, onNone, onSearchAgain, onCancel }: Props) {
  const [hint, setHint] = useState("");
  const loading = state.status === "loading";

  // Results replace the input box; bring the top of the list into view on phones.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [state.status]);

  return (
    <section aria-labelledby="picker-title" aria-busy={loading} className="fade-in">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mola">{name}</p>
      <h1 id="picker-title" className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight text-ink">
        {SEARCH_COPY.heading}
      </h1>

      {loading && (
        <div className="mt-5">
          <p role="status" className="text-sm text-muted">
            {SEARCH_COPY.searching}
          </p>
          <ul className="mt-3 flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-16 animate-pulse rounded-[14px] border border-line bg-card motion-reduce:animate-none" />
            ))}
          </ul>
        </div>
      )}

      {state.status === "ready" && state.candidates.length > 0 && (
        <>
          <p className="mt-2 text-sm text-muted">{SEARCH_COPY.sub}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {state.candidates.map((c) => (
              <li key={c.url}>
                <button
                  type="button"
                  onClick={() => onPick(c)}
                  className="flex min-h-16 w-full items-center gap-3 rounded-[14px] border border-line bg-card p-3 text-left transition-colors hover:border-canal"
                >
                  <span
                    className={`inline-flex h-10 w-[5.5rem] shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                      c.source === "linkedin" ? "bg-canal text-canal-ink" : "bg-mola text-canal-ink"
                    }`}
                  >
                    {c.source === "linkedin" ? SEARCH_COPY.linkedin : SEARCH_COPY.instagram}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg font-semibold text-ink">{c.name ?? displayPath(c)}</span>
                    {c.headline && <span className="block truncate text-sm text-muted">{c.headline}</span>}
                    <span className="block truncate text-xs text-canal">{displayPath(c)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {state.status === "ready" && state.candidates.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-5 text-sm text-muted">{SEARCH_COPY.empty}</p>
      )}
      {state.status === "not_configured" && (
        <p role="alert" className="mt-4 rounded-xl border border-line bg-card px-4 py-4 text-sm text-ink">
          {SEARCH_COPY.notConfigured}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="mt-4 rounded-xl border border-danger/40 bg-card px-4 py-4 text-sm text-ink">
          {SEARCH_COPY.error}
        </p>
      )}

      {!loading && state.status !== "not_configured" && (
        <form
          className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchAgain(hint.trim() || null);
          }}
        >
          <div className="flex-1">
            <Field label={SEARCH_COPY.hintLabel} value={hint} onChange={setHint} placeholder={SEARCH_COPY.hintPlaceholder} maxLength={120} />
          </div>
          <button type="submit" className="min-h-11 rounded-xl border border-canal px-4 text-sm font-semibold text-canal hover:bg-wash">
            {SEARCH_COPY.again}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={onNone}
          disabled={loading}
          className="min-h-12 rounded-xl bg-canal px-5 font-semibold text-canal-ink disabled:opacity-60"
        >
          {SEARCH_COPY.none}
        </button>
        <button type="button" onClick={onCancel} className="min-h-11 px-1 text-sm text-muted underline underline-offset-4">
          {FORM_COPY.cancel}
        </button>
      </div>
    </section>
  );
}
