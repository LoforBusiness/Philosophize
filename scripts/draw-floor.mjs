// DRAW THE FLOOR THAT 87 SCENES DECLARED AND NEVER RENDERED.
//
// The tonal pass that took `check:shade`'s flat count to zero added a `floor:`
// entry to 111 scenes' StyleSheets. 24 of them also added the <View>. The other
// 87 did not, and nothing noticed, because check:shade counts
// `backgroundColor: RULE` INSIDE THE STYLESHEET and never asks whether the style
// is used. So the ratchet reached zero and the screens did not change — which is
// the same shape as every other defect §17 records: a number that is generated,
// validated, written down, and then not read.
//
//   node scripts/draw-floor.mjs          # report
//   node scripts/draw-floor.mjs --write  # insert the View
//
// The floor goes FIRST, before every other child, because it is the ground the
// scene stands on and everything else is on top of it. It is clipped by the band
// like anything else, so a scene whose band stops above GROUND still draws
// nothing — which is correct.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const WRITE = process.argv.includes('--write');

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx')).sort();
const done = [];
const skipped = [];

for (const f of files) {
  const p = path.join(DIR, f);
  const src = fs.readFileSync(p, 'utf8');
  if (!/^ {2}floor: \{/m.test(src)) continue;         // no floor declared
  if (/styles\.floor/.test(src)) continue;            // already drawn

  // The scene root: the first `<View|Animated.View style={styles.scene}>` that
  // follows a `return (`. Anchoring on `return (` matters — a file may define
  // sub-components, and only the scene component owns the ground.
  const lines = src.split('\n');
  let at = -1;
  let sawReturn = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (/\breturn \($/.test(lines[i])) sawReturn = true;
    if (sawReturn && /^\s*<(Animated\.)?View style=\{styles\.scene\}>\s*$/.test(lines[i])) { at = i; break; }
  }
  if (at < 0) { skipped.push(`${f} — no plain scene root`); continue; }

  const indent = (lines[at].match(/^\s*/) || [''])[0];
  lines.splice(at + 1, 0, `${indent}  <View style={styles.floor} pointerEvents="none" />`);

  // `View` must be imported — most scenes have it, a few draw only Animated.View.
  let out = lines.join('\n');
  if (!/^import \{[^}]*\bView\b[^}]*\} from 'react-native';/m.test(out)) {
    skipped.push(`${f} — View is not imported`);
    continue;
  }
  if (WRITE) fs.writeFileSync(p, out, { encoding: 'utf8' });   // LF: the string has no \r
  done.push(f.replace('Scene.tsx', ''));
}

console.log(`${WRITE ? 'drew' : 'would draw'} the floor in ${done.length} scenes`);
if (skipped.length) {
  console.log(`\n${skipped.length} left alone:`);
  for (const s of skipped) console.log(`  ${s}`);
}
if (!WRITE) console.log('\n  --write to apply');
