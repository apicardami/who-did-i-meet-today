import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAuthed } from "./session";
import { DbError } from "./db";
import { logger, errorMessage } from "./logger";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Wraps a data route: auth check (defense in depth behind proxy.ts) + uniform error mapping. */
export function guarded<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      if (!(await isAuthed())) return jsonError("Not signed in", 401);
      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return jsonError(err.issues[0]?.message ?? "Invalid input", 400);
      }
      if (err instanceof SyntaxError) return jsonError("Invalid JSON", 400);
      logger.error("route failed", { error: errorMessage(err), status: err instanceof DbError ? err.status : 500 });
      return jsonError("Something went wrong", 500);
    }
  };
}
