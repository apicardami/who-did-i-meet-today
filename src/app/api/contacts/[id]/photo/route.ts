import { guarded, jsonError } from "@/lib/api";
import { getPhoto } from "@/lib/db";
import { uuid } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = guarded(async (_req: Request, ctx: Ctx) => {
  const id = uuid.safeParse((await ctx.params).id);
  if (!id.success) return jsonError("Not found", 404);
  const dataUrl = await getPhoto(id.data);
  const m = dataUrl?.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!m || !m[1] || !m[2]) return jsonError("Not found", 404);
  return new Response(Buffer.from(m[2], "base64"), {
    headers: {
      "Content-Type": m[1],
      "Cache-Control": "private, max-age=300",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
});
