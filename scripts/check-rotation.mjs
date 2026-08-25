// HOW A READER'S THUMB IS ASKED TO MOVE, LESSON AFTER LESSON.
//
// Group R says which control a CLAIM wants. This asks the other question, the one
// only a reader working through a branch ever feels: does lesson 17 ask for
// anything my thumb did not already do in lesson 16?
//
//   "I want that to be implemented into all the lessons on a good rotation. I
//    still want a couple every now and then for the old way of answering below
//    the stickman, and I also want ways to answer above the stickman too."
//
// Three things follow, and all three are countable.
//
// 1. SPREAD — the two-card deck may not be most of the corpus. It is the right
//    control for a genuine either/or and the wrong one for everything else, and
//    it became the default because it is the easiest to write.
// 2. NEIGHBOURS — two lessons in a row should not be answered the same way twice.
//    This is group Q applied to the hands rather than the eyes.
// 3. ABOVE AND BELOW — every lesson should still ask one question on the STAGE
//    and one under it (H65). The stage question is the one that makes the picture
//    the thing being answered, and it is the half most easily lost when a shiny
//    new control arrives.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';

/** Below the figure: the deck and the five analogue controls. */
const BELOW = ['cards', 'drag', 'lever', 'plot', 'split', 'field'];

/** The deck is right sometimes and not most of the time. */
const DECK_CEIL = 0.55;
/** Neighbouring lessons answered the same way. High-water mark; may only go DOWN. */
const SAME_BUDGET = 112;
/** Lessons asking both questions below the figure. High-water mark; may only go DOWN. */
const STAGELESS_BUDGET = 36;

const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const wired = [...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => ({ id: m[1], comp: m[2] }));

const scriptOf = (comp) => {
  const base = comp.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  for (const f of [path.join(DIR, `${low}Script.ts`), path.join(DIR, `${base}Script.ts`)]) {
    if (fs.existsSync(f)) return f;
  }
  return null;
};

/** Which controls a lesson uses, in beat order. */
export function controls(id, comp) {
  const f = scriptOf(comp);
  if (!f) return null;
  const src = fs.readFileSync(f, 'utf8');
  const out = [];
  // Each `interact: {` block, to the next beat.
  for (const m of src.matchAll(/interact:\s*\{([\s\S]*?)\n {4}\},/g)) {
    const body = m[1];
    const kind = BELOW.find((k) => new RegExp(`\\n\\s{6}${k}:\\s*[[{]`).test(body));
    out.push(kind ?? 'stage');
  }
  return out;
}

const rows = [];
for (const { id, comp } of wired) {
  const c = controls(id, comp);
  if (c && c.length) rows.push({ id, branch: id.replace(/-\d+$/, ''), comp, kinds: c });
}

const tally = new Map();
for (const r of rows) for (const k of r.kinds) tally.set(k, (tally.get(k) ?? 0) + 1);
const total = [...tally.values()].reduce((a, b) => a + b, 0);

let bad = 0;
const say = (ok, label, detail) => { if (!ok) bad += 1; console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`); };

console.log('\nHOW THE THUMB IS ASKED TO MOVE\n');
console.log(`  ${rows.length} lessons · ${total} graded questions`);
const order = ['stage', 'cards', 'drag', 'lever', 'plot', 'split', 'field'];
console.log('  ' + order.map((k) => `${k} ${tally.get(k) ?? 0}`).join(' · ') + '\n');

const deck = (tally.get('cards') ?? 0) / total;
say(deck <= DECK_CEIL, `the two-card deck is at most ${(DECK_CEIL * 100).toFixed(0)}% of all questions`, `${(deck * 100).toFixed(0)}%`);

// Neighbours, within a branch, in reading order.
const byBranch = new Map();
for (const r of rows) {
  const b = r.id.replace(/-\d+$/, '');
  if (!byBranch.has(b)) byBranch.set(b, []);
  byBranch.get(b).push(r);
}
const same = [];
for (const [, list] of byBranch) {
  list.sort((a, b) => +a.id.replace(/^.*-/, '') - +b.id.replace(/^.*-/, ''));
  for (let i = 1; i < list.length; i += 1) {
    const prev = new Set(list[i - 1].kinds.filter((k) => k !== 'stage'));
    const here = list[i].kinds.filter((k) => k !== 'stage');
    if (here.length && here.every((k) => prev.has(k))) same.push(`${list[i - 1].id} -> ${list[i].id}`);
  }
}
say(same.length <= SAME_BUDGET, `no more than ${SAME_BUDGET} neighbour pairs answer the same way`, `${same.length} do`);
if (same.length < SAME_BUDGET) console.log(`        ${same.length} now — lower SAME_BUDGET to ${same.length} to lock it in`);

// H65 says one question in the deck and one on the stage. Thirty-six lessons ask
// both of theirs below the figure, and every one of them is an EARLY lesson —
// the first a reader ever meets, and the ones where the picture most needs to be
// the thing being answered. It is a debt rather than a regression, so it is a
// budget that may only go down. Converting one is the "above the stickman" half
// of the rotation work.
const noStage = rows.filter((r) => !r.kinds.includes('stage'));
say(noStage.length <= STAGELESS_BUDGET, `no more than ${STAGELESS_BUDGET} lessons ask nothing on the stage (H65)`, `${noStage.length} ask nothing`);
if (noStage.length < STAGELESS_BUDGET) console.log(`        ${noStage.length} now — lower STAGELESS_BUDGET to ${noStage.length} to lock it in`);
console.log(`        ${noStage.slice(0, 10).map((r) => r.id).join(', ')}${noStage.length > 10 ? ', …' : ''}`);

console.log(bad ? '\nthe rotation is not doing its job.\n' : '\nthe rotation holds.\n');
process.exit(bad ? 1 : 0);
