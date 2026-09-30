// ─────────────────────────────────────────────────────────────────────────────
// WHO EACH LESSON TALKS ABOUT — is the table still true?
//
//   npm run check:mentions      (node --import ./scripts/lib/register.mjs …)
//
// data/lessonMentions.ts is generated, and generated data rots the same silent way
// the must-boxes do: a lesson gets rewritten, the names in it change, and Insights
// keeps crediting whoever used to be in it. Nothing fails, the chart is simply
// wrong about the reader.
//
// So this re-derives the table and compares. It also guards the two rules that make
// the derivation safe at all — every id must be a real philosopher, and a surname
// may only be matched when it belongs to exactly one of them.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const M = (rel) => import(pathToFileURL(path.join(process.cwd(), rel)).href);
const { ALL_PHILOSOPHERS } = await M('data/philosophers.ts');
const { ALL_BRANCHES } = await M('data/index.ts');
const { LESSON_MENTIONS, MENTION_QUOTED, MENTION_NAMED } = await M('data/lessonMentions.ts');

let fails = 0;
const ok = (m, d) => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
const bad = (m, d) => { fails++; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

console.log('\nLESSON MENTIONS\n');

const ids = new Set(ALL_PHILOSOPHERS.map((p) => p.id));
const lessonIds = new Set();
for (const b of ALL_BRANCHES) for (const u of b.paths) for (const l of u.lessons) lessonIds.add(l.id);

// ── every entry points at something real ────────────────────────────────────
let ghostPhil = 0, ghostLesson = 0, badWeight = 0;
for (const [lid, rows] of Object.entries(LESSON_MENTIONS)) {
  if (!lessonIds.has(lid)) { ghostLesson++; if (ghostLesson <= 4) bad(`${lid} is not a lesson any more`); }
  for (const [pid, w] of rows) {
    if (!ids.has(pid)) { ghostPhil++; if (ghostPhil <= 4) bad(`${lid} credits '${pid}', who is not a philosopher`); }
    if (w !== MENTION_QUOTED && w !== MENTION_NAMED) {
      badWeight++;
      if (badWeight <= 4) bad(`${lid} → ${pid} has weight ${w}, not ${MENTION_QUOTED} or ${MENTION_NAMED}`);
    }
  }
}
if (!ghostPhil && !ghostLesson && !badWeight) {
  ok('every entry names a real lesson, a real philosopher and a legal weight');
}

// ── a surname may only be matched when it is unique ─────────────────────────
//
// The whole prose-matching idea rests on this. "Mill" is J. S. Mill and James
// Mill; crediting the wrong one is worse than crediting neither, and it is the
// kind of wrong nobody would ever notice from the chart.
const surOf = (n) => n.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(-1)[0];
const surCount = new Map();
for (const p of ALL_PHILOSOPHERS) {
  const s = surOf(p.name);
  surCount.set(s, (surCount.get(s) ?? 0) + 1);
}
const shared = [...surCount.entries()].filter(([, n]) => n > 1);
// A HIGH-WATER MARK, NOT A PRINTOUT, AND THIS ONE COST A THINKER.
//
// A bare surname in lesson prose is only matched when exactly ONE thinker has
// it, so ADDING a philosopher can silently DELETE an existing one's links.
// Alain Locke was written, entered, and taken back out on exactly this: he made
// "Locke" ambiguous and stripped JOHN Locke out of eight lessons across the
// branch he matters most in. Nothing failed. The table simply regenerated one
// name shorter and every check stayed green -- it was visible only by diffing
// the generated file by hand.
//
// So the count ratchets. Raising it is a deliberate act that says: this new
// name is worth what it costs the one it collides with.
const SHARED_BUDGET = 3;
if (shared.length <= SHARED_BUDGET) {
  ok(`${shared.length} shared surname(s) are excluded from prose matching`,
    shared.slice(0, 4).map(([s, n]) => `${s}×${n}`).join(', '));
} else {
  bad(`${shared.length} shared surnames, budget ${SHARED_BUDGET} — a new thinker has taken an old one's prose links`,
    shared.map(([s, n]) => `${s}×${n}`).join(', '));
}

// ── the table matches what the lessons say NOW ──────────────────────────────
//
// Re-derived here rather than trusted. This is the check that actually catches a
// rewritten lesson, and it is why the generator's rules live in one place.
const gen = await import(pathToFileURL(path.join(process.cwd(), 'scripts/make-mentions.mjs')).href)
  .catch((e) => { bad('could not load make-mentions.mjs', String(e.message).slice(0, 80)); return null; });
if (gen) {
  // RE-DERIVED, not re-read. The first version of this check read the file on disk
  // twice and compared it with itself, which is a check that cannot fail — the exact
  // shape of dead validator this repo has been bitten by before. `derive` and
  // `render` are exported precisely so the comparison has two independent sides.
  const fresh = gen.render(gen.derive().table);
  const disk = fs.readFileSync(path.join(process.cwd(), 'data/lessonMentions.ts'), 'utf8');
  if (fresh.trim() === disk.trim()) {
    ok('the table matches what the lessons say now');
  } else {
    bad('the table is stale — a lesson has changed since it was generated',
      'run: npm run make:mentions');
  }
}

// ── it is worth having at all ───────────────────────────────────────────────
//
// THESE TWO RULES WAIT FOR A LIBRARY (2026-09-30). They judge whether the table can
// carry a "who you read" chart, and that needs a library of lessons about thinkers.
// Since every subject became one road, the app opens seven first lessons — six of them
// about psychology, business, science and the rest, which name no philosopher on
// purpose — and philosophy's old library is retired until it is rebuilt. Held to 60%
// coverage and a 20% ceiling now, a seven-lesson table fails by arithmetic, not by a
// defect. They switch back on by themselves once 20 lessons are open again.
const OPEN_LESSONS = lessonIds.size;
const CHART_READY = OPEN_LESSONS >= 20;
const covered = Object.keys(LESSON_MENTIONS).length;
const pct = (100 * covered) / lessonIds.size;
if (!CHART_READY) ok(`${covered} of ${lessonIds.size} open lessons name a philosopher`, 'the chart rules wait for 20 open lessons');
else if (pct >= 60) ok(`${covered} of ${lessonIds.size} lessons name a philosopher`, `${pct.toFixed(0)}%`);
else bad(`only ${covered} of ${lessonIds.size} lessons name a philosopher`, 'the signal is too thin to chart');

// NO SINGLE THINKER MAY SWAMP THE CHART. If one philosopher accounted for most
// attributions, "top philosophers" would show the same face for every reader and
// tell them nothing about themselves.
const tally = new Map();
let total = 0;
for (const rows of Object.values(LESSON_MENTIONS)) {
  for (const [pid] of rows) { tally.set(pid, (tally.get(pid) ?? 0) + 1); total++; }
}
const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
if (top) {
  const share = (100 * top[1]) / total;
  if (!CHART_READY || share <= 20) ok(`the most-discussed thinker is ${share.toFixed(0)}% of attributions`, `${top[0]} (${top[1]} lessons)`);
  else bad(`${top[0]} is ${share.toFixed(0)}% of all attributions`, 'the chart would show the same face to everyone');
  ok(`${tally.size} philosophers appear in at least one lesson`);
}

console.log(fails ? `\n${fails} failing.\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
