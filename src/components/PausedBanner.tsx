"use client";

import { useEffect, useState } from "react";
import {
  PAUSED_BANNER_MESSAGE,
  PAUSED_BANNER_CTA,
  PAUSED_BANNER_PLACEHOLDER,
  PAUSED_BANNER_SUBMIT,
  PAUSED_BANNER_SUCCESS,
  PAUSED_BANNER_ERROR,
  PAUSED_BANNER_DISMISS_LABEL,
} from "@/lib/constants";

const DISMISS_KEY = "betoforge-paused-banner-dismissed";

type FormState = "idle" | "loading" | "success" | "error";

export default function PausedBanner() {
  const [paused, setPaused] = useState(false);
  // Lazy initializer instead of setState-in-effect (react-hooks v7 flags the latter). Safe for
  // hydration: the banner renders null until /api/paused-status answers on the client anyway.
  const [dismissed, setDismissed] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/paused-status")
      .then((res) => (res.ok ? res.json() : { paused: false }))
      .then((data) => {
        if (!cancelled) setPaused(Boolean(data?.paused));
      })
      .catch(() => {
        if (!cancelled) setPaused(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!paused || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — session-only convenience, not required to persist
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        width: "100%",
        padding: "12px 16px",
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "14px",
        lineHeight: 1.4,
        boxSizing: "border-box",
      }}
    >
      <span>
        {PAUSED_BANNER_MESSAGE} <strong>{PAUSED_BANNER_CTA}</strong>
      </span>

      {formState === "success" ? (
        <span style={{ color: "#fbbf24", fontWeight: 600 }}>{PAUSED_BANNER_SUCCESS}</span>
      ) : (
        <form
          onSubmit={submit}
          style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}
        >
          <label htmlFor="paused-banner-email" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
            Email address
          </label>
          <input
            id="paused-banner-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={PAUSED_BANNER_PLACEHOLDER}
            style={{
              minHeight: "44px",
              padding: "0 12px",
              borderRadius: "6px",
              border: "1px solid #4b5563",
              backgroundColor: "#111827",
              color: "#f9fafb",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            disabled={formState === "loading"}
            style={{
              minHeight: "44px",
              minWidth: "44px",
              padding: "0 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#f59e0b",
              color: "#1f2937",
              fontWeight: 600,
              cursor: formState === "loading" ? "not-allowed" : "pointer",
              opacity: formState === "loading" ? 0.7 : 1,
            }}
          >
            {formState === "loading" ? "…" : PAUSED_BANNER_SUBMIT}
          </button>
          {formState === "error" && (
            <span style={{ color: "#fca5a5" }}>{PAUSED_BANNER_ERROR}</span>
          )}
        </form>
      )}

      <button
        type="button"
        onClick={dismiss}
        aria-label={PAUSED_BANNER_DISMISS_LABEL}
        style={{
          minHeight: "44px",
          minWidth: "44px",
          background: "transparent",
          border: "none",
          color: "#9ca3af",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}
