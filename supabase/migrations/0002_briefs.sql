-- Get Shit Done — daily brief cache
-- One row per calendar day; shared by all users (it's world news, not personal).
-- The `daily-brief` Edge Function writes rows with the service role; users read.

create table if not exists public.daily_briefs (
  id           uuid primary key default gen_random_uuid(),
  brief_date   date not null unique,
  items        jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

alter table public.daily_briefs enable row level security;

-- Any signed-in user may read the brief.
drop policy if exists "briefs_read" on public.daily_briefs;
create policy "briefs_read" on public.daily_briefs
  for select to authenticated using (true);

-- No insert/update/delete policies: only the Edge Function (service role,
-- which bypasses RLS) may write, so the brief can't be tampered with client-side.
