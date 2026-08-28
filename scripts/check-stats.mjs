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
//   7. NOTHING RESETS TO ZERO EXCEPT ON AN ARRIVAL. The reader reported the
//      four totals at the top of the tab going blank and reading zero after
//      they opened a thinker and came back, and the cause was every animated
//      part treating a fingerprint change as an entrance: shared values to 0,
//      counters from nothing, tiles to opacity 0. Checked at SOURCE level,
//      because it is a property of the effects rather than of any pure
//      function - an effect that runs on `playToken` may not zero a value
//      without consulting `entrance`.
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

// ── what a tap SAYS, now that it is not arithmetic ──────────────────────────
//
//   > "I dont like the obvious information ... like '5 more lessons and your at
//   > 20 lessons done' this is obvious and isnt informative"
//
// lib/utils/statsDiscovery.ts replaced that with a thinker the reader has not
// met, or a fact about one they have. Five things have to hold, and the fourth
// is the reader's complaint written as an assertion.
writeFileSync(
  path.join(TMP, 'statsDiscovery.mjs'),
  transform(readFileSync(path.join(REPO, 'lib/utils/statsDiscovery.ts'), 'utf8'), {
    transforms: ['typescript'],
  }).code,
);
const DSC = await import(pathToFileURL(path.join(TMP, 'statsDiscovery.mjs')).href);

const cand = (i, met) => ({
  id: `p${i}`, name: `Thinker ${i}`, symbol: '*', oneLiner: `Idea number ${i}`,
  lifespan: '100-200', group: 'ANCIENT', branchSlugs: BRANCHES.slice(0, 1 + (i % 4)),
  met, lessons: i % 5,
});

let dBlank = 0, dMet = 0, dUnstable = 0, dArith = 0, dOneNote = 0;
for (let n = 1; n <= 40; n++) {
  for (const metCount of [0, 1, Math.floor(n / 2), n]) {
    const pool = Array.from({ length: n }, (_, i) => cand(i, i < metCount));
    for (const seed of ['ethics:0', 'ethics:3', 'logic:0', 'ANCIENT:7']) {
      const d = DSC.discoverIn(pool, seed);
      if (!d || !d.body || !d.body.trim()) { dBlank++; continue; }
      if (metCount < n && d.kind !== 'meet') dMet++;
      if (DSC.discoverIn(pool, seed).body !== d.body) dUnstable++;
      if (/\d+\s+more\b/i.test(d.body) || /\d+\s+more\b/i.test(d.kicker)) dArith++;
    }
    if (n >= 9 && metCount === 0) {
      const seen = new Set(['a:0', 'b:1', 'c:2', 'd:3', 'e:4', 'f:5']
        .map((sd) => DSC.discoverIn(pool, sd).body));
      if (seen.size < 2) dOneNote++;
    }
  }
}
ok(dBlank === 0, 'every graph tap has something to say', dBlank ? `${dBlank} blank` : 'across 160 pools, empty through fully met');
ok(dMet === 0, 'an unmet thinker is offered while one exists', dMet ? `${dMet} wrong` : 'and the best-read one when none is left');
ok(dUnstable === 0, 'a card does not re-roll under the reader', dUnstable ? `${dUnstable} unstable` : 'same inputs, same card');
ok(dArith === 0, 'no card is arithmetic the reader can already see', dArith ? `${dArith} said "N more ..."` : 'nothing says "N more"');
ok(dOneNote === 0, 'different rows can say different things', dOneNote ? `${dOneNote} pools were one-note` : 'the pick turns over with the seed');

{
  const facts = ['Fact one', 'Fact two', 'Fact three'];
  const got = new Set();
  for (let i = 0; i < 30; i++) got.add(DSC.discoverFact('X', 'x', facts, `x:${i}`).body);
  ok([...got].every((b) => facts.some((f) => b.startsWith(f))), 'a fact card only ever quotes a real fact');
  ok(got.size > 1, 'and it does not always pick the same one', `${got.size} of ${facts.length} seen`);
  ok(DSC.discoverFact('X', 'x', [], 'x') === null, 'a thinker with no facts on file yields no card');
}

