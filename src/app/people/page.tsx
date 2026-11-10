"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/Avatar";
import { Empty, ErrorState, Loading } from "@/components/States";
import { useJson } from "@/components/useJson";
import { HOME_COPY, PEOPLE_COPY } from "@/lib/constants";
import { friendlyDate } from "@/lib/dates";
import type { ContactSummary } from "@/lib/types";

export default function PeoplePage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { state, reload } = useJson<ContactSummary[]>(`/api/contacts${debounced ? `?q=${encodeURIComponent(debounced)}` : ""}`);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl px-4 pb-6 pt-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">{PEOPLE_COPY.title}</h1>
        <div className="mt-5">
          <label htmlFor="people-search" className="sr-only">
            {PEOPLE_COPY.searchLabel}
          </label>
          <input
            id="people-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={PEOPLE_COPY.searchPlaceholder}
            maxLength={60}
            className="min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-base text-ink placeholder:text-muted/80 focus:border-canal focus:outline-none"
          />
        </div>
        <div className="mt-6">
          {state.status === "loading" && <Loading rows={4} />}
          {state.status === "error" && <ErrorState message={HOME_COPY.loadError} retry={reload} retryLabel={HOME_COPY.retry} />}
          {state.status === "ready" &&
            (state.data.length === 0 ? (
              <Empty message={debounced ? PEOPLE_COPY.noResults : PEOPLE_COPY.empty} />
            ) : (
              <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-card">
                {state.data.map((c) => (
                  <li key={c.id}>
                    <Link href={`/people/${c.id}`} className="flex min-h-16 items-center gap-3 px-3 py-3 hover:bg-wash">
                      <Avatar name={c.name} contactId={c.id} hasPhoto={c.has_photo} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg font-semibold text-ink">{c.name}</span>
                        <span className="block truncate text-sm text-muted">
                          {[c.headline, c.company, c.location].filter(Boolean).join(" · ") || c.last_context || " "}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-xs text-muted">
                        {c.last_met_on ? friendlyDate(c.last_met_on) : PEOPLE_COPY.never}
                        <span className="block">{c.meeting_count > 0 ? PEOPLE_COPY.metTimes(c.meeting_count) : ""}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </main>
    </>
  );
}
