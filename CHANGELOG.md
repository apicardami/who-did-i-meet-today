# Changelog

## v0.3.0 — 2026-11-11
### Added
- Edit meeting entries (date, where/how, notes) from the person page (`PATCH /api/meetings/[id]`).
- Name search prefers people tied to Luis / Alberto Picardami: prompt hint plus a stable re-rank (network names weigh 3x region). Tune with `SEARCH_NETWORK_HINT` (default `Luis Picardami, Alberto Picardami`).
- Profile photos: **Get photo from profile** button (one attempt at the contact's own public link preview, placeholders and tiny images rejected, never overwrites without confirmation, one automatic attempt when a link is added to a contact with no photo) and **From a screenshot** in the photo picker (file or paste; browser face detector first, else Claude vision locates the face; square crop with preview; the screenshot is never stored).
- Privacy page describes the screenshot step.
### Known limits
- LinkedIn answers automated requests for person pages with HTTP 999 (measured 5 of 5 existing contacts, 2026-11-11), so the auto-fetch gets nothing for LinkedIn people. The screenshot flow is the way in for them. Instagram was not tested.
- Decided not to pursue automated LinkedIn photo capture: no crawler-UA spoofing, scraping vendors, or server-side headless browser (against LinkedIn's terms and blocked anyway). A Chrome extension sending the photo from a page you are viewing was considered and parked.

## v0.2.1 — 2026-11-11
### Added
- Forge Gallery visit beacon (session-scoped, no personal data) and a one-line private-tool notice on the login page.
### Fixed
- `package.json` version now matches the changelog (was 0.1.0).
- HOW_IT_WORKS no longer says the project isn't connected to Git.
- README: env list now covers the Anthropic and Resend variables, no longer says "no AI", and has an Ops section (Git deploys, uptime monitor, gallery).
- Name search is switched on (`ANTHROPIC_API_KEY` set on Vercel) and verified live.

## v0.2.0 — 2026-11-10
### Added
- Name search: type a full name and the app searches LinkedIn and Instagram (Claude web search, limited to linkedin.com and instagram.com) and shows "Is it one of these?". Tapping a profile pre-fills the card; "Narrow it down" adds a company or city; "None of these" continues with just the name.
- Privacy and terms updated: names typed into search are sent to Anthropic.
- Needs `ANTHROPIC_API_KEY` on Vercel; optional `ANTHROPIC_MODEL` (default `claude-opus-5-5`) and `SEARCH_REGION_HINT` (default `Panama`). Without the key, search says it isn't switched on and the rest of the app works as before.

## v0.1.1 — 2026-11-10
### Improved
- CI actions bumped to `actions/checkout@v7` and `actions/setup-node@v7`; ESLint 10.
- Dependabot ignores TypeScript and `@types/node` major versions (TypeScript 7 fails the build; runtime is Node 22).

## v0.1.0 — 2026-11-10
### Added
- Capture flow: one box for a name, LinkedIn URL, Instagram @handle/URL, WhatsApp number/wa.me link, email or any URL; public link-preview enrichment (SSRF-guarded); duplicate detection with "add today's meeting to <person>".
- "Met today" + dated timeline, searchable People list, person page with one-tap links, meeting history, edit, hard delete (incl. photo).
- On-device photo resize (≤480px JPEG) stored in `wdimt_contact_photos`.
- Shared-password login (iron-session), RLS app-key database access, `/api/health`, `/privacy`, `/terms`, paused-mode banner + interest route, BetoLabs footer.
