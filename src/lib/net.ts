import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/** Pure: is this IP literal in a private / loopback / link-local / reserved range? */
export function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a = 0, b = 0] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  if (v === 6) {
    const s = ip.toLowerCase();
    if (s === "::" || s === "::1") return true;
    if (s.startsWith("fc") || s.startsWith("fd") || s.startsWith("fe8") || s.startsWith("fe9") || s.startsWith("fea") || s.startsWith("feb")) return true;
    const mapped = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) return isPrivateIp(mapped[1]);
    return false;
  }
  return true;
}

async function assertPublicHost(url: URL): Promise<void> {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http(s) links are supported");
  if (url.username || url.password) throw new Error("Links with credentials are not supported");
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("Non-standard ports are not supported");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("Private host");
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error("Private address");
    return;
  }
  const addrs = await lookup(host, { all: true });
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) throw new Error("Private address");
}

const USER_AGENT = "Mozilla/5.0 (compatible; WhoDidIMeetToday/1.0; +link-preview)";

/**
 * Fetch a public URL with SSRF protection: DNS checked on every hop, manual redirects (max 3),
 * hard timeout, and a byte cap. Returns null on any non-2xx.
 */
export async function safeFetch(
  rawUrl: string,
  opts: { maxBytes: number; timeoutMs: number; accept: string },
): Promise<{ body: Buffer; contentType: string; finalUrl: string } | null> {
  let url = new URL(rawUrl);
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicHost(url);
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(opts.timeoutMs),
      headers: { "User-Agent": USER_AGENT, Accept: opts.accept, "Accept-Language": "en,es;q=0.8" },
      cache: "no-store",
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return null;
      url = new URL(loc, url);
      continue;
    }
    if (!res.ok || !res.body) return null;
    const len = Number(res.headers.get("content-length") ?? "0");
    if (len > opts.maxBytes) return null;

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > opts.maxBytes) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    return {
      body: Buffer.concat(chunks),
      contentType: res.headers.get("content-type") ?? "",
      finalUrl: url.toString(),
    };
  }
  return null;
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export const MAX_PHOTO_BYTES = 600_000;

/** Download a remote image into a data URL (so expiring CDN links don't break later). */
export async function fetchImageAsDataUrl(rawUrl: string): Promise<string | null> {
  try {
    const r = await safeFetch(rawUrl, { maxBytes: MAX_PHOTO_BYTES, timeoutMs: 6000, accept: "image/*" });
    if (!r || r.body.byteLength === 0 || r.body.byteLength >= MAX_PHOTO_BYTES) return null;
    const type = r.contentType.split(";")[0]?.trim().toLowerCase() ?? "";
    if (!IMAGE_TYPES.has(type)) return null;
    return `data:${type};base64,${r.body.toString("base64")}`;
  } catch {
    return null;
  }
}
