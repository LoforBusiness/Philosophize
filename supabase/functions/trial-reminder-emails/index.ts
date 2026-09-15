// Supabase Edge Function: the day-before email for a Google Play free trial.
//
// Called hourly by pg_cron (migration 0003_trial_reminders.sql). Finds every
// Scholar's Pass trial that ends in the next 24 to 25 hours and has not been
// cancelled, closed, skipped or already reminded, looks the reader's email up in
// Supabase Auth, and sends one email through Resend. Which rows are due and every
// word of the email are pure functions in ../_shared/trialReminder.ts, held by
// scripts/check-trial-email.mjs. This file is only the I/O.
//
// Deploy, in order:
//   1. Make a long random secret, e.g.
//        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//   2. supabase secrets set TRIAL_CRON_SECRET=<that secret>
//      supabase secrets set RESEND_API_KEY=re_...
//      supabase secrets set TRIAL_EMAIL_FROM="Ashmere <reminders@your-verified-domain>"
//        (the sending domain must be verified in Resend)
//      Only while testing with sandbox purchases:
//        supabase secrets set TRIAL_EMAIL_ALLOW_SANDBOX=true
//   3. In the SQL editor, once. The NAMES are the contract; the values stay out of git:
//        select vault.create_secret('https://wzixxsxkfrfgsggwollf.supabase.co', 'project_url');
//        select vault.create_secret('<the same TRIAL_CRON_SECRET>', 'trial_cron_secret');
//   4. supabase db push                  (the table and the hourly job — migration 0003)
//   5. supabase functions deploy trial-reminder-emails --no-verify-jwt
//      The flag, every time: the cron authenticates with a shared secret, not a JWT.
//   6. Try it by hand. It sends only what is actually due, so an empty run is normal:
//        curl -X POST -H "Authorization: Bearer <TRIAL_CRON_SECRET>" https://wzixxsxkfrfgsggwollf.supabase.co/functions/v1/trial-reminder-emails
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
//
// ONE EMAIL PER TRIAL. `reminder_sent_at` is written only after Resend accepts the
// email, and every send carries an Idempotency-Key, so a run that sends and then
// fails to record it does not send twice. A reader with no Supabase account (only a
// `$RCAnonymousID`) or no email on the account is marked in `skipped_reason` and
// never looked up again. A lookup or a send that fails for any other reason leaves
// the row due, and the next hour tries again while at least an hour is left.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  SEND_BATCH,
  accountIds,
  authMatches,
  dueWindow,
  flagOn,
  idempotencyKey,
  isDue,
  msOf,
  reminderEmail,
  sendOutcome,
  type Options,
  type TrialRow,
} from '../_shared/trialReminder.ts';

const TABLE = 'trial_reminders';
const RESEND_URL = 'https://api.resend.com/emails';

/** Stop starting new sends after this. pg_net waits 60s for the reply, and anything left is still due next hour. */
const BUDGET_MS = 40_000;

/**
 * The service-role client. Its type is taken from a real call, because
 * `ReturnType<typeof createClient>` is the generic's defaults, whose schema is
 * `never`, and every write against that fails to type.
 */
