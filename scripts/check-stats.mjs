// Numeric verification for the INSIGHTS TAB's tap interaction.
//
// `lib/utils/statsMilestone.ts` has no imports, so sucrase can transpile it and
// plain Node can run the EXACT rule the screen runs, across far more profiles
// than anyone would tap through by hand.
//
// FIVE claims, and the last one is the one that would rot in silence:
//
//   1. EVERY TAP SAYS SOMETHING — a milestone or an explicit "complete". A blank
//      is the one outcome the interaction cannot survive.
//   2. EVERY GHOST CAN BE SEEN — the "+1 lesson" design died on a 4 degree arc,
//      and nothing stops that coming back except measuring it.
//   3. EVERY COST IS REAL — at least one whole lesson or saved quote, never a
//      target already reached.
//   4. NOTHING OVERSHOOTS ITS CEILING — a branch cannot project past all its
//      lessons being done.
//   5. THE FINGERPRINT MOVES IF AND ONLY IF A DRAWN NUMBER MOVES. The entrance
//      animation fires on change, so a fingerprint that folds in an unrelated
//      field fires every time and the "something happened" meaning is gone —
//      while the animation still looks like it is working perfectly.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'philosophize-stats-check');
mkdirSync(TMP, { recursive: true });
writeFileSync(
  path.join(TMP, 'statsMilestone.mjs'),
  transform(readFileSync(path.join(REPO, 'lib/utils/statsMilestone.ts'), 'utf8'), {
    transforms: ['typescript'],
  }).code,
);
const M = await import(pathToFileURL(path.join(TMP, 'statsMilestone.mjs')).href);

let fails = 0;
const ok = (pass, label, detail) => {
  if (!pass) fails++;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
};

// The two charts' real geometry, so the floor is the floor the reader sees.
const PIE = { mode: 'pie', minGhost: 6 / 360 };     // 6 degrees of arc
const BAR = { mode: 'bar', minGhost: 8 / 144 };     // 8px in a 144px plot

const BRANCHES = ['ethics', 'metaphysics', 'epistemology', 'aesthetics', 'logic', 'political-philosophy'];
const LESSONS_PER_BRANCH = 32;

/** Deterministic 0..1 — no Math.random, so a failure is always reproducible. */
let seed = 12345;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

/** A synthetic reader: how far into each branch, how many quotes, how many views. */
function profile(kind) {
  return BRANCHES.map((slug, i) => {
    let lessons;
    if (kind === 'empty') lessons = 0;
    else if (kind === 'early') lessons = Math.floor(rnd() * 4);
    else if (kind === 'mid') lessons = 4 + Math.floor(rnd() * 14);
    else if (kind === 'late') lessons = 18 + Math.floor(rnd() * 13);
    else if (kind === 'lopsided') lessons = i === 0 ? 30 : Math.floor(rnd() * 3);
    else lessons = LESSONS_PER_BRANCH;                     // 'complete'
    return {
      slug,
      lessons,
      quotes: Math.floor(rnd() * 6),
      views: Math.floor(rnd() * 12),
    };
  });
}

const areaElements = (p) => p
  .map((b) => {
    const value = b.lessons * 3 + b.quotes * 2 + b.views;
    const left = LESSONS_PER_BRANCH - b.lessons;
    return {
      key: b.slug, label: b.slug, value, perAction: 3, action: 'lesson',
      ceiling: LESSONS_PER_BRANCH * 3 + b.quotes * 2 + b.views,
      unitRemaining: left > 0 ? Math.min(left, 6 - (b.lessons % 6 || 6) + 1) : undefined,
      // REAL-SHAPED TITLES, including the ones that end in a question mark —
      // "What Is Ethics?" is the actual first unit of Ethics, and a label like
      // `unit 3` would make the doubled-punctuation check below vacuous.
      unitLabel: left > 0
        ? ['What Is Ethics?', 'The Good Life', 'Why Be Moral?', 'Rules and Consequences'][Math.floor(b.lessons / 6) % 4]
        : undefined,
    };
  })
  .filter((e) => e.value > 0);

const barElements = (p) => p.map((b) => {
  const value = b.lessons + b.quotes + b.views;
  return {
    key: b.slug, label: b.slug, value, perAction: 1, action: 'lesson',
    ceiling: LESSONS_PER_BRANCH + b.quotes + b.views,
  };
});

const philElements = (p) => p.slice(0, 5).map((b, i) => ({
  key: `phil-${i}`, label: `Thinker ${i}`,
  value: b.views * 3 + b.quotes * 5 + b.lessons,
  perAction: 5, action: 'quote',
})).filter((e) => e.value > 0);

console.log('\nWHAT A TAP ON THE INSIGHTS CHARTS SAYS\n');

