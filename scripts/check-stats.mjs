// Numeric verification for the INSIGHTS TAB's tap interaction.
//
// `lib/utils/statsMilestone.ts` has no imports, so sucrase can transpile it and
// plain Node can run the EXACT rule the screen runs, across far more profiles
// than anyone would tap through by hand.
//
// SIX claims, and the first one is the one this file was rewritten for:
//
//   1. NO TARGET DEPENDS ON THE SIZE OF THE CURRICULUM. Every profile is run
//      twice — once against a 32-lesson branch and once against a 900-lesson
//      branch — and every milestone must come out identical. This is what the
//      reader asked for: "since I will be continuing adding lessons, that
//      doesn't make sense". A ceiling-based target moves AWAY from someone who
//      has done nothing wrong, every time content ships.
//   2. A TARGET NEVER RETREATS AS YOU WORK. Doing the action must always leave
//      you nearer, never further.
//   3. EVERY TAP SAYS SOMETHING — a blank is the one outcome the interaction
//      cannot survive.
//   4. EVERY GHOST CAN BE SEEN — the "+1 lesson" design died on a 4 degree arc,
//      and nothing stops that coming back except measuring it.
//   5. EVERY COST IS REAL — at least one whole lesson or saved quote, never a
//      target already reached.
//   6. THE FINGERPRINT MOVES IF AND ONLY IF A DRAWN NUMBER MOVES. The entrance
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

// The charts' real geometry, so the floor is the floor the reader sees.
const BAR = { minGhost: 8 / 144 };     // 8px in a 144px plot

const BRANCHES = ['ethics', 'metaphysics', 'epistemology', 'aesthetics', 'logic', 'political-philosophy'];

/** Deterministic 0..1 — no Math.random, so a failure is always reproducible. */
let seed = 12345;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

/** A synthetic reader: how far into each branch, how many quotes, how many read. */
function profile(kind, perBranch) {
  return BRANCHES.map((slug, i) => {
    let lessons;
    if (kind === 'empty') lessons = 0;
    else if (kind === 'early') lessons = Math.floor(rnd() * 4);
    else if (kind === 'mid') lessons = 4 + Math.floor(rnd() * 14);
    else if (kind === 'late') lessons = 18 + Math.floor(rnd() * 13);
    else if (kind === 'lopsided') lessons = i === 0 ? 30 : Math.floor(rnd() * 3);
    // NOT `perBranch`: the two passes must be the SAME READER seen against two
    // different curriculum sizes. Tying the reader's own progress to the
    // curriculum makes claim 1 compare two different people and always fail.
    else lessons = 32;                                     // 'complete'
    return {
      slug,
      lessons,
      quotes: Math.floor(rnd() * 6),
      views: Math.floor(rnd() * 12),
      // Carried ONLY so the builders below could use it if someone reintroduced
      // a ceiling. Nothing may read it — claim 1 is what proves nothing does.
      perBranch,
    };
  });
}

const areaElements = (p) => p.map((b) => ({
  key: b.slug, label: b.slug, value: b.lessons, perAction: 1, action: 'lesson',
}));

const quoteElements = (p) => p.map((b) => ({
  key: b.slug, label: b.slug, value: b.quotes, perAction: 1, action: 'quote',
}));

const philElements = (p) => p.slice(0, 5).map((b, i) => ({
  key: `phil-${i}`, label: `Thinker ${i}`,
  value: b.views + b.quotes + b.lessons,
  perAction: 1, action: 'lesson',
})).filter((e) => e.value > 0);

const BUILDERS = [['areas', areaElements], ['quotes', quoteElements], ['thinkers', philElements]];

console.log('\nWHAT A TAP ON THE INSIGHTS CHARTS SAYS\n');

const KINDS = ['empty', 'early', 'mid', 'late', 'lopsided', 'complete'];
let taps = 0, blank = 0, tooSmall = 0, badCost = 0, notNearer = 0;
let doubled = 0, doubledEg = '';
// Claim 1's counters. Two curriculum sizes, everything else identical — the
// seed is reset before each pass so the profiles are the same readers.
let drifted = 0, driftEg = '';

for (const perBranch of [32, 900]) {
  seed = 12345;
  const pass = [];
  for (const kind of KINDS) {
    for (let rep = 0; rep < 40; rep++) {
      const p = profile(kind, perBranch);
      for (const [name, build] of BUILDERS) {
        const els = build(p);
        for (let i = 0; i < els.length; i++) {
          const m = M.milestoneFor(els, i, BAR);
          pass.push(m.copy);
          if (perBranch !== 32) continue;         // measure the rest once only
          taps++;
          if (!m || !m.copy || !m.copy.trim()) { blank++; continue; }
          if (/[.!?][.!?]$/.test(m.copy.trim())) { doubled++; doubledEg ||= m.copy; }
          if (m.kind === 'none') continue;
          if (!(m.cost >= 1) || !Number.isFinite(m.cost)) badCost++;
          if (m.ghost < BAR.minGhost) tooSmall++;

          // Claim 2, per tap. Comparing COST alone is wrong and the first draft
          // of this check did exactly that: overtaking someone legitimately
          // re-aims at the next person up, so the cost jumps while nothing has
          // gone backwards. The property that actually matters is that effort is
          // permanent — so for an UNCHANGED target, one action must always leave
          // strictly fewer to do.
          const after = els.map((e, j) => (j === i ? { ...e, value: e.value + e.perAction } : e));
          const m2 = M.milestoneFor(after, i, BAR);
          if (m2.projected === m.projected && m2.cost >= m.cost) notNearer++;
        }
      }
    }
  }
  if (perBranch === 32) globalThis.__first = pass;
  else {
    const first = globalThis.__first;
    for (let i = 0; i < first.length; i++) {
      if (first[i] !== pass[i]) { drifted++; driftEg ||= `"${first[i]}" -> "${pass[i]}"`; }
    }
  }
}

