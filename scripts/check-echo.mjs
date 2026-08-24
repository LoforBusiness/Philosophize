// DOES ANY LESSON READ AS THE ONE BEFORE IT, AGAIN?
//
//   node --import ./scripts/lib/register.mjs scripts/check-echo.mjs   (npm run check:echo)
//
// Group Q. F43 has asked for this since the card era — "don't let two
// consecutive lessons feel identical" — and for its whole life it was a
// sentence in a document with nothing behind it. A reader walking a branch
// end to end is the only person who ever sees two lessons next to each other,
// and they are the one person the rule is for:
//
//   > "no two lessons by each other can be the same … I always want lessons to
//   >  present information/animations/and everything else in lessons to be done
//   >  in a unique way, not just copying over and over again."
//
// ── WHAT CAN HONESTLY BE MEASURED ───────────────────────────────────────────
//
// Not "does it feel fresh". Three things that are countable and that between
// them cover what a reader actually notices when a lesson repeats itself:
//
//   1 · THE INSTRUMENT — the channels the script declares. That list IS the
//       scene's moving parts, so two neighbours with the same channels are two
//       runs of one machine with different words over it.
//   2 · WHAT THE READER IS ASKED TO DO — the graded prompts' content words.
//       Two neighbours both saying "tap the claim that…" is the echo the reader
//       hits with their thumb rather than their eye.
//   3 · THE DECLARED PICTURE — the `// Theme:` line, which H64 already demands
//       be written before the beats. Two lessons whose one-line picture shares
//       its nouns are the same drawing twice.
//
// Every threshold below is the CURRENT MEASURED WORST, not a number picked to
// feel strict. They are high-water marks in the sense the rest of the repo uses:
// a run that beats one should lower it in the same commit.
//
// ── WHAT IT DELIBERATELY DOES NOT CHECK ─────────────────────────────────────
//
// The house shape (H52): 7–11 beats, two graded questions, one quote, one
// summary, last. Those are supposed to be identical everywhere and
// validate-cinematic already enforces them. Sameness of STRUCTURE is what makes
// 150 lessons one product; sameness of PICTURE is what makes them a chore.
import fs from 'node:fs';

const DIR = 'components/lesson/cinematic';
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

// ── the budgets ──────────────────────────────────────────────────────────────
/** Worst adjacent channel-set overlap. Measured; may only go DOWN. */
const INSTRUMENT_CEILING = 0.50;
/** Worst adjacent graded-prompt word overlap. Measured; may only go DOWN. */
const ASK_CEILING = 0.20;
/** How many lessons declare their picture in one line. May only go UP. */
const THEME_FLOOR = 58;

const { ALL_BRANCHES } = await import('@/data');

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};
const head = (t) => console.log(`\n${t}\n${'─'.repeat(t.length)}`);

const route = fs.readFileSync(ROUTE, 'utf8');
const wired = new Map(
  [...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]),
);
const imports = new Map(
  [...route.matchAll(/import \{?\s*(\w+)\s*\}? from '@\/components\/lesson\/cinematic\/(\w+)'/g)]
    .map((m) => [m[1], m[2]]),
);
function scriptFor(comp) {
  const scene = imports.get(comp);
  if (!scene) return null;
  const base = scene.replace(/Scene$/, '');
  for (const cand of [`${base}Script.ts`, `${scene}.tsx`]) {
    if (fs.existsSync(`${DIR}/${cand}`)) return `${DIR}/${cand}`;
  }
  return null;
}

const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size && !B.size) return 0;
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / new Set([...A, ...B]).size;
};

// Words that carry no picture. Kept deliberately short: over-stopping is how a
// similarity check quietly stops finding anything.
const STOP = new Set((
  'the a an of to in is it and or that this these those what which who whom whose ' +
  'does do did you your one two three both each every all any some no not ' +
  'tap pick choose drag move put place on at for from with as be been being was were ' +
  'are am has have had will would can could should must may might if then than by ' +
  'its his her their there here when where why how out up down over under into ' +
  'about after before still just only more most less least same other another'
).split(' '));
const words = (s) => [...new Set(
  s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w)),
)];

