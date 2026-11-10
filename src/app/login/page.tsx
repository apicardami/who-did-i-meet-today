"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_COPY } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) {
        setError(LOGIN_COPY.wrong);
        return;
      }
      if (!res.ok) throw new Error("login failed");
      router.replace("/");
      router.refresh();
    } catch {
      setError(LOGIN_COPY.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="stub p-6 pl-24">
        <span className="stamp absolute left-4 top-6 inline-flex h-14 w-14 items-center justify-center font-display text-2xl font-bold">?</span>
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink">{LOGIN_COPY.title}</h1>
        <p className="mt-2 text-sm text-muted">{LOGIN_COPY.subtitle}</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            {LOGIN_COPY.password}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-12 rounded-xl border-2 border-line bg-card px-4 text-base text-ink focus:border-canal focus:outline-none"
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy || !password} className="min-h-12 rounded-xl bg-canal px-6 font-semibold text-canal-ink disabled:opacity-60">
            {busy ? LOGIN_COPY.submitting : LOGIN_COPY.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
