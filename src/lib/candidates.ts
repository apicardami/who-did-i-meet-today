/** Pure: turn web-search result blocks into LinkedIn / Instagram profile candidates. No SDK, no network. */
import { classifyInput } from "./links";
import { interpretInstagram, interpretLinkedIn } from "./meta";

export interface ProfileCandidate {
  source: "linkedin" | "instagram";
  url: string;
  handle: string | null;
  name: string | null;
  headline: string | null;
}

interface SearchResultLike {
  type?: unknown;
  url?: unknown;
  title?: unknown;
}

const MAX_CANDIDATES = 10;

/** Walks response content blocks; only `web_search_tool_result` blocks whose content is a list are read. */
export function extractCandidates(blocks: readonly unknown[]): ProfileCandidate[] {
  const out: ProfileCandidate[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const b = block as { type?: unknown; content?: unknown };
    if (b.type !== "web_search_tool_result" || !Array.isArray(b.content)) continue;

    for (const item of b.content as SearchResultLike[]) {
      if (item?.type !== "web_search_result" || typeof item.url !== "string") continue;
      const title = typeof item.title === "string" ? item.title : null;
      const c = classifyInput(item.url);

      if (c.kind === "linkedin") {
        if (seen.has(c.url)) continue;
        seen.add(c.url);
        const g = interpretLinkedIn({ title, description: null, image: null });
        out.push({
          source: "linkedin",
          url: c.url,
          handle: null,
          name: g.name,
          headline: [g.headline, g.company].filter(Boolean).join(" · ") || null,
        });
      } else if (c.kind === "instagram") {
        if (seen.has(c.url)) continue;
        seen.add(c.url);
        const g = interpretInstagram({ title, description: null, image: null }, c.handle);
        out.push({ source: "instagram", url: c.url, handle: c.handle, name: g.name, headline: null });
      }
      if (out.length >= MAX_CANDIDATES) return out;
    }
  }
  return out;
}

/** Keep only characters a person's name can reasonably contain; caps length. */
export function cleanSearchName(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{M}\s'.,-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

const squash = (v: string): string =>
  v
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/**
 * Pure: stable re-rank so candidates tied to the user's own circle come first. `network` terms (e.g. a surname
 * or "Luis Picardami") weigh more than `region` terms (e.g. "Panama"). Matching ignores case, accents, spaces
 * and hyphens, so "Picard-ami" and "picardami" are the same. Candidates with no match keep their order.
 */
export function rankCandidates(
  candidates: readonly ProfileCandidate[],
  network: readonly string[],
  region: readonly string[] = [],
): ProfileCandidate[] {
  const net = network.map(squash).filter((t) => t.length >= 3);
  const reg = region.map(squash).filter((t) => t.length >= 3);
  const score = (c: ProfileCandidate): number => {
    const hay = squash([c.name, c.headline, c.handle, c.url].filter(Boolean).join(" "));
    return net.filter((t) => hay.includes(t)).length * 3 + reg.filter((t) => hay.includes(t)).length;
  };
  return candidates
    .map((c, i) => ({ c, i, s: score(c) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.c);
}

/** Splits a comma-separated env/config list into trimmed, non-empty terms. */
export function parseTerms(raw: string | undefined | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
