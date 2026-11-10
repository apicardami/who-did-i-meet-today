-- Who Did I Meet Today? — initial schema.
--
-- Access model: the app server talks to Supabase over PostgREST with the publishable key.
-- That key alone grants nothing: every table has RLS, and the only policy requires the
-- request to carry an `x-app-key` header whose SHA-256 matches private.app_secret.
-- The header value (APP_DB_KEY) lives only in Vercel's server-side env, never in the browser.
-- The secret row itself is inserted out-of-band (never committed).

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_secret (
  id int primary key default 1 check (id = 1),
  key_hash text not null
);
revoke all on private.app_secret from public, anon, authenticated;

create or replace function private.app_key_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.app_secret s
    where s.key_hash = encode(
      extensions.digest(
        coalesce(current_setting('request.headers', true)::json ->> 'x-app-key', ''),
        'sha256'
      ),
      'hex'
    )
  );
$$;

grant usage on schema private to anon, authenticated;
revoke all on function private.app_key_ok() from public;
grant execute on function private.app_key_ok() to anon, authenticated;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  headline text check (char_length(headline) <= 200),
  company text check (char_length(company) <= 120),
  location text check (char_length(location) <= 120),
  notes text check (char_length(notes) <= 4000),
  tags text[] not null default '{}',
  linkedin_url text check (char_length(linkedin_url) <= 300),
  instagram_handle text check (char_length(instagram_handle) <= 60),
  whatsapp_phone text check (char_length(whatsapp_phone) <= 20),
  email text check (char_length(email) <= 200),
  website_url text check (char_length(website_url) <= 300),
  has_photo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  met_on date not null,
  context text check (char_length(context) <= 200),
  notes text check (char_length(notes) <= 4000),
  created_at timestamptz not null default now()
);
create index if not exists meetings_contact_idx on public.meetings (contact_id, met_on desc);
create index if not exists meetings_met_on_idx on public.meetings (met_on desc, created_at desc);

-- Photos live in their own table so list queries never drag image bytes along.
create table if not exists public.contact_photos (
  contact_id uuid primary key references public.contacts(id) on delete cascade,
  data_url text not null check (char_length(data_url) <= 1000000),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_touch on public.contacts;
create trigger contacts_touch before update on public.contacts
  for each row execute function public.touch_updated_at();

alter table public.contacts enable row level security;
alter table public.meetings enable row level security;
alter table public.contact_photos enable row level security;

drop policy if exists app_key_all on public.contacts;
create policy app_key_all on public.contacts for all to anon, authenticated
  using ((select private.app_key_ok())) with check ((select private.app_key_ok()));

drop policy if exists app_key_all on public.meetings;
create policy app_key_all on public.meetings for all to anon, authenticated
  using ((select private.app_key_ok())) with check ((select private.app_key_ok()));

drop policy if exists app_key_all on public.contact_photos;
create policy app_key_all on public.contact_photos for all to anon, authenticated
  using ((select private.app_key_ok())) with check ((select private.app_key_ok()));

-- Summary view for the people list. security_invoker so RLS still applies.
create or replace view public.contact_summaries with (security_invoker = true) as
select
  c.id, c.name, c.headline, c.company, c.location, c.tags,
  c.linkedin_url, c.instagram_handle, c.whatsapp_phone, c.has_photo, c.notes,
  c.created_at,
  (select max(m.met_on) from public.meetings m where m.contact_id = c.id) as last_met_on,
  (select count(*) from public.meetings m where m.contact_id = c.id)::int as meeting_count,
  (select m.context from public.meetings m where m.contact_id = c.id
     order by m.met_on desc, m.created_at desc limit 1) as last_context
from public.contacts c;

grant select, insert, update, delete on public.contacts, public.meetings, public.contact_photos to anon, authenticated;
grant select on public.contact_summaries to anon, authenticated;

-- Lets /api/health prove the app key is accepted (a wrong key would otherwise just see 0 rows).
create or replace function public.app_key_check()
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.app_key_ok();
$$;
revoke all on function public.app_key_check() from public;
grant execute on function public.app_key_check() to anon, authenticated;
