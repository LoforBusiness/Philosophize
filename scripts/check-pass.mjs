// Does the paywall tell the truth?
//
//   node --import ./scripts/lib/register.mjs scripts/check-pass.mjs   (npm run check:pass)
//
// This is the one screen in the app where somebody is about to be charged, and
// for most of its life its benefit list was three sentences somebody typed. The
// old file even carried a comment explaining why the list was kept short — "a
// paywall that promises one before it exists is the fastest way to make every
// other line on it untrustworthy" — which was the right instinct aimed at the
// wrong failure. A hand-written line is untrustworthy in BOTH directions, and
// this one had drifted the honest way: two of the five things the Pass actually
// buys were not on it at all, so the biggest reasons to subscribe were being
// given away for nothing.
//
// So `lib/utils/passValue.ts` holds the claims and this re-derives every one of
// them from the function that enforces it. A gate that changes, or a claim that
// stops being true, fails the build instead of quietly becoming a lie.
//
// It also holds the family to the palette rule check-ui holds converted screens
// to, and measures the contrast pairs these screens actually produce — including
// the one class of bug §19 records: a colour that passes on paper and fails in
// the shaded corner of a struck tile.
import fs from 'node:fs';
import path from 'node:path';
import { loadFont, wrap as wrapText } from './lib/ttfwidth.mjs';

const REPO = process.cwd();
const read = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');

const V = await import('@/lib/utils/passValue');
const TR = await import('@/lib/utils/trial');
const DATA = await import('@/data');
const SUB = await import('@/constants/subscription');
const STREAK = await import('@/constants/streak');
const D = await import('@/constants/design');
const T = await import('@/components/shared/tone');

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};
const head = (t) => console.log(`\n${t}\n${'─'.repeat(t.length)}`);

// WCAG, the same arithmetic check-ui and check-launch use.
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const LINE = (id) => V.PASS_LINES.find((l) => l.id === id);

// ═════════════════════════════════════════════════════════════════════════════
head('1 · EVERY CLAIM IS ENFORCED SOMEWHERE ELSE');
//
// One assertion per row, each re-deriving the claim from the code that makes it
// true. `GATES` is the list of things that actually differ by tier; if the two
// ever disagree, either a gate has appeared that the paywall does not mention or
// the paywall is advertising something nobody enforces.
const GATES = ['lessons', 'ads', 'replay', 'units', 'rest'];

ok(V.PASS_LINES.length === GATES.length,
  'the table has one row per real gate', `${V.PASS_LINES.length} rows, ${GATES.length} gates`);
ok(GATES.every((g) => LINE(g)), 'every gate has a row',
  GATES.filter((g) => !LINE(g)).join(' ') || 'all present');
ok(new Set(V.PASS_LINES.map((l) => l.id)).size === V.PASS_LINES.length, 'no id appears twice');

// ── lessons a day ────────────────────────────────────────────────────────────
ok(LINE('lessons').free === String(SUB.FREE_DAILY_LESSON_LIMIT),
  'the daily allowance on the table is the one the gate reads',
  `table "${LINE('lessons').free}" · FREE_DAILY_LESSON_LIMIT ${SUB.FREE_DAILY_LESSON_LIMIT}`);
ok(V.allowanceLabel().startsWith(String(SUB.FREE_DAILY_LESSON_LIMIT)),
  'and so is the sentence version', V.allowanceLabel());
{
  // The route's own freeze must compare against the same constant.
  const route = read('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx');
  ok(/used >= FREE_DAILY_LESSON_LIMIT/.test(route),
    'the lesson route gates on that constant, not a literal');
}

// ── advertisements ───────────────────────────────────────────────────────────
{
  const reward = read('components/lesson/LessonReward.tsx');
  const pro = reward.indexOf('if (isPro) {');
  const ad = reward.indexOf('ads.showInterstitial()');
  ok(pro > 0 && ad > pro, 'a subscriber returns before the interstitial is shown',
    pro > 0 && ad > pro ? 'isPro branch precedes the ad call' : 'could not find the ordering');
  ok(/return;\s*\n\s*}\s*\n\s*try {/.test(reward.slice(pro, ad + 40)) || reward.slice(pro, ad).includes('return;'),
    'and it returns rather than falling through');
}

// ── replay ───────────────────────────────────────────────────────────────────
//
// `lessonAccess(li, unitDone, startable, isPro)`. A FINISHED lesson is li < done.
{
  const free = DATA.lessonAccess(0, 1, true, false);
  const paid = DATA.lessonAccess(0, 1, true, true);
  ok(free.open === false && free.needsPass === true,
    'a free reader cannot reopen a lesson they finished',
    `open ${free.open}, needsPass ${free.needsPass}`);
  ok(paid.open === true, 'and the Pass does open it');
  ok(LINE('replay').free === null,
    'so the free column shows nothing at all for replay', String(LINE('replay').free));
}

// ── starting a unit out of order ─────────────────────────────────────────────
{
  const notStartable = DATA.lessonAccess(0, 0, false, false);
  ok(notStartable.open === false && notStartable.needsPass === true,
    'a unit whose predecessors are unfinished is shut to a free reader');
  ok(DATA.lessonAccess(0, 0, true, true).open === true, 'and open once it is startable');
  const src = read('data/index.ts');
  ok(/const startable = isPro \|\|/.test(src),
    'and `isPro` is what makes any unit startable', 'data/index.ts');
  ok(LINE('units').free !== null && /order/i.test(LINE('units').free),
    'the free column says the units come in order', LINE('units').free);
}

// ── rest days ────────────────────────────────────────────────────────────────
{
  ok(STREAK.restCap(true) > STREAK.restCap(false),
    'the Pass holds more rest days', `${STREAK.restCap(false)} → ${STREAK.restCap(true)}`);
  ok(STREAK.restEarnEvery(true) < STREAK.restEarnEvery(false),
    'and earns them faster', `every ${STREAK.restEarnEvery(false)} → every ${STREAK.restEarnEvery(true)}`);
  const f = LINE('rest').free, p = LINE('rest').pass;
  ok(f.includes(String(STREAK.REST_CAP_FREE)) && f.includes(String(STREAK.REST_EARN_EVERY_FREE)),
    'the free cell carries the real free numbers', f);
  ok(p.includes(String(STREAK.REST_CAP_PRO)) && p.includes(String(STREAK.REST_EARN_EVERY_PRO)),
    'and the pass cell the real pass numbers', p);
}

