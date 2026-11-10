# Who Did I Meet Today?

A private, phone-first personal CRM: paste a LinkedIn / Instagram / WhatsApp link (or just type a
name), the app reads whatever the link shares publicly, you add where you met, and it's in your
register — with a full "when did we meet" history per person.

Built by Beto Forge (RUN-20261110-001).

## Stack
- Next.js 16 App Router + Tailwind 4, TypeScript strict
- Supabase Postgres, accessed over PostgREST from the server only. Every table has RLS; the only
  policy requires an `x-app-key` header whose SHA-256 matches `private.app_secret`
  (see `supabase/migrations/001_init.sql`). The publishable key alone can read nothing.
- iron-session shared-password login (`APP_PASSWORD`), enforced in `src/proxy.ts` and again in
  every data route.
- Photos are resized on-device to ≤480px JPEG and stored in `contact_photos` (deleted with the person).

## Enrichment, honestly
`/api/enrich` fetches the pasted page once (SSRF-guarded: public IPs only, 3 redirects max, 1MB cap,
7s timeout) and reads its Open Graph tags. LinkedIn and Instagram usually refuse anonymous
requests, so for those the app falls back to what's in the link itself (name from the LinkedIn slug,
the Instagram handle) plus manual entry and a photo. No scraping behind logins, no AI.

## Env
See `.env.example`. Required: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `APP_DB_KEY`,
`APP_PASSWORD`, `SESSION_SECRET`. Optional: `RESEND_API_KEY`, `ADMIN_EMAIL`, `APP_PAUSED`.

## Dev
```
npm install
npm run dev        # needs .env.local
npm test && npm run lint && npm run typecheck && npm run build
```

`GET /api/health` → `{ status: "ok", db: "connected" }` only when the DB answers *and* accepts the app key.
