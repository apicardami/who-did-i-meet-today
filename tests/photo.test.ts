import { describe, expect, it } from "vitest";
import { cropSquare, parseFaceBox } from "@/lib/faceCrop";
import { dataUrlBytes, isPlaceholderUrl, isUsablePhoto } from "@/lib/photoQuality";

const big = `data:image/jpeg;base64,${"A".repeat(4000)}`;
const tiny = `data:image/jpeg;base64,${"A".repeat(200)}`;

describe("photoQuality", () => {
  it("flags logos, silhouettes and ghosts by URL", () => {
    expect(isPlaceholderUrl("https://media.licdn.com/dms/image/v2/X/company-logo_200_200/0/1.png")).toBe(true);
    expect(isPlaceholderUrl("https://static.licdn.com/sc/h/ghost-person.png")).toBe(true);
    expect(isPlaceholderUrl("https://x.com/default_profile_400x400.png")).toBe(true);
    expect(isPlaceholderUrl("https://media.licdn.com/dms/image/v2/D4E03AQ/profile-displayphoto-shrink_800_800/0/1.jpg")).toBe(false);
  });

  it("measures decoded bytes", () => {
    expect(dataUrlBytes("data:image/png;base64,QUJD")).toBe(3);
    expect(dataUrlBytes("data:image/png;base64,QUI=")).toBe(2);
  });

  it("rejects placeholders and tiny images, accepts a real-sized photo", () => {
    expect(isUsablePhoto("https://x.com/a.jpg", big)).toBe(true);
    expect(isUsablePhoto("https://x.com/a.jpg", tiny)).toBe(false);
    expect(isUsablePhoto("https://x.com/company-logo.jpg", big)).toBe(false);
  });
});

describe("parseFaceBox", () => {
  it("accepts a valid box and rejects bad shapes", () => {
    expect(parseFaceBox({ found: true, box: { x: 0.1, y: 0.2, w: 0.3, h: 0.3 } })).toEqual({ x: 0.1, y: 0.2, w: 0.3, h: 0.3 });
    expect(parseFaceBox({ found: false })).toBeNull();
    expect(parseFaceBox({ found: true, box: { x: 2, y: 0, w: 0.3, h: 0.3 } })).toBeNull();
    expect(parseFaceBox({ found: true, box: { x: 0.1, y: 0.1, w: 0, h: 0.3 } })).toBeNull();
    expect(parseFaceBox({ found: true })).toBeNull();
    expect(parseFaceBox(null)).toBeNull();
    expect(parseFaceBox("nope")).toBeNull();
  });
});

describe("cropSquare", () => {
  it("centers on the box with padding", () => {
    const r = cropSquare({ x: 0.4, y: 0.4, w: 0.2, h: 0.2 }, 1000, 1000, 0.25);
    expect(r.size).toBeCloseTo(300);
    expect(r.sx).toBeCloseTo(350);
    expect(r.sy).toBeCloseTo(350);
  });

  it("slides back inside the image at the edges", () => {
    const r = cropSquare({ x: 0, y: 0, w: 0.2, h: 0.2 }, 1000, 1000, 0.25);
    expect(r.sx).toBe(0);
    expect(r.sy).toBe(0);
    const far = cropSquare({ x: 0.9, y: 0.9, w: 0.1, h: 0.1 }, 1000, 1000, 0.25);
    expect(far.sx + far.size).toBeLessThanOrEqual(1000);
    expect(far.sy + far.size).toBeLessThanOrEqual(1000);
  });

  it("never exceeds the shorter image side", () => {
    const r = cropSquare({ x: 0.1, y: 0.1, w: 0.9, h: 0.9 }, 800, 400, 0.25);
    expect(r.size).toBeLessThanOrEqual(400);
    expect(r.sy).toBeGreaterThanOrEqual(0);
  });
});
