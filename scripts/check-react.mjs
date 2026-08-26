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
const ANALOGUE = ['drag', 'lever', 'plot', 'split', 'field'];

/** Lessons whose analogue beat leaves the stage still. DOWN ONLY. */
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

  const reads = /\bdragPos2?\b/.test(scene);
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
console.log(ok ? '\nthe reader moves the picture, not a widget beside it.\n' : '\na control with a dead stage is a slider with a lesson printed next to it.\n');
process.exit(ok ? 0 : 1);
