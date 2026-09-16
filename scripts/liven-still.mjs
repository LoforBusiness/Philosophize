// ─────────────────────────────────────────────────────────────────────────────
// NO TAP LEAVES THE WHOLE PICTURE STILL.
//
//   node scripts/liven-still.mjs          report
//   node scripts/liven-still.mjs --write   do it, then run regrow-pose.mjs
//
// A STILL BEAT is one where no scene channel changed, the figure's x did not
// change, his pose did not change, and that pose reads `bt` — so the moment the
// beat advances, every single thing on screen stops. Measured across the corpus
// there are 334 of them in 149 lessons, and a reader found them from the outside:
// *"sometimes there will just be three tabs in one lesson where there is no
// animation above the words."*
//
// The cause is not carelessness, it is J12 working as designed. The beat splitter
// cut 466 over-packed beats into pieces and copied every channel verbatim so the
// PICTURE would hold still while the words advanced. That was right for the scene
// and wrong for the figure — group N already found the same thing about repeated
// poses and fixed 445 of them with `LIVING_RUN`. This is the rest of it.
//
// The fix is one substitution: put the figure on the LIVING twin of the pose he is
// already holding, so he keeps moving straight through the beat change. He is not
// doing anything new — he is doing the same thing, alive. `carryFrom` blends the
// transition, so the tap itself is smooth.
//
// ── WHAT IT WILL NOT TOUCH ──────────────────────────────────────────────────
//
//   · a pose with no honest living twin (`STILL_TWIN` is deliberately partial —
//     every prop-work and floor pose is absent, because a living hold takes the
//     hand off the board and A1 outranks this);
//   · the FIRST beat of a still run, so the run stays one continuous movement (N7)
//     and the reader still sees the pose the author chose;
//   · a beat the figure is already alive on.
//
// IDEMPOTENT: after a run every touched beat holds a living pose, so it is no
// longer a still beat and the second run finds nothing.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { STILL_TWIN, holdsARun } from './lib/liveliness.mjs';
import { poseTrack, poseTracks } from './lib/posetrack.mjs';

const DIR = 'components/lesson/cinematic';
const WRITE = process.argv.includes('--write');
const PROSE = new Set(['text', 'cite', 'say', 'quote', 'tap', 'mc', 'interact', 'summary', 'must', 'dur']);

/** Beat blocks, on validate-cinematic's own delimiter. */
const blocksOf = (src) => src.split('\n  {\n').slice(1).map((c) => c.split('\n  }')[0]);

const field = (block, key) => {
  const m = block.match(new RegExp(String.raw`(?:^|,|\n)\s*${key}:\s*([^,\n]+)`));
  return m ? m[1].trim() : undefined;
};

let stillTotal = 0;
let noTrack = 0;
const changed = [];
const unmapped = new Map();

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('Script.ts'))) {
  const full = path.join(DIR, file);
  const src = fs.readFileSync(full, 'utf8');
  if (src.includes('\r\n')) { console.log(`  skipped ${file} — CRLF`); continue; }
  const blocks = blocksOf(src);
  if (!blocks.length) continue;

  // Every channel this lesson declares, minus the figure's own two.
  const keys = new Set();
  for (const b of blocks) for (const m of b.matchAll(/(?:^|\n)\s*([A-Za-z_$][\w$]*):\s/g)) keys.add(m[1]);
  const scene = [...keys].filter((k) => !PROSE.has(k) && k !== 'x');

  // WHICH FIELD IS THE POSE — followed out of the scene, never assumed to be `p`.
  //
  // A SCENE THAT POSES TWO FIGURES GETS BOTH OF THEM ALIVE. Which of the two is the
  // lead is a judgement, and guessing it dresses the wrong man — so this never
  // guesses: on a still beat each figure takes its own pose's living twin, and two
  // people standing in conversation both keep breathing. That reached the 22
  // two-figure lessons this pass used to skip whole.
  const stem = file.replace('Script.ts', '');
  const single = poseTrack(DIR, stem);
  const tracks = single ? [single] : poseTracks(DIR, stem);
  if (!tracks.length) { noTrack += 1; continue; }

  const swaps = [];
  for (let i = 1; i < blocks.length; i += 1) {
    const same = (k) => field(blocks[i - 1], k) === field(blocks[i], k);
    if (!scene.every(same)) continue;             // the scene moved, pose included
    if (!same('x')) continue;                     // he walked
    // A beat may omit the field entirely, and then the pose is whatever the SCENE
    // falls back to — read off its own `?? N` rather than assumed, so a beat whose
    // scene defaults to something other than the neutral stand is handled honestly
    // instead of being given a gesture nobody wrote.
    const poses = tracks.map((t) => {
      const declared = field(blocks[i], t.field);
      return { t, declared, p: Number(declared ?? t.dflt) };
    });
    if (poses.some(({ p }) => holdsARun(p))) continue;   // somebody is already alive
    stillTotal += 1;
    for (const { t, declared, p } of poses) {
      const twin = STILL_TWIN[p];
      if (twin === undefined) { unmapped.set(p, (unmapped.get(p) ?? 0) + 1); continue; }
      swaps.push([i, t.field, declared === undefined ? null : p, twin]);
    }
  }
  if (!swaps.length) continue;

  // Rewrite in the raw text, one beat block at a time, so nothing else can move.
  const parts = src.split('\n  {\n');
  for (const [i, POSE, from, to] of swaps) {
    const idx = i + 1;
    const end = parts[idx].indexOf('\n  }');
    const head = parts[idx].slice(0, end);
    const tail = parts[idx].slice(end);
    if (from === null) {
      // The beat declared no pose, so the scene was falling back. Write the twin in.
      parts[idx] = `    ${POSE}: ${to},\n${head}${tail}`;
    } else {
      const re = new RegExp(String.raw`(^|,|\n)(\s*)${POSE}:\s*${from}\b`);
      if (!re.test(head)) throw new Error(`${file} beat ${i}: could not find ${POSE}: ${from}`);
      parts[idx] = head.replace(re, `$1$2${POSE}: ${to}`) + tail;
    }
  }
  const out = parts.join('\n  {\n');
  if (WRITE) fs.writeFileSync(full, out, 'utf8');
  changed.push([file.replace('Script.ts', ''), swaps.length]);
}

const swapped = changed.reduce((a, [, n]) => a + n, 0);
const left = [...unmapped.values()].reduce((a, b) => a + b, 0);
console.log(`\n${stillTotal} still beats — nothing on screen moves at all\n`);
console.log(`  ${WRITE ? 'given' : 'would be given'} a living hold : ${swapped}  in ${changed.length} lessons`);
console.log(`  left alone, no honest twin       : ${left}`);
console.log(`  lessons skipped, no pose track     : ${noTrack}`);
if (unmapped.size) {
  console.log('\n  the poses with no twin, and why they cannot have one — they work at a');
  console.log('  prop or are on the floor, so moving the hand would break A1:');
  for (const [p, n] of [...unmapped].sort((a, b) => b[1] - a[1])) {
    console.log(`     pose ${String(p).padStart(3)} — ${n} beat(s)`);
  }
  console.log('\n  those beats need the SCENE to change, not the figure.');
}
if (WRITE) console.log('\nNOW RUN: node scripts/regrow-pose.mjs --write   (the boxes hold a different pose)');
else console.log('\n(dry run — pass --write to apply)');
