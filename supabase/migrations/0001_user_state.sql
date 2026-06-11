-- Philosophize cloud sync: one JSON snapshot row per user.
-- The app is local-first (Zustand + AsyncStorage); this table is the backup/sync
-- copy. `data` holds the whole persisted userDataStore blob.

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Signed-in users need base table privileges; the RLS policies below still
-- restrict each user to their own row. (Some Supabase projects don't auto-grant
-- these to the authenticated role, so we grant them explicitly. anon stays
-- locked out — only logged-in users sync.)
grant select, insert, update on public.user_state to authenticated;

alter table public.user_state enable row level security;

-- Each user can only read and write their own row.
drop policy if exists "user_state select own" on public.user_state;
create policy "user_state select own" on public.user_state
  for select using (auth.uid() = user_id);

drop policy if exists "user_state insert own" on public.user_state;
create policy "user_state insert own" on public.user_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_state update own" on public.user_state;
create policy "user_state update own" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
