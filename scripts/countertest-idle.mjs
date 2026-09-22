// ─────────────────────────────────────────────────────────────────────────────
// AL1, PUT BACK ONE DEFECT AT A TIME.
//
//   node scripts/countertest-idle.mjs
//
// A detector nobody has seen go red is a detector nobody has tested — §21 records
// that lesson five times now. So every wobble this pass removed is staged again
// here and `check-idle` has to name it, plus the two directions that must stay
// SILENT, because a checker that cannot tell the design from the defect is the
// boxiness metric again (§13).
//
// NOTHING IS EVER WRITTEN INTO THE WORKING TREE. The four files the rig is made of
// are copied into the scratch, the defect is staged in the copy, and `RIG_SRC`
// points the checker at it. `countertest-life` mutates and reverts in a `finally`,
// which is correct as far as it goes and still leaves a window in which another
// session's build picks the defect up — and another session is usually working in
// this repo.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SRC = 'components/lesson/cinematic';
const FILES = ['rig.ts', 'moves.ts', 'wander.ts', 'interact.ts'];
const STAGE = fs.mkdtempSync(path.join(os.tmpdir(), 'al1-stage-'));

/** Run check-idle against a staged copy and return the lines it printed. */
function run(env) {
  try {
    return { code: 0, out: execFileSync('node', ['scripts/check-idle.mjs'], { encoding: 'utf8', env: { ...process.env, ...env } }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') };
  }
}

/**
 * Stage one edit in the copy and ask the checker about it.
 *
 * `want` is what the report must contain. A case with `silent: true` asserts the
 * opposite — the shape is legal and the checker has to say nothing about it.
 */
function stage(name, file, from, to, want, silent = false) {
  for (const f of FILES) fs.copyFileSync(path.join(SRC, f), path.join(STAGE, f));
  const p = path.join(STAGE, file);
  const src = fs.readFileSync(p, 'utf8');
  const n = src.split(from).length - 1;
  if (n !== 1) {
    console.log(`  ??  ${name} — the anchor matched ${n} times, so this case proves nothing`);
    return false;
  }
  fs.writeFileSync(p, src.replace(from, to));
  // A MUTATION THAT CHANGED NOTHING SCORES AS "UNCHANGED" AND READS AS A BLIND
  // CHECKER (§17's own note on countertest-stamp). Assert the file really moved.
  if (fs.readFileSync(p, 'utf8') === src) {
    console.log(`  ??  ${name} — the staged file is byte-identical; the case did not apply`);
    return false;
  }
  const { code, out } = run({ RIG_SRC: STAGE });
  const named = want.every((w) => out.includes(w));
  if (silent) {
    const ok = code === 0 && !out.includes('(AL1):');
    console.log(`  ${ok ? 'ok ' : '✗  '} ${name} — must stay silent${ok ? '' : ' — IT FIRED'}`);
    return ok;
  }
  const ok = code !== 0 && named;
  console.log(`  ${ok ? 'ok ' : '✗  '} ${name}${ok ? '' : ` — NOT CAUGHT (exit ${code})`}`);
  return ok;
}

console.log('AL1 — every wobble staged again\n');
let pass = 0;
let total = 0;
const t = (...a) => { total += 1; if (stage(...a)) pass += 1; };

// 1 · THE BREATH ITSELF, which every pose in the app used to inherit.
t('stand() breathes again', 'rig.ts',
  '    bob: 0,',
  '    bob: 0.7 * (0.5 - 0.5 * Math.cos(t * 1.6)),',
  ['(AL1):', 'rig.stand']);

// 2 · THE BOXERS' GUARD, the largest clock wobble the app ever had.
t('the guard bounces again', 'rig.ts',
  '    tilt: -0.10, neck: -0.05, bob: -2,',
  '    tilt: -0.10, neck: -0.05, bob: b - 2,',
  ['(AL1):', 'rig.boxMove']);

// 3 · A LIVING HOLD's own sink. 59 WEIGHT SHIFT was the plainest of them.
t('a living hold sinks again', 'moves.ts',
  '      bob: s.bob,\n      footL: { x: -5 - w * 3.0, y: 0 }, footR: { x: 5 - w * 3.0, y: 0 },',
  '      bob: s.bob - Math.abs(w) * 2.6,\n      footL: { x: -5 - w * 3.0, y: 0 }, footR: { x: 5 - w * 3.0, y: 0 },',
  ['(AL1):', 'actStance 59']);

// 4 · A WORKING-SHELF pose, where the constant has to survive and the swing must not.
t('a working pose breathes again', 'moves.ts',
  '      bob: s.bob - 9,\n      footL: { x: -6 - check * 2.8',
  '      bob: s.bob - 9 + breathe * 1.4,\n      footL: { x: -6 - check * 2.8',
  ['(AL1):', 'actStance 178']);

// 5 · A SEAT. `seated`'s breath is off by default; turning it back on is the defect,
//     and it is the case that proves the DEFAULT is what gets swept.
t('the default seat breathes again', 'rig.ts',
  '    bob: seatBob(seatH) + breath * breathe,',
  '    bob: seatBob(seatH) + breath,',
  ['(AL1):', 'rig.seated']);

// 6 · ACT 30, the site a hand-built list missed because its own bob CANCELLED most
//     of the breath. It is here so the next person does not trust a net reading.
t('act 30 flows up and down again', 'moves.ts',
  'neck: s.neck - b * 0.06, bob: s.bob,',
  'neck: s.neck - b * 0.06, bob: s.bob - Math.abs(a) * 1.2,',
  ['(AL1):', 'actStance 30']);

// 7 · THE WANDER's weight shift, ambient on 218 lessons.
t('the weight shift sinks again', 'wander.ts',
  '    tilt: s.tilt + 0.09 * p,\n    footL: { x: s.footL.x - 4 * p, y: s.footL.y },',
  '    tilt: s.tilt + 0.09 * p,\n    bob: s.bob - 2.2 * p,\n    footL: { x: s.footL.x - 4 * p, y: s.footL.y },',
  ['(AL1)']);

// ── AND THE TWO DIRECTIONS THAT MUST STAY SILENT ────────────────────────────

// 8 · A CONSTANT OFFSET IS THE POSE, not a wobble. 74 sits 2.2 units low on purpose
//     and 178 crouches 9; a rule that flagged those would ban crouching.
t('a deeper constant crouch', 'moves.ts',
  '      bob: s.bob - 9,\n      footL: { x: -6 - check * 2.8',
  '      bob: s.bob - 14,\n      footL: { x: -6 - check * 2.8',
  [], true);

// 9 · A ONE-SHOT's vertical is a staged event driven by `u`. Doubling one must not
//     fire: this is how a jump, a fall and picking something up are drawn.
t('a bigger one-shot dip', 'moves.ts',
  '      bob: s.bob - e * 2,',
  '      bob: s.bob - e * 4,',
  [], true);

fs.rmSync(STAGE, { recursive: true, force: true });
console.log(`\n${pass}/${total} cases behaved.`);
process.exit(pass === total ? 0 : 1);
