"use client";

import { useMemo } from "react";
import AppHeader from "@/components/AppHeader";
import CaptureFlow from "@/components/CaptureFlow";
import MeetingStub from "@/components/MeetingStub";
import { Empty, ErrorState, Loading } from "@/components/States";
import { useJson } from "@/components/useJson";
import { HOME_COPY } from "@/lib/constants";
import { friendlyDate, localIsoDate } from "@/lib/dates";
import type { MeetingWithContact } from "@/lib/types";

export default function HomePage() {
  const { state, reload } = useJson<MeetingWithContact[]>("/api/meetings?limit=60");
  const today = localIsoDate();

  const { todays, earlier } = useMemo(() => {
    const all = state.status === "ready" ? state.data : [];
    const todays = all.filter((m) => m.met_on === today);
    const groups = new Map<string, MeetingWithContact[]>();
    for (const m of all) {
      if (m.met_on === today) continue;
      const g = groups.get(m.met_on) ?? [];
      g.push(m);
      groups.set(m.met_on, g);
    }
    return { todays, earlier: Array.from(groups.entries()) };
  }, [state, today]);

  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 pb-6 pt-8">
        <CaptureFlow onSaved={reload} />

        <section aria-labelledby="today-title">
          <h2 id="today-title" className="mb-3 font-display text-xl font-semibold text-ink">
            {HOME_COPY.todayHeading}
          </h2>
          {state.status === "loading" && <Loading rows={1} />}
          {state.status === "error" && <ErrorState message={HOME_COPY.loadError} retry={reload} retryLabel={HOME_COPY.retry} />}
          {state.status === "ready" &&
            (todays.length === 0 ? (
              <Empty message={HOME_COPY.todayEmpty} />
            ) : (
              <ul className="flex flex-col gap-3">
                {todays.map((m) => (
                  <MeetingStub key={m.id} m={m} />
                ))}
              </ul>
            ))}
        </section>

        {state.status === "ready" && (
          <section aria-labelledby="recent-title">
            <h2 id="recent-title" className="mb-3 font-display text-xl font-semibold text-ink">
              {HOME_COPY.recentHeading}
            </h2>
            {earlier.length === 0 && todays.length === 0 ? (
              <Empty message={HOME_COPY.recentEmpty} />
            ) : (
              <div className="flex flex-col gap-6">
                {earlier.map(([date, ms]) => (
                  <div key={date}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{friendlyDate(date, today)}</h3>
                    <ul className="flex flex-col gap-3">
                      {ms.map((m) => (
                        <MeetingStub key={m.id} m={m} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
