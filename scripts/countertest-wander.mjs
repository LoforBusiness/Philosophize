// U3 FOR THE MOVEMENT LAYER: PUT EACH DEFECT BACK AND WATCH check:wander GO RED.
//
//   node scripts/countertest-wander.mjs
//
// Two kinds of stage, because the check has two halves.
//
//   THE TABLE — damaged in a COPY, through `WANDER_FILE`, so the repo's own plans
//   are never touched.
//   THE MATHS — `wander.ts` itself, restored in a `finally` and verified byte for
//   byte at the end. That is how `countertest-insignia` does it, and the three
//   defects it re-stages are the three this layer actually shipped in its first
//   draft: a step that began with a foot jump, a step interrupted by a tap that
//   jumped 23 units, and a look whose lean cancelled its own neck.
//
// A red run only counts if the rule the damage should break is the one that broke,
// and every stage asserts its damage changed the file — a mutation that matched
// nothing scores as silent, which is how `countertest-stamp` once read a working
// guard as a blind one.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = process.cwd();
const TABLE = path.join(REPO, 'data/lessonWander.ts');
const MATHS = path.join(REPO, 'components/lesson/cinematic/wander.ts');
const SRC = fs.readFileSync(TABLE, 'utf8').replace(/\r\n/g, '\n');
const MATHS_SRC = fs.readFileSync(MATHS, 'utf8').replace(/\r\n/g, '\n');
const tmp = path.join(os.tmpdir(), 'philosophize-wander-ct.ts');

