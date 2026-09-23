// PUTS EACH E41 DEFECT BACK AND REQUIRES `check:shape` TO FAIL ON IT.
//
//   node scripts/countertest-shape.mjs
//
// A check that has never failed has not been shown to look (U3). Each case edits
// one file in place, runs the check, and restores the file byte for byte. It
// asserts three things: the mutation really changed the file (a no-op mutation
// scores as "the check stayed silent" and reads as a blind check, which is
// countertest-stamp's own recorded failure), the check exited non-zero, and the
// check named THIS fault rather than some other one. The last run is the restored
// tree, which must pass.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

const CIN = path.join('components', 'lesson', 'cinematic');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const run = () => spawnSync(process.execPath, [path.join('scripts', 'check-answers-shape.mjs')], { encoding: 'utf8' });

const CASES = [
  {
    name: 'a scene mount passes its picks through ungated',
    file: 'CinematicPlayer.tsx',
    from: 'onPick={(id, ok) => { if (stageLive) choose(id, ok, true); }} />',
    to: 'onPick={(id, ok) => choose(id, ok, true)} />',
    expect: 'pass picks through ungated',
  },
  {
    name: 'a provider does not say whether the stage is live',
    file: 'CinematicPlayer.tsx',
    from: '<TargetCountProvider onCount={setTargetCount} live={stageLive}>',
    to: '<TargetCountProvider onCount={setTargetCount}>',
    expect: 'without live={stageLive}',
  },
  {
    name: 'Target takes a press on a beat answered below',
    file: 'Target.tsx',
    from: 'disabled={answered || !live || !!rest.disabled}',
    to: 'disabled={answered || !!rest.disabled}',
    expect: 'takes a press',
  },
  {
    name: 'Target draws its ring on a beat answered below',
    file: 'Target.tsx',
    from: '{!answered && live && !rest.disabled ? (',
    to: '{!answered && !rest.disabled ? (',
    expect: 'draws its ring or pip',
  },
  {
    name: 'TargetRing breathes on a beat answered below',
    file: 'Target.tsx',
    from: 'answered || !live ? 0 :',
    to: 'answered ? 0 :',
    expect: 'TargetRing breathes',
  },
  {
    name: 'stageAnswered forgets a control',
    file: 'cinematicKit.tsx',
    from: ' && !q.odd);',
    to: ');',
    expect: 'does not exclude: odd',
  },
  {
    name: 'a new control arrives without its key in stageAnswered',
    file: 'cinematicKit.tsx',
    from: '  odd?: OddBlock;\n}',
    to: '  odd?: OddBlock;\n  newcontrol?: SortBlock;\n}',
    expect: 'does not exclude: newcontrol',
  },

  // ── THE TWO TILE CONTROLS (R21, R22) ───────────────────────────────────────
  //
  // The first of these is the one worth having. Three drawings and one bare word
  // is a set that hands over its own answer, and NOTHING else in the suite can
  // see it: the spoiler sweep reads words, the readable sweep reads type, and
  // both are looking at a tile that is drawn perfectly.
  {
    name: 'an odd one out where one tile draws and three do not',
    file: 'metaphysics18Script.ts',
    from: "{ id: 'tree', reads: 'A TREE' }",
    to: "{ id: 'tree', reads: 'A TREE', draw: 'tree' }",
    expect: 'every tile set is the shape',
  },
  {
    name: 'an odd one out with five tiles',
    file: 'metaphysics18Script.ts',
    from: "{ id: 'wheel', reads: 'A WHEEL' },",
    to: "{ id: 'wheel', reads: 'A WHEEL' },\n          { id: 'spare', reads: 'A SPARE' },",
    expect: 'every tile set is the shape',
  },
  {
    name: 'an odd one out with two strangers',
    file: 'metaphysics18Script.ts',
    from: "{ id: 'tree', reads: 'A TREE' }",
    to: "{ id: 'tree', reads: 'A TREE', correct: true }",
    expect: 'every tile set is the shape',
  },
  {
    name: 'an odd one out with no stranger at all',
    file: 'metaphysics18Script.ts',
    from: "reads: 'THE NUMBER 3', correct: true",
    to: "reads: 'THE NUMBER 3'",
    expect: 'every tile set is the shape',
  },
  {
    name: 'an axis too long for the row it shares with the hint',
    file: 'metaphysics18Script.ts',
    from: "axis: 'THREE HAVE A PLACE'",
    to: "axis: 'THREE OF THESE HAVE A PLACE IN THE WORLD'",
    expect: 'every tile set is the shape',
  },
  {
    name: 'two tiles sharing an id',
    file: 'metaphysics18Script.ts',
    from: "{ id: 'cup', reads: 'A CUP' }",
    to: "{ id: 'tree', reads: 'A CUP' }",
    expect: 'every tile set is the shape',
  },
];

let bad = 0;
const say = (ok, msg) => { if (!ok) bad += 1; console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${msg}`); };

console.log('\nCOUNTER-TEST · check:shape E41, one place to answer\n');
for (const c of CASES) {
  const file = path.join(CIN, c.file);
  const original = readFileSync(file, 'utf8');
  const mutated = original.replace(c.from, c.to);
  if (mutated === original) { say(false, `${c.name} — the mutation matched nothing, so it proves nothing`); continue; }
  let res;
  try {
    writeFileSync(file, mutated);
    res = run();
  } finally {
    writeFileSync(file, original);
  }
  const restored = sha(readFileSync(file, 'utf8')) === sha(original);
  if (!restored) { say(false, `${c.name} — ${c.file} did not restore byte for byte; stop and check it`); break; }
  const named = (res.stdout || '').split('\n').some((l) => l.includes('FAIL') && l.includes(c.expect));
  say(res.status !== 0 && named, `${c.name}${res.status === 0 ? ' — the check PASSED on it' : named ? '' : ' — it failed, but not on this fault'}`);
}
const clean = run();
say(clean.status === 0, 'the restored tree passes');
console.log(bad ? `\n${bad} failing.\n` : '\nevery defect is caught, and the real tree is clean.\n');
process.exit(bad ? 1 : 0);
