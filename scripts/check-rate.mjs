// HOW OFTEN THE APP ASKS FOR A RATING, ASSERTED RATHER THAN TRUSTED.
//
// `lib/utils/rateCadence.ts` has zero imports for exactly this reason -- the
// whole policy can be run here against stated dates, with no store, no clock and
// no phone. Same rule `rig.ts`, `tone.ts` and `dialHit.ts` hold.
//
// It is worth a checker because both ways of getting this wrong are INVISIBLE.
// Too loose does not crash and does not look wrong in review; it just nags every
// reader the app has, and the first news of it is the rating going down. Too
// tight is worse to spot: the sheet simply never comes back, and nothing at all
// happens to tell anyone.
//
// The cadence is ONE RAISE PER CALENDAR DAY until the reader answers. Two of
// these assertions exist only to separate that from the rolling twenty-four
// hours it is so easily written as -- see the counter-test at the bottom, which
// puts the 24-hour rule back and shows it refusing the very opens the brief is
// about.
import fs from 'node:fs';

const M = await import('../lib/utils/rateCadence.ts').catch(() => null);
if (!M) {
  // The repo runs TS through a loader for the checks that need it; if this file
  // is invoked without one, say so rather than silently passing.
  console.error('run with: node --import ./scripts/lib/register.mjs scripts/check-rate.mjs');
  process.exit(1);
}
const { mayAsk, sameLocalDay, ASKS_PER_DAY } = M;

/** LOCAL dates throughout — the rule is a local calendar day, so UTC would test
 *  a different rule and would pass or fail depending on the machine's zone. */
