// ─────────────────────────────────────────────────────────────────────────────
// THE TRIAL REMINDER'S DECISIONS AND ITS WORDS, AND NOTHING ELSE.
//
// Two Edge Functions act on this file — `revenuecat-webhook` records what
// RevenueCat says happened to a trial, `trial-reminder-emails` writes to the
// reader a day before it converts — and neither decides anything itself. Every
// rule lives here: which events matter, what each one does to a row, which rows
// are due, what the email says.
//
// NO IMPORTS IN THIS FILE, the same rule `rig.ts`, `tone.ts` and
// `lib/utils/trial.ts` state and for the same reason: `scripts/check-trial-email.mjs`
// loads it in plain Node and re-derives every decision and every sentence. An
// email about money that is written in one place and checked against another is
// an email nobody has actually checked. `now` is always passed in, never read.
//
// THIS IS THE ONE PLACE A PERSON IS TOLD THEY ARE ABOUT TO BE CHARGED, so the
// copy is held to what CLAUDE.md §14 holds the paywall to: nothing it says may be
// untrue on the day it arrives. That is why it never prints a clock time (the
// server does not know the reader's timezone), never prints a price it was not
// given, and says "about N hours" rather than "24 hours" if a late run means the
// day has already shrunk.
// ─────────────────────────────────────────────────────────────────────────────

/** Restated from app.json and constants/subscription.ts; check-trial-email holds all three together. */
export const PACKAGE_NAME = 'com.philosophize.app';
export const ENTITLEMENT_ID = 'scholars_pass';
export const APP_NAME = 'Ashmere';
export const PASS_NAME = 'Scholar’s Pass';

export const HOUR_MS = 60 * 60 * 1000;

/** THE single statement of "a day before". Both functions import it; neither restates it. */
export const REMINDER_BEFORE_MS = 24 * 60 * 60 * 1000;

/**
 * How often the cron fires (hourly, in 0003_trial_reminders.sql). The due window
 * is one period wide past REMINDER_BEFORE_MS, so every trial is picked up by
 * exactly one run that lands between 24 and 25 hours before it ends.
 */
export const CRON_PERIOD_MS = HOUR_MS;

/**
 * Never write "your trial ends soon" with less than this left. A reminder that
 * arrives after the charge is worse than none, and an hour is the least a reader
 * can reasonably act on.
 */
export const LAST_CALL_MS = HOUR_MS;

/** Rows one run will look at. A run that finds more leaves them for the next hour, still inside the window. */
export const SEND_BATCH = 50;

export const PLAY_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';

// ─── THE SHAPES ──────────────────────────────────────────────────────────────

/** A subscriber attribute as RevenueCat delivers it: `{ value, updated_at_ms }`. */
export type RcAttribute = { value?: unknown; updated_at_ms?: number | null };

/**
 * The `event` object of a RevenueCat webhook body (`{ api_version, event }`).
 * Only the fields this file reads; everything is optional because a webhook is
 * input from outside and is treated as such.
 */
export type RcEvent = {
  id?: string | null;
  type?: string | null;
  event_timestamp_ms?: number | null;
  app_user_id?: string | null;
  original_app_user_id?: string | null;
  aliases?: string[] | null;
  product_id?: string | null;
  new_product_id?: string | null;
  entitlement_ids?: string[] | null;
  entitlement_id?: string | null;
  period_type?: string | null;
  expiration_at_ms?: number | null;
  environment?: string | null;
  store?: string | null;
  cancel_reason?: string | null;
  is_trial_conversion?: boolean | null;
  subscriber_attributes?: Record<string, RcAttribute> | null;
  transferred_from?: string[] | null;
  transferred_to?: string[] | null;
};

/** One row of `public.trial_reminders`. Timestamps are ISO strings, as PostgREST returns them. */
export type TrialRow = {
  original_app_user_id: string;
  app_user_id: string | null;
  aliases: string[];
  product_id: string | null;
  environment: string | null;
  trial_ends_at: string;
  price_label: string | null;
  cancelled_at: string | null;
  resolved_at: string | null;
  resolved_reason: string | null;
  reminder_sent_at: string | null;
  skipped_reason: string | null;
  last_event_id: string | null;
  last_event_at: string | null;
  version: number;
  updated_at: string;
};

