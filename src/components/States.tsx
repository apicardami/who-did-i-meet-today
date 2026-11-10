export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <ul aria-busy="true" aria-label="Loading" className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="h-24 animate-pulse rounded-[14px] border border-line bg-card motion-reduce:animate-none" />
      ))}
    </ul>
  );
}

export function ErrorState({ message, retry, retryLabel }: { message: string; retry: () => void; retryLabel: string }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/40 bg-card p-4 text-sm text-ink">
      <p>{message}</p>
      <button type="button" onClick={retry} className="mt-2 min-h-11 font-semibold text-canal underline underline-offset-4">
        {retryLabel}
      </button>
    </div>
  );
}

export function Empty({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{message}</p>;
}
