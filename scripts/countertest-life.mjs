// Put each defect back and watch `check-life` fail. A detector nobody has seen
// go red is a detector nobody has tested — §21 records that lesson four times.
//
//   node scripts/countertest-life.mjs
//
// Every mutation is applied to a real script, measured, and reverted in a
// `finally`, so an exception cannot leave the corpus mutated.
//
// THE VICTIM HAS TO BE CHOSEN WITH THE CHECKER'S OWN RULES. The first version of
// this reported N6 and N7 as blind, and both times the TEST was wrong: it set a
// beat that was inside a split run (where a repeat is required, not forbidden)
// to a code that has no `VARIANTS` row (where the rule does not apply). A
// counter-test that stages the wrong defect proves nothing in either direction —
// the same trap the Cyrillic font check fell into (§7).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { corpus, readScript, decomment } from './lib/gestures.mjs';
import { grave, reachesCatalogue, VARIANTS, channels } from './lib/liveliness.mjs';

const lessons = corpus().filter((l) => l.key && reachesCatalogue(l.comp));

function failures() {
  try {
    execFileSync('node', ['scripts/check-life.mjs'], { encoding: 'utf8' });
    return 0;
  } catch (e) {
    return (e.stdout || '').split('\n').filter((l) => l.includes('FAIL')).length;
  }
}

/** The checker's own run detection, so victim choice and rule agree. */
function runs(lesson) {
  const raw = readScript(lesson.file);
  const m = raw.match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
  const parts = m[1].split(/(\n\s{2}\},?\s*\n?)/);
  const chunks = [];
  for (let i = 0; i < parts.length; i += 2) if (/\S/.test(parts[i])) chunks.push(parts[i]);
  const cont = new Set();
  for (let i = 1; i < chunks.length; i++) {
    const a = channels(decomment(chunks[i - 1]));
    const b = channels(decomment(chunks[i]));
    if (a && a === b) cont.add(i);
  }
  const inRun = new Set();
  for (const i of cont) { let h = i; while (cont.has(h)) h--; inRun.add(i); inRun.add(h); }
  return { cont, inRun };
}

/** Set the code on beat `bi` — indexed by DECLARED order, which is how the file reads. */
function setBeat(lesson, bi, code) {
  const nth = lesson.beats.filter((b) => b.declared !== null && b.i < bi).length;
  return (src) => {
    let seen = 0;
    return src.replace(new RegExp(`([\\s{,]${lesson.key}\\s*:\\s*)(-?\\d+)`, 'g'), (m, p1) => {
      if (seen++ === nth) return `${p1}${code}`;
      return m;
    });
  };
}

function withMutation(file, mutate, label) {
  const before = readScript(file);
  const after = mutate(before);
  if (after === before) { console.log(`  BAD   ${label} — mutation made no change`); return; }
  try {
    fs.writeFileSync(file, after, 'utf8');
    const n = failures();
    console.log(`  ${n > 0 ? 'ok  ' : 'BAD '}  ${label} → ${n} failure(s)`);
  } finally {
    fs.writeFileSync(file, before, 'utf8');
  }
}

console.log('\nCOUNTER-TESTS — every line must say ok\n');
console.log(`  baseline → ${failures()} failure(s)  (must be 0)`);

const light = (l) => !grave(l.beats.map((b) => b.text).join(' '));

// N9 · a gag about nothing in its beat.
const l9 = lessons.find((l) => light(l) && l.beats.filter((b) => b.declared !== null).length > 4);
withMutation(l9.file, setBeat(l9, l9.beats.filter((b) => b.declared !== null)[1].i, 398),
  'N9 · a gag about nothing in its beat');

// N11 · a gag anywhere in a lesson that mentions a grave subject.
const l11 = lessons.find((l) => !light(l) && l.beats.filter((b) => b.declared !== null).length > 3);
withMutation(l11.file, setBeat(l11, l11.beats.filter((b) => b.declared !== null)[1].i, 402),
  'N11 · a gag in a grave lesson');

// N11 · a gag on a graded beat.
const lq = lessons.find((l) => light(l) && l.beats.some((b) => b.graded && b.declared !== null));
withMutation(lq.file, setBeat(lq, lq.beats.find((b) => b.graded && b.declared !== null).i, 402),
  'N11 · a gag on a graded beat');

// N6 · the same pose struck twice, BOTH outside a run, on a code that has a
// variant available. All three conditions are the rule's own preconditions.
let l6 = null;
for (const l of lessons) {
  const { inRun } = runs(l);
  const free = l.beats.filter((b) => b.declared !== null && !inRun.has(b.i) && VARIANTS[b.declared]);
  if (free.length >= 2) { l6 = { l, from: free[0], to: free[1] }; break; }
}
if (l6) {
  withMutation(l6.l.file, setBeat(l6.l, l6.to.i, l6.from.declared),
    `N6 · pose ${l6.from.declared} struck twice, both outside a run`);
} else console.log('  SKIP  N6 · no lesson has two free beats with a variant row');

// N7 · a played action across a whole split run.
//
// THE WHOLE RUN HAS TO BE MUTATED, and finding that out is the useful part. A run
// is DEFINED by its members declaring identical channels, and the gesture is one
// of those channels — so changing a single member's pose dissolves the very run
// that made it illegal, and the check correctly says nothing. The reachable
// defect is therefore a run whose members all carry a played action, which is
// exactly what an author writing `p: 383` down a split sentence would produce:
// the action replays on every piece.
let l7 = null;
for (const l of lessons) {
  const { cont } = runs(l);
  for (const i of cont) {
    if (!cont.has(i + 1)) continue;
    let head = i; while (cont.has(head)) head--;
    const members = [head];
    for (let k = head + 1; cont.has(k); k++) members.push(k);
    if (members.every((m) => l.beats[m].declared !== null)) { l7 = { l, members }; break; }
  }
  if (l7) break;
}
if (l7) {
  withMutation(l7.l.file,
    (src) => l7.members.reduce((acc, m) => setBeat(l7.l, m, 383)(acc), src),
    `N7 · a played action across a whole run (beats ${l7.members.join(',')})`);
} else console.log('  SKIP  N7 · no run of three or more found');

// And the direction that must stay silent: a played action on a run's TAIL is
// legal and must NOT fire, or the joke pass's own fallback becomes unusable.
let l7b = null;
for (const l of lessons) {
  const { cont } = runs(l);
  for (const i of cont) if (!cont.has(i + 1)) { l7b = { l, i }; break; }
  if (l7b) break;
}
if (l7b) {
  const before = readScript(l7b.l.file);
  try {
    fs.writeFileSync(l7b.l.file, setBeat(l7b.l, l7b.i, 383)(before), 'utf8');
    const n = failures();
    console.log(`  ${n === 0 ? 'ok  ' : 'BAD '}  N7 · a played action on a run TAIL stays silent → ${n} failure(s)`);
  } finally { fs.writeFileSync(l7b.l.file, before, 'utf8'); }
}

console.log(`\n  restored → ${failures()} failure(s)  (must be 0)\n`);
