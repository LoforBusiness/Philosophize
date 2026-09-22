// U3 FOR THE OBJECTS: PUT EACH DEFECT BACK AND WATCH check:objects GO RED.
//
//   node scripts/countertest-objects.mjs
//
// Every defect is staged on a COPY under `OBJECTS_SRC`, never in the working tree —
// the rule group AL added, because another session is usually building in this repo
// and a checker that mutates and reverts leaves a window in which their build takes
// the defect.
//
// Five of the seven below are faults this library actually shipped and the RENDER
// caught, not inventions: a shaded plane that flew off its own box, a top face darker
// than the front under it, a capital flaring the wrong way. The two that must stay
// SILENT are the two the rules were wrong about on their first run — a recessed panel
// high on a door, and a body plane that is not contained by the rest of the body.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = process.cwd();
const SRC = 'components/lesson/cinematic/objects.ts';
const TEXT = fs.readFileSync(path.join(REPO, SRC), 'utf8');
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'objects-countertest-'));
const COPY = path.join(DIR, 'objects.ts');

function run() {
  try {
    execFileSync(process.execPath, ['scripts/check-objects.mjs'], {
      encoding: 'utf8',
      env: { ...process.env, OBJECTS_SRC: COPY },
    });
    return { red: false, out: '' };
  } catch (e) { return { red: true, out: `${e.stdout || ''}${e.stderr || ''}` }; }
}

let pass = 0;
let fail = 0;

/** Stage one edit on the copy and require the named rule to fire. */
const stage = (name, want, from, to) => {
  if (!TEXT.includes(from)) { fail += 1; console.log(`  ✗    ${name} — the text to damage is not in the library`); return; }
  const damaged = TEXT.replace(from, to);
  if (damaged === TEXT) { fail += 1; console.log(`  ✗    ${name} — the damage changed nothing`); return; }
  fs.writeFileSync(COPY, damaged);
  const res = run();
  const hit = res.red && res.out.includes(want);
  if (hit) { pass += 1; console.log(`  ok   ${name}`); } else {
    fail += 1;
    console.log(`  ✗    ${name} — ${res.red ? `red, but not for ${want}` : 'stayed silent'}`);
  }
};

/** …and one that must NOT fire. */
const silent = (name, from, to) => {
  if (!TEXT.includes(from)) { fail += 1; console.log(`  ✗    ${name} — the text to change is not in the library`); return; }
  const changed = TEXT.replace(from, to);
  if (changed === TEXT) { fail += 1; console.log(`  ✗    ${name} — the change changed nothing`); return; }
  fs.writeFileSync(COPY, changed);
  const res = run();
  if (!res.red) { pass += 1; console.log(`  ok   ${name} (silent, as it should be)`); } else {
    fail += 1; console.log(`  ✗    ${name} — went red and should not have`);
  }
};

console.log('PUTTING THE DEFECTS BACK\n');
try {
  // 1 · AN OBJECT COLLAPSED BACK INTO A BOX. The whole point of the group.
  stage('a table that is one rectangle again', 'THIN',
    "export const table = (x: number, y: number, w: number, h: number) => fit(TABLE, x, y, w, h);",
    "export const table = (x: number, y: number, w: number, h: number) => fit([TABLE[0]], x, y, w, h);");

  // 2 · NOTHING FOR THE OUTLINE TO GO ROUND.
  //
  // Staged on the FLAG, whose only `mass` is the cloth. The first attempt used the
  // leaf and stayed silent, correctly: taking the blade's role away still left the
  // tip's, so the leaf had a body throughout. A stage that does not create the
  // defect proves nothing about the rule.
  stage('a drawing with no body at all', 'NOBODY',
    "  oRect('mass', 46, 30, 62, 38, 0, 1.5),                        // the flag at the hoist",
    "  oRect('line', 46, 30, 62, 38, 0, 1.5),                        // the flag at the hoist");

  // 3 · THE SHADED PLANE THAT FLEW OFF ITS OWN BOX — the crate's first side face.
  stage('a shaded plane detached from the object', 'STRAY',
    "  oRect('face', 50, 66, 84, 54, 0, 2),                          // the front, in shade",
    "  oRect('face', 200, 66, 84, 54, 0, 2),                         // the front, in shade");

  // 4 · A RECESS WITH NO OBJECT UNDER IT.
  stage('a recess cut into thin air', 'STRAY',
    "  oEll('dark', 50, 62, 66, 13),", "  oEll('dark', 50, 300, 66, 13),");

  // 5 · ART THE SCENE NEVER BUDGETED FOR.
  stage('an object drawing outside the box it was given', 'SPILL',
    "  oRect('mass', 50, 92, 96, 8, 0, 1.5),                         // the sill, proud of the frame",
    "  oRect('mass', 50, 92, 260, 8, 0, 1.5),                        // the sill, proud of the frame");

  // 6 · A DRAWING THAT IGNORES THE BOX'S SIZE. `fit` is what makes one drawing serve
  //     a 40-unit thumbnail and a 160-unit subject, and nothing else would notice.
  stage('an object that will not scale', 'SCALE',
    "export const coin = (x: number, y: number, w: number, h: number) => fit(COIN, x, y, w, h);",
    "export const coin = (x: number, y: number, w: number, h: number) => fit(COIN, x, y, 100, 100);");

  // 7 · THE LAMP TURNED ROUND. §19's one rule for every struck thing in the app.
  stage('a box lit from underneath', 'LAMP',
    "  ...trapezoid('mass', 50, 30, 62, 84, 18),                     // the top, receding, lit\n  oRect('face', 50, 66, 84, 54, 0, 2),                          // the front, in shade",
    "  ...trapezoid('face', 50, 30, 62, 84, 18),                     // the top, receding, lit\n  oRect('mass', 50, 66, 84, 54, 0, 2),                          // the front, in shade");

  // …AND THE TWO THAT MUST STAY SILENT, both of which the rules called faults on
  // their first run. A checker that cannot tell the design from the defect is the
  // boxiness metric again.
  silent('a recessed panel high on a door',
    "  oRect('dark', 48, 33, 50, 32, 0, 1.5),                        // the upper panel, recessed",
    "  oRect('dark', 48, 26, 50, 30, 0, 1.5),                        // the upper panel, recessed");

  // A face sits ENTIRELY OUTSIDE the rest of the body by design — a box's front is
  // below its top and shares only an edge with it — so the rule has to test that it
  // TOUCHES, not that it is contained. The first version of this case moved the face
  // down far enough to leave an 8-unit gap, which is a real defect and went red
  // deservedly: a silent case must be a legal drawing, not merely a different one.
  silent('a body plane the rest of the body does not contain, but still touches',
    "  oRect('face', 50, 66, 84, 54, 0, 2),                          // the front, in shade",
    "  oRect('face', 50, 67, 84, 56, 0, 2),                          // the front, in shade");

  // and the library as it stands
  fs.writeFileSync(COPY, TEXT);
  const clean = run();
  if (!clean.red) { pass += 1; console.log('  ok   the library as it stands (silent, as it should be)'); } else {
    fail += 1; console.log(`  ✗    the library as it stands — went red:\n${clean.out.split('\n').slice(4, 9).join('\n')}`);
  }
} finally {
  fs.rmSync(DIR, { recursive: true, force: true });
}
const untouched = fs.readFileSync(path.join(REPO, SRC), 'utf8') === TEXT;
console.log(`\n${pass} stage(s) behaved, ${fail} did not`);
console.log(untouched ? 'the working tree was never edited.' : 'THE WORKING TREE CHANGED — check git status.');
process.exit(fail || !untouched ? 1 : 0);