// ═════════════════════════════════════════════════════════════════════════════
head('2 · THE FIGURES ON THE WALL');
//
// The wait in days is the screen's main argument and the number nobody would
// catch being wrong — 208 and 219 look equally plausible on a phone.
{
  ok(V.daysAtFreePace(208, 1) === 208, 'one a day, 208 left, is 208 days');
  ok(V.daysAtFreePace(209, 1) === 209, 'and 209 is 209');
  ok(V.daysAtFreePace(5, 2) === 3, 'two a day rounds UP, not down', String(V.daysAtFreePace(5, 2)));
  ok(V.daysAtFreePace(0, 1) === 0, 'nothing left is no wait');
  ok(V.daysAtFreePace(-5, 1) === 0, 'and a negative remainder cannot promise a negative wait');
  ok(V.daysAtFreePace(10, 0) === 0, 'a zero allowance does not divide by zero');
}
{
  ok(!/\d/.test(V.paceLabel(0)), 'zero days is not printed as a number', V.paceLabel(0));
  ok(V.paceLabel(1) === '1 more day', 'one day is singular', V.paceLabel(1));
  ok(/days$/.test(V.paceLabel(364)), 'under a year it counts days', V.paceLabel(364));
  ok(/year/.test(V.paceLabel(365)), 'a year or more switches to years', V.paceLabel(365));
  ok(/years/.test(V.paceLabel(900)), 'and pluralises them', V.paceLabel(900));
}
{
  const total = V.libraryTotal();
  let sum = 0;
  for (const b of DATA.ALL_BRANCHES) for (const u of b.paths) sum += u.lessons.length;
  ok(total === sum && total > 0, 'the library total is counted out of the tree', `${total} lessons`);

  const empty = V.libraryStanding({});
  ok(empty.done === 0 && empty.left === total && empty.pct === 0, 'a new reader stands at zero');

  // A corrupt or ahead-of-its-time count must not produce a number over the
  // total or a negative remainder — `lessonsByBranch` is a derived mirror and a
  // merge can legitimately hand it something larger than this build's tree.
  const over = {};
  for (const b of DATA.ALL_BRANCHES) over[b.slug] = 99_999;
  const cap = V.libraryStanding(over);
  ok(cap.done === total && cap.left === 0 && cap.pct === 1,
    'and an over-count is clamped rather than shown', `${cap.done}/${cap.total}`);
}
{
  // Local midnight, not UTC and not "24 hours from now" — the allowance is keyed
  // on a local calendar date.
  const oneMinuteToMidnight = new Date(2026, 7, 22, 23, 59, 0, 0);
  ok(V.msToRenewal(oneMinuteToMidnight) === 60_000,
    'a minute to midnight is a minute', `${V.msToRenewal(oneMinuteToMidnight)}ms`);
  const justAfter = new Date(2026, 7, 22, 0, 0, 0, 0);
  ok(V.msToRenewal(justAfter) === 86_400_000, 'and midnight itself is a full day');
  // The clocks-change days are exactly why this is built with the Date
  // constructor rather than by adding 86_400_000.
  const anyDay = new Date(2026, 2, 29, 12, 0, 0, 0);
  ok(V.msToRenewal(anyDay) > 0 && V.msToRenewal(anyDay) <= 86_400_000,
    'and it is never negative or longer than a day');
}
{
  ok(V.renewalLabel(0) === 'under a minute', 'a spent clock says so', V.renewalLabel(0));
  ok(V.renewalLabel(48 * 60_000) === '48m', 'under an hour is minutes alone', V.renewalLabel(48 * 60_000));
  ok(V.renewalLabel(61 * 60_000) === '1h 1m', 'over an hour carries both', V.renewalLabel(61 * 60_000));
  ok(V.renewalLabel(120 * 60_000) === '2h', 'and drops a zero minute', V.renewalLabel(120 * 60_000));
  ok(!/\ds\b/.test(V.renewalLabel(90 * 60_000)), 'seconds never appear');
}

// ═════════════════════════════════════════════════════════════════════════════
head('3 · THE FAMILY DECLARES NO COLOUR OF ITS OWN');
//
// The same rule check-ui holds the converted screens to. A colour written here
// is a colour nobody decided on — and on this family in particular it would be
// the fifteenth place a value gets chosen by eye.
const FAMILY = [
  'components/paywall/PassParts.tsx',
  'components/paywall/TrialOffer.tsx',
  'components/paywall/PassConferred.tsx',
  'components/paywall/TrialStatus.tsx',
  'components/paywall/TrialReminderAsk.tsx',
  'lib/utils/trialTerms.ts',
  'components/paywall/DailyLimit.tsx',
  'components/paywall/LessonLocked.tsx',
  'components/shared/PaywallContent.tsx',
  'components/shared/branchMarks.ts',
  'lib/utils/passValue.ts',
];
for (const rel of FAMILY) {
  const src = read(rel).replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  const hexes = [...new Set(src.match(/#[0-9A-Fa-f]{3,8}\b/g) || [])];
  ok(hexes.length === 0, `${rel}: no colour of its own`, hexes.join(' '));
  // A DERIVED rgba (`rgba(${r}, …)`) is the ground made transparent and is not a
  // decision; a literal one is. Only the literal fails.
  const rgbs = [...new Set(src.match(/rgba?\([^)]*\)/g) || [])].filter((r) => !r.includes('${'));
  ok(rgbs.length === 0, `${rel}: no literal rgb() of its own`, rgbs.join(' '));
}

// ── THE EMBER STAYS OFF THESE SCREENS ────────────────────────────────────────
//
// `constants/streak.ts` names the paywall by name as somewhere the one colour in
// a black-and-white app may not go, and gives the reason: the same colour used
// in six places is a theme, and then it signals nothing.
for (const rel of FAMILY) {
  const src = read(rel).replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  ok(!/\bEMBER\b|\bASH\b/.test(src), `${rel}: no ember — it belongs to the streak`);
}

// ═════════════════════════════════════════════════════════════════════════════
head('4 · READABLE ON THE GROUNDS THESE SCREENS ACTUALLY MAKE');
//
// THE ONE THAT ACTUALLY FAILS THIS CLASS OF CHECK, per §19: a colour measured on
// `paper` and then used in the SHADED corner of a struck face, where the ground
// has turned a step darker. Every struck tile on these screens has such a corner
// and text sits in it.
const PAPER = D.C.paper;
const SHADE = T.PAPER_SHADE; // the shaded end of a StruckTile's face

ok(ratio(D.C.ink, PAPER) >= 7, 'ink on paper', `${ratio(D.C.ink, PAPER).toFixed(2)}:1`);
ok(ratio(D.C.ink, SHADE) >= 7, 'ink in a tile’s shaded corner', `${ratio(D.C.ink, SHADE).toFixed(2)}:1`);
ok(ratio(D.C.inkSoft, PAPER) >= 4.5, 'secondary text on paper', `${ratio(D.C.inkSoft, PAPER).toFixed(2)}:1`);

// The branch kicker on `NextUp` is `ramp(hue).shade` on a struck tile, so all six
// have to clear the floor in the corner as well as on the face.
for (const [slug, hue] of Object.entries(D.BRANCH)) {
  const shade = T.ramp(hue).shade;
  ok(ratio(shade, SHADE) >= 4.5, `${slug}: its kicker reads in the shaded corner`,
    `${ratio(shade, SHADE).toFixed(2)}:1`);
}

// ── THE METAL PLATE, AND WHY THE RULE IS ABOUT WORDS RATHER THAN COLOUR ─────
//
// `tone.ts` promises `on` is "ink or paper, whichever reads on `base`", and all
// three metals keep that promise — check-ui owns it and it is re-derived here.
for (const [name, m] of Object.entries(T.METAL)) {
  ok(ratio(m.on, m.base) >= 4.5, `${name} plate: its label reads on the metal`,
    `${ratio(m.on, m.base).toFixed(2)}:1 on base`);
}
//
// The face is a GRADIENT though, and at the shaded end gold reads 2.94:1 and
// silver 4.32:1 against their own `on`. That is fine on a badge, where the mark
// is centred inside a rim, and it is reachable on a small plate — a long label
// runs far enough along the diagonal to sit in the shaded corner.
//
// The fix is this family's, not `tone.ts`'s: retuning `METAL` would repaint every
// medal, rank pin and mastery flag in the app to solve a problem that only exists
// when a caller writes a long label. So the rule is a WORD COUNT, and it is
// enforced rather than remembered. ("TODAY IS BANKED" was the one that failed.)
for (const rel of FAMILY.filter((f) => f.endsWith('.tsx'))) {
  const src = read(rel);
  const labels = [...src.matchAll(/<MetalPlate[^>]*?label="([^"]*)"/g)].map((m) => m[1]);
  const long = labels.filter((l) => l.trim().split(/\s+/).length > 2);
  ok(long.length === 0, `${rel}: every plate label is two words or fewer`,
    long.map((l) => `"${l}"`).join(' ') || `${labels.length} plate(s)`);
}

// THE WALL'S TICKS ARE THE ARGUMENT, so they are held to the 3:1 non-text mark
// floor rather than left to whatever recedes prettily. `C.dim` measures 2.11:1
// on paper and its own comment rules it out for anything that must be seen; so
// did gold's `base`, at 2.51:1, which is why the struck tick is drawn from the
// shaded half of the metal, the palette's purple since 2026-09-15.
ok(ratio(D.C.inkSoft, PAPER) >= 3, 'the free run of day-ticks is visible on paper',
  `${ratio(D.C.inkSoft, PAPER).toFixed(2)}:1`);
ok(ratio(T.ROYAL.shade, PAPER) >= 3, 'and so is the single struck one beside it',
  `${ratio(T.ROYAL.shade, PAPER).toFixed(2)}:1`);
{
  const parts = read('components/paywall/PassParts.tsx');
  ok(/ROYAL\.base, ROYAL\.shade, ROYAL\.rim/.test(parts),
    'and it is struck from that half, not the lit one');
}

// ── inkSoft IS A PAPER TONE ─────────────────────────────────────────────────
//
// 5.33:1 on paper, 3.07:1 in a StruckTile's shaded corner. Nothing in the
// palette sits between, so secondary text inside a tile is ink or the branch's
// own shade. This asserts the boundary so the next person meets the number
// rather than the habit.
ok(ratio(D.C.inkSoft, PAPER) >= 4.5 && ratio(D.C.inkSoft, SHADE) < 4.5,
  'inkSoft is readable on paper and NOT in a struck corner — hence the rule',
  `${ratio(D.C.inkSoft, PAPER).toFixed(2)}:1 vs ${ratio(D.C.inkSoft, SHADE).toFixed(2)}:1`);
{
  const parts = read('components/paywall/PassParts.tsx');
  const caption = parts.match(/nextCaption: \{[^}]*\}/);
  ok(!!caption && !/inkSoft/.test(caption[0]),
    'the tile caption does not take it', caption ? caption[0] : 'not found');
  const locked = read('components/paywall/LessonLocked.tsx');
  const label = locked.match(/openLabel: \{[^}]*\}/);
  ok(!!label && !/inkSoft/.test(label[0]),
    'nor does the tile label', label ? label[0] : 'not found');
}

