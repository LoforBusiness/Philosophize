-- Philosophize Database Schema
-- Run this in your Supabase SQL editor or via `supabase db push`

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── profiles ───────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  daily_goal  integer not null default 1,
  timezone    text not null default 'UTC',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ─── user_xp ────────────────────────────────────────────────────────────────
create table public.user_xp (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  total_xp      integer not null default 0,
  current_level integer not null default 1,
  updated_at    timestamptz not null default now()
);

alter table public.user_xp enable row level security;
create policy "Users can manage own XP" on public.user_xp
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── user_streaks ────────────────────────────────────────────────────────────
create table public.user_streaks (
  user_id              uuid primary key references public.profiles(id) on delete cascade,
  current_streak       integer not null default 0,
  longest_streak       integer not null default 0,
  last_activity_date   date,
  streak_frozen_until  date,
  updated_at           timestamptz not null default now()
);

alter table public.user_streaks enable row level security;
create policy "Users can manage own streaks" on public.user_streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── user_lesson_progress ───────────────────────────────────────────────────
create table public.user_lesson_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  lesson_id        text not null,   -- matches Lesson.id in data/
  completed_at     timestamptz not null default now(),
  score            numeric(5,2) not null default 0,
  stars            integer not null default 0,
  xp_earned        integer not null default 0,
  time_spent_secs  integer not null default 0,
  attempt_number   integer not null default 1
);

create index user_lesson_progress_user_lesson on public.user_lesson_progress(user_id, lesson_id);
alter table public.user_lesson_progress enable row level security;
create policy "Users can manage own lesson progress" on public.user_lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── user_achievements ──────────────────────────────────────────────────────
create table public.user_achievements (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,   -- matches ACHIEVEMENTS[].id in constants/
  earned_at      timestamptz not null default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;
create policy "Users can manage own achievements" on public.user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Auto-create XP and streak rows on profile creation ─────────────────────
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_xp(user_id) values (new.id) on conflict do nothing;
  insert into public.user_streaks(user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();