/** Why a trial will not be emailed about: it stopped being a trial that converts. */
export type ResolvedReason =
  | 'purchased'
  | 'converted'
  | 'renewed'
  | 'product_changed'
  | 'refunded'
  | 'expired'
  | 'transferred';

export type Action =
  | { kind: 'ignore'; reason: string }
  /** `fresh` is a trial beginning; not fresh is the same trial moved (SUBSCRIPTION_EXTENDED). */
  | { kind: 'start'; fresh: boolean }
  | { kind: 'cancel' }
  | { kind: 'uncancel' }
  | { kind: 'resolve'; reason: ResolvedReason }
  | { kind: 'transfer'; from: string[] };

export type Decision =
  | { write: 'none'; reason: string }
  | { write: 'insert'; row: TrialRow }
  | { write: 'update'; patch: Partial<TrialRow> };

export type Options = { allowSandbox: boolean };

// ─── SMALL, SHARP HELPERS ────────────────────────────────────────────────────

const iso = (ms: number): string => new Date(ms).toISOString();

/** An ISO timestamp as ms, or null for anything that is not one. */
export function msOf(value: string | null | undefined): number | null {
  if (typeof value !== 'string') return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

/**
 * RevenueCat app user ids, restricted to characters that are safe unquoted in a
 * Postgres array literal. The webhook looks rows up with PostgREST's `ov.{…}`,
 * which postgrest-js writes without quoting, so an id carrying `{ } , " \` or
 * whitespace could widen the filter. Real ids here are auth UUIDs and
 * `$RCAnonymousID:<hex>`, both of which pass.
 */
const SAFE_ID = /^[A-Za-z0-9$:_.@+-]{1,128}$/;

export function safeId(v: unknown): string | null {
  return typeof v === 'string' && SAFE_ID.test(v) ? v : null;
}

export function safeIds(list: unknown): string[] {
  const out: string[] = [];
  if (!Array.isArray(list)) return out;
  for (const v of list) {
    const id = safeId(v);
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

function mergeIds(a: readonly string[] | null | undefined, b: readonly string[]): string[] {
  return safeIds([...(a ?? []), ...b]);
}

/**
 * The key a customer's row is filed under: `original_app_user_id`, "the first App
 * User ID used by the subscriber", which does not change when the app later calls
 * `logIn(<uuid>)`. `app_user_id` is only "last seen", and keying on it would let a
 * CANCELLATION sent under the account id miss a trial recorded under the
 * anonymous one — and email somebody who had already cancelled.
 */
export function customerKey(ev: RcEvent): string | null {
  return safeId(ev.original_app_user_id) ?? safeId(ev.app_user_id);
}

/** Every id the event knows this customer by. A row stores them all in `aliases`, its own key included. */
export function customerIds(ev: RcEvent): string[] {
  return safeIds([ev.original_app_user_id, ev.app_user_id, ...(ev.aliases ?? [])]);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The ids worth asking Supabase Auth about, most recent first. The app logs
 * RevenueCat in with the Supabase user's UUID, so a reader with an account has
 * one; `$RCAnonymousID:…` readers have none and are never looked up.
 */
export function accountIds(row: Pick<TrialRow, 'app_user_id' | 'original_app_user_id' | 'aliases'>): string[] {
  const out: string[] = [];
  for (const id of [row.app_user_id, row.original_app_user_id, ...(row.aliases ?? [])]) {
    if (typeof id !== 'string' || !UUID.test(id)) continue;
    const v = id.toLowerCase();
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

/** The webhook body's `event`, or null. */
export function eventOf(body: unknown): RcEvent | null {
  if (!body || typeof body !== 'object') return null;
  const ev = (body as { event?: unknown }).event;
  return ev && typeof ev === 'object' ? (ev as RcEvent) : null;
}

/** An env flag is on only when it says exactly "true". Unset, empty or anything else is off. */
export function flagOn(value: string | null | undefined): boolean {
  return (value ?? '').trim().toLowerCase() === 'true';
}

/**
 * A shared-secret compare that does not return early on the first differing
 * character. Fails CLOSED: no configured secret means nobody is let in, so a
 * function deployed before its secret is set is locked rather than open.
 */
export function authMatches(given: string | null | undefined, expected: string | null | undefined): boolean {
  const a = (given ?? '').trim();
  const b = (expected ?? '').trim();
  if (!a || !b) return false;
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= a.charCodeAt(i % a.length) ^ b.charCodeAt(i % b.length);
  return diff === 0;
}

function endMs(ev: RcEvent): number | null {
  const v = ev.expiration_at_ms;
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null;
}

function eventMs(ev: RcEvent, fallback: number): number {
  const v = ev.event_timestamp_ms;
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback;
}

function carriesPass(ev: RcEvent): boolean {
  return (Array.isArray(ev.entitlement_ids) && ev.entitlement_ids.includes(ENTITLEMENT_ID))
    || ev.entitlement_id === ENTITLEMENT_ID;
}

const ignore = (reason: string): Action => ({ kind: 'ignore', reason });
const none = (reason: string): Decision => ({ write: 'none', reason });

// ─── WHAT A PRICE LOOKS LIKE ─────────────────────────────────────────────────

/**
 * The monthly price the app wrote to the `pass_price` subscriber attribute before
 * the trial began, as the store localized it ("$6.99", "6,99 €").
 *
 * IT IS DEVICE INPUT, so it is held to the shape of a price before it goes near an
 * email: a digit, at most 32 characters, no markup and no control characters.
 * Anything else is dropped, and the email then states no figure at all rather than
 * the wrong one.
 */
export function normalizePriceLabel(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const s = value.replace(/\s+/g, ' ').trim();
  if (!s || s.length > 32) return null;
  if (!/\d/.test(s)) return null;
  if (/[<>"\\\u0000-\u001f\u007f]/.test(s)) return null;
  return s;
}

export function priceLabelOf(ev: RcEvent): string | null {
  const attr = ev.subscriber_attributes?.pass_price;
  return attr && typeof attr === 'object' ? normalizePriceLabel(attr.value) : null;
}

// ─── WHICH EVENTS MATTER ─────────────────────────────────────────────────────

/**
 * What a RevenueCat event means for a trial reminder. Read against RevenueCat's
 * "Event Types and Fields" and "Event Flows":
 *
 *   · a trial starts as INITIAL_PURCHASE with `period_type: TRIAL` (and a lapsed
 *     reader resubscribing into one arrives as RENEWAL, so that counts too);
 *   · turning off auto-renew in a trial is CANCELLATION — they keep access until
 *     the trial ends and are not charged, so no email;
 *   · CANCELLATION with `cancel_reason: CUSTOMER_SUPPORT` is a REFUND;
 *   · conversion is RENEWAL into a normal period (`is_trial_conversion: true`);
 *   · TRANSFER moves the purchase to another app user id, so the row it leaves
 *     behind is closed.
 *
 * Only Google Play purchases of the `scholars_pass` entitlement are considered,
 * because the email says "charged through Google Play" and links to it.
 */
export function classifyEvent(ev: RcEvent | null | undefined): Action {
  if (!ev || typeof ev !== 'object') return ignore('malformed');
  if (ev.type === 'TEST') return ignore('test');
  if (typeof ev.id !== 'string' || !ev.id || typeof ev.type !== 'string') return ignore('malformed');

  if (ev.type === 'TRANSFER') {
    const from = safeIds(ev.transferred_from);
    return from.length ? { kind: 'transfer', from } : ignore('no_ids');
  }

  if (ev.store !== 'PLAY_STORE') return ignore('other_store');
  if (!carriesPass(ev)) return ignore('other_entitlement');
  if (!customerKey(ev)) return ignore('no_ids');

  const trial = ev.period_type === 'TRIAL';
  const startOr = (fresh: boolean): Action => (endMs(ev) == null ? ignore('no_expiration') : { kind: 'start', fresh });

  switch (ev.type) {
    case 'INITIAL_PURCHASE':
      return trial ? startOr(true) : { kind: 'resolve', reason: 'purchased' };
    case 'RENEWAL':
      if (trial) return startOr(true);
      return { kind: 'resolve', reason: ev.is_trial_conversion ? 'converted' : 'renewed' };
    case 'SUBSCRIPTION_EXTENDED':
      return trial ? startOr(false) : ignore('not_trial');
    case 'PRODUCT_CHANGE':
      return ev.period_type === 'NORMAL' ? { kind: 'resolve', reason: 'product_changed' } : ignore('product_change_not_normal');
    case 'CANCELLATION':
      return ev.cancel_reason === 'CUSTOMER_SUPPORT' ? { kind: 'resolve', reason: 'refunded' } : { kind: 'cancel' };
    case 'UNCANCELLATION':
      return { kind: 'uncancel' };
    case 'EXPIRATION':
      return { kind: 'resolve', reason: 'expired' };
    default:
      // BILLING_ISSUE included, deliberately: a failed charge happens at or after
      // the trial's end, where the due window already stops looking, and closing
      // the row on one would silence a reminder if the store ever sent it early.
      return ignore('not_tracked');
  }
}

// ─── WHAT AN EVENT DOES TO A ROW ─────────────────────────────────────────────

function sandboxSkip(environment: string | null | undefined, opts: Options): string | null {
  return environment === 'SANDBOX' && !opts.allowSandbox ? 'sandbox' : null;
}

/**
 * The write one event makes to one row (or to no row yet).
 *
 * RETRIES AND ORDER. RevenueCat retries a failed delivery up to five times, reusing
 * the event's `id` and `event_timestamp_ms`, so an INITIAL_PURCHASE can arrive
 * AFTER the CANCELLATION that followed it. Two rules make the row come out the
 * same whatever order the deliveries land in:
 *
 *   · an event whose id is the row's last one is a duplicate, and one older than
 *     the row's last event is stale — both change nothing;
 *   · a cancel, uncancel or close that finds NO row, but is plainly about a trial
 *     (`period_type: TRIAL` with an end), creates the row in that state, so the
 *     late trial start that follows it is stale rather than a fresh open trial.
 *
 * Only a trial ever creates a row: a paying subscriber's renewals and expirations
 * with nothing on file change nothing.
 */
export function decide(row: TrialRow | null, ev: RcEvent, action: Action, nowMs: number, opts: Options): Decision {
  if (action.kind === 'ignore') return none(action.reason);
  const now = iso(nowMs);
  const at = eventMs(ev, nowMs);
  const end = endMs(ev);

  if (!row) {
    if (action.kind === 'transfer') return none('no_row');
    const aboutTrial = ev.period_type === 'TRIAL' && end != null;
    const opens = action.kind === 'start' || (action.kind === 'uncancel' && aboutTrial);
    const closes = (action.kind === 'cancel' || action.kind === 'resolve') && aboutTrial;
    const key = customerKey(ev);
    if ((!opens && !closes) || end == null || !key) return none('no_row');
    return {
      write: 'insert',
      row: {
        original_app_user_id: key,
        app_user_id: safeId(ev.app_user_id),
        aliases: customerIds(ev),
        product_id: str(ev.product_id),
        environment: str(ev.environment),
        trial_ends_at: iso(end),
        price_label: priceLabelOf(ev),
        cancelled_at: action.kind === 'cancel' ? now : null,
        resolved_at: action.kind === 'resolve' ? now : null,
        resolved_reason: action.kind === 'resolve' ? action.reason : null,
        reminder_sent_at: null,
        skipped_reason: sandboxSkip(str(ev.environment), opts),
        last_event_id: String(ev.id),
        last_event_at: iso(at),
        version: 1,
        updated_at: now,
      },
    };
  }

  if (row.last_event_id && row.last_event_id === ev.id) return none('duplicate');
  const lastAt = msOf(row.last_event_at);
  if (lastAt != null && at < lastAt) return none('stale');

  const patch: Partial<TrialRow> = {
    last_event_id: String(ev.id),
    last_event_at: iso(at),
    updated_at: now,
  };
  if (action.kind !== 'transfer') {
    patch.aliases = mergeIds(row.aliases, customerIds(ev));
    const appUser = safeId(ev.app_user_id);
    if (appUser) patch.app_user_id = appUser;
    const price = priceLabelOf(ev);
    if (price) patch.price_label = price;
  }

  switch (action.kind) {
    case 'start': {
      const environment = str(ev.environment) ?? row.environment;
      patch.product_id = str(ev.product_id) ?? row.product_id;
      patch.environment = environment;
      if (end != null && end !== msOf(row.trial_ends_at)) {
        // The trial now ends somewhere else, so any reminder already sent was about
        // an end that is not coming. A fresh trial starts clean; an extended one is
        // still the trial the reader may already have cancelled.
        patch.trial_ends_at = iso(end);
        patch.reminder_sent_at = null;
        patch.skipped_reason = sandboxSkip(environment, opts);
        patch.resolved_at = null;
        patch.resolved_reason = null;
        if (action.fresh) patch.cancelled_at = null;
      }
      break;
    }
    case 'cancel':
      if (!row.cancelled_at) patch.cancelled_at = now;
      break;
    case 'uncancel':
      patch.cancelled_at = null;
      break;
    case 'resolve':
    case 'transfer':
      if (!row.resolved_at) {
        patch.resolved_at = now;
        patch.resolved_reason = action.kind === 'transfer' ? 'transferred' : action.reason;
      }
      break;
  }
  return { write: 'update', patch };
}

// ─── WHO IS DUE ──────────────────────────────────────────────────────────────

/** Trials ending inside this window are due: at least LAST_CALL_MS away, at most a day and one cron period. */
export function dueWindow(nowMs: number): { fromMs: number; toMs: number } {
  return { fromMs: nowMs + LAST_CALL_MS, toMs: nowMs + REMINDER_BEFORE_MS + CRON_PERIOD_MS };
}

/** The whole rule. The reminder function's SQL filter is only a pre-filter for this. */
export function isDue(
  row: Pick<TrialRow, 'trial_ends_at' | 'reminder_sent_at' | 'cancelled_at' | 'resolved_at' | 'skipped_reason' | 'environment'>,
  nowMs: number,
  opts: Options,
): boolean {
  if (row.reminder_sent_at || row.cancelled_at || row.resolved_at || row.skipped_reason) return false;
  if (row.environment === 'SANDBOX' && !opts.allowSandbox) return false;
  const end = msOf(row.trial_ends_at);
  if (end == null) return false;
  const { fromMs, toMs } = dueWindow(nowMs);
  return end >= fromMs && end <= toMs;
}

// ─── WHERE TO CANCEL ─────────────────────────────────────────────────────────

/**
 * The Play subscription id. RevenueCat names a Google product set up since
 * February 2023 `<subscription_id>:<base_plan_id>`; Play's deep link wants only
 * the subscription id.
 */
export function playSku(productId: unknown): string | null {
  if (typeof productId !== 'string') return null;
  const sku = productId.split(':')[0].trim();
  return sku || null;
}

/**
 * Google Play's documented deep link to one subscription, or to the subscription
 * list when the product is unknown (developer.android.com, "Deep link to the
 * subscription management center").
 */
export function manageUrl(productId: unknown): string {
  const sku = playSku(productId);
  return sku ? `${PLAY_SUBSCRIPTIONS_URL}?sku=${encodeURIComponent(sku)}&package=${PACKAGE_NAME}` : PLAY_SUBSCRIPTIONS_URL;
}

// ─── THE EMAIL ───────────────────────────────────────────────────────────────

const FULL_DAY_HOURS = REMINDER_BEFORE_MS / HOUR_MS;

/**
 * "24 hours" while at least 23 are left, which covers the run that finds the row
 * and the one after it if that send failed — so a retry sends the same words, and
 * the idempotency key Resend holds for it still matches. Past that, the real
 * number of whole hours, floored: telling somebody they have a little less time
 * than they do costs nothing, telling them more costs a charge.
 */
export function hoursLeftPhrase(msLeft: number): string {
  if (msLeft >= REMINDER_BEFORE_MS - HOUR_MS) return `${FULL_DAY_HOURS} hours`;
  const h = Math.max(1, Math.floor(msLeft / HOUR_MS));
  return `${h} ${h === 1 ? 'hour' : 'hours'}`;
}

export type ReminderInput = {
  priceLabel: string | null;
  productId: string | null;
  trialEndsAtMs: number;
  nowMs: number;
};

export type ReminderEmail = { subject: string; text: string; html: string };

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * The reminder, in plain text and in HTML that says the same sentences. What it
 * must say is the product owner's list, and check-trial-email holds each one:
 * the trial ends in about 24 hours; doing nothing makes it a Scholar's Pass
 * subscription automatically, charged through Google Play; how to cancel before
 * it ends; the Pass stays until the trial ends either way; and a reader who has
 * already cancelled will not be charged and can ignore this.
 */
export function reminderEmail(input: ReminderInput): ReminderEmail {
  const left = Math.max(0, input.trialEndsAtMs - input.nowMs);
  const span = hoursLeftPhrase(left);
  const wholeDay = left >= REMINDER_BEFORE_MS - HOUR_MS;
  const price = normalizePriceLabel(input.priceLabel);
  const url = manageUrl(input.productId);

  const subject = `Your ${PASS_NAME} free trial ends in ${wholeDay ? span : `about ${span}`}`;
  const ends = `Your ${PASS_NAME} free trial ends in about ${span}.`;
  const converts = price
    ? `If you do nothing, it will automatically become a ${PASS_NAME} subscription at ${price} a month, charged through Google Play.`
    : `If you do nothing, it will automatically become a ${PASS_NAME} subscription, charged monthly through Google Play at the price shown there.`;
  const cancel = 'If you do not want to be charged, cancel before the trial ends. You can do it in Google Play:';
  const steps = `Or open the Google Play Store app, go to your subscriptions, choose ${APP_NAME} and tap Cancel subscription. Uninstalling the app does not cancel it.`;
  const keep = `Either way, you keep the ${PASS_NAME} until the trial ends.`;
  const ignoreLine = 'If you have already cancelled, you will not be charged and can ignore this email.';
  const why = `You are getting this because a free trial of the ${PASS_NAME} was started in ${APP_NAME} with this account.`;

  const text = [
    'Hello,',
    ends,
    converts,
    `${cancel}\n${url}`,
    steps,
    keep,
    ignoreLine,
    APP_NAME,
    why,
  ].join('\n\n') + '\n';

  const p = (s: string, style = 'margin:0 0 16px;') => `<p style="${style}">${esc(s)}</p>`;
  const html = [
    '<!doctype html>',
    '<html lang="en">',
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(subject)}</title></head>`,
    '<body style="margin:0;padding:0;background:#FAFAF7;">',
    '<div style="max-width:520px;margin:0 auto;padding:32px 24px;font-family:Georgia,\'Times New Roman\',serif;font-size:16px;line-height:1.55;color:#1A1A1A;">',
    `<p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#5F5F5F;">${esc(APP_NAME)}</p>`,
    `<h1 style="margin:0 0 20px;font-size:23px;line-height:1.3;font-weight:bold;">${esc(ends)}</h1>`,
    p(converts),
    p(cancel),
    `<p style="margin:0 0 12px;"><a href="${esc(url)}" style="display:inline-block;padding:12px 20px;border-radius:6px;background:#1A1A1A;color:#FAFAF7;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;">Manage or cancel in Google Play</a></p>`,
    `<p style="margin:0 0 20px;font-size:13px;color:#5F5F5F;">If the button does not open, use this link: <a href="${esc(url)}" style="color:#1A1A1A;word-break:break-all;">${esc(url)}</a></p>`,
    p(steps),
    p(keep),
    `<p style="margin:0 0 16px;font-weight:bold;">${esc(ignoreLine)}</p>`,
    `<p style="margin:28px 0 0;font-size:13px;color:#5F5F5F;">${esc(why)}</p>`,
    '</div>',
    '</body>',
    '</html>',
  ].join('\n');

  return { subject, text, html };
}

// ─── SENDING IT ONCE ─────────────────────────────────────────────────────────

/**
 * Resend's `Idempotency-Key` (at most 256 characters, honoured for 24 hours). If
 * the email is accepted but writing `reminder_sent_at` fails, the next run sends
 * the same request under the same key and Resend returns the original response
 * without sending again.
 */
export function idempotencyKey(userId: string, trialEndsAtMs: number): string {
  return `trial-reminder/${userId}/${trialEndsAtMs}`.slice(0, 256);
}

/**
 * What a Resend response means for the row.
 *
 *   sent   — accepted; or 409 `invalid_idempotent_request`, which means this key
 *            was already used, i.e. this reader was already sent this reminder
 *   stop   — 429: stop the run, the rest are still due next hour
 *   retry  — anything else, including 409 `concurrent_idempotent_requests`;
 *            the row stays due and the next run tries again
 */
export function sendOutcome(status: number, errorName: string | null | undefined): 'sent' | 'stop' | 'retry' {
  if (status >= 200 && status < 300) return 'sent';
  if (status === 409 && errorName === 'invalid_idempotent_request') return 'sent';
  if (status === 429) return 'stop';
  return 'retry';
}
