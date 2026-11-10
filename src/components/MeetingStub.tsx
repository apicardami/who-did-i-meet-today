import Link from "next/link";
import Avatar from "./Avatar";
import DateStamp from "./DateStamp";
import type { MeetingWithContact } from "@/lib/types";

export default function MeetingStub({ m }: { m: MeetingWithContact }) {
  const c = m.contacts;
  if (!c) return null;
  return (
    <li className="fade-in">
      <Link href={`/people/${c.id}`} className="stub flex min-h-24 items-center gap-4 p-3 pl-3 transition-colors hover:border-canal">
        <span className="flex w-16 justify-center">
          <DateStamp date={m.met_on} size="sm" />
        </span>
        <span className="ml-2 flex min-w-0 flex-1 items-center gap-3">
          <Avatar name={c.name} contactId={c.id} hasPhoto={c.has_photo} size={44} />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold text-ink">{c.name}</span>
            {(c.headline || c.company) && (
              <span className="block truncate text-sm text-muted">{[c.headline, c.company].filter(Boolean).join(" · ")}</span>
            )}
            {m.context && <span className="block truncate text-sm text-canal">{m.context}</span>}
          </span>
        </span>
      </Link>
    </li>
  );
}
