// DOES THE PICTURE MOVE WHEN THE READER MOVES THE CONTROL?
//
// R1 picks the control from the shape of the claim. R7 says that IF a scene reads
// the control it must read it only on its own graded beat. Neither of them said
// the scene has to read it at all, and for a long time it did not: 30 scenes of
// 186 moved, and the other 150 sat still while the reader dragged a knob beside
// them.
//
// The reader is the one who noticed, and named the difference it makes:
//
//   "I want something to change within the animation above the stickman, like it
//    reacts during the user moving something, I saw you did this for one lesson
//    and it makes the lessons better."
//
// That is R7b, and it is the difference between moving a WIDGET and moving the
// PICTURE. A control with a dead stage is a slider with a lesson printed next to
// it; a control the stage follows is the reader operating the thing being taught —
// the tower comes apart under their thumb, the painting cleans, the crowd grows
// while every life in it shrinks.
//
// ── WHAT COUNTS ─────────────────────────────────────────────────────────────
//
// A lesson passes when, for every graded beat carrying one of the five analogue
// controls, its scene reads `dragPos` (or `dragPos2` for a pad's second axis).
// The check is deliberately structural rather than semantic: whether the thing
// that moves is the RIGHT thing is R2's job and a reading's job. What can be
// counted is whether anything moves at all, and that was the part nobody was
// watching.
//
// A high-water mark, like CARD_BUDGET and SLICE_BUDGET: it may only go down.
//
//   node scripts/check-react.mjs              # the count, and what is failing
//   node scripts/check-react.mjs --list       # every unwired lesson, with its
//                                             # control and the tracks it could use
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
// `lever` and `field` are retired — kept here so a scene still naming one is
// recognised as a control rather than skipped, which is how 51 dead flags stayed
// invisible. `sort` and `poll` are the controls that replaced them, and leaving
// them out meant every lesson carrying one was passed over by this whole file:
// the reader works them with a thumb exactly like the others.
const ANALOGUE = ['drag', 'lever', 'plot', 'split', 'field', 'sort', 'poll'];

/**
 * Lessons whose analogue beat leaves the stage still. DOWN ONLY.
 *
 * THE DENOMINATOR CHANGED UNDER THIS NUMBER, so do not read it against the old
 * one. `sort` and `poll` were missing from ANALOGUE, so this file used to see 110
 * lessons and now sees 182; the 15 it once reported were 15 of the lessons it
 * could see, not 15 of the lessons that have a control. 33 is the first honest
 * count, and it happens to equal the budget that was already here.
 */
const DEAD_BUDGET = 33;

const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const wired = [...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => ({ id: m[1], comp: m[2] }));