const at = (y, mo, d, h = 12, mi = 0) => new Date(y, mo, d, h, mi).getTime();

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? `  —  ${detail}` : ''}`);
};

const H = (p = {}) => ({ settled: false, askedAt: 0, ...p });

console.log('\nTHE RATING CADENCE\n');
console.log(`  ${ASKS_PER_DAY} raise per calendar day, until they answer\n`);

// ── the first ask ───────────────────────────────────────────────────────────
ok(mayAsk(H(), at(2026, 8, 4, 9), true) === true,
  'a reader who has finished onboarding is asked',
  'the ask the brief put right after the email screen');
ok(mayAsk(H(), at(2026, 8, 4, 9), false) === false,
  'and nobody is asked before onboarding is finished');

// ── answering ends it, permanently ──────────────────────────────────────────
ok(mayAsk(H({ settled: true, askedAt: at(2020, 0, 1) }), at(2026, 8, 4, 9), true) === false,
  'somebody who gave a rating is never asked again',
  'no day and no counter applies to them');

// ── one a day ───────────────────────────────────────────────────────────────
ok(mayAsk(H({ askedAt: at(2026, 8, 4, 0, 5) }), at(2026, 8, 4, 23, 55), true) === false,
  'asked at five past midnight, still no at five to the next',
  'one raise a day means one');
ok(mayAsk(H({ askedAt: at(2026, 8, 3, 12) }), at(2026, 8, 4, 9), true) === true,
  'and yesterday does not block today');

// ── THE TWO THAT SEPARATE A CALENDAR DAY FROM TWENTY-FOUR HOURS ─────────────
//
// These are the whole brief: "it will show up the first time the user opens the
// app each day". Both of these opens ARE the first of their day and both are
// less than twenty-four hours after the previous ask.
const CROSSED = { asked: at(2026, 8, 3, 23, 55), now: at(2026, 8, 4, 0, 10) };
const EARLIER = { asked: at(2026, 8, 3, 9, 0), now: at(2026, 8, 4, 8, 0) };
ok(mayAsk(H({ askedAt: CROSSED.asked }), CROSSED.now, true) === true,
  'an ask at 23:55 does not eat the 00:10 open fifteen minutes later',
  'midnight clears the day, elapsed time does not');
ok(mayAsk(H({ askedAt: EARLIER.asked }), EARLIER.now, true) === true,
  'and 9am yesterday does not eat 8am today',
  'twenty-three hours apart, but a different day');

// ── the boundary itself ─────────────────────────────────────────────────────
ok(sameLocalDay(at(2026, 8, 4, 0, 0), at(2026, 8, 4, 23, 59)) === true,
  'midnight and one minute to midnight are the same day');
ok(sameLocalDay(at(2026, 8, 4, 23, 59), at(2026, 8, 5, 0, 0)) === false,
  'and one minute apart across midnight is not');
ok(sameLocalDay(at(2025, 8, 4, 12), at(2026, 8, 4, 12)) === false,
  'the year is part of the comparison',
  'a date-only check would silence the sheet for a year');
ok(sameLocalDay(at(2026, 7, 4, 12), at(2026, 8, 4, 12)) === false,
  'and so is the month');

// ── nothing else may throttle it ────────────────────────────────────────────
//
// The old policy carried three: a yearly ceiling, a sixty-day gap and an
// engagement requirement. They are gone by instruction, and the way to assert
// "gone" is that the history has nowhere left to keep them.
const keys = Object.keys(H()).sort();
ok(keys.length === 2 && keys[0] === 'askedAt' && keys[1] === 'settled',
  'the history holds one timestamp and one latch, and nothing that could cap it',
  keys.join(' · '));
ok(mayAsk(H({ askedAt: at(2026, 8, 3, 12) }), at(2026, 8, 4, 9), true) === true,
  'a reader who has never finished a lesson is still asked',
  'the engagement rule is gone, not merely relaxed');

// ── COUNTER-TEST: the rule this is so easily written as ─────────────────────
//
// A subtraction against a day in milliseconds is the obvious implementation and
// it is the wrong one. Put it back and it refuses both of the opens above -- so
// the ask never lands on the first open of the day, it walks later through the
// week, and when it finally crosses midnight it skips a day in silence.
const rolling = (h, now) => !h.askedAt || now - h.askedAt >= 86_400_000;
ok(rolling({ askedAt: CROSSED.asked }, CROSSED.now) === false
  && rolling({ askedAt: EARLIER.asked }, EARLIER.now) === false,
  'and the 24-hour version refuses both of them, which is why it is not used',
  'the counter-test — if this line ever passes, the two above are not testing anything');

// ── the source rules, which the arithmetic cannot reach ─────────────────────
//
// Comments stripped first, for the reason section 17's L8 gives: a detector that
// reads prose finds the rule being described and calls it the rule being broken.
const src = fs.readFileSync('components/shared/RatePrompt.tsx', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

// THE HALF OF THE CADENCE THAT DOES NOT LIVE IN THE POLICY. Recording the ask on
// DISMISSAL was harmless at sixty days; daily it means a reader who force-quits
// with the sheet up meets it again on the next launch the same day.
ok(/noteRateAsk\(\);\s*setOpen\(true\)/.test(src),
  'the ask is recorded as the sheet OPENS',
  'not when it is dismissed — a force-quit would otherwise cost nothing');
ok(!/onClose=\{\s*\(\)\s*=>\s*noteRateAsk/.test(src),
  'and closing it does not record a second one');

// A Modal raised from a mounted-but-unfocused screen covers whatever is actually
// on the glass. Home never unmounts, so without this the daily sheet would
// regularly land on top of another tab.
ok(/useIsFocused\(\)/.test(src),
  'it waits for Home to be the screen on the glass',
  'all five tabs are mounted from startup');

// THE RULE THAT MADE THIS SHIPPABLE. An OTA bundles the working tree, so a
// single import of an unrelated feature's field means the two can only ever be
// published together. An earlier draft of the host read `conferral` -- the
// Scholar's Pass ceremony -- and that one line was enough to weld the rating
// sheet to unfinished trial work.
ok(!/\bconferral\b/.test(src) && !/\btrial\b/i.test(src),
  'the rating sheet reads nothing belonging to the trial',
  'so it can be published on its own');

console.log(bad === 0 ? '\none a day, and it lands on the first open.\n' : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);