// ── which row bounces ───────────────────────────────────────────────────────
{
  const f = (a, b, c) => `2;ethics:${a}:0:0|logic:${b}:0:0;;kant:${c};;ANCIENT:1`;
  const g = (x, y) => [...M.grownKeys(x, y)].sort().join(',');
  ok(g(f(1, 1, 1), f(1, 1, 1)) === '', 'nothing bounces when nothing changed');
  ok(g(f(1, 1, 1), f(2, 1, 1)) === 'ethics', 'the branch that grew is the one that bounces', g(f(1, 1, 1), f(2, 1, 1)));
  ok(g(f(1, 1, 1), f(2, 3, 1)) === 'ethics,logic', 'two growing rows both bounce');
  ok(g(f(1, 1, 1), f(1, 1, 9)) === 'kant', 'a thinker climbing counts too');
  ok(g(f(5, 5, 5), f(2, 5, 5)) === '', 'a value that FELL does not bounce — a reset is not an achievement');
  ok(g('1;ethics:1:0:0', f(9, 9, 9)) === '', 'a fingerprint version bump bounces nothing at all');
  ok(g('', f(1, 1, 1)) === '' && g(f(1, 1, 1), '') === '', 'a missing fingerprint bounces nothing');
  ok([...M.grownKeys(f(1, 1, 1), '2;ethics:1:0:0|logic:1:0:0|newbranch:2:0:0;;kant:1;;ANCIENT:1')].join(',') === 'newbranch',
    'a row that did not exist before counts as grown');
}

// ── nothing resets to zero except on an arrival ─────────────────────────────
//
// STRIP THE COMMENTS FIRST. §17's L8 is the whole reason: a detector that reads
// raw source reports the paragraph EXPLAINING a defect as the defect, and the
// first hardened checker in this repo did exactly that on its first run.
function strip(src) {
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, '');
  return noBlock.split('\n').map((line) => {
    let q = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '\\') { i++; continue; }
        if (c === q) q = null;
      } else if (c === '"' || c === "'" || c === '`') {
        q = c;
      } else if (c === '/' && line[i + 1] === '/') {
        return line.slice(0, i);
      }
    }
    return line;
  }).join('\n');
}

