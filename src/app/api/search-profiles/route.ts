import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, jsonError } from "@/lib/api";
import { cleanSearchName } from "@/lib/candidates";
import { searchProfiles, SearchNotConfiguredError } from "@/lib/profileSearch";
import { logger, errorMessage } from "@/lib/logger";

export const maxDuration = 60;

const body = z.object({
  name: z.string().trim().min(2, "Type a full name").max(120),
  hint: z.string().trim().max(120).optional().nullable(),
});

export const POST = guarded(async (request: Request) => {
  const parsed = body.parse(await request.json());
  const name = cleanSearchName(parsed.name);
  if (name.length < 2) return jsonError("Type a full name", 400);
  const hint = parsed.hint ? cleanSearchName(parsed.hint) || null : null;

  try {
    const candidates = await searchProfiles(name, hint);
    return NextResponse.json({ candidates });
  } catch (err) {
    if (err instanceof SearchNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    logger.error("profile search failed", { error: errorMessage(err) });
    return jsonError("Search failed", 502);
  }
});
