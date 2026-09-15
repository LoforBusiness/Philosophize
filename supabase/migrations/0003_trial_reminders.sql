-- Ashmere: "your free trial ends in 24 hours" emails.
--
-- The Scholar's Pass monthly subscription carries a Google Play free trial that
-- CONVERTS to a paid month unless the reader cancels. This table is the server's
-- record of those trials, written only by the `revenuecat-webhook` Edge Function,
-- and read hourly by `trial-reminder-emails`, which emails each reader once, a day
-- before their trial ends. The decisions both make live in
-- supabase/functions/_shared/trialReminder.ts; scripts/check-trial-email.mjs
-- holds them, and holds this file to the columns and filters they assume.
--
-- Run with `supabase db push` (or paste into the SQL editor). Safe to re-run.
--
-- BEFORE THE SCHEDULE CAN DO ANYTHING, two Vault secrets must exist. Their NAMES
-- are the contract; their values are never committed. In the SQL editor, once:
--
--   select vault.create_secret('https://wzixxsxkfrfgsggwollf.supabase.co', 'project_url');
--   select vault.create_secret('<the TRIAL_CRON_SECRET set on the functions>', 'trial_cron_secret');
--
-- Until both exist the hourly job runs and sends nothing (see its WHERE clause).

-- ─── The table ───────────────────────────────────────────────────────────────

create table if not exists public.trial_reminders (
  -- RevenueCat's original_app_user_id: stable for a customer even after the app
  -- calls logIn(<supabase uuid>). Every id the customer is known by is in aliases,
  -- this one included, and rows are found by overlap on that array.
  original_app_user_id text primary key,
  app_user_id          text,                        -- last seen
  aliases              text[] not null default '{}',
  product_id           text,                        -- e.g. philosophize_scholars_pass_monthly:monthly
  environment          text,                        -- PRODUCTION | SANDBOX
  trial_ends_at        timestamptz not null,        -- the event's expiration_at_ms
  price_label          text,                        -- subscriber attribute pass_price, e.g. "$6.99"
  cancelled_at         timestamptz,                 -- auto-renew off: no charge, no email
  resolved_at          timestamptz,                 -- no longer a trial that converts: no email
  resolved_reason      text,                        -- converted | renewed | purchased | product_changed | refunded | expired | transferred
  reminder_sent_at     timestamptz,
  skipped_reason       text,                        -- sandbox | no_account | no_email: never retried
  last_event_id        text,                        -- RevenueCat retries reuse the id: a repeat is a no-op
  last_event_at        timestamptz,                 -- an event older than this is stale and ignored
  version              integer not null default 1,  -- optimistic lock for concurrent deliveries
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Service role only. It holds who is on a trial and when they will be charged,
-- which no reader needs to see, so there are no policies at all: with RLS forced
-- and nothing granted, anon and authenticated can read and write nothing. The
-- service role bypasses RLS, which is how both functions reach it.
revoke all on table public.trial_reminders from public, anon, authenticated;
grant select, insert, update, delete on table public.trial_reminders to service_role;

alter table public.trial_reminders enable row level security;
alter table public.trial_reminders force row level security;

-- The hourly query: open rows by end time. Partial, so it stays the size of the
-- trials still waiting rather than of every trial ever started.
create index if not exists trial_reminders_due_idx
  on public.trial_reminders (trial_ends_at)
  where reminder_sent_at is null
    and cancelled_at is null
    and resolved_at is null
    and skipped_reason is null;

-- The webhook's lookup: rows whose aliases overlap the ids on an event.
create index if not exists trial_reminders_aliases_idx
  on public.trial_reminders using gin (aliases);

-- ─── The hourly schedule ─────────────────────────────────────────────────────
--
-- Supabase's documented pattern ("Scheduling Edge Functions"): pg_cron fires,
-- pg_net POSTs, and the URL and secret are read from Vault at run time so neither
-- is in this file. `trial-reminder-emails` is deployed with --no-verify-jwt and
-- checks `Authorization: Bearer <TRIAL_CRON_SECRET>` itself.
--
-- Minute 17 rather than 0 keeps it off the top of the hour, where every other
-- scheduled job on the platform lands. Scheduling a name that already exists
-- overwrites that job, which is what makes this migration re-runnable.

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'trial-reminder-emails',
  '17 * * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/trial-reminder-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'trial_cron_secret')
    ),
    body := jsonb_build_object('source', 'pg_cron', 'at', now()),
    timeout_milliseconds := 60000
  ) as request_id
  where exists (select 1 from vault.decrypted_secrets where name = 'project_url')
    and exists (select 1 from vault.decrypted_secrets where name = 'trial_cron_secret');
  $job$
);

-- To stop it:        select cron.unschedule('trial-reminder-emails');
-- To see its runs:   select * from cron.job_run_details
--                    where jobid = (select jobid from cron.job where jobname = 'trial-reminder-emails')
--                    order by start_time desc limit 20;
-- Its HTTP replies:  select * from net._http_response order by created desc limit 20;