// ── read every wired lesson, in reading order ────────────────────────────────
const rows = [];
for (const b of ALL_BRANCHES) {
  for (const u of b.paths) {
    for (const l of u.lessons) {
      const comp = wired.get(l.id);
      if (!comp) continue;
      const sp = scriptFor(comp);
      if (!sp) { rows.push({ branch: b.slug, id: l.id, title: l.title, missing: comp }); continue; }
      const src = fs.readFileSync(sp, 'utf8');

      const iface = src.match(/export interface \w+Beat extends BaseBeat \{([\s\S]*?)\n\}/);
      const chans = iface
        ? [...iface[1].matchAll(/^\s*(?:\/\*\*[\s\S]*?\*\/\s*)?(\w+)\??:/gm)].map((x) => x[1])
        : [];

      // Both graded prompts. Single-quoted with escaped apostrophes, which is
      // how every script writes them.
      const prompts = [...src.matchAll(/prompt:\s*'((?:[^'\\]|\\.)*)'/g)]
        .map((m) => m[1].replace(/\\'/g, "'"));

      const theme = (src.match(/^\/\/ Theme:\s*(.+)$/m) ?? [])[1] ?? null;

      rows.push({ branch: b.slug, id: l.id, title: l.title, file: sp, chans, prompts, theme });
    }
  }
}

// The two lessons that predate the shared player carry their own copy of it and
// declare no beat interface at all, so they have no channels to compare. They
// are exempt by having nothing to measure, not by being excused.
const BESPOKE = rows.filter((r) => r.chans && r.chans.length === 0).map((r) => r.id);

// ═════════════════════════════════════════════════════════════════════════════
head('Q1 · NO TWO NEIGHBOURS ARE THE SAME MACHINE');
//
// The channel list is the scene's moving parts. `[p, x, rule, fact, concl, pick]`
// is a board being written on; `[p, hotel, shift, dbl, live]` is a building
// emptying. A reader cannot name the difference and feels it immediately.
{
  const pairs = [];
  for (const b of ALL_BRANCHES) {
    const list = rows.filter((r) => r.branch === b.slug && r.chans && r.chans.length);
    for (let i = 1; i < list.length; i++) {
      pairs.push({
        s: jaccard(list[i - 1].chans, list[i].chans),
        a: list[i - 1].id, b: list[i].id,
        ca: list[i - 1].chans, cb: list[i].chans,
      });
    }
  }
  pairs.sort((x, y) => y.s - x.s);
  const over = pairs.filter((p) => p.s > INSTRUMENT_CEILING);
  ok(over.length === 0, `no neighbour pair shares more than ${INSTRUMENT_CEILING} of its channels`,
    over.length
      ? over.slice(0, 3).map((p) => `${p.a}→${p.b} ${p.s.toFixed(2)} [${p.ca}] vs [${p.cb}]`).join(' · ')
      : `worst ${pairs[0]?.s.toFixed(2) ?? '—'} (${pairs[0]?.a} → ${pairs[0]?.b})`);

  const worst = pairs[0]?.s ?? 0;
  if (worst < INSTRUMENT_CEILING - 1e-9) {
    console.log(`        the worst pair is now ${worst.toFixed(2)} — lower INSTRUMENT_CEILING to ${worst.toFixed(2)} to lock it in`);
  }
  ok(BESPOKE.length <= 2, 'only the two pre-player lessons declare no channels',
    BESPOKE.join(', ') || 'none');
}

// ═════════════════════════════════════════════════════════════════════════════
head('Q2 · NO TWO NEIGHBOURS ASK THE SAME QUESTION');
//
// Content words of both graded prompts. This is the axis a reader meets with
// their thumb: two lessons in a row that both say "tap the one that actually
// follows" are the same interaction wearing different nouns.
{
  const pairs = [];
  for (const b of ALL_BRANCHES) {
    const list = rows.filter((r) => r.branch === b.slug && r.prompts && r.prompts.length);
    for (let i = 1; i < list.length; i++) {
      const wa = words(list[i - 1].prompts.join(' '));
      const wb = words(list[i].prompts.join(' '));
      pairs.push({ s: jaccard(wa, wb), a: list[i - 1].id, b: list[i].id,
        shared: wa.filter((x) => new Set(wb).has(x)) });
    }
  }
  pairs.sort((x, y) => y.s - x.s);
  const over = pairs.filter((p) => p.s > ASK_CEILING);
  ok(over.length === 0, `no neighbour pair shares more than ${ASK_CEILING} of its prompt words`,
    over.length
      ? over.slice(0, 3).map((p) => `${p.a}→${p.b} ${p.s.toFixed(2)} (${p.shared.join(' ')})`).join(' · ')
      : `worst ${pairs[0]?.s.toFixed(2) ?? '—'} (${pairs[0]?.a} → ${pairs[0]?.b}: ${pairs[0]?.shared.join(' ') || '—'})`);

  const worst = pairs[0]?.s ?? 0;
  if (worst < ASK_CEILING - 1e-9) {
    console.log(`        the worst pair is now ${worst.toFixed(2)} — lower ASK_CEILING to ${worst.toFixed(2)} to lock it in`);
  }
  // Same exemption as Q1, for the same reason rather than a second one: the two
  // pre-player lessons build their questions inside their own components, so
  // there is no `prompt:` in a script to read. They are excluded by having
  // nothing to measure — and Q1 already asserts there are only ever two of them,
  // so this cannot quietly grow into a way of opting out.
  const noPrompt = rows
    .filter((r) => r.prompts && !r.prompts.length && !BESPOKE.includes(r.id))
    .map((r) => r.id);
  ok(noPrompt.length === 0, 'every lesson on the shared player states its questions in words',
    noPrompt.join(', ') || `${rows.filter((r) => r.prompts?.length).length} lessons read`);
}

// ═════════════════════════════════════════════════════════════════════════════
head('Q3 · EVERY LESSON SAYS WHAT ITS PICTURE IS, AND NO TWO SAY THE SAME');
//
// H64 already requires the author to be able to finish the sentence "the picture
// is X, and over the lesson X does Y" BEFORE writing any beats. `// Theme:` is
// that sentence, in the file, where it can be compared against its neighbours
// instead of living in somebody's head.
{
  const themed = rows.filter((r) => r.theme);
  ok(themed.length >= THEME_FLOOR, `at least ${THEME_FLOOR} lessons declare a picture`,
    `${themed.length} of ${rows.length}`);
  if (themed.length > THEME_FLOOR) {
    console.log(`        ${themed.length} now — raise THEME_FLOOR to ${themed.length} to lock it in`);
  }

  // Nobody may reuse a picture, anywhere in the app — not only next door.
  const seen = new Map();
  for (const r of themed) {
    const key = words(r.theme).sort().join('|');
    seen.set(key, [...(seen.get(key) ?? []), r.id]);
  }
  const dupes = [...seen.entries()].filter(([, v]) => v.length > 1);
  ok(dupes.length === 0, 'no picture is declared twice anywhere',
    dupes.map(([, v]) => v.join(' = ')).join(' · ') || `${themed.length} distinct`);

  // And next door, they may not even share their nouns.
  const pairs = [];
  for (const b of ALL_BRANCHES) {
    const list = rows.filter((r) => r.branch === b.slug && r.theme);
    for (let i = 1; i < list.length; i++) {
      const wa = words(list[i - 1].theme), wb = words(list[i].theme);
      const shared = wa.filter((x) => new Set(wb).has(x));
      pairs.push({ n: shared.length, a: list[i - 1].id, b: list[i].id, shared });
    }
  }
  pairs.sort((x, y) => y.n - x.n);
  // Two nouns is a coincidence a real pair can survive ("two" and "line" turn up
  // everywhere); three is the same drawing described twice.
  const over = pairs.filter((p) => p.n >= 3);
  ok(over.length === 0, 'neighbouring pictures share at most two nouns',
    over.length
      ? over.slice(0, 3).map((p) => `${p.a}→${p.b} (${p.shared.join(' ')})`).join(' · ')
      : `worst ${pairs[0]?.n ?? 0} (${pairs[0]?.shared.join(' ') || '—'})`);
}

// ═════════════════════════════════════════════════════════════════════════════
head('Q4 · THE FILES ARE ALL THERE');
{
  const missing = rows.filter((r) => r.missing);
  ok(missing.length === 0, 'every wired lesson resolves to a script',
    missing.map((m) => `${m.id} → ${m.missing}`).join(', ') || `${rows.length} lessons`);
}

console.log(bad === 0
  ? '\nPASS — no lesson reads as the one before it.\n'
  : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);
