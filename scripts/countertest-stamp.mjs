// PUT THE DEFECT BACK: does the prose-independent must-stamp still see everything
// that can actually move a box?
//
//   node scripts/countertest-stamp.mjs
//
// `muststamp.mjs` stopped hashing a script's narration, because a rewritten
// sentence is drawn in the LOWER DECK and `mustprobe` only ever looks inside
// `#stage-clip` — so it made 186 lessons stale and demanded a browser sweep that
// could not change a single number. That is a real saving and a real risk: the
// same edit that is now free is one keystroke from an edit that moves a prop.
//
// FIVE CASES, and one of them must stay SILENT. Four go red.
//
// It is worth having as a file rather than a scratch run because the first
// version PASSED FOUR OF FIVE AND WAS WRONG TWICE:
//
//   · it kept the string's LENGTH in the hash, on the reasoning that a split beat
//     should still register. A rewritten sentence is almost never the same length,
//     so the one case the change exists for was the one case that failed — while
//     the other four passed and made the guard look prudent. Splitting a beat adds
//     a `{ … }` to the array and is caught structurally anyway.
//   · its beat-removal mutation matched NOTHING, so a no-op was scored as
//     "unchanged" and read as the stamp being blind. The file had CRLF endings —
//     the trap §21 records — after a `git checkout`. A counter-test that stages
//     the wrong defect proves nothing in either direction.
//
// So this one restores from BYTES, and asserts each mutation actually changed the
// file before believing what the stamp says about it.
import fs from 'node:fs';
import path from 'node:path';
import { mustStamp } from './lib/muststamp.mjs';

const DIR = 'components/lesson/cinematic';
const COMP = 'Logic18Lesson';
const SCRIPT = path.join(DIR, 'logic18Script.ts');
const SCENE = path.join(DIR, 'logic18Scene.tsx');
const PROBE = 'countertest-probe';

const script0 = fs.readFileSync(SCRIPT);
const scene0 = fs.readFileSync(SCENE);
const restore = () => { fs.writeFileSync(SCRIPT, script0); fs.writeFileSync(SCENE, scene0); };

const base = mustStamp(DIR, COMP, PROBE);
let bad = 0;

function run(label, mutate, expect) {
  const before = fs.readFileSync(SCRIPT, 'utf8') + fs.readFileSync(SCENE, 'utf8');
  mutate();
  const after = fs.readFileSync(SCRIPT, 'utf8') + fs.readFileSync(SCENE, 'utf8');
  const got = mustStamp(DIR, COMP, PROBE);
  restore();

  // A MUTATION THAT DID NOTHING PROVES NOTHING. This is the check the first
  // version lacked, and it is why a broken regex read as a blind stamp.
  if (before === after) {
    console.log(`FAIL ${label.padEnd(44)} the mutation changed no bytes`);
    bad += 1;
    return;
  }
  const same = got === base;
  const ok = same === (expect === 'same');
  if (!ok) bad += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(44)} ${same ? 'unchanged' : 'changed'} (wanted ${expect})`);
}

const s = script0.toString('utf8');

// THE ONE THAT MUST STAY SILENT — the whole point of the change.
run('a rewritten narration sentence', () => {
  fs.writeFileSync(SCRIPT, s.replace(/text: '([^']{10,})'/, "text: 'A wholly different sentence, of another length entirely.'"));
}, 'same');

run('prose swapped for the SAME length', () => {
  fs.writeFileSync(SCRIPT, s.replace(/text: '([^']{10,})'/, (m, b) => `text: '${'x'.repeat(b.length)}'`));
}, 'same');

// AND FOUR THAT MUST NOT BE.
run('a changed channel value', () => {
  fs.writeFileSync(SCRIPT, s.replace(/\bx: 200\b/, 'x: 117'));
}, 'changed');

run('a beat removed', () => {
  fs.writeFileSync(SCRIPT, s.replace(/\n {2}\{\n[^]*?\n {2}\},/, ''));
}, 'changed');

run('a new channel key on a beat', () => {
  fs.writeFileSync(SCRIPT, s.replace(/\n {4}dur: /, '\n    lift: 0.5,\n    dur: '));
}, 'changed');

run('an edited scene', () => {
  fs.writeFileSync(SCENE, `${scene0.toString('utf8')}\n// touched\n`);
}, 'changed');

restore();
if (bad) {
  console.log(`\n${bad} case(s) wrong — the must-stamp is not safe to rely on`);
  process.exit(1);
}
console.log('\nall clear — the stamp ignores prose and nothing else');
