-- Philosophize security hardening. Safe to run on top of 0001/001.
-- Run in the Supabase SQL editor or `supabase db push`.

-- 1) Let a user delete their own cloud snapshot (right-to-erasure). Without this
--    the in-app "Delete account" can wipe local data but never the cloud row.
grant delete on public.user_state to authenticated;

drop policy if exists "user_state delete own" on public.user_state;
create policy "user_state delete own" on public.user_state
  for delete using (auth.uid() = user_id);

-- 2) Force RLS so even the table owner obeys the policies (defense in depth).
alter table public.user_state force row level security;

-- 3) Harden the SECURITY DEFINER trigger: pin an empty search_path so it can't be
--    hijacked by a malicious schema on the caller's search_path, and fully
--    schema-qualify the writes. (No-op unless the 001 relational schema is used.)
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_xp(user_id) values (new.id) on conflict do nothing;
  insert into public.user_streaks(user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
