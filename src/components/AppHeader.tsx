"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { APP_SHORT, NAV } from "@/lib/constants";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // fall through — the redirect below re-checks auth anyway
    }
    router.replace("/login");
    router.refresh();
  };

  const tab = (href: string, label: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors sm:px-4 ${
          active ? "bg-canal text-canal-ink" : "text-ink hover:bg-wash"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2">
        <Link href="/" aria-label={APP_SHORT} className="flex min-h-11 items-center gap-2 whitespace-nowrap font-display text-base font-semibold tracking-tight text-canal sm:text-lg">
          <span aria-hidden="true" className="stamp inline-flex h-8 w-8 items-center justify-center text-base">?</span>
          <span className="hidden min-[400px]:inline">
            {APP_SHORT}
            <span className="text-mola">?</span>
          </span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-0.5">
          {tab("/", NAV.today)}
          {tab("/people", NAV.people)}
          <button
            type="button"
            onClick={logout}
            disabled={busy}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-2 text-sm text-muted hover:bg-wash disabled:opacity-60"
          >
            {NAV.logout}
          </button>
        </nav>
      </div>
    </header>
  );
}
