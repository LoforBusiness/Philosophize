// Does the trial reminder say what it must, to the people it must, a day before?
//
//   node scripts/check-trial-email.mjs
//
// The Scholar's Pass monthly subscription carries a Google Play free trial that
// CONVERTS into a paid month. Two Edge Functions stand between that and a reader
// being surprised by a charge: `revenuecat-webhook` records each trial and what
// happens to it, and `trial-reminder-emails` writes to the reader a day before it
// ends. Neither decides anything itself — every rule and every sentence is a pure
// function in supabase/functions/_shared/trialReminder.ts — so this loads that
// module in plain Node (zero imports, the loadts pattern rig.ts and tone.ts use)
// and re-derives all of it:
//
//   · every RevenueCat event type the brief names, including a sandbox trial;
//   · the row coming out the same whatever order retried deliveries land in;
//   · the due window's edges, and that an hourly run always lands 24 to 25 hours out;
//   · the Play deep link, with `:basePlan` stripped;
//   · every statement the product owner said the email must make, in the text AND
//     the HTML, and that no price is ever printed that the server was not given;
//   · that the functions import these rules rather than restating them, and that
//     the migration has the columns, the lock-down and the Vault names they assume.
//
// It prints what it checked and exits non-zero on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { loadTs } from './lib/loadts.mjs';

const REPO = process.cwd();
const read = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');

const MODULE = 'supabase/functions/_shared/trialReminder.ts';
const WEBHOOK = 'supabase/functions/revenuecat-webhook/index.ts';
const REMINDER = 'supabase/functions/trial-reminder-emails/index.ts';
const MIGRATION = 'supabase/migrations/0003_trial_reminders.sql';

const TR = await loadTs(path.join(REPO, MODULE));

let bad = 0;
let good = 0;
const ok = (cond, label, detail = '') => {
  if (cond) good++;
  else bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};
const head = (t) => console.log(`\n${t}\n${'─'.repeat(t.length)}`);

const H = 3_600_000;
const DAY = TR.REMINDER_BEFORE_MS;
const USER = '3f2b8c1e-9a4d-4f6b-8e2a-1c5d7b9e0f12';
const OTHER_USER = 'aa2b8c1e-9a4d-4f6b-8e2a-1c5d7b9e0f99';
const ANON = '$RCAnonymousID:8069238d6049ce87cc529853916d624c';
const PRODUCT = 'philosophize_scholars_pass_monthly:monthly';
const SKU = 'philosophize_scholars_pass_monthly';
const T0 = Date.UTC(2026, 8, 15, 9, 0, 0);
const END = T0 + 72 * H;
const OFF = { allowSandbox: false };
const ON = { allowSandbox: true };

// A RevenueCat `event`, shaped like the documented samples, for a Play trial.
let seq = 0;
const ev = (type, over = {}) => {
  seq++;
  return {
    id: `evt-${seq}`,
    type,
    event_timestamp_ms: T0 + seq * 1000,
    app_user_id: USER,
    original_app_user_id: ANON,
    aliases: [ANON, USER],
    product_id: PRODUCT,
    entitlement_id: null,
    entitlement_ids: ['scholars_pass'],
    period_type: 'TRIAL',
    purchased_at_ms: T0,
    expiration_at_ms: END,
    environment: 'PRODUCTION',
    store: 'PLAY_STORE',
    currency: 'USD',
    price: 0,
    subscriber_attributes: { pass_price: { value: '$6.99', updated_at_ms: T0 - 5000 } },
    ...over,
  };
};

// The webhook's three writes, in memory: find by alias overlap, insert when nothing
// matched, patch under the version. The ORDER checks below run the same
// classify → decide → write loop the function runs.
function store(opts = OFF) {
  const rows = new Map();
  const deliver = (e) => {
    const action = TR.classifyEvent(e);
    if (action.kind === 'ignore') return [{ write: 'none', reason: action.reason }];
    const now = (e.event_timestamp_ms ?? T0) + 400;
    const ids = action.kind === 'transfer' ? action.from : TR.customerIds(e);
    const hit = [...rows.values()].filter((r) => r.aliases.some((a) => ids.includes(a)));
    if (hit.length === 0) {
      const d = TR.decide(null, e, action, now, opts);
      if (d.write === 'insert') rows.set(d.row.original_app_user_id, d.row);
      return [d];
    }
    return hit.map((r) => {
      const d = TR.decide(r, e, action, now, opts);
      if (d.write === 'update') rows.set(r.original_app_user_id, { ...r, ...d.patch, version: r.version + 1 });
      return d;
    });
  };
  return { rows, deliver, only: () => [...rows.values()][0] };
}