function run(env = {}) {
  try {
    const out = execFileSync(process.execPath, ['scripts/check-wander.mjs'], {
      cwd: REPO, encoding: 'utf8', env: { ...process.env, ...env },
    });
    return { red: false, out };
  } catch (e) {
    return { red: true, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
}
// EVERY MUTATION MUST CHANGE THE FILE. A damage that matched nothing scores as a
// silent check rather than as a broken test, which is exactly how countertest-stamp
// read a working guard as a blind one.
const table = (text) => {
  if (text === SRC) return { red: false, out: '', nochange: true };
  fs.writeFileSync(tmp, text);
  return run({ WANDER_FILE: tmp });
};

/** The first plan in the table, as `{ id, line, nums }`. */
function firstPlan(pred = () => true) {
  for (const line of SRC.split('\n')) {
    const m = line.match(/^ {2}'([a-z0-9-]+)': \[(.*)\],$/);
    if (!m) continue;
    const cells = m[2].split(/,\s*(?=\[|null)/);
    for (const [i, cell] of cells.entries()) {
      if (cell.trim() === 'null') continue;
      const nums = cell.replace(/[[\]]/g, '').split(',').map(Number);
      if (pred(nums, i)) return { id: m[1], line, cells, beat: i, nums };
    }
  }
  throw new Error('no plan matched');
}
const rebuild = (p, nums) => {
  const cells = [...p.cells];
  cells[p.beat] = `[${nums.join(', ')}]`;
  return SRC.replace(p.line, `  '${p.id}': [${cells.join(', ')}],`);
};

let pass = 0;
let fail = 0;
const stage = (name, want, res) => {
  if (res.nochange) { fail += 1; console.log(`  ✗    ${name} — the damage changed nothing`); return; }
  const hit = res.red && (want === null || res.out.includes(want));
  if (hit) { pass += 1; console.log(`  ok   ${name}`); } else {
    fail += 1;
    console.log(`  ✗    ${name} — ${res.red ? `red, but not for ${want}` : 'stayed silent'}`);
  }
};
const silent = (name, res) => {
  if (!res.red) { pass += 1; console.log(`  ok   ${name} (silent, as it should be)`); } else {
    fail += 1;
    console.log(`  ✗    ${name} — went red and should not have`);
  }
};

console.log('PUTTING THE DEFECTS BACK\n');

// ── the table ───────────────────────────────────────────────────────────────
{
  // A REAL STEP, found by reading the kind SLOTS rather than by asking whether the
  // number 1 appears anywhere: a look to +1 and a duration of 1 both match that, and
  // the first draft of this stage damaged neither a kind nor a target.
  const hasStep = (n) => { for (let j = 2; j + 3 < n.length; j += 4) if (n[j] === 1) return true; return false; };
  const p = firstPlan((n) => hasStep(n) && n[1] > 20);
  const nums = [...p.nums];
  for (let j = 2; j + 3 < nums.length; j += 4) if (nums[j] === 1) nums[j + 3] = nums[1] + 40;
  stage('a step that leaves its own room', 'OUTSIDE', table(rebuild(p, nums)));
}
{
  const p = firstPlan();
  stage('a stale room, wider than the boxes allow', 'ROOM',
    table(rebuild(p, [p.nums[0] - 30, p.nums[1] + 30, ...p.nums.slice(2)])));
}
{
  const p = firstPlan();
  const nums = [...p.nums];
  nums[3] = 0.1;                                   // the first move's `at`
  stage('a move that starts over the line\'s first words', 'EARLY', table(rebuild(p, nums)));
}
{
  const p = firstPlan();
  const nums = [...p.nums];
  nums[3] = 40;                                    // far past the end of the line
  stage('a move still running after the line has finished', 'LATE', table(rebuild(p, nums)));
}
{
  const hasSit = (n) => { for (let j = 2; j + 3 < n.length; j += 4) if (n[j] === 3) return true; return false; };
  const p = firstPlan(hasSit);
  stage('a sit in a lesson with no floor for his legs', 'SIT',
    table(rebuild(p, [-4, 4, ...p.nums.slice(2)])));
}
{
  // A plan bolted onto a graded beat: find a lesson whose next slot is null and
  // copy this plan into it. The check re-derives which beats are questions.
  const p = firstPlan();
  const cells = [...p.cells];
  let at = -1;
  for (const [i, c] of cells.entries()) if (c.trim() === 'null') { at = i; break; }
  if (at >= 0) {
    cells[at] = `[${p.nums.join(', ')}]`;
    const text = SRC.replace(p.line, `  '${p.id}': [${cells.join(', ')}],`);
    stage('a plan on a beat that may not have one', null, table(text));
  }
}

// ── the maths ───────────────────────────────────────────────────────────────
let restored = false;
try {
  const patch = (name, want, from, to) => {
    if (!MATHS_SRC.includes(from)) { fail += 1; console.log(`  ✗    ${name} — the text to damage is not in wander.ts`); return; }
    const damaged = MATHS_SRC.replace(from, to);
    if (damaged === MATHS_SRC) { fail += 1; console.log(`  ✗    ${name} — the damage changed nothing`); return; }
    fs.writeFileSync(MATHS, damaged);
    stage(name, want, run());
    fs.writeFileSync(MATHS, MATHS_SRC);
  };

  patch('a look whose lean cancels its own neck (N12)', 'QUIET',
    '      tilt: s.tilt - 0.05 * look,', '      tilt: s.tilt + 0.11 * look,');

  patch('a step that starts from the middle of the cycle', null,
    '  const pd = clamp01(walked / 11);', '  const pd = clamp01(walked / 0.0001);');

  patch('a step a tap cannot continue', null,
    '  if (st.legU >= 0 && st.legU <= 1 && Math.abs(st.legTo - st.legFrom) + st.legPrior > 0.5) {',
    '  if (st.legU >= 0 && st.legU <= 1 && Math.abs(st.legTo - st.legFrom) > 0.5) {');

  // AND THE ONE THAT LIVES IN THE RIG. The arc a settling walk gives its feet used
  // to go to whichever had further to travel, which is a hard switch on a comparison
  // that flips mid-settle: an ankle rose 8.5 units and the other fell 7.3 between two
  // frames. It is rig.ts rather than wander.ts, and every walk in the app has it, so
  // it is staged here — this check is the one that measures a frame.
  const RIG_FILE = path.join(REPO, 'components/lesson/cinematic/rig.ts');
  const RIG_SRC = fs.readFileSync(RIG_FILE, 'utf8').replace(/\r\n/g, '\n');
  const from = 'y: settled.footL.y - arc * (gapL / tot) }';
  const to = 'y: settled.footL.y - (gapL >= gapR ? arc : 0) }';
  if (!RIG_SRC.includes(from)) { fail += 1; console.log('  ✗    the settling arc handed to one foot — the text to damage is not in rig.ts'); } else {
    try {
      fs.writeFileSync(RIG_FILE, RIG_SRC.replace(from, to));
      stage('the settling arc handed to whichever foot is further', null, run());
    } finally {
      fs.writeFileSync(RIG_FILE, RIG_SRC);
    }
  }
} finally {
  fs.writeFileSync(MATHS, MATHS_SRC);
  restored = fs.readFileSync(MATHS, 'utf8').replace(/\r\n/g, '\n') === MATHS_SRC;
}

// ── and the direction that must stay quiet ──────────────────────────────────
silent('the table as shipped', run());
{
  // A LESSON WITH NO PLANS AT ALL IS A DECISION, NOT A DEFECT — 26 of them are left
  // alone because they pose a crowd or a pair. Removing one lesson's plans must not
  // fail anything but the corpus floor, so this drops a single beat's plan.
  const p = firstPlan();
  const cells = [...p.cells];
  cells[p.beat] = 'null';
  silent('one beat with no plan', table(SRC.replace(p.line, `  '${p.id}': [${cells.join(', ')}],`)));
}

console.log(`\n${pass} stage(s) behaved, ${fail} did not`);
console.log(restored ? 'wander.ts restored byte for byte.' : 'WANDER.TS WAS NOT RESTORED — check it before committing.');
process.exit(fail || !restored ? 1 : 0);
