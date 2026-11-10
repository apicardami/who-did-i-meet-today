import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-20 text-center">
      <p className="font-display text-5xl font-semibold text-mola">404</p>
      <p className="mt-2 text-ink">That page isn&apos;t in the register.</p>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center text-canal underline underline-offset-4">
        Back to today
      </Link>
    </main>
  );
}
