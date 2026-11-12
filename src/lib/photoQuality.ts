/** Pure: reject images that are clearly not a person's photo (silhouettes, logos, tracking pixels). */

const MIN_BYTES = 2_000;
const PLACEHOLDER_URL =
  /company-logo|school-logo|default[-_]?(profile|avatar|user)|ghost|silhouette|empty[-_]?(profile|photo)|no[-_]?(photo|image|avatar)|favicon|sprite|\/logo[-_./]/i;

export function isPlaceholderUrl(url: string): boolean {
  return PLACEHOLDER_URL.test(url);
}

/** Decoded size of a base64 data URL, in bytes. */
export function dataUrlBytes(dataUrl: string): number {
  const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const pad = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - pad);
}

export function isUsablePhoto(url: string, dataUrl: string): boolean {
  return !isPlaceholderUrl(url) && dataUrlBytes(dataUrl) >= MIN_BYTES;
}
