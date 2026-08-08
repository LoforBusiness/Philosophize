// HOW BIG IS THE PERSON, AND IS IT A PERSON?
//
// Two faults a reader described as "the stickman are huge and the whole screen
// looks bad", in the trolley lesson and others like it.
//
// 1. SCALE. cinematicKit sets K_FIG = 1.0 — a 103-unit figure, about a third of a
//    typical band — after exactly this complaint. A scene that multiplies it back
//    up, or crops to a short band, puts one character back in charge of the frame.
//    The measure that matters is not the figure's height, it is the figure's
//    height AS A FRACTION OF THE BAND, because the band is what the reader sees.
//
// 2. WHETHER IT IS DRAWN BY THE RIG. The five people tied to the trolley track
//    were `Peg`: a circle, a bar and two rotated rectangles. No arms, no joints,
//    no motion — and rule A6 says everything alive stays alive. They read as
//    lollipops standing next to a real articulated figure, which is precisely why
//    they "don't even look like stickmen".
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const FIG_UNITS = 103;            // rig height at K_FIG = 1
/** Above this share of the band, one character is the composition. */
const FAT = 0.38;

// RATCHETS, the same pattern as CARD_BUDGET in validate-cinematic: high-water
// marks that may only come DOWN. Both counts are real defects in scenes nobody
// has re-composed yet, and neither can be fixed blind — shrinking a figure
// shortens its reach, so any scene where a hand meets a prop has to be looked at.
// Recording them stops the problem GROWING while they are worked through.
const SCALE_BUDGET = 18;      // scenes where one figure owns >38% of its band
const HANDBUILT_BUDGET = 6;   // scenes drawing a person out of plain Views

const files = readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx')).sort();

const scale = [];
const fake = [];
for (const f of files) {
  const src = readFileSync(path.join(DIR, f), 'utf8');
  const b = src.match(/band=\{\[\s*(\d+),\s*(\d+)\s*\]\}/);
  const bandH = b ? Number(b[2]) - Number(b[1]) : 560;

  // the largest figure multiplier this scene uses
  let mult = 0;
  for (const m of src.matchAll(/K_FIG\s*\*\s*([\d.]+)/g)) mult = Math.max(mult, Number(m[1]));
  if (!mult && /\bK_FIG\b/.test(src)) mult = 1;
  if (mult) scale.push({ f, bandH, mult, share: (FIG_UNITS * mult) / bandH });

  // people built out of Views instead of the rig: a round "head" style next to a
  // "body"/"torso" style, in a file that never solves a stance for them.
  const styles = [...src.matchAll(/^\s{2}(\w*[Hh]ead\w*):\s*\{[^}]*borderRadius/gm)].map((m) => m[1]);
  const bodies = [...src.matchAll(/^\s{2}(\w*(?:[Bb]ody|[Tt]orso)\w*):\s*\{/gm)].map((m) => m[1]);
  if (styles.length && bodies.length) {
    const stem = styles[0].replace(/[Hh]ead.*/, '');
    fake.push({ f, stem: stem || styles[0], head: styles[0], body: bodies[0] });
  }
}

let fails = 0;
console.log('\nFIGURE SCALE AGAINST THE BAND\n');
scale.sort((a, z) => z.share - a.share);
const over = scale.filter((s) => s.share > FAT);
console.log(`  ${scale.length} scenes measured · median share ${(scale[Math.floor(scale.length / 2)].share * 100).toFixed(0)}%`);
for (const s of over) {
  console.log(`  FAIL  ${s.f.replace('Scene.tsx', '').padEnd(16)} figure ${(FIG_UNITS * s.mult).toFixed(0)} of a ${s.bandH} band = ${(s.share * 100).toFixed(0)}%  (K_FIG × ${s.mult})`);
}
if (!over.length) console.log('  ok    no scene lets one figure own more than ' + (FAT * 100) + '% of its band');
console.log(`  ${over.length} over, budget ${SCALE_BUDGET}`);
if (over.length > SCALE_BUDGET) { console.log(`  FAIL  that is MORE than the ${SCALE_BUDGET} recorded — a scene got fatter.`); fails++; }

console.log('\nPEOPLE NOT DRAWN BY THE RIG\n');
if (!fake.length) console.log('  ok    every human in every scene is a solved figure');
for (const x of fake) {
  console.log(`  FAIL  ${x.f.replace('Scene.tsx', '').padEnd(16)} hand-built figure: ${x.head} + ${x.body}`);
}
console.log(`  ${fake.length} hand-built, budget ${HANDBUILT_BUDGET}`);
if (fake.length > HANDBUILT_BUDGET) { console.log(`  FAIL  that is MORE than the ${HANDBUILT_BUDGET} recorded — a new one appeared.`); fails++; }

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
