import Link from "next/link";
import { FOOTER_COPYRIGHT, NAV } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-2xl px-4 py-8 text-center text-xs text-muted">
      <nav aria-label="Legal" className="mb-2 flex justify-center gap-4">
        <Link href="/privacy" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
          {NAV.privacy}
        </Link>
        <Link href="/terms" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
          {NAV.terms}
        </Link>
      </nav>
      <p>{FOOTER_COPYRIGHT}</p>
    </footer>
  );
}