// ═════════════════════════════════════════════════════════════════════════════
head('5 · THE SCREENS ARE WIRED TO THE TABLE, NOT TO A COPY OF IT');
{
  const parts = read('components/paywall/PassParts.tsx');
  ok(/PASS_LINES\.map\(/.test(parts),
    'the comparison renders every row of PASS_LINES', 'a new gate cannot be silently dropped');
  ok(/left <= 0/.test(parts),
    'the wall says nothing when there is nothing left to wait for (A1)');
  ok(/Math\.min\(days, CAP\)/.test(parts),
    'and never draws more ticks than there are days (A1)');

  const pay = read('components/shared/PaywallContent.tsx');
  ok(/PassTable/.test(pay), 'the paywall shows the comparison');
  ok(/TheWall/.test(pay) && /LibraryLine/.test(pay), 'and the reader’s own standing');
  const card = pay.match(/const PASS_CARD_LINES = \[([\s\S]*?)\];/);
  ok(!!card, 'the engraved card lines are one named list');
  if (card) {
    const n = card[1].split('\n').filter((l) => l.trim().startsWith("'")).length;
    ok(n === 3, 'and there are three of them — what the card face fits', `${n} lines`);
  }

  const route = read('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx');
  ok(/<DailyLimit/.test(route) && /<LessonLocked/.test(route),
    'the lesson route delegates both gates');
  ok(!/lockTitle|lockWrap|primaryBtn/.test(route),
    'and keeps none of their old styling');

  // The replay case is why LessonLocked exists: the old copy told a reader who
  // had FINISHED a lesson to go and finish the unit before it.
  const locked = read('components/paywall/LessonLocked.tsx');
  ok(/'replay'/.test(locked) && /'ahead'/.test(locked) && /'unreached'/.test(locked),
    'the locked screen tells the three reasons apart');
  ok(/kind !== 'unreached'/.test(locked),
    'and shows no paywall for the one money cannot fix');
}

// ═════════════════════════════════════════════════════════════════════════════
head('7 · THE CERTIFICATE, AND EVERY FIGURE PRINTED ON IT');
//
// The Pass tab prints two certificates, and the second half of each is a list of
// what a reader ALREADY has — the library, the thinkers, the quotes, the ranks,
// the badges. Those are not gates, so section 1 above cannot hold them; they are
// counts, and a count typed onto a screen that takes money is the exact failure
// §14 exists to prevent. CLAUDE.md was still claiming 132 saveable quotes when
// the tree held 228.
//
// So each one is re-derived here from the data itself, by a second count written
// independently of the one in passValue.
{
  const PH = await import('@/data/philosophers');
  const RK = await import('@/data/ranks');
  const BG = await import('@/data/badges');
  const INS = await import('@/constants/insignia');

  const lines = V.includedLines();
  const byId = (id) => lines.find((l) => l.id === id);
  const IDS = ['library', 'thinkers', 'quotes', 'ranks', 'badges', 'streak'];

  ok(lines.length === IDS.length, 'the schedule has one row per included id',
    `${lines.length} rows`);
  ok(IDS.every((i) => byId(i)), 'every id is present',
    IDS.filter((i) => !byId(i)).join(' ') || 'all present');
  ok(new Set(lines.map((l) => l.id)).size === lines.length, 'no id appears twice');

  // ── the library ───────────────────────────────────────────────────────────
  let lessons = 0, units = 0;
  for (const b of DATA.ALL_BRANCHES) {
    units += b.paths.length;
    for (const u of b.paths) lessons += u.lessons.length;
  }
  const lib = byId('library').detail;
  ok(lib.includes(String(lessons)), 'the library row counts the real lessons', `${lessons} — "${lib}"`);
  ok(lib.includes(String(units)), 'and the real units', `${units}`);
  ok(lib.includes(String(DATA.ALL_BRANCHES.length)), 'and the real branches',
    `${DATA.ALL_BRANCHES.length}`);
  ok(V.libraryTotal() === lessons, '`libraryTotal` agrees with this count', `${V.libraryTotal()}`);

  // ── the thinkers ──────────────────────────────────────────────────────────
  const th = byId('thinkers').detail;
  ok(th.includes(String(PH.ALL_PHILOSOPHERS.length)),
    'the thinkers row counts ALL_PHILOSOPHERS', `${PH.ALL_PHILOSOPHERS.length} — "${th}"`);

  // ── the quotes ────────────────────────────────────────────────────────────
  //
  // Counted a second time, here, rather than trusting `saveableQuotes()` — the
  // point of this file is that the screen's arithmetic is checked BY different
  // arithmetic, not restated by it.
  let quotes = 0;
  for (const b of DATA.ALL_BRANCHES) {
    for (const u of b.paths) {
      for (const l of u.lessons) {
        for (const c of l.cards) if (c.type === 'quote') quotes++;
      }
    }
  }
  const qd = byId('quotes').detail;
  ok(V.saveableQuotes() === quotes, '`saveableQuotes` counts every quote card', `${quotes}`);
  ok(qd.includes(String(quotes)), 'and the quotes row prints that figure', `"${qd}"`);

  // ── the two ladders ───────────────────────────────────────────────────────
  const rk = byId('ranks').detail;
  ok(rk.includes(String(RK.RANKS.length)), 'the ranks row counts the real ladder',
    `${RK.RANKS.length} — "${rk}"`);
  ok(rk.includes(String(INS.ORDERS.length)), 'and the real number of orders',
    `${INS.ORDERS.length}`);

  const bg = byId('badges').detail;
  const tiers = new Set(BG.BADGES.map((b) => b.tier)).size;
  ok(bg.includes(String(BG.BADGES.length)), 'the badges row counts the real roll',
    `${BG.BADGES.length} — "${bg}"`);
  ok(bg.includes(String(tiers)), 'and the tiers actually struck in it', `${tiers}`);

  // ── NOTHING ON THE CERTIFICATE IS TYPED ───────────────────────────────────
  //
  // The counts above could all be right and the SCREEN could still print a
  // number of its own. So the tab's source is read for a bare figure outside a
  // style block — the same shape of rule §17 uses for a typed XP figure in a
  // cinematic string, and for the same reason: a hard-coded number is a claim
  // nobody will re-derive.
  const tab = read('app/(app)/pass.tsx').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  //
  // A REGEX CANNOT FIND A JSX TEXT NODE, and the first draft of this rule proved
  // it. `>\s*([^<>{}]*?)\s*<` matched `lib.left > 0 ? (` — a comparison operator
  // and an opening paren — and reported the screen as printing the figure "0".
  //
  // Balanced braces CAN be stripped, and that is exact. Every attribute value and
  // every interpolation in JSX lives inside `{...}`; take those out, along with
  // the StyleSheet block, and what is left of the render is tag names and literal
  // text. Tag names carry no digits, so anything remaining that does is copy
  // somebody typed by hand.
  const render = tab.slice(tab.indexOf('return ('), tab.indexOf('const st = StyleSheet.create'));
  let literal = '', depth = 0;
  for (const ch of render) {
    if (ch === '{') depth++;
    else if (ch === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0) literal += ch;
  }
  const typedNumber = [...literal.matchAll(/[^\s<>/]*\d[^\s<>/]*/g)].map((m) => m[0]);
  ok(typedNumber.length === 0, 'no figure is typed into the Pass tab',
    typedNumber.slice(0, 3).map((t) => JSON.stringify(t)).join(' ') || 'every number derived');

  // THE SAME STRIP FOR THE TWO PIECES THE TAB IS BUILT FROM, because a digit
  // typed into the shared chart or the door would be on three screens at once.
  for (const rel of ['components/paywall/PassChart.tsx', 'components/paywall/PassDoor.tsx']) {
    const src = read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    const styleAt = src.indexOf('const st = StyleSheet.create');
    const body = src.slice(src.indexOf('return ('), styleAt);
    let lit = '', d = 0;
    for (const ch of body) {
      if (ch === '{') d++;
      else if (ch === '}') d = Math.max(0, d - 1);
      else if (d === 0) lit += ch;
    }
    const typed = [...lit.matchAll(/[^\s<>/]*\d[^\s<>/]*/g)].map((m) => m[0]);
    ok(styleAt > 0 && typed.length === 0, `no figure is typed into ${rel.split('/').pop()}`,
      typed.slice(0, 3).map((t) => JSON.stringify(t)).join(' ') || 'every number derived');
  }

  // -- AND SETTINGS IS THE SIXTH MEMBER OF THE FAMILY --------------------------
  //
  // It was not, and that is why this block exists. Settings > Subscription spent
  // its whole life as two hand-written pricing cards, and every failure mode this
  // section was built to catch was sitting in it at once:
  //
  //   . "All 50 badges", against a roll of seventy.
  //   . Two of the five things the Pass adds, with replay and jumping ahead --
  //     the two biggest -- simply absent. The same silence the paywall kept.
  //   . "$6.99" typed twice, in dollars, on a screen that ships to every
  //     currency Play sells in.
  //
  // None of it could fail anything: a stale claim still typechecks and still
  // renders. So the section is held to the same three rules the tab is.
  const set = read('app/(app)/settings.tsx')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const secStart = set.indexOf('function SubscriptionSection()');
  const secEnd = set.indexOf('function DangerSection()');
  ok(secStart > 0 && secEnd > secStart, 'the settings subscription section is findable');
  const sec = set.slice(secStart, secEnd);

  ok(/<PassChart\b[^>]*size="compact"/.test(sec),
    'settings draws the same chart as the tab, issued compact',
    'the two pricing cards listed two of the five and got the badge count wrong');
  ok(!/<PassChart\b[^>]*\bplay=/.test(sec),
    'and draws it still, without the arrival',
    'the reader asked for the animation on the tab and the offer, not in Settings');
  ok(/<PassDoor\b[^>]*source="settings"/.test(sec),
    'and acts through the same door as the tab \u2014 one object, not a second design');
  const doorSrc = read('components/paywall/PassDoor.tsx');
  ok(/monthly\?\.priceString \?\? FALLBACK_PRICE/.test(doorSrc),
    'and the door\u2019s price is the store\u2019s own string with the shared fallback',
    'a typed price is wrong in every currency but one');

  // THE SAME BALANCED-BRACE STRIP the tab gets. Every attribute value and every
  // interpolation in JSX lives inside {...}; take those out and what is left of
  // the render is tag names and literal text. Tag names carry no digits, so
  // anything remaining that does is copy somebody typed by hand.
  const secRender = sec.slice(sec.indexOf('return ('));
  let secLit = '', secDepth = 0;
  for (const ch of secRender) {
    if (ch === '{') secDepth++;
    else if (ch === '}') secDepth = Math.max(0, secDepth - 1);
    else if (secDepth === 0) secLit += ch;
  }
  const secTyped = [...secLit.matchAll(/[^\s<>/]*\d[^\s<>/]*/g)].map((m) => m[0]);
  ok(secTyped.length === 0, 'and no figure is typed into it either',
    secTyped.slice(0, 3).map((t) => JSON.stringify(t)).join(' ') || 'every number derived');

  // AND IT PICKS ON WHAT THE READER PAYS, NOT ON `isPro`. `isPro` is also true
  // inside the free trial, and a reader on the trial has nothing to cancel: the
  // cancel button shown to them would open a store page with no subscription on it.
  ok(/paying \? \(/.test(sec) && /state\.kind === 'paid' \|\| state\.kind === 'reviewer'/.test(sec),
    'the cancel subscription button is for a paying reader only',
    'isPro is true on the free trial as well, so it cannot decide this');
  ok(/<TrialStatus\b[^>]*source="settings"/.test(sec),
    'and a reader on the trial gets the trial panel, with its own Cancel free trial button');

  // ── AND THE TAB'S CHART SHOWS EVERY DIFFERENCE, SAID SHORT ────────────────
  //
  // The tab stopped being two certificates: a reader found eleven ruled rows,
  // printed twice, "too confusing", and it is a Free-against-Pass chart now, the
  // way Brilliant shows it. A column is about sixty points wide, so `passCompare`
  // re-says each row as a tick, a cross or a few characters. That short form is
  // a second place a claim could drift, so every cell is re-derived here from the
  // constant its gate reads, not from the long form it was made from.
  const CMP = await import('@/lib/utils/passCompare');
  const cmp = CMP.compareRows();
  // ONE CHART, DRAWN IN THREE PLACES. The tab, the post-lesson trial offer and
  // Settings all render `PassChart`, so the chart's own source is what is read
  // for its rows, and each screen is held to drawing it rather than a copy.
  const chartSrc = read('components/paywall/PassChart.tsx');
  ok(/compareRows\(\)/.test(chartSrc) && /rows\.map\(/.test(chartSrc),
    'the shared chart draws from compareRows() rather than a typed list');
  ok(/<PassChart\b[^>]*\bplay=/.test(tab),
    'and the tab draws that chart, with its arrival');
  ok(cmp.length === V.PASS_LINES.length && cmp.every((r, i) => r.id === V.PASS_LINES[i].id),
    'the chart has one row per PASS_LINES entry, in the same order', cmp.map((r) => r.id).join(' · '));
  const cell = (id, side) => cmp.find((r) => r.id === id)?.[side];
  const said = (c) => (c?.kind === 'value' ? c.text : c?.kind);
  ok(said(cell('lessons', 'free')) === String(SUB.FREE_DAILY_LESSON_LIMIT),
    'the Free column\'s lessons a day is the allowance the gate reads', `"${said(cell('lessons', 'free'))}"`);
  ok(cell('ads', 'free')?.kind === 'no' && LINE('ads').free !== null,
    'the Free column does not have "No ads", because a free reader sees them');
  ok((cell('replay', 'free')?.kind === 'no') === (LINE('replay').free === null),
    'replay is crossed out on Free exactly when the free tier cannot replay at all');
  ok(cell('units', 'free')?.kind === 'value',
    'starting a unit is NOT crossed out on Free: a free reader can start them in order');
  ok(String(said(cell('rest', 'free'))).includes(String(STREAK.REST_CAP_FREE))
      && String(said(cell('rest', 'pass'))).includes(String(STREAK.REST_CAP_PRO)),
    'the rest days held are the two caps the streak reads',
    `"${said(cell('rest', 'free'))}" · "${said(cell('rest', 'pass'))}"`);
  ok(cmp.every((r) => r.pass.kind !== 'no'), 'nothing in the Pass column is crossed out');
  ok(cmp.every((r) => said(r.free) !== said(r.pass)),
    'and every row differs between the columns, or it is not a difference');

  // THE SHARED HALF, ONCE. NN/g's rule for a comparison on a phone is to merge
  // what both options share rather than repeat it, and the certificates printed
  // the same six rows twice.
  const tiles = CMP.includedTiles();
  ok(/includedTiles\(\)/.test(chartSrc) && (tab.match(/<PlanTiles\b/g) || []).length === 1,
    'the tab prints what every plan includes once, from includedTiles()');
  ok(tiles.length === IDS.length && IDS.every((id) => tiles.some((t) => t.id === id)),
    'one tile per included id', tiles.map((t) => t.id).join(' · '));
  const fig = (id) => tiles.find((t) => t.id === id)?.figure;
  ok(fig('library') === String(lessons), 'the lessons tile counts the real lessons', `${fig('library')} of ${lessons}`);
  ok(fig('thinkers') === String(PH.ALL_PHILOSOPHERS.length), 'the thinkers tile counts ALL_PHILOSOPHERS', `${fig('thinkers')}`);
  ok(fig('quotes') === String(quotes), 'the quotes tile counts every quote card', `${fig('quotes')}`);
  ok(fig('ranks') === String(RK.RANKS.length), 'the ranks tile counts the real ladder', `${fig('ranks')}`);
  ok(fig('badges') === String(BG.BADGES.length), 'the badges tile counts the real roll', `${fig('badges')}`);

  // ── NO COLOUR IS DECLARED IN THE NEW FILES ────────────────────────────────
  //
  // Same rule section 5 holds the rest of the family to. `mix()` of two tones is
  // fine and is how the certificate derives its gold rules; a raw hex is not.
  for (const f of ['components/paywall/Certificate.tsx', 'components/paywall/PassHerald.tsx', 'app/(app)/pass.tsx',
                   'components/paywall/PassChart.tsx', 'components/paywall/PassDoor.tsx']) {
    const src = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    const hexes = [...src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    ok(hexes.length === 0, `${f.split('/').pop()} declares no colour of its own`,
      hexes.slice(0, 3).join(' ') || 'every value from tone/METAL/mix');
  }

  // ── THE PURPLE ON PAPER, MEASURED ───────────────────────────────────────────────
  //
  // The certificate's frame and its section headings are rules and small caps
  // on bare paper. Gold's base read 2.51:1 there and had to be dragged toward
  // ink; the palette's purple is used as it is, and this asserts it clears.
  const onPaper = ratio(T.PURPLE, D.C.paper);
  ok(onPaper >= 4.5, 'the certificate\'s purple clears 4.5:1 on paper', `${onPaper.toFixed(2)}:1`);

  // The label inside a purple plate takes the metal's own `on`, which check-ui
  // owns — but the plate on this certificate is the ACTIVE flag, so it is worth
  // asserting here too rather than assuming.
  const onPlate = ratio(T.ROYAL.on, T.ROYAL.base);
  ok(onPlate >= 3, 'the ACTIVE plate\'s label reads on its own metal', `${onPlate.toFixed(2)}:1`);

  // ── THE CROSS ON THE TAB'S CHART, READ OUT OF THE TAB ─────────────────────
  //
  // A grey disc is what Brilliant draws for "not included", and GHOST alone
  // measures about 2:1 on paper, under the 3:1 a mark that carries meaning needs
  // (WCAG 1.4.11). The tab darkens it toward ink; both the disc against the Free
  // panel it sits on and the white cross on the disc have to clear the floor.
  // Both mixes are READ from the component rather than restated, which is the
  // rule section 8 below learned the hard way.
  const tabSrc = read('components/paywall/PassChart.tsx');
  const noMix = /const NO_DISC = mix\(GHOST, INK, ([\d.]+)\)/.exec(tabSrc);
  const panelMix = /const FREE_PANEL = mix\(PAPER, GHOST, ([\d.]+)\)/.exec(tabSrc);
  ok(!!noMix && !!panelMix, 'the chart\'s cross and Free panel are readable from the shared chart',
    noMix && panelMix ? `disc ${noMix[1]} · panel ${panelMix[1]}` : 'NOT FOUND — this checker has stopped tracking them');
  if (noMix && panelMix) {
    const disc = T.mix(T.GHOST, T.INK, +noMix[1]);
    const panel = T.mix(T.PAPER, T.GHOST, +panelMix[1]);
    ok(ratio(disc, panel) >= 3, 'the cross\'s disc reads against the Free panel', `${ratio(disc, panel).toFixed(2)}:1`);
    ok(ratio(T.PAPER_LIT, disc) >= 3, 'and the cross reads on its disc', `${ratio(T.PAPER_LIT, disc).toFixed(2)}:1`);
    ok(ratio(T.MID, panel) >= 4.5, 'and a limit said in words reads on the Free panel', `${ratio(T.MID, panel).toFixed(2)}:1`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
head('8 · THE CERTIFICATE\'S NAME FITS THE CERTIFICATE');
//
// The one thing on this screen that cannot be allowed to truncate. The title is
// set in Cinzel capitals with tracking, and at 21px "THE SCHOLAR’S" is 210pt
// wide — against 208pt of room inside the head on a 320dp phone. Two points.
//
// It shipped past a type check, a contact sheet and a mounted-and-measured
// browser sweep at 390dp, and appeared on the narrow phone as "THE SCHOLAR’S …":
// an ellipsis where the name of the product should be. §19 records the identical
// failure for "PER ACTIVE DAY" — measured fine at 390, broke at 360 — so this is
// the second time the narrow phone has been the one that mattered.
//
// Measured against Cinzel's own .ttf in plain Node, at every width the app
// supports, with the head's real padding read out of the component.
{
  const CINZEL = loadFont('node_modules/@expo-google-fonts/cinzel/700Bold/Cinzel_700Bold.ttf');
  const cert = read('components/paywall/Certificate.tsx');

  const SPACE = JSON.parse(/export const SPACE = (\[[^\]]*\])/.exec(read('constants/design.ts'))[1]);
  const headPad = (() => {
    const m = /head: \{[\s\S]*?paddingHorizontal: SPACE\[(\d)\]/.exec(cert);
    return m ? SPACE[+m[1]] : NaN;
  })();
  ok(Number.isFinite(headPad), 'the head\'s padding is readable from the component', `${headPad}pt a side`);

  const FULL_W = +/const TITLE_FULL_W = (\d+)/.exec(cert)[1];
  // BOTH FORMATS, and the pocket one is the tighter case: it sets four points
  // smaller, but it is drawn inside a settings CARD beside a labelled rail, so
  // it has barely half the width to set in. Fitting at full size proves nothing
  // about it.
  //
  // EVERY NUMBER IS READ OUT OF THE COMPONENT, and this block is why. The first
  // version restated the sizes here — `compact ? 17 : 21`, `compact ? 12 : 16`
  // — and a counter-test that raised the component's floor to 14 came back
  // MISSED: the checker was measuring its own copy and had quietly stopped
  // tracking the thing it was checking. That is the fault §19 records for
  // SPLASH_BG and §21 for the must-boxes probe, arriving by a third route, and
  // it is silent in both directions.
  const num = (re, what) => {
    const m = re.exec(cert);
    ok(!!m, `the title's ${what} is readable from the component`,
      m ? m.slice(1).join(' / ') : 'NOT FOUND — this checker has stopped tracking it');
    return m ? m.slice(1).map(Number) : [NaN, NaN];
  };
  const [fullSm, fullLg] = num(/const full = compact \? ([\d.]+) : ([\d.]+);/, 'full size');
  const [floorSm, floorLg] = num(/const floor = compact \? ([\d.]+) : ([\d.]+);/, 'floor');
  const [ratioSm, ratioLg] = num(/width \* \(compact \? ([\d.]+) : ([\d.]+)\)/, 'ratio');
  const titleSize = (w, compact) => (
    w >= FULL_W
      ? (compact ? fullSm : fullLg)
      : Math.max(compact ? floorSm : floorLg, Math.round(w * (compact ? ratioSm : ratioLg)))
  );

  // The longest single WORD-RUN that must sit on one line. A title breaks between
  // words, so what has to fit is the widest line the wrap can produce — for both
  // certificates that is the first line.
  const TITLES = [['THE SCHOLAR’S PASS', 'THE SCHOLAR’S'], ['THE DAY PASS', 'THE DAY PASS']];
  const PAGE_PAD = SPACE[4];   // the Pass tab's own horizontal padding

  // THE SETTINGS CARD IS THE NARROW CASE, and it is not the page width. That
  // screen is a labelled RAIL beside a card, so the certificate gets what is left
  // after the rail, the page padding and the card's own padding — measured in a
  // browser at 390dp it comes out at about 225. Modelled here as a fraction so a
  // rail that gets wider is caught rather than assumed away.
  const headPadSm = (() => {
    const m = /headSm: \{[\s\S]*?paddingHorizontal: SPACE\[(\d)\]/.exec(cert);
    return m ? SPACE[+m[1]] : NaN;
  })();
  ok(Number.isFinite(headPadSm), 'the pocket head\'s padding is readable too', `${headPadSm}pt a side`);

  let worst = Infinity, worstAt = '';
  for (const dp of [320, 360, 390, 412, 430]) {
    for (const compact of [false, true]) {
      // The tab's certificate spans the page inside its own padding. The pocket
      // one loses the rail and a second card's padding on top of that; 0.58 of
      // the page is what the browser measures at 390 and it is the tighter end
      // of what the rail can leave.
      const cardW = compact
        ? Math.round((dp - PAGE_PAD * 2) * 0.58)
        : dp - PAGE_PAD * 2;
      const pad = compact ? headPadSm : headPad;
      const avail = cardW - pad * 2;
      const size = titleSize(cardW, compact);
      for (const [full, line] of TITLES) {
        // Tracking is applied per character by the component (fontSize * 0.124).
        const w = CINZEL.width(line, size) + line.length * size * 0.124;
        const slack = avail - w;
        const where = `${dp}dp${compact ? ' settings' : ''} · ${size}px · "${line}"`;
        if (slack < worst) { worst = slack; worstAt = where; }
        if (slack < 0) {
          ok(false, `"${full}" fits at ${where}`, `${w.toFixed(0)}pt into ${avail}pt — it will truncate`);
        }
      }
    }
  }
  ok(worst >= 0, 'every certificate title fits at every width the app supports',
    `tightest ${worst.toFixed(0)}pt of slack — ${worstAt}`);

  // ── AND THE HEAD CAN GROW ─────────────────────────────────────────────────
  //
  // Fitting the title is only half of it: the head was a FIXED 96pt, so a title
  // that wrapped to three lines was sliced along its top edge instead. Both
  // halves have to hold, and only one of them is arithmetic.
  // `headMin`, not `HEAD_MIN`: there are two resting heights now, one per
  // format, and the head is given whichever applies rather than a constant.
  ok(/minHeight: headMin/.test(cert),
    'the head grows with its title rather than clipping it');
  ok(/const HEAD_MIN_SM = (\d+)/.test(cert),
    'and the pocket copy has a resting height of its own',
    `${/const HEAD_MIN_SM = (\d+)/.exec(cert)?.[1]}pt against the full ${/const HEAD_MIN = (\d+)/.exec(cert)?.[1]}`);
  ok(/numberOfLines=\{3\}/.test(cert),
    'and the title is allowed the third line it sometimes needs');
}


// =============================================================================
head('9 · THE TRIAL IS GOOGLE PLAY\'S, AND NOBODY IS SURPRISED BY THE CHARGE');
//
//   "I want it to explicitly say that the user will be notified a day before the
//    trial expires. And in smaller letters, it will say it will automatically
//    convert to a scholar's pass."
//
// For its first life the trial was granted BY THE APP, and this section held that
// it could never charge anybody. Then the reader found the monthly subscription's
// free-trial offer in Play Console. The Subscribe button had been starting
// Google's trial all along, and that one converts into a charge. There is one
// trial now, Google's, so what this section holds is the opposite promise: that
// the charge is said before the trial starts, a reminder is set for the day
// before it, and cancelling is one button away while it runs.
//
// Each block below is a way that promise could quietly stop being kept while
// every screen still rendered and every type still checked.
{
  const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const TERMS = await import('@/lib/utils/trialTerms');

  // -- 9a. `isPro` IS DERIVED, ALWAYS ---------------------------------------
  //
  // A stray `set({ isPro })` anywhere but derive() would set the entitlement and
  // the trial at odds, and the reader on the losing side of the disagreement is
  // somebody who paid.
  const store = strip(read('stores/subscriptionStore.ts'));
  // `isPro` AS A KEY, not as a word inside the braces: a looser pattern once
  // matched a local holding the store's answer and reported three writes.
  const writes = [...store.matchAll(/set\(\s*\{[^{}]*\bisPro\s*:/g)];
  ok(writes.length === 1, 'isPro is written in exactly one place',
    `${writes.length} write(s)`);
  const dv = store.indexOf('function derive');
  ok(dv >= 0 && /set\(\{ isPro/.test(store.slice(dv, dv + 400)),
    'and that place is derive()', 'entitlement and trial cannot disagree');
  ok(/trialActive\(s\.trialEndsAt/.test(store),
    'and a retired on-device trial still ends by the clock',
    'one that expired while the app was shut must not survive the restart');

  // -- 9b. OFFERED BEFORE THE AD, AND ONLY WHILE GOOGLE WILL GIVE IT --------
  //
  // Before the ad, because the second after an interstitial is the worst frame of
  // mind to ask somebody about a subscription. And only while the STORE is
  // offering this reader a trial. A button promising free days over a sheet that
  // charges at once is the lie section 14 exists to prevent, and Google lists
  // only the offers a reader is still eligible for, so its answer is the only one
  // that can be trusted.
  const rw = strip(read('components/lesson/LessonReward.tsx'));
  const a = rw.indexOf('const handleContinue');
  const b = rw.indexOf('const finishFree');
  ok(a >= 0 && b > a, 'the reward screen separates the offer from the free finish');
  const cont = rw.slice(a, b);
  ok(/canStartTrial\(\)/.test(cont), 'the offer is gated on canStartTrial()');
  ok(!/showInterstitial/.test(cont),
    'and no ad can run before it', 'the interstitial lives past the offer, not in front of it');
  ok(/isPro\b[\s\S]{0,120}?return;/.test(cont),
    'and a reader who holds the Pass is returned before either');
  // The IMPLEMENTATION, not the interface line above it that shares its name. And
  // `trialUsed` anywhere but the migration that deletes it: the old device flag
  // must not decide an offer the store now owns.
  const canImpl = store.slice(store.indexOf('canStartTrial: () => {'), store.indexOf('startTrial: async'));
  ok(/monthly\?\.trial != null/.test(canImpl) && !/trialUsed/.test(store.slice(0, store.indexOf('migrate:'))),
    'the trial is offered only while the store is offering one',
    'the store’s answer, not a flag on this phone');
  const real = strip(read('lib/purchases/real.ts'));
  ok(/defaultOption\?\.freePhase/.test(real),
    'and the offer is read off the option a purchase actually buys',
    'purchasePackage buys defaultOption; a trial read from anywhere else could promise days the sheet will not give');
  // Ended at the NEXT `syncTrial:` after it. The first one in the file is the
  // interface's, which comes before, and slicing to it returned an empty string.
  const startAt = store.indexOf('startTrial: async');
  const startImpl = store.slice(startAt, store.indexOf('syncTrial: () =>', startAt));
  ok(/if \(!get\(\)\.canStartTrial\(\)\) return 'error'/.test(startImpl),
    'a trial button refuses rather than charging once the offer has gone',
    'a button that said free must never open a sheet that charges today');

  // -- 9c. THE OFFER'S SCHEDULE IS THE PASS'S OWN ---------------------------
  //
  // Section 14's founding fault was three hand-typed benefits with two of the
  // five real ones missing. A trial screen listing what the trial gives is where
  // that happens again, so it may not have a list of its own.
  const off = read('components/paywall/TrialOffer.tsx');
  ok(/<PassChart\b[^>]*\bplay=/.test(off),
    'the offer renders the shared chart, with the arrival the tab plays');
  ok(/<PlanTiles\b/.test(off),
    'and the whole included schedule under it');
  const conf = read('components/paywall/PassConferred.tsx');
  ok(/PASS_LINES\.map/.test(conf) && /grade="granted"/.test(conf),
    'and the conferral shows the same five rows, not a summary of them');

  // -- 9d. NO FIGURE IS TYPED ON ANY TRIAL SCREEN ---------------------------
  //
  // The trial's length, its price and its end date all appear on these screens,
  // and every one of them has to come from the store. The balanced-brace strip
  // the Pass tab gets: every interpolation in JSX lives inside `{...}`, so what is
  // left of a render is tag names and literal text, and a digit left in that is
  // copy somebody typed.
  const statusSrc = read('components/paywall/TrialStatus.tsx');
  const askSrc = read('components/paywall/TrialReminderAsk.tsx');
  for (const [rel, src, last] of [
    ['TrialOffer', off, true], ['PassConferred', conf, true],
    ['TrialStatus', statusSrc, false], ['TrialReminderAsk', askSrc, false],
  ]) {
    const t = strip(src);
    // THE LAST `return (` BEFORE THE STYLESHEET for a one-render screen:
    // PassConferred's effect ends with `return () => clearTimeout(t);`, which
    // contains `return (`. From the FIRST one for the two components with a
    // render per state, whose earlier returns are real JSX.
    const styleAt = t.indexOf('const st = StyleSheet.create');
    const from = last ? t.lastIndexOf('return (', styleAt) : t.indexOf('return (');
    const render = t.slice(from, styleAt);
    let literal = '', depth = 0;
    for (const ch of render) {
      if (ch === '{') depth++;
      else if (ch === '}') depth = Math.max(0, depth - 1);
      else if (depth === 0) literal += ch;
    }
    const typed = [...literal.matchAll(/[^\s<>/]*\d[^\s<>/]*/g)].map((m) => m[0]);
    ok(from > 0 && typed.length === 0, `no figure is typed into ${rel}`,
      typed.slice(0, 3).map((x) => JSON.stringify(x)).join(' ') || 'every number derived');
  }

  // -- 9e. ONE CEREMONY, RAISED FROM ONE PLACE ------------------------------
  //
  // Four screens can make somebody a Scholar and three of them close themselves
  // the instant `isPro` flips, so a conferral raised by the caller would be
  // unmounted mid-animation by its own success.
  ok(/showConferral\('purchase'\)/.test(store) && /showConferral\('trial'\)/.test(store),
    'both doors raise the conferral from the store');
  for (const rel of ['components/shared/PaywallContent.tsx', 'app/(app)/pass.tsx',
                     'app/(app)/settings.tsx', 'components/paywall/DailyLimit.tsx',
                     'components/paywall/PassDoor.tsx', 'components/paywall/TrialStatus.tsx']) {
    ok(!/showConferral/.test(read(rel)), `${rel} does not raise its own ceremony`);
  }
  // A RESTORE IS NOT A CONFERRAL: it is the Pass they already had, on a new phone.
  const rest = store.slice(store.indexOf('restore: async'));
  ok(!/showConferral/.test(rest), 'and a restore raises none');

  // -- 9f. THE TRIAL'S ARITHMETIC -------------------------------------------
  //
  // Pure, so it is checked rather than eyeballed. The countdown rounds UP: a trial
  // started at nine on Monday has 71 hours left an hour later, and a reader
  // promised three days who is told two has been short-changed by a rounding rule.
  const H = 3_600_000;
  ok(TR.trialLabel(71 * H) === `${SUB.TRIAL_DAYS} days left`,
    'an hour in, the trial still reads its full length', TR.trialLabel(71 * H));
  ok(TR.trialLabel(23 * H) === '23 hours left',
    'the last day reads in hours', TR.trialLabel(23 * H));
  ok(TR.trialLabel(0.5 * H) === 'Ends within the hour',
    'and the last hour is not counted down to the minute', TR.trialLabel(0.5 * H));
  ok(TR.trialLabel(0) === 'Ended', 'and a spent trial says so');
  ok(TR.trialActive(1000, 999) === true && TR.trialActive(1000, 1000) === false,
    'the trial is over AT its end, not after it');
  ok(TR.trialActive(null, 1) === false, 'and a trial never taken is never active');
  const offer = { value: SUB.TRIAL_DAYS, unit: 'day' };
  ok(TR.trialLengthPhrase(offer) === `${SUB.TRIAL_DAYS} days` && TR.trialAdjective(offer) === `${SUB.TRIAL_DAYS}-day`,
    'the offer’s length reads as the store states it',
    `${TR.trialLengthPhrase(offer)} · ${TR.trialAdjective(offer)}`);
  ok(TR.trialLengthPhrase({ value: 1, unit: 'week' }) === '1 week',
    'and a single unit reads singular');
  ok(TR.reminderAt(10 * 24 * H) === 9 * 24 * H,
    'the reminder is due exactly a day before the end');
  ok(TR.playSubscriptionUrl('philosophize_scholars_pass_monthly:monthly')
      === `https://play.google.com/store/account/subscriptions?sku=philosophize_scholars_pass_monthly&package=${SUB.ANDROID_PACKAGE}`,
    'the cancel link opens on THIS subscription in Google Play',
    'the base plan RevenueCat appends is stripped from the sku');
  const at = (sub, extra = {}) => TR.passState({
    entitled: sub.active, isReviewer: false, sub, trialEndsAt: null, offer: null, ...extra,
  }, 1000).kind;
  const S = (o) => ({ active: false, onTrial: false, expiresAt: null, willRenew: false, productId: null, ...o });
  ok(at(S({ active: true, onTrial: true, willRenew: true })) === 'trial'
     && at(S({ active: true, willRenew: true })) === 'paid'
     && at(S({}), { trialEndsAt: 2000 }) === 'deviceTrial'
     && at(S({}), { trialEndsAt: 500 }) === 'free',
    'a trial, a paid Pass, the retired trial and a free reader are four different states',
    'isPro is true in three of them and cannot tell them apart');

  // -- 9g. EVERY DOOR SAYS THE PROMISE LARGE AND THE CONVERSION SMALL -------
  //
  // Google Play's policy asks the same thing from the other side: before the
  // trial starts, say how long it lasts, what it costs after, when it converts
  // and how to cancel. Three doors with three wordings would be three chances for
  // one of them to leave out the charge, so all three say the shared sentences.
  const t3 = { value: SUB.TRIAL_DAYS, unit: 'day' };
  const terms = TERMS.conversionTerms(t3, '$X', 'month');
  ok(/a day before/.test(TERMS.REMINDER_PROMISE),
    'the promise says the reminder comes a day before the end', TERMS.REMINDER_PROMISE);
  ok(/automatically becomes a Scholar’s Pass/.test(terms) && terms.includes('$X a month'),
    'the terms say it automatically becomes a Scholar’s Pass, at the price');
  ok(terms.includes(TR.trialLengthPhrase(t3)), 'and how long the trial lasts');
  ok(/Cancel any time before then/.test(terms) && /won’t be charged/.test(terms) && terms.includes(TERMS.STORE),
    'and how to cancel without being charged', terms);
  for (const [rel, where] of [
    ['components/paywall/PassDoor.tsx', 'the Pass tab and Settings'],
    ['components/paywall/TrialOffer.tsx', 'the offer after a lesson'],
    ['components/shared/PaywallContent.tsx', 'the paywall'],
  ]) {
    const src = strip(read(rel));
    ok(/\{REMINDER_PROMISE\}/.test(src) && /conversionTerms\(/.test(src) && /startTrialLabel\(/.test(src),
      `${where}: the trial starts under the shared promise and terms`);
    ok(src.indexOf('{REMINDER_PROMISE}') < src.lastIndexOf('conversionTerms('),
      `${where}: the promise comes before the terms`, 'the order the reader asked for');
    ok(!/no card|no charge|nothing to cancel|closes again on its own/i.test(src),
      `${where}: nothing still claims the trial cannot charge`);
  }

  // -- 9h. WHILE IT RUNS, IT SAYS WHAT IT BECOMES, AND CANCEL IS ONE BUTTON -
  //
  //   "I want this to be easy to do so that the user won't be able to complain
  //    about not being able to cancel the free trial before it ends"
  //
  // An app cannot cancel a Google Play subscription itself. Easy means a button
  // nobody can miss, at the top of the tab the reminder opens, and a link that
  // lands on THIS subscription rather than on a list.
  const status = strip(statusSrc);
  ok(/autoConvertLine\(/.test(status) && /label="Cancel free trial"/.test(status),
    'the running trial says what it becomes and carries a Cancel free trial button');
  ok(/openManage\(source\)/.test(status),
    'and the button opens Google Play through the store');
  ok(/cancelledLine\(/.test(status) && /willRenew/.test(status),
    'and once cancelled it says no charge is coming');
  const tabSrc = strip(read('app/(app)/pass.tsx'));
  ok(/<TrialStatus\b[^>]*source="pass_tab"/.test(tabSrc)
     && tabSrc.indexOf('<TrialStatus') < tabSrc.indexOf('<PassChart'),
    'the Pass tab puts the trial above the chart', 'the reminder lands on this tab');
  const manage = store.slice(store.indexOf('openManage: async'), store.indexOf('init: async'));
  ok(/playSubscriptionUrl\(/.test(manage),
    'the store opens this subscription’s own page in Google Play');
  ok(/refresh\(true\)/.test(store),
    'and re-reads it fresh on the way back', 'a cancelled trial must not still say it converts');
  const lay = strip(read('app/(app)/_layout.tsx'));
  ok(/pendingOpen !== 'trial'/.test(lay) && /router\.navigate\('\/\(app\)\/pass'\)/.test(lay),
    'a tap on the reminder opens the Pass tab');

  // -- 9i. THE REMINDER: A DAY BEFORE, ONLY WHILE IT WILL CONVERT, AND ASKED FOR
  const notif = strip(read('lib/notifications/real.ts'));
  const block = notif.slice(notif.indexOf('trial.endsAt != null'), notif.indexOf('export const realNotifications'));
  ok(/trial\.willRenew/.test(block) && /reminderAt\(trial\.endsAt\)/.test(block),
    'the notification is laid down a day before the end, and only while the trial will convert');
  ok(/reminderNotification\(/.test(block) && /open: 'trial'/.test(block) && /TRIAL_CHANNEL/.test(block),
    'in the shared words, on its own channel, and a tap on it opens the trial');
  const rn = TERMS.reminderNotification('$X', 'month');
  ok(/automatically becomes a Scholar’s Pass/.test(rn.body) && /cancel/i.test(rn.body),
    'and it says the trial converts and can be cancelled', rn.body);
  const useRem = strip(read('lib/notifications/useReminders.ts'));
  ok(/remindersNonce, trialEndsAt, trialRenews/.test(useRem),
    'the scheduler re-runs when permission is granted and when the trial changes',
    'the nonce was read and never listed, so a yes scheduled nothing until the next foreground');
  ok(/<TrialReminderAsk\b/.test(conf) && /requestPermission\(\)/.test(strip(askSrc)),
    'the conferral asks for the reminder the moment a trial starts');
  ok(/TRIAL_EMAIL_REMINDERS && email/.test(strip(askSrc)),
    'and mentions an email only once the email is really being sent',
    `TRIAL_EMAIL_REMINDERS is ${SUB.TRIAL_EMAIL_REMINDERS}`);

  // -- 9j. A TRIAL START IS NOT REVENUE -------------------------------------
  //
  // Nobody has been charged. A `$revenue` on a trial would count every trial as a
  // sale whether or not it ever converts, which is most of the number being wrong.
  const buy = store.slice(store.indexOf('purchaseMonthly: async'), store.indexOf('restore: async'));
  const trialAt = buy.indexOf("track('trial_started'");
  const saleAt = buy.indexOf("track('subscribe_succeeded'");
  ok(trialAt > 0 && saleAt > trialAt && buy.indexOf('if (st.onTrial)') < trialAt
     && !/\$revenue/.test(buy.slice(trialAt, saleAt)),
    'a trial start is tracked as a trial, never as revenue');

  // -- 9k. THE REMINDER EMAIL KEEPS THE SAME DAY ----------------------------
  //
  // It is sent by a server that cannot import the app's constants, so the figure
  // is stated twice, and this is what stops the two drifting apart.
  const shared = 'supabase/functions/_shared/trialReminder.ts';
  if (fs.existsSync(path.join(REPO, shared))) {
    const E = await import('@/supabase/functions/_shared/trialReminder');
    ok(E.REMINDER_BEFORE_MS === SUB.TRIAL_REMINDER_BEFORE_MS,
      'the reminder email is due in the same window as the notification',
      `${E.REMINDER_BEFORE_MS} against ${SUB.TRIAL_REMINDER_BEFORE_MS}`);
  } else {
    ok(false, 'the reminder email’s server module exists', shared);
  }
}


// =============================================================================
head('10 · THE MOTTO IS A WHOLE SENTENCE, AND IT BREAKS LIKE ONE');
//
//   "under the scholars pass, it says admits there to the whole library
//    without... and it has a comma, and then just stops there. That's
//    confusing ... I want it to actually have a complete sentence."
//
// Two faults met on one line, and only the second one is visible in the source.
//
// THE COPY WAS A FRAGMENT. "Admits the bearer to the whole library, without
// limit" has no subject, and "Free, for as long as you like -- one sitting at a
// time" has no verb at all. Both are the register a certificate traditionally
// uses and both read, to somebody meeting them cold, as a sentence that stopped.
//
// AND THE WRAP PUT THE BREAK AFTER THE COMMA. At 320dp the first one came out
//
//     Admits the bearer to the whole library,
//     without limit
//
// -- a line ending on a comma with a two-word tail under it, which is exactly
// what "it has a comma, and then just stops there" describes. The second broke
// worse still, stranding "a time" alone. Neither is visible at 390dp, which is
// the width everything here had been measured at.
//
// So both halves are held: a motto must END IN A FULL STOP, and at every width
// the app supports it must not leave a line hanging on a comma or a single word
// stranded on the last line. Measured against EB Garamond's own .ttf in plain
// Node, so it costs milliseconds and needs no browser.
{
  const GARAMOND = loadFont('node_modules/@expo-google-fonts/eb-garamond/400Regular_Italic/EBGaramond_400Regular_Italic.ttf');
  const src = [
    ['pass tab', read('app/(app)/pass.tsx'), 13.5, (w) => w - 96],
    ['settings', read('app/(app)/settings.tsx'), 12, () => 137],
    ['trial offer', read('components/paywall/TrialOffer.tsx'), 13.5, (w) => w - 96],
    ['conferral', read('components/paywall/PassConferred.tsx'), 13.5, (w) => w - 96],
  ];
  const WIDTHS = [430, 412, 390, 375, 360, 320];

  let n = 0, whole = 0, clean = 0;
  for (const [where, text, px, inner] of src) {
    for (const m of text.matchAll(/motto="([^"]+)"/g)) {
      const motto = m[1];
      n++;
      // `ok(cond, ...)` -- NOT `bad(...)`. `bad` in this file is a COUNTER, not a
      // function, so calling it would have thrown "bad is not a function" the
      // first time a motto actually failed. The check would have crashed rather
      // than reported, which is the one failure mode worse than a missing rule.
      const finished = /[.!?]$/.test(motto.trim());
      if (finished) whole++;
      else ok(false, `${where}: the motto is not a whole sentence`, JSON.stringify(motto));

      let worst = null;
      for (const w of WIDTHS) {
        const lines = wrapText(motto, px, inner(w), GARAMOND);
        const hangs = lines.slice(0, -1).some((l) => /,$/.test(l.trim()));
        const orphan = lines.length > 1 && lines[lines.length - 1].trim().split(/\s+/).length < 2;
        if (hangs || orphan) { worst = { w, lines, why: hangs ? 'a line ends on a comma' : 'the last line is one word' }; break; }
      }
      if (!worst) clean++;
      else ok(false, `${where}: the motto breaks badly at ${worst.w}dp — ${worst.why}`,
        JSON.stringify(worst.lines));
    }
  }
  ok(whole === n, 'every motto is a finished sentence', `${whole} of ${n}`);
  ok(clean === n, 'and none hangs on a comma or strands a word, 320dp to 430dp', `${clean} of ${n}`);
}


console.log(bad === 0 ? '\nPASS — the paywall says only what the code enforces.\n'
                      : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);
