# How it works — Who Did I Meet Today?

Last updated: 2026-11-11 (v0.3.0)

## For the person using it
1. Open https://who-did-i-meet-today.vercel.app and sign in with the shared password (stays signed in 90 days). On a phone, Share → Add to Home Screen.
2. **Today** tab: type their full name, or paste a LinkedIn profile link, an Instagram @handle, a WhatsApp number, an email or any web link, then tap **Look them up**.
   - For a name, the app searches LinkedIn and Instagram and asks **Is it one of these?** Tap the right profile to fill in their details. People tied to Luis or Alberto Picardami are listed first. Add a company or city under **Narrow it down** if the list is off, or tap **None of these** to continue with just the name.
3. Check the card. Add a photo, where/how you met, notes and tags. The date defaults to today on your phone. Tap **Save to register**.
   - If the person is already saved, tap **Add today's meeting to …** instead of creating a duplicate.
4. **People** tab: search by name, company, place, notes or where you last met. Open someone to see every time you met, message them on WhatsApp, open their LinkedIn/Instagram, log another meeting, edit a meeting's date, place or notes, edit or delete the person.

What lookups can fill in: LinkedIn pages for individuals are usually blocked to apps, so expect a name from the link at most, and Instagram usually shares nothing (it requires a login). For a photo, use **From a screenshot**: screenshot their profile, choose it in the photo picker (or paste it), and the app finds the face and crops it. **Get photo from profile** on the person page tries the public link preview once and says if nothing came back. A WhatsApp number is saved for one-tap messaging.

## Under the hood
- Next.js 16 on Vercel; pages call the app's own `/api/*` routes.
- `src/proxy.ts` sends anyone without a session to `/login` (APIs get 401); every data route checks the session again.
- `/api/search-profiles` asks Claude (Anthropic API, web search tool restricted to linkedin.com and instagram.com) for a name and turns the search results into profile candidates. Only the typed name and hint are sent. Needs `ANTHROPIC_API_KEY`. Results are re-ranked so names in `SEARCH_NETWORK_HINT` and the region hint come first.
- `/api/photo/locate` sends a downsized screenshot to Claude (vision, forced tool call) only when the browser has no face detector; it returns a crop box and stores nothing. `/api/contacts/[id]/photo/fetch` makes one attempt at the contact's own LinkedIn/Instagram preview image.
- `/api/enrich` fetches the pasted page once (public IPs only, 3 redirects, 1MB, 7s) and reads its Open Graph tags; it never logs in to any site.
- Data lives in Supabase (`wdimt_contacts`, `wdimt_meetings`, `wdimt_contact_photos`, view `wdimt_contact_summaries`). The server talks to it over PostgREST; row-level security only lets requests through that carry the server-only app key.
- `/api/health` returns `{status: "ok", db: "connected"}` only when the database answers and accepts the app key.

## Operating it
- Change the password: Vercel → Settings → Environment Variables → `APP_PASSWORD`, then redeploy.
- Rotate the database key: set a new `APP_DB_KEY` in Vercel and update the SHA-256 in `wdimt_private.app_secret`, then redeploy.
- Pause: set `APP_PAUSED=true` and redeploy (see the forge's PAUSED_MODE_TEMPLATE.md).
- Deploys: the Vercel project is connected to Git (verified 2026-11-11). A push to `master` deploys production; every PR gets a preview build (previews need a Vercel login to view).
- Forge Gallery: every page load sends one anonymous visit beacon (a per-tab random ID and the app's slug, nothing else) to the forge's gallery. The login page says visitors can't sign in.