const KINDS = ['empty', 'early', 'mid', 'late', 'lopsided', 'complete'];
let taps = 0, blank = 0, tooSmall = 0, badCost = 0, overshot = 0, fellBack = 0, completes = 0;
let worstGhost = { g: Infinity, where: '' };
// Unit and lesson titles are written as titles and a great many are questions —
// "What Is Ethics?" — so appending a full stop unconditionally produces
// "finishes What Is Ethics?." No arithmetic catches that; it took loading the
// real screen in a browser. Now it cannot come back.
let doubled = 0, doubledEg = '';

for (const kind of KINDS) {
  for (let rep = 0; rep < 40; rep++) {
    const p = profile(kind);
    for (const [els, opts, name] of [
      [areaElements(p), PIE, 'areas'],
      [barElements(p), BAR, 'activity'],
      [philElements(p), PIE, 'thinkers'],
    ]) {
      for (let i = 0; i < els.length; i++) {
        const m = M.milestoneFor(els, i, opts);
        taps++;
        if (!m || !m.copy || !m.copy.trim()) { blank++; continue; }
        if (/[.!?][.!?]$/.test(m.copy.trim())) { doubled++; doubledEg ||= m.copy; }
        if (m.kind === 'complete') { completes++; continue; }
        if (!(m.cost >= 1) || !Number.isFinite(m.cost)) badCost++;
        if (els[i].ceiling != null && m.projected > els[i].ceiling + 1e-9) overshot++;
        if (m.ghost < opts.minGhost) {
          // Only the deliberate branch fallback may sit under the floor.
          if (m.kind === 'branch') fellBack++;
          else { tooSmall++; }
          if (m.ghost < worstGhost.g) worstGhost = { g: m.ghost, where: `${kind}/${name}/${els[i].key}` };
        }
      }
    }
  }
}

ok(taps > 2000, 'the check actually tapped things', `${taps} taps across ${KINDS.length} kinds of profile`);
ok(blank === 0, 'every tap says something', blank ? `${blank} blank` : `${completes} of them "complete", the rest a target`);
ok(tooSmall === 0, 'no ghost is too small to see',
  tooSmall ? `${tooSmall} under the floor` :
    `floor is ${(PIE.minGhost * 360).toFixed(0)}deg / ${(BAR.minGhost * 144).toFixed(0)}px; ${fellBack} fell back to finishing the branch`);
ok(badCost === 0, 'every cost is at least one whole action', badCost ? `${badCost} bad` : 'no free milestones');
ok(overshot === 0, 'nothing projects past a finished branch', overshot ? `${overshot} overshot` : 'every projection within its ceiling');
ok(doubled === 0, 'no line ends in two full stops',
  doubled ? `${doubled}, e.g. "${doubledEg}"` : 'titles that are questions keep their question mark');

// ── 5. the fingerprint ──────────────────────────────────────────────────────
//
// Built from a store-shaped object so the sweep can touch the fields a real
// store has and prove they do NOT move it.
const base = {
  branches: BRANCHES.map((slug, i) => ({ slug, interest: 10 + i, interactions: 4 + i })),
  philosophers: [['kant', 30], ['hume', 22], ['plato', 14]].map(([id, score]) => ({ id, score })),
};
const fp = (x) => M.statsFingerprint(x);
const F0 = fp(base);

const same = [];
const moved = [];

// things that must NOT move it: everything the charts do not draw
for (const [name, mutate] of [
  ['a settings toggle', (x) => ({ ...x })],
  ['branch order', (x) => ({ ...x, branches: [...x.branches].reverse() })],
  ['an identical rebuild', (x) => ({ branches: x.branches.map((b) => ({ ...b })), philosophers: x.philosophers.map((p) => ({ ...p })) })],
]) {
  if (fp(mutate(base)) !== F0) same.push(name);
}
ok(same.length === 0, 'unrelated changes leave the fingerprint alone',
  same.length ? `moved by: ${same.join(', ')}` : 'settings, ordering and rebuilds all inert');

// things that MUST move it: every number the charts draw
for (const [name, mutate] of [
  ['one lesson in a branch', (x) => ({ ...x, branches: x.branches.map((b, i) => (i === 2 ? { ...b, interest: b.interest + 3 } : b)) })],
  ['one interaction in a branch', (x) => ({ ...x, branches: x.branches.map((b, i) => (i === 4 ? { ...b, interactions: b.interactions + 1 } : b)) })],
  ["a thinker's score", (x) => ({ ...x, philosophers: x.philosophers.map((p, i) => (i === 1 ? { ...p, score: p.score + 5 } : p)) })],
  ['the thinker ranking', (x) => ({ ...x, philosophers: [x.philosophers[1], x.philosophers[0], x.philosophers[2]] })],
  ['a new thinker appearing', (x) => ({ ...x, philosophers: [...x.philosophers, { id: 'mill', score: 9 }] })],
]) {
  if (fp(mutate(base)) === F0) moved.push(name);
}
ok(moved.length === 0, 'and every drawn number moves it',
  moved.length ? `missed: ${moved.join(', ')}` : 'lessons, interactions, scores, ranking and new thinkers all register');

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
