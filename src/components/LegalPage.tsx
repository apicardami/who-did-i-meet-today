import Link from "next/link";

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

export default function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:underline">
        ← Home
      </Link>
      <article className="mt-4 rounded-[14px] border border-line bg-card p-5 sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-muted">Last updated: {updated}</p>
        {sections.map((s) => (
          <section key={s.heading} className="mt-6">
            <h2 className="font-display text-xl font-semibold text-ink">{s.heading}</h2>
            <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-ink">{s.body}</div>
          </section>
        ))}
      </article>
    </main>
  );
}
