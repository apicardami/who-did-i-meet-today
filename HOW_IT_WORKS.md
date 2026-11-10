# How it works — Who Did I Meet Today?

Last updated: 2026-11-10

## For the person using it
1. Open https://who-did-i-meet-today.vercel.app and sign in with the shared password (stays signed in 90 days). On a phone, Share → Add to Home Screen.
2. **Today** tab: type a name, or paste a LinkedIn profile link, an Instagram @handle, a WhatsApp number, an email or any web link, then tap **Look them up**.
3. Check the card. Add a photo, where/how you met, notes and tags. The date defaults to today on your phone. Tap **Save to register**.
   - If the person is already saved, tap **Add today's meeting to …** instead of creating a duplicate.
4. **People** tab: search by name, company, place, notes or where you last met. Open someone to see every time you met, message them on WhatsApp, open their LinkedIn/Instagram, log another meeting, edit or delete.

What lookups can fill in: LinkedIn usually shares name, headline and photo. Instagram usually shares nothing (it requires a login), so take a photo instead. A WhatsApp number is saved for one-tap messaging.

## Under the hood
- Next.js 16 on Vercel; pages call the app's own `/api/*` routes.
- `src/proxy.ts` sends anyone without a session to `/login` (APIs get 401); every data route checks the session again.
- `/api/enrich` fetches the pasted page once (public IPs only, 3 redirects, 1MB, 7s) and reads its Open Graph tags; it never logs in to any site.
- Data lives in Supabase (`wdimt_contacts`, `wdimt_meetings`, `wdimt_contact_photos`, view `wdimt_contact_summaries`). The server talks to it over PostgREST; row-level security only lets requests through that carry the server-only app key.
- `/api/health` returns `{status: "ok", db: "connected"}` only when the database answers and accepts the app key.

## Operating it
- Change the password: Vercel → Settings → Environment Variables → `APP_PASSWORD`, then redeploy.
- Rotate the database key: set a new `APP_DB_KEY` in Vercel and update the SHA-256 in `wdimt_private.app_secret`, then redeploy.
- Pause: set `APP_PAUSED=true` and redeploy (see the forge's PAUSED_MODE_TEMPLATE.md).
- Deploys: the Vercel project is not yet connected to Git, so pushes don't auto-deploy. Connect it in Vercel → Settings → Git, or deploy from the forge session.
