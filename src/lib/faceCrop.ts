import { z } from "zod";

/** A face / profile-photo box, each value a fraction (0..1) of the image's width or height. */
export interface FaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const unit = z.number().min(0).max(1);
const faceBoxSchema = z.object({ x: unit, y: unit, w: unit.refine((v) => v > 0.02), h: unit.refine((v) => v > 0.02) });

/** Pure: validate whatever the model returned; anything off (or `found: false`) becomes null. */
export function parseFaceBox(input: unknown): FaceBox | null {
  if (!input || typeof input !== "object") return null;
  const o = input as { found?: unknown; box?: unknown };
  if (o.found === false) return null;
  const r = faceBoxSchema.safeParse(o.box);
  return r.success ? r.data : null;
}

/**
 * Pure: the square (in source pixels) to crop for an avatar. Centered on the box, sized to the larger side
 * plus `padding` on each side, then slid back inside the image so it never reads outside it.
 */
export function cropSquare(box: FaceBox, imgW: number, imgH: number, padding = 0.25): { sx: number; sy: number; size: number } {
  const bw = box.w * imgW;
  const bh = box.h * imgH;
  const cx = (box.x + box.w / 2) * imgW;
  const cy = (box.y + box.h / 2) * imgH;
  const size = Math.max(1, Math.min(Math.max(bw, bh) * (1 + padding * 2), imgW, imgH));
  const sx = Math.min(Math.max(0, cx - size / 2), imgW - size);
  const sy = Math.min(Math.max(0, cy - size / 2), imgH - size);
  return { sx, sy, size };
}
