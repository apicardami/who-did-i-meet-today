/** Pure HTML-metadata parsing for link previews. No network here. */

export interface PageMeta {
  title: string | null;
  description: string | null;
  image: string | null;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
};

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => safeFromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => safeFromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z#0-9]+);/gi, (m, n: string) => ENTITIES[n.toLowerCase()] ?? m);
}

function safeFromCodePoint(cp: number): string {
  try {
    return String.fromCodePoint(cp);
  } catch {
    return "";
  }
}

function clean(s: string | null | undefined, max = 300): string | null {
  if (!s) return null;
  const out = decodeEntities(s).replace(/\s+/g, " ").trim();
  return out ? out.slice(0, max) : null;
}

function metaContent(html: string, key: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const attr = (name: string) => {
      const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
      return m ? (m[2] ?? m[3] ?? null) : null;
    };
    const k = (attr("property") ?? attr("name") ?? "").toLowerCase();
    if (k === key) return attr("content");
  }
  return null;
}

export function parseMeta(html: string): PageMeta {
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null;
  return {
    title: clean(metaContent(html, "og:title") ?? metaContent(html, "twitter:title") ?? titleTag),
    description: clean(
      metaContent(html, "og:description") ?? metaContent(html, "twitter:description") ?? metaContent(html, "description"),
      600,
    ),
    image: clean(metaContent(html, "og:image") ?? metaContent(html, "twitter:image"), 2000),
  };
}

export interface ProfileGuess {
  name: string | null;
  headline: string | null;
  company: string | null;
  location: string | null;
}

/** "Juan Pérez - Product Manager - Copa Airlines | LinkedIn" */
export function interpretLinkedIn(meta: PageMeta): ProfileGuess {
  const guess: ProfileGuess = { name: null, headline: null, company: null, location: null };
  if (meta.title && !/sign up|log in|linkedin: log/i.test(meta.title)) {
    const base = meta.title.replace(/\s*[|–-]\s*LinkedIn\s*$/i, "").trim();
    const parts = base.split(/\s+[-–]\s+/).map((p) => p.trim()).filter(Boolean);
    guess.name = parts[0] ?? null;
    if (parts.length >= 3) {
      guess.headline = parts.slice(1, -1).join(" – ");
      guess.company = parts[parts.length - 1] ?? null;
    } else if (parts.length === 2) {
      guess.headline = parts[1] ?? null;
    }
  }
  const loc = meta.description?.match(/Location:\s*([^·|]+)/i)?.[1]?.trim();
  if (loc) guess.location = loc.slice(0, 120);
  const exp = meta.description?.match(/Experience:\s*([^·|]+)/i)?.[1]?.trim();
  if (exp && !guess.company) guess.company = exp.slice(0, 120);
  return guess;
}

/** "Juan Pérez (@juanp) • Instagram photos and videos" */
export function interpretInstagram(meta: PageMeta, handle: string): ProfileGuess {
  const guess: ProfileGuess = { name: null, headline: null, company: null, location: null };
  const t = meta.title ?? "";
  const m = t.match(/^(.*?)\s*\(@([^)]+)\)/);
  if (m && m[1] && m[1].trim() && m[2]?.toLowerCase() === handle.toLowerCase()) {
    guess.name = m[1].trim();
  }
  const followers = meta.description?.match(/^([\d.,]+[KkMm]?)\s+Followers/i)?.[1];
  const bio = meta.description?.match(/on Instagram:\s*"([\s\S]+)"\s*$/i)?.[1];
  if (bio) guess.headline = clean(bio, 200);
  else if (followers) guess.headline = `${followers} followers on Instagram`;
  return guess;
}

/** Generic site: "Jane Doe | Designer" → name-ish title, description as headline. */
export function interpretWebsite(meta: PageMeta): ProfileGuess {
  const title = meta.title?.split(/\s+[|–—]\s+/)[0]?.trim() ?? null;
  return {
    name: title ? title.slice(0, 120) : null,
    headline: meta.description ? meta.description.slice(0, 200) : null,
    company: null,
    location: null,
  };
}
