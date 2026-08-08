// PROPS MUST NOT BLINK.
//
// A cinematic lesson names its props with boolean cues in its *Script.ts, and the
// scene fades each one in and out as the cue turns on and off. That is fine for a
// prop that arrives, does its job and leaves — and wrong for one that leaves and
// then COMES BACK, which is what a viewer sees as "objects disappearing and
// reappearing". Nothing in a real scene teleports out of the room for one beat.
//
// ethics-1 had two at once: the dog was on for beat 1, gone for beats 2-6, back
// for beat 7; the balance was on for 2-3, gone for 4-5, back for 6-7. Both are the
// lesson's subject matter, and both flickered.
//
// This walks every script and reports any cue that goes ON → OFF → ON.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const files = readdirSync(DIR).filter((f) => f.endsWith('Script.ts')).sort();

/**
 * A gap in the SCRIPT is not itself a fault — the script says which beats a prop
 * is relevant to, and that is the right thing for it to say. The fault is the
 * SCENE fading the prop out and back on those beats. A scene that wraps the cue
 * in `held()` keeps it on stage across the gap, which is the fix, so this looks
 * for that before complaining.
 */
function isHeld(scriptFile, cue) {
  const scene = path.join(DIR, scriptFile.replace('Script.ts', 'Scene.tsx'));
  if (!existsSync(scene)) return false;
  const src = readFileSync(scene, 'utf8');
  // NOT `[^)]*` — the arrow parameter `(b) =>` contains a close paren, so a
  // negated-paren class stops before ever reaching the cue name.
  return new RegExp(`held\\(\\s*BEATS\\.map\\([\\s\\S]{0,60}?\\b${cue}\\b`).test(src);
}

/** The beats of one script, as raw text chunks. */
function beatsOf(src) {
  const i = src.indexOf('BEATS');
  if (i < 0) return [];
  return src.slice(i).split(/\n {2}\{/).slice(1);
}

/** Cue names: the boolean flags this script actually sets. */
function cuesOf(body) {
  const out = new Set();
  for (const m of body.matchAll(/^ {4}(\w+): true,/gm)) out.add(m[1]);
  return [...out];
}

let blinking = 0, propCount = 0, fixed = 0;
const rows = [];
for (const f of files) {
  const src = readFileSync(path.join(DIR, f), 'utf8');
  const chunks = beatsOf(src);
  if (chunks.length < 3) continue;
  const body = src.slice(src.indexOf('BEATS'));
  const bad = [];
  for (const cue of cuesOf(body)) {
    const re = new RegExp(`\\b${cue}: true`);
    const seq = chunks.map((c) => (re.test(c) ? 1 : 0));
    let seen = false, gapped = false, blink = false;
    seq.forEach((v) => {
      if (v) { if (seen && gapped) blink = true; seen = true; gapped = false; }
      else if (seen) gapped = true;
    });
    if (blink && !isHeld(f, cue)) bad.push(`${cue} [${seq.join('')}]`);
    if (blink && isHeld(f, cue)) fixed++;
  }
  if (bad.length) { blinking++; propCount += bad.length; rows.push(`  ${f.replace('Script.ts', '').padEnd(18)} ${bad.join('   ')}`); }
}

console.log('\nPROPS THAT LEAVE AND COME BACK\n');
console.log(`  ${files.length} scripts scanned`);
if (fixed) console.log(`  ${fixed} cue(s) have a gap in the script and are held on stage by their scene — fine`);
if (!rows.length) {
  console.log('  none — every prop arrives once and leaves once.\n');
} else {
  console.log(`  ${blinking} lessons, ${propCount} props\n`);
  console.log(rows.join('\n'));
  console.log('');
  process.exit(1);
}
