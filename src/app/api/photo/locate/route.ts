import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, jsonError } from "@/lib/api";
import { locateFace, LocateNotConfiguredError } from "@/lib/faceLocate";
import { logger, errorMessage } from "@/lib/logger";

export const maxDuration = 30;

const JPEG_RE = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/;
const body = z.object({ image_data_url: z.string().max(1_500_000).regex(JPEG_RE, "Invalid image") });

/** Finds the face box in a screenshot. The image is used for this one call and never stored. */
export const POST = guarded(async (request: Request) => {
  const parsed = body.parse(await request.json());
  const data = JPEG_RE.exec(parsed.image_data_url)?.[1];
  if (!data) return jsonError("Invalid image", 400);
  try {
    return NextResponse.json({ box: await locateFace(data) });
  } catch (err) {
    if (err instanceof LocateNotConfiguredError) return NextResponse.json({ error: "not_configured" }, { status: 503 });
    logger.error("face locate failed", { error: errorMessage(err) });
    return jsonError("Couldn't read that screenshot", 502);
  }
});
