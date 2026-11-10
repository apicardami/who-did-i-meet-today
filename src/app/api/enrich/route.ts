import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded } from "@/lib/api";
import { enrich } from "@/lib/enrich";
import { findMatches } from "@/lib/db";
import { logger, errorMessage } from "@/lib/logger";

export const maxDuration = 30;

const body = z.object({ input: z.string().trim().min(1, "Type a name or paste a link").max(500) });

export const POST = guarded(async (request: Request) => {
  const { input } = body.parse(await request.json());
  const result = await enrich(input);
  try {
    result.matches = await findMatches(result);
  } catch (err) {
    logger.warn("match lookup failed", { error: errorMessage(err) });
  }
  return NextResponse.json(result);
});
