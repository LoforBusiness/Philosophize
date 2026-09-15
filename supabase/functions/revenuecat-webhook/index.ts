// Supabase Edge Function: RevenueCat webhook → public.trial_reminders.
//
// Records every Google Play free trial of the Scholar's Pass, and what happens to
// it afterwards, so `trial-reminder-emails` can write to the reader a day before
// the trial converts into a paid month. It decides nothing itself: which events
// count, what each one does to a row, and how retries and out-of-order deliveries
// are absorbed are pure functions in ../_shared/trialReminder.ts, held by
// scripts/check-trial-email.mjs. This file is only the I/O.
//
// Deploy, in order:
//   1. Make a long random secret, e.g.
//        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//   2. supabase secrets set REVENUECAT_WEBHOOK_AUTH="Bearer <that secret>"
//      Only while testing with sandbox purchases:
//        supabase secrets set TRIAL_EMAIL_ALLOW_SANDBOX=true
//   3. supabase db push                  (public.trial_reminders — migration 0003)
//   4. supabase functions deploy revenuecat-webhook --no-verify-jwt
//      The flag, EVERY time. RevenueCat sends its own secret in Authorization, not
//      a Supabase JWT, so with verification on the gateway answers 401 before this
//      code runs, and RevenueCat stops retrying after five attempts.
//   5. RevenueCat dashboard → the project → Integrations → Webhooks → add a webhook:
//        URL                   https://wzixxsxkfrfgsggwollf.supabase.co/functions/v1/revenuecat-webhook
//        Authorization header  exactly the REVENUECAT_WEBHOOK_AUTH value, "Bearer <that secret>"
//        Environment           production and sandbox (sandbox trials are recorded
//                              and never emailed unless TRIAL_EMAIL_ALLOW_SANDBOX=true)
//        Events                all of them; anything irrelevant is answered 200 and ignored
//      "Send test event" should come back 200 with {"ignored":"test"}.
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
//
// Answers 200 for anything handled or ignored (RevenueCat counts only a 200 as
// delivered), 401 for a wrong Authorization header, 405 for anything but POST, and
// 500 only when the database write failed, which is the one case a retry can fix.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  authMatches,
  classifyEvent,
  customerIds,
  decide,
  eventOf,
  flagOn,
  type Action,
  type Options,
  type RcEvent,
  type TrialRow,
} from '../_shared/trialReminder.ts';

const TABLE = 'trial_reminders';

/** Times one row is re-read after losing a write to a concurrent delivery, before handing the retry back to RevenueCat. */
const ATTEMPTS = 4;

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
type Recorded = { customer: string | null; write: 'insert' | 'update' | 'none'; reason?: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const messageOf = (e: unknown): string =>
  e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : String(e);

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  if (!authMatches(req.headers.get('Authorization'), Deno.env.get('REVENUECAT_WEBHOOK_AUTH'))) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // A body that is not JSON will not become JSON on a retry.
    return json({ ok: true, ignored: 'malformed' });
  }

  const ev = eventOf(body);
  const action = classifyEvent(ev);
  if (!ev || action.kind === 'ignore') {
    return json({ ok: true, type: ev?.type ?? null, ignored: action.kind === 'ignore' ? action.reason : 'malformed' });
  }

  const admin = connect();
  const opts: Options = { allowSandbox: flagOn(Deno.env.get('TRIAL_EMAIL_ALLOW_SANDBOX')) };

  try {
    const results = await record(admin, ev, action, opts);
    console.log(JSON.stringify({ event: ev.id, type: ev.type, environment: ev.environment ?? null, results }));
    return json({ ok: true, type: ev.type, results });
  } catch (e) {
    console.error(JSON.stringify({ event: ev.id, type: ev.type, error: messageOf(e) }));
    return json({ error: 'could not record the event' }, 500);
  }
});

/**
 * Apply one event to every row it concerns. Rows are found by overlap on
 * `aliases`, because one customer is known to RevenueCat by several ids (an
 * anonymous one, then the Supabase UUID after `logIn`) and an event may name any
 * of them.
 */
async function record(
  admin: Admin,
  ev: RcEvent,
  action: Exclude<Action, { kind: 'ignore' }>,
  opts: Options,
): Promise<Recorded[]> {
  const ids = action.kind === 'transfer' ? action.from : customerIds(ev);
  let rows = await rowsFor(admin, ids);

  if (rows.length === 0) {
    const d = decide(null, ev, action, Date.now(), opts);
    if (d.write !== 'insert') {
      return [{ customer: null, write: 'none', reason: d.write === 'none' ? d.reason : 'unexpected' }];
    }
    const { data, error } = await admin
      .from(TABLE)
      .upsert(d.row, { onConflict: 'original_app_user_id', ignoreDuplicates: true })
      .select('original_app_user_id');
    if (error) throw error;
    if (data && data.length > 0) return [{ customer: d.row.original_app_user_id, write: 'insert' }];
    // A concurrent delivery for the same customer inserted first: apply this one on top of its row.
    rows = await rowsFor(admin, ids);
    if (rows.length === 0) throw new Error('insert conflicted but no row was found');
  }

  const results: Recorded[] = [];
  for (const row of rows) results.push(await updateRow(admin, row, ev, action, opts));
  return results;
}

/**
 * Write one row under an optimistic lock on `version`. If another delivery changed
 * the row between the read and the write, nothing is written, the row is read
 * again and the decision is made again against what is really there.
 */
async function updateRow(admin: Admin, first: TrialRow, ev: RcEvent, action: Action, opts: Options): Promise<Recorded> {
  let row: TrialRow | null = first;
  for (let attempt = 0; attempt < ATTEMPTS && row; attempt++) {
    const d = decide(row, ev, action, Date.now(), opts);
    if (d.write === 'none') return { customer: row.original_app_user_id, write: 'none', reason: d.reason };
    if (d.write !== 'update') return { customer: row.original_app_user_id, write: 'none', reason: 'unexpected' };

    const { data, error } = await admin
      .from(TABLE)
      .update({ ...d.patch, version: row.version + 1 })
      .eq('original_app_user_id', row.original_app_user_id)
      .eq('version', row.version)
      .select('original_app_user_id');
    if (error) throw error;
    if (data && data.length > 0) return { customer: row.original_app_user_id, write: 'update' };

    row = await rowByKey(admin, first.original_app_user_id);
  }
  if (!row) return { customer: first.original_app_user_id, write: 'none', reason: 'row_gone' };
  throw new Error(`row ${first.original_app_user_id} kept changing under event ${ev.id}`);
}

async function rowsFor(admin: Admin, ids: string[]): Promise<TrialRow[]> {
  if (ids.length === 0) return [];
  const { data, error } = await admin.from(TABLE).select('*').overlaps('aliases', ids);
  if (error) throw error;
  return (data ?? []) as TrialRow[];
}

async function rowByKey(admin: Admin, key: string): Promise<TrialRow | null> {
  const { data, error } = await admin.from(TABLE).select('*').eq('original_app_user_id', key).maybeSingle();
  if (error) throw error;
  return (data as TrialRow | null) ?? null;
}
