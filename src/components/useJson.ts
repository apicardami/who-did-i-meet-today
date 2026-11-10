"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type LoadState<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T } | { status: "missing" };

/** Fetch JSON from our own API with loading/error states and a 401 → /login redirect. */
export function useJson<T>(url: string | null) {
  const router = useRouter();
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal, cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.status === 404) {
          setState({ status: "missing" });
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        setState({ status: "ready", data: (await res.json()) as T });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ status: "error" });
      });
    return () => ctrl.abort();
  }, [url, nonce, router]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { state, reload };
}
