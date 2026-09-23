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
// `lever`, `field`, `drag` and `split` are retired (R10, R20) and no lesson
// declares one. They stay in the list so a revert or an old branch is still
// counted rather than silently dropping out of the rotation -- a control that
// stops being counted looks like variety improving.
const BELOW = ['cards', 'sort', 'poll', 'plot', 'order', 'odd', 'drag', 'split', 'lever', 'field'];

/**
 * THE RETIRED CONTROLS, WHICH MAY NOT COME BACK (R20).
 *
 * `drag` and `split` were the two the owner removed by name -- "two sliding ones
 * ... I want those removed" -- and `lever` and `field` went before them for the
 * same reason one layer down: all four asked HOW MUCH and answered it by making
 * the reader hold a finger on a line and hunt for a boundary they could not see.
 *
 * The budget is ZERO rather than a high-water mark, because unlike every other
 * ratchet here there is no honest reason for the number to be anything else. The
 * block types survive in cinematicKit so an old branch still compiles; what is
 * gone is any lesson that uses one.
 */
const RETIRED = ['drag', 'split', 'lever', 'field'];

/**
 * The deck is right sometimes and not most of the time.
 *
 * 55% was the ceiling while the deck WAS the default. It is 10% now — 36 of 368
 * questions — because every lesson that could take an analogue control was given
 * one. The reader asked for exactly that, and for the deck to survive:
 *
 *   "I still want a couple every now and then for the old way of answering below
 *    the stickman"
 *
 * So this is a ceiling, not a target. A claim that is genuinely either/or should
 * still be two cards; forcing a control onto one is worse than leaving it (R1).
 */
const DECK_CEIL = 0.14;
/**
 * Neighbouring lessons answered the same way. High-water mark; may only go DOWN.
 *
 * 25 → 26 on 13 Sep 2026, once, and deliberately. valid3's grass-and-sky question
 * classifies an argument by its form and by the truth of its premise. As a poll it
 * needed a thinker on every row (R17), and a cell of that grid has no holder, so it
 * carried "Aristotle" pasted on all four. It is now the sort R1 prescribes for a
 * category, and that pairs it with strong4. Which control a claim wants (R1) comes
 * before variety between neighbours (R9).
 *
 * 26 → 23 on 22 Sep 2026. Retiring the two sliders (R20) moved 123 questions onto
 * the controls that were left, and `sort` took most of them — 35 neighbour pairs,
 * nine over budget, which is the rotation slipping as a side effect of a change
 * that was not about the rotation at all. Ten lessons were re-pointed onto `odd`,
 * and the ones worth knowing are the HINGES: converting the middle lesson of a
 * run of three breaks two pairs at once, so metaphysics38 and logic13 did the work
 * of four conversions. Converting BOTH ends of such a run is the trap — two
 * neighbours both moved to `odd` are a pair again.
 */
const SAME_BUDGET = 23;
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
const order = ['stage', 'cards', 'sort', 'poll', 'plot', 'order', 'odd', 'drag', 'split', 'lever', 'field'];
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
// NAMING THEM IS THE DIFFERENCE BETWEEN A NUMBER AND A WORKLIST. The count
// alone says the rotation slipped; the pairs say which lesson to re-point.
if (same.length) console.log(same.slice(0, 12).map((s) => `        ${s}`).join('\n') + (same.length > 12 ? '\n        …' : ''));

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

// R20 — A RETIRED CONTROL MAY NOT COME BACK, and this is the only budget here
// that is a flat zero. Every other number in this file is a high-water mark
// because the thing it counts is a debt being worked down; a retired control is
// not a debt, it is a decision, and the owner made it in one sentence.
{
  const back = [];
  for (const r of rows) for (const k of r.kinds) if (RETIRED.includes(k)) back.push(`${r.id} (${k})`);
  say(back.length === 0, 'no lesson uses a retired control (R20)',
    `${back.length} do: ${back.slice(0, 6).join(', ')}`);
}

console.log(bad ? '\nthe rotation is not doing its job.\n' : '\nthe rotation holds.\n');
process.exit(bad ? 1 : 0);
