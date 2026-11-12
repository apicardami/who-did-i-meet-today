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

## Name search
`/api/search-profiles` uses Claude's server-side web search (`web_search_20260209`, `allowed_domains: linkedin.com, instagram.com`) to find profile candidates for a full name, then the picked profile goes through the normal enrichment. Env: `ANTHROPIC_API_KEY` (required for search), `ANTHROPIC_MODEL` (default `claude-opus-5-5`), `SEARCH_REGION_HINT` (default `Panama`), `SEARCH_NETWORK_HINT` (default `Luis Picardami, Alberto Picardami`; results tied to these names rank first).

## Enrichment, honestly
`/api/enrich` fetches the pasted page once (SSRF-guarded: public IPs only, 3 redirects max, 1MB cap,
7s timeout) and reads its Open Graph tags. LinkedIn and Instagram usually refuse anonymous
requests, so for those the app falls back to what's in the link itself (name from the LinkedIn slug,
the Instagram handle) plus manual entry and a photo. No scraping behind logins. The only AI is the name search above.

## Env
See `.env.example`. Required: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `APP_DB_KEY`,
`APP_PASSWORD`, `SESSION_SECRET`. Optional: `ANTHROPIC_API_KEY` (name search; `ANTHROPIC_MODEL` and
`SEARCH_REGION_HINT` tune it), `RESEND_API_KEY` + `ADMIN_EMAIL` (paused-mode signup email), `APP_PAUSED`.
All are set on Vercel for Production, Preview and Development (an env change needs a redeploy).

## Ops
Vercel is git-linked: a push to `master` deploys production and every PR gets a preview (previews need a
Vercel login). An UptimeRobot keyword monitor watches `/api/health` for `"db":"connected"`. The app is
listed in Forge Gallery as a private app and sends one anonymous visit beacon per page load.

## Dev
```
npm install
npm run dev        # needs .env.local
npm test && npm run lint && npm run typecheck && npm run build
```

`GET /api/health` → `{ status: "ok", db: "connected" }` only when the DB answers *and* accepts the app key.
