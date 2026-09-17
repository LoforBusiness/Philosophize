// PUT EACH DEFECT BACK INTO THE STRUCK INSIGNIA AND WATCH IT GO RED, THEN
// RESTORE THE FILE AND WATCH BOTH CHECKS GO GREEN.
//
//   node scripts/countertest-insignia.mjs
//
// check:ui §4c/§4d and check:badges hold every rule the rank ladder and the
// badge case have learned: no limbs, every rung adds something, no two pins are
// one drawing in two paints, nothing leaves its box, a frame shows past its
// crest, a glint on paper carries its dark line, the laurel stays outside the
// medal, tier IV is more laurel than tier III, a mark keeps its room, and a
// locked badge carries no furniture. Each is staged here as the defect it
// exists to catch.
//
// ONE OF THESE MISSED ON ITS FIRST RUN AND THE CHECKER WAS RIGHT. Moving the
// open laurel's control point in to 30 still left every leaf outside the
// medal, because a leaf sits four units off its own stem. A counter-test that
// stages the wrong defect proves nothing in either direction; the laurel below
// is one that really curls behind the medal.
//
// The file is rewritten in place and restored in a finally, so run it from the
// repo root and not while anything else is editing insigniaArt.ts.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const F = 'components/shared/insigniaArt.ts';
const pristine = readFileSync(F, 'utf8');
const CASES = [
  ['a limb is declared', 'check-ui', 'no pin grows a limb',
    [pristine.length, '\nexport function wingPath(): string { return \'\'; }\n']],
  ['degree 2 draws less than degree 1', 'check-ui', 'every rung adds something',
    ['stones: d === 1 ? 1 : d === 2 ? 3 : 0,', 'stones: d === 1 ? 1 : d === 2 ? 0 : 0,']],
  ['two orders share a silhouette', 'check-ui', 'no two of the forty-eight draw the same thing',
    ["{ label: 'hex', core: () => rounded(poly(47, 6, 0), 8),", "{ label: 'hex', core: () => circle(44),"]],
  ['a capstone overflows its box', 'check-ui', 'stays inside the viewBox',
    ['export const frameK = (orderIndex: number) => 0.86 +', 'export const frameK = (orderIndex: number) => 0.99 +']],
  ['a glint loses its line', 'check-ui', 'every white glint carries its dark line',
    ["return [{ k: 'line', d: p, c: t.line, w: 1.6 }, { k: 'fill', d: p, c: '#FFFFFF' }];", "return [{ k: 'fill', d: p, c: '#FFFFFF' }];"]],
  ['the frame hides behind the crest', 'check-ui', 'its frame shows past the crest',
    ['export const FRAMED_K = 0.62;', 'export const FRAMED_K = 0.84;']],
  ['the laurel curls behind the medal', 'validate-badges', 'behind a medal',
    ['  open: { x0: 15, y0: 92, cx: 53, cy: 60, x1: 29,', '  open: { x0: 6, y0: 92, cx: 16, cy: 60, x1: 10,']],
  ['tier IV is no more laurel than tier III', 'validate-badges', 'tier IV must be more furniture',
    ['cx: 56, cy: 56, x1: 28, y1: 11, n: 8,', 'cx: 56, cy: 56, x1: 28, y1: 11, n: 6,']],
  ['a mark outgrows its face', 'validate-badges', 'the mark comes within',
    ['  lessons: { size: 0.36, dy: 5 },', '  lessons: { size: 0.46, dy: 5 },']],
  ['a locked badge keeps its furniture', 'validate-badges', 'still carries furniture',
    ['  const furnished = t.struck;', '  const furnished = true;']],
];

let missed = 0;
try {
  for (const [name, check, expect, [from, to]] of CASES) {
    let src;
    if (typeof from === 'number') src = pristine + to;
    else {
      if (!pristine.includes(from)) { console.log(`BROKEN   ${name}: target not found`); missed++; continue; }
      src = pristine.replace(from, to);
    }
    if (src === pristine) { console.log(`BROKEN   ${name}: changed nothing`); missed++; continue; }
    writeFileSync(F, src);
    const r = spawnSync(process.execPath, [`scripts/${check}.mjs`], { encoding: 'utf8', timeout: 240000 });
    const out = (r.stdout || '') + (r.stderr || '');
    const caught = r.status !== 0 && out.includes(expect);
    if (!caught) missed++;
    console.log(`${caught ? 'caught  ' : 'MISSED  '}${name}  (${check} exit ${r.status})`);
  }
} finally {
  writeFileSync(F, pristine);
}
const clean = [spawnSync(process.execPath, ['scripts/check-ui.mjs']).status, spawnSync(process.execPath, ['scripts/validate-badges.mjs']).status];
console.log(`control after restore: check-ui ${clean[0]}, validate-badges ${clean[1]}`);
console.log(missed ? `${missed} not caught` : 'every defect caught');
process.exit(missed || clean.some(Boolean) ? 1 : 0);
