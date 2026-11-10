import "server-only";
import { classifyInput, nameFromLinkedInSlug } from "./links";
import { interpretInstagram, interpretLinkedIn, interpretWebsite, parseMeta, type ProfileGuess } from "./meta";
import { fetchImageAsDataUrl, safeFetch } from "./net";
import { logger, errorMessage } from "./logger";
import { ENRICH_COPY } from "./constants";
import type { EnrichResult } from "./types";

async function readPreview(url: string) {
  try {
    const r = await safeFetch(url, { maxBytes: 1_000_000, timeoutMs: 7000, accept: "text/html,application/xhtml+xml" });
    if (!r || !/html/i.test(r.contentType)) return null;
    return { meta: parseMeta(r.body.toString("utf8")), finalUrl: r.finalUrl };
  } catch (err) {
    logger.warn("preview fetch failed", { host: safeHost(url), error: errorMessage(err) });
    return null;
  }
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "invalid";
  }
}

function blank(source: EnrichResult["source"]): EnrichResult {
  return {
    source,
    status: "none",
    message: "",
    name: null,
    headline: null,
    company: null,
    location: null,
    linkedin_url: null,
    instagram_handle: null,
    whatsapp_phone: null,
    email: null,
    website_url: null,
    photo_data_url: null,
    matches: [],
  };
}

function apply(result: EnrichResult, g: ProfileGuess) {
  result.name = g.name ?? result.name;
  result.headline = g.headline ?? result.headline;
  result.company = g.company ?? result.company;
  result.location = g.location ?? result.location;
}

/** Best-effort: read whatever the link shares publicly. Never throws. */
export async function enrich(input: string): Promise<EnrichResult> {
  const c = classifyInput(input);

  switch (c.kind) {
    case "name": {
      const r = blank("name");
      r.name = c.name;
      r.status = "partial";
      r.message = ENRICH_COPY.name;
      return r;
    }
    case "email": {
      const r = blank("email");
      r.email = c.email;
      r.status = "partial";
      r.message = ENRICH_COPY.email;
      return r;
    }
    case "whatsapp": {
      const r = blank("whatsapp");
      r.whatsapp_phone = c.phone;
      r.status = "partial";
      r.message = ENRICH_COPY.whatsapp;
      return r;
    }
    case "linkedin": {
      const r = blank("linkedin");
      r.linkedin_url = c.url;
      r.name = nameFromLinkedInSlug(c.slug);
      const p = await readPreview(c.url);
      if (p) apply(r, interpretLinkedIn(p.meta));
      if (p?.meta.image && r.headline) r.photo_data_url = await fetchImageAsDataUrl(p.meta.image);
      r.status = r.headline ? "full" : r.name ? "partial" : "none";
      r.message = r.status === "full" ? ENRICH_COPY.found : ENRICH_COPY.linkedinBlocked;
      return r;
    }
    case "instagram": {
      const r = blank("instagram");
      r.instagram_handle = c.handle;
      const p = await readPreview(c.url);
      if (p) apply(r, interpretInstagram(p.meta, c.handle));
      if (p?.meta.image && r.name) r.photo_data_url = await fetchImageAsDataUrl(p.meta.image);
      r.status = r.name ? "full" : "partial";
      r.message = r.status === "full" ? ENRICH_COPY.found : ENRICH_COPY.instagramBlocked;
      return r;
    }
    case "website": {
      const r = blank("website");
      r.website_url = c.url;
      const p = await readPreview(c.url);
      if (p) {
        apply(r, interpretWebsite(p.meta));
        if (p.meta.image) {
          const img = new URL(p.meta.image, p.finalUrl).toString();
          r.photo_data_url = await fetchImageAsDataUrl(img);
        }
      }
      r.status = r.name || r.headline ? "full" : "none";
      r.message = r.status === "full" ? ENRICH_COPY.foundWebsite : ENRICH_COPY.nothing;
      return r;
    }
  }
}
