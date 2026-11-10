import "server-only";
import { z } from "zod";

const schema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  APP_DB_KEY: z.string().min(32),
  APP_PASSWORD: z.string().min(8),
  SESSION_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  APP_PAUSED: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/**
 * Validated on first use (not at import) so `next build` can run without secrets.
 * A missing var throws loudly with every problem listed.
 */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  cached = parsed.data;
  return cached;
}