/** Every `useEffect(() => { … }, [ … ])` in a file, as {body, deps}. */
function effects(src) {
  const out = [];
  const open = /useEffect\(\s*\(\s*\)\s*=>\s*\{/g;
  let m;
  while ((m = open.exec(src))) {
    let i = m.index + m[0].length;
    let depth = 1;
    for (; i < src.length && depth > 0; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
    }
    out.push({
      body: src.slice(m.index + m[0].length, i - 1),
      deps: (src.slice(i, i + 400).match(/^\s*,\s*\[([^\]]*)\]/) || [, ''])[1],
    });
  }
  return out;
}

/**
 * THE DEFECT: an effect that resets a value to zero on a play, without knowing
 * both of the things it has to know.
 *
 * `entrance` alone is not enough, and that is the whole reason this predicate
 * asks for two words rather than one. The first version of the fix consulted
 * `entrance` and still blanked the ledger, because these effects also depend on
 * the FIGURE they draw: the store updates, the effect fires on the value alone,
 * and it reads the previous play's `entrance`. Browser probe, four runs for one
 * tap, the third of them at play 1 with a stale `true`.
 *
 * So an entrance must be gated on `newPlay` as well — something the screen
 * announces, never something a changing number can trigger by itself.
 */
function offenders(src) {
  return effects(strip(src)).filter(
    (e) => /\bplayToken\b/.test(e.deps)
      && /\.value\s*=\s*0\b/.test(e.body)
      && !(/\bentrance\b/.test(e.body) && /\bnewPlay\b/.test(e.body)),
  ).length;
}

{
  // COUNTER-TEST. A detector is only worth its green once it has been watched
  // going red — so all three defects are put back here and must be seen.
  const bad = 'useEffect(() => { n.value = 0; n.value = withTiming(v); }, [playToken, animate, n]);';
  const stale = 'useEffect(() => { if (entrance) { n.value = 0; } }, [playToken, entrance, n, item.value]);';
  const asks = 'useEffect(() => { const newPlay = t.current !== playToken; if (newPlay && entrance) { n.value = 0; } }, [playToken, entrance, n]);';
  const commented = 'useEffect(() => { /* was: n.value = 0 */ n.value = withTiming(v); }, [playToken, n]);';
  ok(offenders(bad) === 1, 'the reset detector sees the defect when it is put back');
  ok(offenders(stale) === 1, 'and sees the one that asks but can be asking about the last play');
  ok(offenders(asks) === 0, 'and holds its fire on an effect that asks about THIS play');
  ok(offenders(commented) === 0, 'and reads the code rather than the comments about it');
}

const TAB_FILES = [
  'components/stats/InsightBoard.tsx',
  'components/stats/Instrument.tsx',
  'components/stats/Dial.tsx',
  'app/(app)/stats/index.tsx',
];

{
  let bad = 0;
  const where = [];
  for (const f of TAB_FILES) {
    const n = offenders(readFileSync(path.join(REPO, f), 'utf8'));
    if (n) { bad += n; where.push(`${f} (${n})`); }
  }
  ok(bad === 0,
    'nothing on the tab resets to zero without asking whether the reader just arrived',
    bad ? where.join(', ') : `${TAB_FILES.length} files clean`);
}

/**
 * AND A FIGURE THE READER CAN READ IS NEVER ANIMATED THROUGH ZERO AT ALL.
 *
 * The rule above governs bars, curtains and sweeps, which may legitimately grow
 * out of nothing — a bar at zero length is a bar, not a claim. A NUMBER at zero
 * is a claim, and it is the one this readout must never make by accident: the
 * reader saw their four totals and their four metrics reading zero and said so
 * twice. The first time it was the entrance replaying on a tap. The second time
 * it was the entrance doing exactly what it was written to do.
 *
 * So the count-up is gone and this is what keeps it gone. Every shared value
 * that ends up in an `ACounter`'s `text` must start at its real figure and must
 * never be assigned 0 — the tiles do the arriving, the digits only move when the
 * figure behind them moves.
 */
function counterZeros(src) {
  const clean = strip(src);
  const names = new Set();
  const re = /useAnimatedProps\([^\n]*?text:[^\n]*?\b([A-Za-z_$][\w$]*)\.value/g;
  let m;
  while ((m = re.exec(clean))) names.add(m[1]);
  const bad = [];
  for (const n of names) {
    if (new RegExp(`\\b${n}\\.value\\s*=\\s*0\\b`).test(clean)) bad.push(`${n}.value = 0`);
    const init = clean.match(new RegExp(`\\b${n}\\s*=\\s*useSharedValue\\(([^;]*)\\)`));
    if (init && /\b0\b/.test(init[1])) bad.push(`${n} starts at 0`);
  }
  return { seen: names.size, bad };
}

{
  // COUNTER-TEST, both directions.
  const good = 'const n = useSharedValue(item.value);\nconst p = useAnimatedProps(() => ({ text: `${Math.round(n.value)}` }) as never);';
  const zeroed = `${good}\nn.value = 0;`;
  const born = 'const n = useSharedValue(animate ? 0 : item.value);\nconst p = useAnimatedProps(() => ({ text: `${Math.round(n.value)}` }) as never);';
  ok(counterZeros(good).seen === 1, 'the counter detector finds the value behind an ACounter');
  ok(counterZeros(good).bad.length === 0, 'and passes one that starts true and stays true');
  ok(counterZeros(zeroed).bad.length === 1, 'and catches one assigned zero');
  ok(counterZeros(born).bad.length === 1, 'and catches one BORN at zero, which no effect can undo');
}

{
  let bad = [];
  let seen = 0;
  for (const f of TAB_FILES) {
    const r = counterZeros(readFileSync(path.join(REPO, f), 'utf8'));
    seen += r.seen;
    bad = bad.concat(r.bad.map((b) => `${f}: ${b}`));
  }
  ok(seen >= 2, 'the tab still has counters to check', `${seen} found`);
  ok(bad.length === 0,
    'no figure the reader can read is ever animated through zero',
    bad.length ? bad.join(', ') : `${seen} counters start true and only move when the figure does`);
}

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
