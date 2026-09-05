// MAKE THE FIGURE LOOK AT WHAT THE BEAT IS ABOUT, IN EVERY SCENE THAT HAS ONE.
//
//   node scripts/wire-gaze.mjs           # report
//   node scripts/wire-gaze.mjs --write
//
// `moves.gazeAt` and `moves.pointAt` have existed since the rig was written and
// are called ZERO times across 184 scenes; `interact.ts` is a thousand lines of
// the figure's relationship to the world and 14 of its 17 exports are also called
// zero times. The figure narrates a diagram he never once looks at, which is what
// a reader was describing:
//
//   "I want the stickman more interactive with objects and lessons and reacts in
//    better ways and acts in better ways. That is more entertaining and more real."
//
// The substitution is `pose(...)` → `lookPose(..., gazeX.value, gazeY.value,
// gazeOn.value)`. It has to be a substitution rather than an added line because
// `gazeAt` needs the same `x` and `dir` that are written INLINE inside the `pose`
// call in every one of these files, and hoisting them would be 184 refactors.
//
// ── ONLY THE SCENES WITH ONE FIGURE ─────────────────────────────────────────
//
// 20 scenes pose two. Which of them is the narrator is a judgement (`check:turn`
// records the same problem for facing: picking the first `pose()` in the file
// reported 101 lessons, most of them wrongly), and pointing both heads at one
// centroid would be worse than leaving them. They are listed and skipped.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const WRITE = process.argv.includes('--write');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7);

/** The end of the call that starts at `from` (the index of the '(' ). */
function closeAt(src, from) {
  let depth = 0;
  for (let i = from; i < src.length; i += 1) {
    const c = src[i];
    if (c === '(') depth += 1;
    else if (c === ')') { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}

const done = [];
const skipped = [];

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Scene.tsx')).sort()) {
  if (ONLY && !f.includes(ONLY)) continue;
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf8');
  const base = f.replace('Scene.tsx', '');

  if (/\blookPose\b/.test(src)) { skipped.push(`${base} — already wired`); continue; }

  // Every `pose(` that is a real call, not `lookPose(` or `poseFoo(`.
  const calls = [];
  const re = /(?<![A-Za-z0-9_])pose\(/g;
  let m;
  while ((m = re.exec(src))) calls.push(m.index);
  if (calls.length !== 1) { skipped.push(`${base} — ${calls.length} pose() calls, needs a person`); continue; }

  const open = calls[0] + 'pose'.length;
  const close = closeAt(src, open);
  if (close < 0) { skipped.push(`${base} — unbalanced pose() call`); continue; }

  const inner = src.slice(open + 1, close);
  // Six arguments at depth 0: stance, x, groundY, k, dir, opacity.
  let depth = 0, commas = 0;
  for (const c of inner) {
    if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']' || c === '}') depth -= 1;
    else if (c === ',' && depth === 0) commas += 1;
  }
  if (commas !== 5) { skipped.push(`${base} — pose() has ${commas + 1} args, expected 6`); continue; }

  src = `${src.slice(0, calls[0])}lookPose(${inner}, gazeX.value, gazeY.value, gazeOn.value)${src.slice(close + 1)}`;

  // The import. Formatting varies from scene to scene, so add to the NAMES.
  const imp = /import \{([\s\S]*?)\} from '\.\/cinematicKit';/.exec(src);
  if (!imp) { skipped.push(`${base} — no cinematicKit import`); continue; }
  if (!/\blookPose\b/.test(imp[1])) {
    src = src.replace(imp[0], `import {${imp[1].replace(/,?\s*$/, ', lookPose,\n')}} from './cinematicKit';`);
  }

  // The three values off SceneApi.
  const sig = /export default function \w+\(\{([^}]*)\}: SceneApi\)/.exec(src);
  if (!sig) { skipped.push(`${base} — could not read the component signature`); continue; }
  if (!/\bgazeX\b/.test(sig[1])) {
    src = src.replace(sig[0], sig[0].replace(sig[1], `${sig[1].replace(/,?\s*$/, '')}, gazeX, gazeY, gazeOn `));
  }

  if (WRITE) fs.writeFileSync(p, src, { encoding: 'utf8' });
  done.push(base);
}

console.log(`${WRITE ? 'wired' : 'would wire'} ${done.length} scenes`);
if (skipped.length) {
  console.log(`\n${skipped.length} left alone:`);
  const multi = skipped.filter((s) => /pose\(\) calls/.test(s));
  for (const s of skipped.filter((x) => !/pose\(\) calls/.test(x))) console.log(`    ${s}`);
  if (multi.length) console.log(`    ${multi.length} with more than one figure: ${multi.map((s) => s.split(' ')[0]).join(', ')}`);
}
if (!WRITE) console.log('\n  --write to apply');
