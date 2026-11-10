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
