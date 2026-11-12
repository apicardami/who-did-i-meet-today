import "server-only";
import { readPreview } from "./enrich";
import { classifyInput } from "./links";
import { fetchImageAsDataUrl } from "./net";
import { isUsablePhoto } from "./photoQuality";

/**
 * Best-effort: read the public preview of the contact's own LinkedIn / Instagram link and return its
 * image as a data URL. One fetch per link, only the page the user linked; never throws.
 */
export async function fetchProfilePhoto(links: { linkedin_url: string | null; instagram_handle: string | null }): Promise<string | null> {
  const targets = [links.linkedin_url, links.instagram_handle ? `https://www.instagram.com/${links.instagram_handle}/` : null].filter(
    (u): u is string => Boolean(u),
  );
  for (const target of targets) {
    const c = classifyInput(target);
    if (c.kind !== "linkedin" && c.kind !== "instagram") continue;
    const p = await readPreview(c.url);
    if (!p?.meta.image) continue;
    try {
      const imageUrl = new URL(p.meta.image, p.finalUrl).toString();
      const dataUrl = await fetchImageAsDataUrl(imageUrl);
      if (dataUrl && isUsablePhoto(imageUrl, dataUrl)) return dataUrl;
    } catch {
      continue;
    }
  }
  return null;
}
