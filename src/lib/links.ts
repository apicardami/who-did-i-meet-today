import type { EnrichSource } from "./types";

export type ClassifiedInput =
  | { kind: "linkedin"; url: string; slug: string }
  | { kind: "instagram"; handle: string; url: string }
  | { kind: "whatsapp"; phone: string }
  | { kind: "email"; email: string }
  | { kind: "website"; url: string }
  | { kind: "name"; name: string };

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_RESERVED = new Set(["p", "reel", "reels", "stories", "explore", "accounts", "tv", "direct"]);

/** Keep only digits; keep a leading + if present. Returns null if it doesn't look like a phone. */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  return `+${digits}`;
}

function looksLikePhone(raw: string): boolean {
  return /^\+?[\d\s().-]{7,20}$/.test(raw.trim());
}

function toUrl(raw: string): URL | null {
  const s = raw.trim();
  const withScheme = /^https?:\/\//i.test(s) ? s : /^[\w-]+(\.[\w-]+)+(\/|$)/.test(s) ? `https://${s}` : null;
  if (!withScheme) return null;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u;
  } catch {
    return null;
  }
}

export function classifyInput(raw: string): ClassifiedInput {
  const s = raw.trim();

  if (s.startsWith("@") && HANDLE_RE.test(s.slice(1))) {
    const handle = s.slice(1).toLowerCase();
    return { kind: "instagram", handle, url: `https://www.instagram.com/${handle}/` };
  }

  if (EMAIL_RE.test(s) && !s.includes("/")) {
    return { kind: "email", email: s.toLowerCase() };
  }

  if (looksLikePhone(s)) {
    const phone = normalizePhone(s);
    if (phone) return { kind: "whatsapp", phone };
  }

  const url = toUrl(s);
  if (url) {
    const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
    const parts = url.pathname.split("/").filter(Boolean);

    if (host.endsWith("linkedin.com") && parts[0] === "in" && parts[1]) {
      const slug = decodeURIComponent(parts[1]).toLowerCase();
      return { kind: "linkedin", slug, url: `https://www.linkedin.com/in/${encodeURIComponent(slug)}/` };
    }

    if ((host === "instagram.com" || host === "instagr.am") && parts[0] && !INSTAGRAM_RESERVED.has(parts[0])) {
      const handle = parts[0].toLowerCase();
      if (HANDLE_RE.test(handle)) return { kind: "instagram", handle, url: `https://www.instagram.com/${handle}/` };
    }

    if (host === "wa.me" && parts[0]) {
      const phone = normalizePhone(parts[0]);
      if (phone) return { kind: "whatsapp", phone };
    }
    if (host.endsWith("whatsapp.com")) {
      const p = url.searchParams.get("phone");
      const phone = p ? normalizePhone(p) : null;
      if (phone) return { kind: "whatsapp", phone };
    }

    return { kind: "website", url: url.toString() };
  }

  return { kind: "name", name: s.replace(/\s+/g, " ").slice(0, 120) };
}

export function sourceOf(c: ClassifiedInput): EnrichSource {
  return c.kind;
}

/** "juan-perez-castillo-4a1b2c3" → "Juan Perez Castillo" */
export function nameFromLinkedInSlug(slug: string): string | null {
  const words = slug
    .split("-")
    .filter(Boolean)
    .filter((w) => !/\d/.test(w));
  if (words.length === 0) return null;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function instagramLink(handle: string): string {
  return `https://www.instagram.com/${handle}/`;
}

/** Only allow http(s) links to be rendered as hrefs. */
export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