ok(drifted === 0, 'no target depends on how big the curriculum is',
  drifted ? `${drifted} differed, e.g. ${driftEg}` :
    `${globalThis.__first.length} milestones identical at 32 and at 900 lessons a branch`);
ok(notNearer === 0, 'a target never retreats as you work',
  notNearer ? `${notNearer} got further away` : 'doing the action always leaves you nearer');
ok(taps > 2000, 'the check actually tapped things', `${taps} taps across ${KINDS.length} kinds of profile`);
ok(blank === 0, 'every tap says something', blank ? `${blank} blank` : 'every element has a reachable target');
ok(tooSmall === 0, 'no ghost is too small to see',
  tooSmall ? `${tooSmall} under the floor` : `floor is ${(BAR.minGhost * 144).toFixed(0)}px in a 144px plot`);
ok(badCost === 0, 'every cost is at least one whole action', badCost ? `${badCost} bad` : 'no free milestones');
ok(doubled === 0, 'no line ends in two full stops',
  doubled ? `${doubled}, e.g. "${doubledEg}"` : 'nothing double-punctuated');

// ── the round marks themselves ──────────────────────────────────────────────
//
// `nextMark` is the whole of claim 1's second half: an absolute number that
// means the same thing whatever the app contains. Two properties are all it
// needs, and both are the sort of thing that breaks silently.
let markBad = 0, markStuck = 0;
for (let n = 0; n <= 1200; n++) {
  const m = M.nextMark(n);
  if (!(m > n)) markBad++;                                  // never the one you stand on
  if (n > 0 && M.nextMark(n - 1) > m) markStuck++;          // never goes backwards
}
ok(markBad === 0, 'the next mark is always ahead of you', markBad ? `${markBad} not ahead` : 'including exact round numbers');
ok(markStuck === 0, 'and marks never run backwards', markStuck ? `${markStuck} inverted` : 'monotonic from 0 to 1200');

// ── the fingerprint ─────────────────────────────────────────────────────────
const base = {
  branches: BRANCHES.map((slug, i) => ({ slug, lessons: 3 + i, quotes: i, thinkers: 2 + i })),
  philosophers: [['kant', 30], ['hume', 22], ['plato', 14]].map(([id, score]) => ({ id, score })),
  eras: [['ANCIENT', 4], ['MODERN', 7], ['EASTERN', 1]].map(([key, value]) => ({ key, value })),
};
const fp = (x) => M.statsFingerprint(x);
const F0 = fp(base);

const same = [];
const moved = [];

// things that must NOT move it: everything the charts do not draw
for (const [name, mutate] of [
  ['a settings toggle', (x) => ({ ...x })],
  ['branch order', (x) => ({ ...x, branches: [...x.branches].reverse() })],
  ['era order', (x) => ({ ...x, eras: [...x.eras].reverse() })],
  ['an identical rebuild', (x) => ({
    branches: x.branches.map((b) => ({ ...b })),
    philosophers: x.philosophers.map((p) => ({ ...p })),
    eras: x.eras.map((e) => ({ ...e })),
  })],
]) {
  if (fp(mutate(base)) !== F0) same.push(name);
}
ok(same.length === 0, 'unrelated changes leave the fingerprint alone',
  same.length ? `moved by: ${same.join(', ')}` : 'settings, ordering and rebuilds all inert');

// things that MUST move it: every number the charts draw
for (const [name, mutate] of [
  ['one lesson in a branch', (x) => ({ ...x, branches: x.branches.map((b, i) => (i === 2 ? { ...b, lessons: b.lessons + 1 } : b)) })],
  ['one quote in a branch', (x) => ({ ...x, branches: x.branches.map((b, i) => (i === 4 ? { ...b, quotes: b.quotes + 1 } : b)) })],
  ['a thinker met in a branch', (x) => ({ ...x, branches: x.branches.map((b, i) => (i === 1 ? { ...b, thinkers: b.thinkers + 1 } : b)) })],
  ["a thinker's score", (x) => ({ ...x, philosophers: x.philosophers.map((p, i) => (i === 1 ? { ...p, score: p.score + 5 } : p)) })],
  ['the thinker ranking', (x) => ({ ...x, philosophers: [x.philosophers[1], x.philosophers[0], x.philosophers[2]] })],
  ['a new thinker appearing', (x) => ({ ...x, philosophers: [...x.philosophers, { id: 'mill', score: 9 }] })],
  ['one more from an era', (x) => ({ ...x, eras: x.eras.map((e, i) => (i === 0 ? { ...e, value: e.value + 1 } : e)) })],
]) {
  if (fp(mutate(base)) === F0) moved.push(name);
}
ok(moved.length === 0, 'and every drawn number moves it',
  moved.length ? `missed: ${moved.join(', ')}` : 'lessons, quotes, thinkers, scores, ranking and eras all register');

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