const fileFor = (comp, kind) => {
  const base = comp.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  const names = kind === 'script'
    ? [`${low}Script.ts`, `${base}Script.ts`]
    : [`${low}Scene.tsx`, `${comp}.tsx`];
  for (const n of names) {
    const p = path.join(DIR, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
};

/** Comments quote the very identifiers this matches on — strip them (the L8 lesson). */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const rows = [];
/** Scenes whose reaction flag names a control the lesson does not ship. */
const deadFlag = [];
for (const { id, comp } of wired) {
  const sf = fileFor(comp, 'script');
  const cf = fileFor(comp, 'scene');
  if (!sf || !cf) continue;
  const src = fs.readFileSync(sf, 'utf8');
  const scene = strip(fs.readFileSync(cf, 'utf8'));

  const controls = [];
  for (const m of src.matchAll(/interact:\s*\{([\s\S]*?)\n {4}\},/g)) {
    const k = ANALOGUE.find((c) => new RegExp(`\\n\\s{6}${c}:\\s*\\{`).test(m[1]));
    if (k) controls.push(k);
  }
  if (!controls.length) continue;

  const reads = /\b(dragPos2?|pickPos)\b/.test(scene);

  // ── AND THE FLAG HAS TO BE ABLE TO FIRE ────────────────────────────────────
  //
  // `reads` above only asks whether the scene MENTIONS the value. That was true
  // of 51 scenes whose reaction had been dead for as long as the controls had
  // been converted: they derive
  //
  //     const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
  //
  // and no script has shipped a `lever` or a `field` since both were retired into
  // `sort` and `poll`. So `reacting` was permanently false, the stage held still
  // under the reader's thumb, and this file printed that the picture moved —
  // because the wiring is all present, and only the current through it is not.
  //
  // A flag naming a control the lesson does not have is worse than no flag: it is
  // the shape of a wired scene, so nobody looks again.
  const flag = /const REACT\s*=\s*BEATS\.map\(\(b\) => \(b\.interact\?\.([a-z]+) \? 1 : 0\)\);/.exec(scene);
  if (flag && !controls.includes(flag[1])) {
    deadFlag.push(`${id.padEnd(30)} reacts to interact.${flag[1]}, which this lesson does not have (it has ${controls.join('+')})`);
  }
  // What the scene has to offer: the tracks it already interpolates. A reaction is
  // almost always one of these handed the control's value on its own beat, rather
  // than new art — which is what makes wiring one a small job.
  const tracks = [...new Set([...scene.matchAll(/carry\(cv,\s*\d+,\s*n,\s*([A-Z_][A-Z0-9_]*)\[p\]/g)].map((m) => m[1]))];
  rows.push({ id, comp, file: path.basename(cf), controls, reads, tracks });
}

const dead = rows.filter((r) => !r.reads);

if (process.argv.includes('--list')) {
  console.log('\nANALOGUE LESSONS WHOSE STAGE DOES NOT MOVE\n');
  const byBranch = new Map();
  for (const r of dead) {
    const b = r.id.replace(/-\d+$/, '');
    if (!byBranch.has(b)) byBranch.set(b, []);
    byBranch.get(b).push(r);
  }
  for (const [b, list] of byBranch) {
    list.sort((a, x) => +a.id.replace(/^.*-/, '') - +x.id.replace(/^.*-/, ''));
    console.log(`${b} — ${list.length}`);
    for (const r of list) {
      console.log(`  ${r.id.padEnd(28)} ${r.controls.join('+').padEnd(12)} ${r.file}`);
      console.log(`      tracks: ${r.tracks.length ? r.tracks.join(' ') : '(none carried)'}`);
    }
    console.log('');
  }
  console.log(`${dead.length} lessons to wire.\n`);
  process.exit(0);
}

console.log('\nDOES THE PICTURE MOVE WITH THE CONTROL?\n');
console.log(`  ${rows.length} lessons carry an analogue control`);
console.log(`  ${rows.length - dead.length} of them drive the stage with it\n`);

const ok = dead.length <= DEAD_BUDGET;
console.log(`  ${ok ? 'ok  ' : 'FAIL'}  no more than ${DEAD_BUDGET} analogue lesson(s) leave the stage still (R7b)  ${dead.length} do`);
if (dead.length) {
  console.log(`        ${dead.slice(0, 10).map((r) => r.id).join(', ')}${dead.length > 10 ? ', …' : ''}`);
  console.log('        node scripts/check-react.mjs --list   — each one with the tracks it could use');
}
if (ok && dead.length < DEAD_BUDGET) console.log(`        ${dead.length} now — lower DEAD_BUDGET to ${dead.length} to lock it in`);

for (const d of deadFlag.slice(0, 12)) console.log(`  FAIL  ${d}`);
if (deadFlag.length > 12) console.log(`  FAIL  … and ${deadFlag.length - 12} more`);
console.log(deadFlag.length
  ? '  a flag that cannot fire is the SHAPE of a wired scene, which is why nobody looked at it again.'
  : '  ok    every reaction flag names a control its own lesson actually ships');

console.log(ok && !deadFlag.length
  ? '\nthe reader moves the picture, not a widget beside it.\n'
  : '\na control with a dead stage is a slider with a lesson printed next to it.\n');
process.exit(ok && !deadFlag.length ? 0 : 1);