const dueAt = (row, left, opts = OFF) => TR.isDue(row, TR.msOf(row.trial_ends_at) - left, opts);
const stripComments = (src) =>
  src.split('\n').filter((l) => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n');

// ═════════════════════════════════════════════════════════════════════════════
head('1 · THE MODULE STANDS ALONE AND AGREES WITH THE APP');

const moduleSrc = stripComments(read(MODULE));
ok(!/^\s*import\s|\bimport\s*\(|\brequire\s*\(/m.test(moduleSrc), 'the shared module has no imports, so plain Node and Deno load the same text');
ok(TR.REMINDER_BEFORE_MS === 24 * 60 * 60 * 1000, 'REMINDER_BEFORE_MS is one day', String(TR.REMINDER_BEFORE_MS));

const entitlement = read('constants/subscription.ts').match(/export const ENTITLEMENT_ID = '([^']+)'/)?.[1];
ok(entitlement === TR.ENTITLEMENT_ID, 'the entitlement is the one the app checks', `${TR.ENTITLEMENT_ID} vs constants/subscription.ts ${entitlement}`);
const pkg = JSON.parse(read('app.json')).expo?.android?.package;
ok(pkg === TR.PACKAGE_NAME, 'the package in the Play link is the one app.json ships', `${TR.PACKAGE_NAME} vs ${pkg}`);

// A raw control character loads and runs perfectly, which is why it is looked for:
// an escape like the price rule's control-character range, written by a tool that
// decodes it, lands as real NUL bytes — git then calls the file binary, and every
// behavioural check above still passes. Carriage returns count too (§21's CRLF).
const rawControl = (src) => [...src].filter((c) => {
  const n = c.charCodeAt(0);
  return (n < 32 && n !== 9 && n !== 10) || n === 127;
}).length;
for (const rel of [MODULE, WEBHOOK, REMINDER, MIGRATION]) {
  const n = rawControl(read(rel));
  ok(n === 0, `${rel} is plain text: no raw control characters, no CRLF`, n ? `${n} found` : '');
}

// ═════════════════════════════════════════════════════════════════════════════
head('2 · EVERY EVENT IS CLASSIFIED');

const TRANSFER = {
  id: 'evt-transfer',
  type: 'TRANSFER',
  event_timestamp_ms: T0 + 900_000,
  store: 'PLAY_STORE',
  environment: 'PRODUCTION',
  transferred_from: [USER],
  transferred_to: [OTHER_USER],
};
const CASES = [
  ['TEST', ev('TEST'), 'ignore', 'test'],
  ['INITIAL_PURCHASE · TRIAL starts a trial', ev('INITIAL_PURCHASE'), 'start'],
  ['INITIAL_PURCHASE · TRIAL in SANDBOX is still recorded', ev('INITIAL_PURCHASE', { environment: 'SANDBOX' }), 'start'],
  ['INITIAL_PURCHASE · NORMAL closes (bought outright)', ev('INITIAL_PURCHASE', { period_type: 'NORMAL' }), 'resolve', 'purchased'],
  ['INITIAL_PURCHASE · TRIAL with no expiration is ignored', ev('INITIAL_PURCHASE', { expiration_at_ms: null }), 'ignore', 'no_expiration'],
  ['CANCELLATION · UNSUBSCRIBE cancels', ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' }), 'cancel'],
  ['CANCELLATION · BILLING_ERROR cancels', ev('CANCELLATION', { cancel_reason: 'BILLING_ERROR' }), 'cancel'],
  ['CANCELLATION · CUSTOMER_SUPPORT is a refund and closes', ev('CANCELLATION', { cancel_reason: 'CUSTOMER_SUPPORT', price: -6.99 }), 'resolve', 'refunded'],
  ['UNCANCELLATION un-cancels', ev('UNCANCELLATION'), 'uncancel'],
  ['RENEWAL · NORMAL, trial conversion, closes', ev('RENEWAL', { period_type: 'NORMAL', is_trial_conversion: true }), 'resolve', 'converted'],
  ['RENEWAL · TRIAL (a lapsed reader back on a trial) starts', ev('RENEWAL'), 'start'],
  ['PRODUCT_CHANGE into NORMAL closes', ev('PRODUCT_CHANGE', { period_type: 'NORMAL', new_product_id: 'other' }), 'resolve', 'product_changed'],
  ['PRODUCT_CHANGE not into NORMAL is ignored', ev('PRODUCT_CHANGE'), 'ignore', 'product_change_not_normal'],
  ['EXPIRATION closes', ev('EXPIRATION', { expiration_reason: 'UNSUBSCRIBE' }), 'resolve', 'expired'],
  ['TRANSFER closes the rows it moves away from', TRANSFER, 'transfer'],
  ['TRANSFER with no usable ids is ignored', { ...TRANSFER, id: 'evt-t2', transferred_from: ['a,b'] }, 'ignore', 'no_ids'],
  ['SUBSCRIPTION_EXTENDED · TRIAL moves the trial', ev('SUBSCRIPTION_EXTENDED', { expiration_at_ms: END + 24 * H }), 'start'],
  ['BILLING_ISSUE is not tracked', ev('BILLING_ISSUE'), 'ignore', 'not_tracked'],
  ['another entitlement is ignored', ev('INITIAL_PURCHASE', { entitlement_ids: ['something_else'] }), 'ignore', 'other_entitlement'],
  ['unmapped entitlements (null) are ignored', ev('INITIAL_PURCHASE', { entitlement_ids: null }), 'ignore', 'other_entitlement'],
  ['the App Store is ignored (the email names Google Play)', ev('INITIAL_PURCHASE', { store: 'APP_STORE' }), 'ignore', 'other_store'],
  ['an event with no id is ignored', ev('INITIAL_PURCHASE', { id: null }), 'ignore', 'malformed'],
];
for (const [label, e, kind, reason] of CASES) {
  const a = TR.classifyEvent(e);
  ok(a.kind === kind && (reason === undefined || a.reason === reason), label, `${a.kind}${a.reason ? ' · ' + a.reason : ''}`);
}
ok(TR.classifyEvent(ev('SUBSCRIPTION_EXTENDED')).fresh === false && TR.classifyEvent(ev('INITIAL_PURCHASE')).fresh === true,
  'an extension is the same trial moved; a purchase is a fresh one');
const envelope = { api_version: '1.0', event: ev('INITIAL_PURCHASE') };
ok(TR.eventOf(envelope)?.type === 'INITIAL_PURCHASE', 'the event is read out of the documented { api_version, event } envelope');
ok(TR.classifyEvent(TR.eventOf({ api_version: '1.0' })).reason === 'malformed', 'an envelope with no event is ignored');
ok(TR.classifyEvent(TR.eventOf('nonsense')).kind === 'ignore', 'a body that is not an object is ignored');

// ═════════════════════════════════════════════════════════════════════════════
head('3 · THE ROW FOLLOWS THE EVENTS, IN ANY ORDER');

{
  const s = store();
  const [d] = s.deliver(ev('INITIAL_PURCHASE'));
  const r = s.only();
  ok(d.write === 'insert', 'a trial start inserts a row');
  ok(r.trial_ends_at === new Date(END).toISOString(), 'trial_ends_at is the event\'s expiration_at_ms', r.trial_ends_at);
  ok(r.price_label === '$6.99', 'price_label comes from subscriber_attributes.pass_price.value', String(r.price_label));
  ok(r.original_app_user_id === ANON && r.aliases.includes(ANON) && r.aliases.includes(USER), 'filed under original_app_user_id, with every alias kept');
  ok(r.skipped_reason === null && dueAt(r, 24.5 * H), 'a production trial is due 24.5 hours before it ends');
  ok(!dueAt(r, 30 * H), '…and not 30 hours before');
}
{
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE'));
  s.deliver(ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' }));
  ok(s.only().cancelled_at !== null && !dueAt(s.only(), 24.5 * H), 'start then cancel: cancelled, never due');
}
{
  const s = store();
  const start = ev('INITIAL_PURCHASE');
  const cancel = ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' });
  const [first] = s.deliver(cancel);
  const [late] = s.deliver(start);
  ok(first.write === 'insert' && s.only().cancelled_at !== null, 'a cancel that arrives before its trial start records a cancelled trial');
  ok(late.write === 'none' && late.reason === 'stale', 'the retried trial start that follows it is stale', late.reason);
  ok(!dueAt(s.only(), 24.5 * H), '…so a reader who cancelled at once is never emailed');
}
{
  const s = store();
  const start = ev('INITIAL_PURCHASE');
  s.deliver(start);
  const [again] = s.deliver(start);
  ok(again.write === 'none' && again.reason === 'duplicate', 'the same event delivered twice changes nothing', again.reason);
}
{
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE'));
  s.deliver(ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' }));
  s.deliver(ev('UNCANCELLATION'));
  ok(s.only().cancelled_at === null && dueAt(s.only(), 24.5 * H), 'cancel then uncancel: due again');
}
{
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE'));
  const cancel = ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' });
  const uncancel = ev('UNCANCELLATION');
  s.deliver(uncancel);
  const [late] = s.deliver(cancel);
  ok(late.reason === 'stale' && s.only().cancelled_at === null, 'an uncancel that lands before its cancel wins, because it is newer');
}
// Built lazily: an event is stamped when it is made, and one made before the trial
// start would be older than it — and rightly ignored as stale.
for (const [label, make, reason] of [
  ['conversion', () => ev('RENEWAL', { period_type: 'NORMAL', is_trial_conversion: true }), 'converted'],
  ['refund', () => ev('CANCELLATION', { cancel_reason: 'CUSTOMER_SUPPORT', price: -6.99 }), 'refunded'],
  ['expiration', () => ev('EXPIRATION', { expiration_reason: 'UNSUBSCRIBE' }), 'expired'],
  ['product change into NORMAL', () => ev('PRODUCT_CHANGE', { period_type: 'NORMAL' }), 'product_changed'],
]) {
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE'));
  s.deliver(make());
  const r = s.only();
  ok(r.resolved_at !== null && r.resolved_reason === reason && !dueAt(r, 24.5 * H), `${label} closes the row, never due`, String(r.resolved_reason));
}
{
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE'));
  s.deliver({ ...TRANSFER, event_timestamp_ms: T0 + 10 * 3_600_000 });
  const r = s.only();
  ok(r.resolved_reason === 'transferred' && !dueAt(r, 24.5 * H), 'a TRANSFER away from the reader closes their row', String(r.resolved_reason));
}
{
  const s = store(OFF);
  s.deliver(ev('INITIAL_PURCHASE', { environment: 'SANDBOX' }));
  const r = s.only();
  ok(r.environment === 'SANDBOX' && r.skipped_reason === 'sandbox', 'SANDBOX with the flag off: recorded, marked skipped', String(r.skipped_reason));
  ok(!dueAt(r, 24.5 * H, OFF) && !dueAt(r, 24.5 * H, ON), '…and never due, even if the flag is switched on later');
  const s2 = store(ON);
  s2.deliver(ev('INITIAL_PURCHASE', { environment: 'SANDBOX' }));
  const r2 = s2.only();
  ok(r2.skipped_reason === null && dueAt(r2, 24.5 * H, ON), 'SANDBOX with TRIAL_EMAIL_ALLOW_SANDBOX=true: due');
  ok(!dueAt(r2, 24.5 * H, OFF), '…and the reminder side re-checks the flag, so turning it off stops the email');
  ok(TR.flagOn('true') && TR.flagOn(' TRUE ') && !TR.flagOn('1') && !TR.flagOn('') && !TR.flagOn(undefined), 'the flag is on only for "true"');
}
{
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE', { subscriber_attributes: null }));
  ok(s.only().price_label === null, 'no pass_price attribute: no price on file');
  s.deliver(ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' }));
  s.deliver(ev('UNCANCELLATION'));
  ok(s.only().price_label === '$6.99', '…and a later event that carries it fills it in');
}
{
  // The reader started the trial signed out, then signed in: RevenueCat now calls
  // them by the Supabase UUID, but the row was filed under the anonymous id.
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE', { app_user_id: ANON, aliases: [ANON] }));
  ok(TR.accountIds(s.only()).length === 0, 'an anonymous-only trial has no account to look up');
  s.deliver(ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE', app_user_id: USER, aliases: [ANON, USER] }));
  const r = s.only();
  ok(s.rows.size === 1 && r.cancelled_at !== null, 'a cancel sent under the account id still finds the anonymous row');
  ok(r.aliases.includes(USER) && TR.accountIds(r)[0] === USER, '…and learns the account id for the email lookup');
}
{
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE'));
  s.deliver(ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' }));
  const before = s.only();
  s.rows.set(before.original_app_user_id, { ...before, reminder_sent_at: new Date(END - 24 * H).toISOString() });
  s.deliver(ev('SUBSCRIPTION_EXTENDED', { expiration_at_ms: END + 48 * H }));
  const r = s.only();
  ok(r.trial_ends_at === new Date(END + 48 * H).toISOString() && r.reminder_sent_at === null, 'an extension moves the end and owes a new reminder');
  ok(r.cancelled_at !== null, '…but an extended trial the reader cancelled stays cancelled');
}
{
  const s = store();
  s.deliver(ev('INITIAL_PURCHASE'));
  s.deliver(ev('EXPIRATION', { expiration_reason: 'UNSUBSCRIBE' }));
  const END2 = END + 90 * 24 * H;
  s.deliver(ev('INITIAL_PURCHASE', { expiration_at_ms: END2, purchased_at_ms: END2 - 72 * H }));
  const r = s.only();
  ok(r.resolved_at === null && r.cancelled_at === null && r.trial_ends_at === new Date(END2).toISOString(), 'a new trial after the old one closed starts clean');
}
{
  const s = store();
  const [d] = s.deliver(ev('RENEWAL', { period_type: 'NORMAL', original_app_user_id: 'payer', app_user_id: 'payer', aliases: ['payer'] }));
  ok(d.write === 'none' && s.rows.size === 0, 'a paying subscriber with no trial on file creates no row', d.reason);
}
ok(JSON.stringify(TR.safeIds([ANON, USER, 'a,b', '{x}', 'has space', 'q"t', USER])) === JSON.stringify([ANON, USER]),
  'ids unsafe in a Postgres array literal never reach the overlap filter');
ok(JSON.stringify(TR.accountIds({ app_user_id: USER.toUpperCase(), original_app_user_id: ANON, aliases: [ANON, USER] })) === JSON.stringify([USER]),
  'account ids are the UUIDs, lower-cased, once each, most recent first');

// ═════════════════════════════════════════════════════════════════════════════
head('4 · THE DUE WINDOW');

const open = (endMs, over = {}) => ({
  trial_ends_at: new Date(endMs).toISOString(),
  reminder_sent_at: null,
  cancelled_at: null,
  resolved_at: null,
  skipped_reason: null,
  environment: 'PRODUCTION',
  ...over,
});
{
  const now = T0;
  const { fromMs, toMs } = TR.dueWindow(now);
  ok(fromMs === now + H && toMs === now + DAY + H, 'the window is now+1h … now+25h', `${(fromMs - now) / H}h … ${(toMs - now) / H}h`);
  ok(TR.isDue(open(now + H), now, OFF), 'ending exactly 1 hour away: due');
  ok(!TR.isDue(open(now + H - 1), now, OFF), 'ending 1 ms inside the last hour: not due');
  ok(TR.isDue(open(now + DAY + H), now, OFF), 'ending exactly 25 hours away: due');
  ok(!TR.isDue(open(now + DAY + H + 1), now, OFF), 'ending 1 ms past 25 hours: not due yet');
  ok(!TR.isDue(open(now - H), now, OFF), 'an ended trial: not due');
  const mid = now + DAY;
  for (const [field, value] of [
    ['reminder_sent_at', new Date(now).toISOString()],
    ['cancelled_at', new Date(now).toISOString()],
    ['resolved_at', new Date(now).toISOString()],
    ['skipped_reason', 'no_email'],
  ]) ok(!TR.isDue(open(mid, { [field]: value }), now, OFF), `a row with ${field} set is never due`);
  ok(!TR.isDue(open(mid, { environment: 'SANDBOX' }), now, OFF) && TR.isDue(open(mid, { environment: 'SANDBOX' }), now, ON),
    'a SANDBOX row is due only with the flag on');
}
{
  let worst = [Infinity, -Infinity];
  let everyRunSaysADay = true;
  for (let minute = 0; minute < 60; minute++) {
    const end = T0 + 72 * H + minute * 60_000 + 13_000;
    const row = open(end);
    let first = null;
    for (let run = T0 + 17 * 60_000; run < end; run += H) {
      if (TR.isDue(row, run, OFF)) { first = run; break; }
    }
    const left = end - first;
    worst = [Math.min(worst[0], left), Math.max(worst[1], left)];
    // The run that finds it, and the next one if that send failed, must say the same words.
    const a = TR.reminderEmail({ priceLabel: '$6.99', productId: PRODUCT, trialEndsAtMs: end, nowMs: first });
    const b = TR.reminderEmail({ priceLabel: '$6.99', productId: PRODUCT, trialEndsAtMs: end, nowMs: first + H });
    if (a.text !== b.text || a.html !== b.html || a.subject !== b.subject || !/ends in about 24 hours/.test(a.text)) everyRunSaysADay = false;
  }
  ok(worst[0] > DAY && worst[1] <= DAY + H, 'an hourly run always finds a trial between 24 and 25 hours before it ends',
    `${(worst[0] / H).toFixed(2)}h … ${(worst[1] / H).toFixed(2)}h across every minute of the hour`);
  ok(everyRunSaysADay, 'that run and a retry an hour later send identical words, so the Idempotency-Key still matches');
}

// ═════════════════════════════════════════════════════════════════════════════
head('5 · WHERE TO CANCEL');

ok(TR.playSku(PRODUCT) === SKU, 'subscriptionId:basePlanId → subscriptionId', String(TR.playSku(PRODUCT)));
ok(TR.playSku(SKU) === SKU, 'an id with no base plan is unchanged');
ok(TR.playSku(null) === null && TR.playSku('') === null && TR.playSku(':monthly') === null, 'no product, no sku');
ok(TR.manageUrl(PRODUCT) === `https://play.google.com/store/account/subscriptions?sku=${SKU}&package=com.philosophize.app`,
  'the manage link is Google\'s documented deep link', TR.manageUrl(PRODUCT));
ok(TR.manageUrl(null) === 'https://play.google.com/store/account/subscriptions', 'an unknown product links to the subscription list');

// ═════════════════════════════════════════════════════════════════════════════
head('6 · THE EMAIL SAYS EVERYTHING IT MUST');

const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const visible = (html) => decode(html.replace(/<title>[\s\S]*?<\/title>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const flat = (s) => s.replace(/[’‘]/g, "'").replace(/\s+/g, ' ');

// The product owner's list, in their words, written here rather than imported so
// the check cannot agree with a module that has quietly changed its mind.
const MUST = [
  ['the free trial ends in about 24 hours', /free trial ends in about 24 hours/i],
  ['doing nothing makes it a subscription AUTOMATICALLY', /if you do nothing, it will automatically become a scholar's pass subscription/i],
  ['charged through Google Play', /charged (monthly )?through google play/i],
  ['how to cancel before it ends so they are not charged', /if you do not want to be charged, cancel before the trial ends/i],
  ['they keep the Pass until the trial ends either way', /either way, you keep the scholar's pass until the trial ends/i],
  ['already cancelled: not charged, ignore this email', /if you have already cancelled, you will not be charged and can ignore this email/i],
];
const CLOCK = [/\b\d{1,2}:\d{2}\b/, /\b\d{1,2}\s?(am|pm)\b/i, /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, /\b(UTC|GMT)\b/];
const NOW = END - 24.5 * H;
const URL = TR.manageUrl(PRODUCT);

for (const [label, price] of [['price known', '$6.99'], ['price unknown', null]]) {
  const mail = TR.reminderEmail({ priceLabel: price, productId: PRODUCT, trialEndsAtMs: END, nowMs: NOW });
  const text = flat(mail.text);
  const shown = flat(visible(mail.html));
  for (const [what, re] of MUST) {
    ok(re.test(text) && re.test(shown), `${label} · says: ${what}`);
  }
  ok(mail.text.includes(URL) && shown.includes(URL), `${label} · prints the manage link`);
  ok(mail.html.includes(`href="${URL.replace(/&/g, '&amp;')}"`), `${label} · the button is a real link to it`);
  ok(mail.subject === 'Your Scholar’s Pass free trial ends in 24 hours', `${label} · subject`, mail.subject);
  ok(CLOCK.every((re) => !re.test(text) && !re.test(shown)), `${label} · no clock time, day name or timezone anywhere`);
  if (price) {
    ok(text.includes('at $6.99 a month') && shown.includes('at $6.99 a month'), `${label} · states the price a month`);
  } else {
    const leftover = (s) => s.replace(/https?:\/\/\S+/g, ' ').replace(/24 hours/g, ' ');
    const digits = [text, shown, mail.subject].map(leftover).join(' ').match(/\d/g);
    ok(!digits, `${label} · no digit anywhere but "24 hours" and the link`, digits ? digits.join('') : '');
    ok(![text, shown].some((s) => /[$€£¥₹]|\b(USD|EUR|GBP)\b/.test(s)), `${label} · no currency symbol or code`);
  }
}
{
  const late = TR.reminderEmail({ priceLabel: '$6.99', productId: PRODUCT, trialEndsAtMs: END, nowMs: END - 5.6 * H });
  ok(/ends in about 5 hours/.test(late.text) && !/24 hours/.test(late.text + late.subject + late.html),
    'a late run says the hours really left, never "24 hours"', late.subject);
  const last = TR.reminderEmail({ priceLabel: null, productId: PRODUCT, trialEndsAtMs: END, nowMs: END - H });
  ok(/ends in about 1 hour\./.test(last.text), 'the last call says "about 1 hour"');
}
{
  const hostile = TR.reminderEmail({ priceLabel: '<img src=x onerror=alert(1)>9', productId: PRODUCT, trialEndsAtMs: END, nowMs: NOW });
  ok(!hostile.html.includes('<img') && !/\d/.test(flat(hostile.text).replace(/https?:\/\/\S+/g, '').replace(/24 hours/g, '')),
    'a price attribute carrying markup is dropped, not printed');
  ok(TR.normalizePriceLabel('6,99 €') === '6,99 €' && TR.normalizePriceLabel('R$ 34,90') === 'R$ 34,90', 'localized prices survive');
  ok(TR.normalizePriceLabel('free') === null && TR.normalizePriceLabel('') === null && TR.normalizePriceLabel(699) === null
    && TR.normalizePriceLabel('$6.99 every month, cancel whenever you like') === null, 'anything that is not the shape of a price is dropped');
  const BEL = String.fromCharCode(7);
  const BACKSLASH = String.fromCharCode(92);
  ok(TR.normalizePriceLabel(`$6.99${BEL}`) === null && TR.normalizePriceLabel(`$6${BACKSLASH}99`) === null && TR.normalizePriceLabel('$6.99"') === null,
    'a control character, a backslash or a quote in the price is dropped');
  const amp = TR.reminderEmail({ priceLabel: 'A&B 7', productId: PRODUCT, trialEndsAtMs: END, nowMs: NOW });
  ok(amp.html.includes('A&amp;B 7') && !amp.html.includes('A&B 7'), 'what is printed in the HTML is escaped');
}

// ═════════════════════════════════════════════════════════════════════════════
head('7 · THE DOORS');

ok(TR.authMatches('Bearer s3cret', 'Bearer s3cret') && TR.authMatches(' Bearer s3cret ', 'Bearer s3cret'), 'the configured Authorization value is accepted verbatim');
ok(!TR.authMatches('Bearer s3cres', 'Bearer s3cret') && !TR.authMatches('Bearer s3cre', 'Bearer s3cret')
  && !TR.authMatches('Bearer s3cret!', 'Bearer s3cret') && !TR.authMatches(null, 'Bearer s3cret'), 'a different, shorter, longer or missing value is refused');
ok(!TR.authMatches('', '') && !TR.authMatches('anything', undefined) && !TR.authMatches('anything', '  '), 'no secret configured means nobody is let in');
for (const [status, name, want] of [
  [200, null, 'sent'],
  [409, 'invalid_idempotent_request', 'sent'],
  [409, 'concurrent_idempotent_requests', 'retry'],
  [429, 'rate_limit_exceeded', 'stop'],
  [422, 'validation_error', 'retry'],
  [500, 'application_error', 'retry'],
  [0, 'network', 'retry'],
]) ok(TR.sendOutcome(status, name) === want, `Resend ${status}${name ? ' ' + name : ''} → ${want}`, TR.sendOutcome(status, name));
const key = TR.idempotencyKey(USER, END);
ok(key === `trial-reminder/${USER}/${END}` && key.length <= 256, 'the Idempotency-Key is stable per reader and trial end, within 256 characters', key);

// ═════════════════════════════════════════════════════════════════════════════
head('8 · THE FUNCTIONS USE THE RULES RATHER THAN RESTATING THEM');

const headerOf = (src) => {
  const out = [];
  for (const line of src.split('\n')) {
    if (/^\s*\/\//.test(line)) out.push(line);
    else if (line.trim() === '' && out.length) out.push(line);
    else break;
  }
  return out.join('\n');
};
for (const [name, rel] of [['revenuecat-webhook', WEBHOOK], ['trial-reminder-emails', REMINDER]]) {
  const src = read(rel);
  const code = stripComments(src);
  const header = headerOf(src);
  ok(/from '\.\.\/_shared\/trialReminder\.ts'/.test(src), `${name} imports ../_shared/trialReminder.ts`);
  const restated = [/24\s*\*\s*60\s*\*\s*60/, /86_?400_?000/, /play\.google\.com/, /scholars_pass/, /com\.philosophize\.app/, /ignore this email/i, /Scholar’s Pass/]
    .filter((re) => re.test(code));
  ok(restated.length === 0, `${name} restates no rule, constant or copy`, restated.map(String).join(' '));
  const envs = [...new Set([...code.matchAll(/Deno\.env\.get\('([A-Z_]+)'\)/g)].map((m) => m[1]))];
  const undocumented = envs.filter((e) => !header.includes(e));
  ok(envs.length > 0 && undocumented.length === 0, `${name} names every env var it reads in its deploy header`, envs.join(', '));
  ok(header.includes(`supabase functions deploy ${name} --no-verify-jwt`), `${name}'s header deploys it with --no-verify-jwt`);
  ok(/json\(\{ error: 'unauthorized' \}, 401\)/.test(code), `${name} answers 401 to a wrong Authorization header`);
}
{
  const webhook = read(WEBHOOK);
  ok(webhook.includes('https://wzixxsxkfrfgsggwollf.supabase.co/functions/v1/revenuecat-webhook'), 'the webhook header gives the RevenueCat dashboard URL');
  ok(/\.eq\('version', row\.version\)/.test(webhook), 'the webhook writes a row only if nobody changed it since it was read');
  const reminder = read(REMINDER);
  ok(/'Idempotency-Key': idempotencyKey\(/.test(reminder), 'every send carries the Idempotency-Key');
  ok(/if \(!isDue\(row, started, opts\)\) continue;/.test(reminder), 'the reminder run applies isDue to every row its query returns');
  ok(/reminder_sent_at: now/.test(reminder) && reminder.indexOf("outcome === 'sent'") < reminder.indexOf('await markSent('),
    'reminder_sent_at is written only after Resend accepts the email');
}

// ═════════════════════════════════════════════════════════════════════════════
head('9 · THE MIGRATION IS WHAT THE FUNCTIONS ASSUME');

{
  const sqlAll = read(MIGRATION);
  const sql = sqlAll.split('\n').filter((l) => !/^\s*--/.test(l)).map((l) => l.replace(/\s--.*$/, '')).join('\n');
  const body = sql.match(/create table if not exists public\.trial_reminders \(([\s\S]*?)\n\);/)?.[1] ?? '';
  const columns = body.split('\n').map((l) => l.trim().match(/^([a-z_]+)\s/)?.[1]).filter(Boolean);
  ok(columns.length >= 15, 'the table is declared', columns.join(', '));

  const s = store();
  s.deliver(ev('INITIAL_PURCHASE'));
  const row = s.only();
  const [upd] = s.deliver(ev('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' }));
  const extended = TR.decide(row, ev('SUBSCRIPTION_EXTENDED', { expiration_at_ms: END + 48 * H }), { kind: 'start', fresh: true }, T0 + 99 * H, OFF);
  const written = new Set([...Object.keys(row), ...Object.keys(upd.patch), ...Object.keys(extended.patch), 'version']);
  const missing = [...written].filter((c) => !columns.includes(c));
  ok(missing.length === 0, 'every column the webhook writes exists', missing.join(', '));
  const read2 = [...read(REMINDER).matchAll(/\.(?:is|gte|lte|eq|order)\('([a-z_]+)'/g)].map((m) => m[1]);
  const missing2 = [...new Set(read2)].filter((c) => !columns.includes(c));
  ok(read2.length > 0 && missing2.length === 0, 'every column the reminder filters on exists', [...new Set(read2)].join(', '));

  ok(/alter table public\.trial_reminders enable row level security;/.test(sql), 'RLS is enabled');
  ok(/alter table public\.trial_reminders force row level security;/.test(sql), 'RLS is forced');
  ok(!/create\s+policy/i.test(sql), 'there are no policies: service role only');
  ok(/revoke all on table public\.trial_reminders from public, anon, authenticated;/.test(sql), 'anon and authenticated hold no privileges');
  const due = sql.match(/create index if not exists trial_reminders_due_idx[\s\S]*?;/)?.[0] ?? '';
  ok(['trial_ends_at', 'reminder_sent_at is null', 'cancelled_at is null', 'resolved_at is null', 'skipped_reason is null'].every((t) => due.includes(t)),
    'the due index is on trial_ends_at, over the same open-row conditions isDue uses');
  ok(/using gin \(aliases\)/.test(sql), 'the alias lookup is indexed');
  ok(/cron\.schedule\(\s*'trial-reminder-emails',\s*'17 \* \* \* \*'/.test(sql), 'the schedule is hourly, and named so a re-run overwrites it');
  ok(/name = 'project_url'/.test(sql) && /name = 'trial_cron_secret'/.test(sql), 'the schedule reads the Vault secrets project_url and trial_cron_secret');
  ok(/'\/functions\/v1\/trial-reminder-emails'/.test(sql) && /'Bearer ' \|\|/.test(sql), 'it POSTs to trial-reminder-emails with a Bearer secret');
  ok(!/create_secret\s*\(/i.test(sql), 'no secret value is created in the migration (only in its comments)');
  ok(!/eyJ[A-Za-z0-9_-]{10,}|re_[A-Za-z0-9]{10,}|sb_secret_/.test(sqlAll + read(WEBHOOK) + read(REMINDER)), 'no key or token is committed in any of the three files');
}

console.log(`\n${good} checks passed, ${bad} failed.`);
process.exitCode = bad ? 1 : 0;