const connect = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
type Admin = ReturnType<typeof connect>;
type Found = { userId: string; email: string } | 'none' | 'failed';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  const secret = (Deno.env.get('TRIAL_CRON_SECRET') ?? '').trim();
  if (!secret || !authMatches(req.headers.get('Authorization'), `Bearer ${secret}`)) {
    return json({ error: 'unauthorized' }, 401);
  }

  const resendKey = (Deno.env.get('RESEND_API_KEY') ?? '').trim();
  const from = (Deno.env.get('TRIAL_EMAIL_FROM') ?? '').trim();
  if (!resendKey || !from) return json({ error: 'RESEND_API_KEY and TRIAL_EMAIL_FROM must be set' }, 500);

  const started = Date.now();
  const opts: Options = { allowSandbox: flagOn(Deno.env.get('TRIAL_EMAIL_ALLOW_SANDBOX')) };
  const admin = connect();

  // A pre-filter for `isDue`, which is the rule; it keeps the batch to rows that can pass it.
  const { fromMs, toMs } = dueWindow(started);
  let query = admin
    .from(TABLE)
    .select('*')
    .is('reminder_sent_at', null)
    .is('cancelled_at', null)
    .is('resolved_at', null)
    .is('skipped_reason', null)
    .gte('trial_ends_at', new Date(fromMs).toISOString())
    .lte('trial_ends_at', new Date(toMs).toISOString());
  if (!opts.allowSandbox) query = query.or('environment.is.null,environment.neq.SANDBOX');
  const { data, error } = await query.order('trial_ends_at', { ascending: true }).limit(SEND_BATCH);
  if (error) return json({ error: 'query failed', detail: error.message }, 500);

  const tally = { due: 0, sent: 0, no_account: 0, no_email: 0, lookup_failed: 0, send_failed: 0, deferred: 0 };
  let stopped = false;

  for (const row of (data ?? []) as TrialRow[]) {
    if (!isDue(row, started, opts)) continue;
    tally.due++;
    if (stopped || Date.now() - started > BUDGET_MS) {
      tally.deferred++;
      continue;
    }

    const ids = accountIds(row);
    if (ids.length === 0) {
      await markSkipped(admin, row, 'no_account');
      tally.no_account++;
      continue;
    }

    const found = await findEmail(admin, ids);
    if (found === 'failed') {
      tally.lookup_failed++;
      continue;
    }
    if (found === 'none') {
      await markSkipped(admin, row, 'no_email');
      tally.no_email++;
      continue;
    }

    const endMs = msOf(row.trial_ends_at) as number; // isDue has already parsed it
    const mail = reminderEmail({
      priceLabel: row.price_label,
      productId: row.product_id,
      trialEndsAtMs: endMs,
      nowMs: Date.now(),
    });

    let status = 0;
    let name: string | null = null;
    try {
      const res = await fetch(RESEND_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey(found.userId, endMs),
        },
        body: JSON.stringify({ from, to: [found.email], subject: mail.subject, text: mail.text, html: mail.html }),
      });
      status = res.status;
      if (!res.ok) name = await errorName(res);
      else await res.body?.cancel();
    } catch (e) {
      name = e instanceof Error ? e.message : String(e);
    }

    const outcome = sendOutcome(status, name);
    if (outcome === 'sent') {
      await markSent(admin, row);
      tally.sent++;
    } else {
      tally.send_failed++;
      console.error(JSON.stringify({ customer: row.original_app_user_id, status, error: name }));
      if (outcome === 'stop') stopped = true;
    }
  }

  const result = {
    ok: true,
    window: { from: new Date(fromMs).toISOString(), to: new Date(toMs).toISOString() },
    sandbox: opts.allowSandbox,
    ...tally,
  };
  console.log(JSON.stringify(result));
  return json(result);
});

/**
 * The first id, most recent first, whose Supabase user has an email. A missing
 * user is an answer ('none'); any other failure is not, and leaves the row for the
 * next run rather than marking a reader as unreachable because of a blip.
 */
async function findEmail(admin: Admin, ids: string[]): Promise<Found> {
  let failed = false;
  for (const id of ids) {
    try {
      const { data, error } = await admin.auth.admin.getUserById(id);
      const email = data?.user?.email?.trim();
      if (email) return { userId: id, email };
      if (error && error.status !== 404 && error.code !== 'user_not_found') failed = true;
    } catch {
      failed = true;
    }
  }
  return failed ? 'failed' : 'none';
}

/** Resend's error name (`rate_limit_exceeded`, `invalid_idempotent_request`, …), if the body carries one. */
async function errorName(res: Response): Promise<string | null> {
  try {
    const body = (await res.json()) as { name?: unknown; error?: { name?: unknown } } | null;
    const name = body?.name ?? body?.error?.name;
    return typeof name === 'string' ? name : null;
  } catch {
    return null;
  }
}

/** Only for the trial end the email was about: an end the webhook has since moved stays due. */
async function markSent(admin: Admin, row: TrialRow): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await admin
    .from(TABLE)
    .update({ reminder_sent_at: now, updated_at: now })
    .eq('original_app_user_id', row.original_app_user_id)
    .eq('trial_ends_at', row.trial_ends_at)
    .is('reminder_sent_at', null);
  if (error) {
    console.error(JSON.stringify({ customer: row.original_app_user_id, error: `sent but not recorded: ${error.message}` }));
  }
}

async function markSkipped(admin: Admin, row: TrialRow, reason: 'no_account' | 'no_email'): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await admin
    .from(TABLE)
    .update({ skipped_reason: reason, updated_at: now })
    .eq('original_app_user_id', row.original_app_user_id)
    .is('skipped_reason', null);
  if (error) console.error(JSON.stringify({ customer: row.original_app_user_id, error: `skip not recorded: ${error.message}` }));
}
