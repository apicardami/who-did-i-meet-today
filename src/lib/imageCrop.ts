"use client";

import { cropSquare, parseFaceBox, type FaceBox } from "./faceCrop";

const LOCATE_EDGE = 1024;
const AVATAR_EDGE = 480;

interface DetectedFace {
  boundingBox: { x: number; y: number; width: number; height: number };
}
interface FaceDetectorLike {
  detect(image: ImageBitmap): Promise<DetectedFace[]>;
}
type FaceDetectorCtor = new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorLike;

function canvasOf(bitmap: ImageBitmap, maxEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Largest face found by the browser's built-in detector (Chrome/Android), or null when unsupported or none found. */
async function detectLocally(bitmap: ImageBitmap): Promise<FaceBox | null> {
  const Ctor = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
  if (!Ctor) return null;
  try {
    const faces = await new Ctor({ fastMode: true, maxDetectedFaces: 5 }).detect(bitmap);
    const best = [...faces].sort((a, b) => b.boundingBox.width * b.boundingBox.height - a.boundingBox.width * a.boundingBox.height)[0];
    if (!best) return null;
    const { x, y, width, height } = best.boundingBox;
    return parseFaceBox({ found: true, box: { x: x / bitmap.width, y: y / bitmap.height, w: width / bitmap.width, h: height / bitmap.height } });
  } catch {
    return null;
  }
}

async function locateRemotely(canvas: HTMLCanvasElement): Promise<FaceBox | null> {
  const res = await fetch("/api/photo/locate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_data_url: canvas.toDataURL("image/jpeg", 0.8) }),
  });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as { box?: unknown };
  return parseFaceBox({ found: data.box != null, box: data.box });
}

/** Screenshot in, face-centered square JPEG data URL out (null when no face was found). */
export async function cropFaceFromImage(file: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    const box = (await detectLocally(bitmap)) ?? (await locateRemotely(canvasOf(bitmap, LOCATE_EDGE)));
    if (!box) return null;
    const { sx, sy, size } = cropSquare(box, bitmap.width, bitmap.height);
    const out = document.createElement("canvas");
    out.width = out.height = Math.min(AVATAR_EDGE, Math.round(size));
    const ctx = out.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, out.width, out.height);
    return out.toDataURL("image/jpeg", 0.85);
  } finally {
    bitmap.close();
  }
}
