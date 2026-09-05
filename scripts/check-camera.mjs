// CAN THE READER SEE WHAT THEY HAVE TO TAP?
//
// A reader reported answer plates cropped by the camera: the shot was framed for
// the figure, the question sat top-right, and the window cut it. They could not
// tap it, and nothing on screen said anything was missing.
//
// The fix is central, and it lives INLINE IN CinematicPlayer — not, as this header
// claimed for a while, in a camera.ts function called `openForTargets`, which has
// never existed. `needsBox` marks every beat carrying an `interact` block; the
// answer targets measure themselves and report a box, and `containShot` pulls the
// shot out only as far as that box needs. Before a box arrives the shot is
// NEUTRAL — the whole declared band, which cannot crop anything. It is applied
// AFTER resolveMoves, so no authored verb can override it. That covers every
// lesson whose camera the PLAYER owns.
//
// This finds the ones it does not: a scene that builds its own camera transform
// out of a local SHOTS table and applies its own `camStyle`. Those bypass the
// player entirely, so the guarantee does not reach them, and any of them with a
// scene-answered question has to be checked by hand.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { readScript, decomment, beatsBody, beatChunks } from './lib/gestures.mjs';

const DIR = 'components/lesson/cinematic';
const scenes = readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx')).sort();

/** Does this lesson ask a question INSIDE the scene? */
function hasInteract(sceneFile) {
  const script = path.join(DIR, sceneFile.replace('Scene.tsx', 'Script.ts'));
  try {
    return /^\s+interact:\s*\{/m.test(readFileSync(script, 'utf8'));
  } catch {
    return false;
  }
}

let unguarded = 0;
const rows = [];
for (const f of scenes) {
  const src = readFileSync(path.join(DIR, f), 'utf8');
  // The player owns the camera when the lesson hands it `shots=` or `camera=`.
  const playerOwned = /\b(shots|camera)=\{/.test(src);
  // A scene rolls its own when it builds a camera transform itself.
  const ownCamera = /transform:\s*\[[^\]]*scale/.test(src) && /\bcam\b/.test(src);
  if (!ownCamera || playerOwned) continue;
  if (!hasInteract(f)) continue;
  unguarded++;
  rows.push(`  ${f.replace('Scene.tsx', '')}`);
}

// ── ONE SHOT PER BEAT ────────────────────────────────────────────────────────
//
// A hand-written SHOTS table is indexed BY BEAT, and nothing was comparing its
// length to how many beats the lesson has. J12's segmenting pass then cut the
// packed beats of ethics-ethics-8 in two — 11 → 18 — and the whole list slid one
// place per split: 1.62 on the first half of a sentence and 1.0 on the second,
// then 1.24 where the arc wanted 1.0. The reader saw the camera pull back and
// push in on alternate taps, and reported it as the lesson "resetting".
//
// It could not fail. The splitter copies every CHANNEL verbatim so the picture
// holds still, and a shot is not a channel — it lives in the scene, not on the
// beat. `make:tours` and `measure:must` both re-derive per beat and were re-run;
// this one table was hand-written and stayed eleven long. Beats past the end are
// CLAMPED to the last shot rather than throwing, which is why the tail of the
// lesson merely held wide instead of crashing.
//
// The general form is the one §21 keeps recording: when something changes how
// many beats a lesson has, everything indexed by beat must be re-derived — and
// what is hand-written needs a checker, because it has no generator to re-run.
const SHOT_RE = /const SHOTS[^=]*=\s*\[([\s\S]*?)\n\];/;
const mismatched = [];
let withShots = 0;
for (const f of scenes) {
  const src = readFileSync(path.join(DIR, f), 'utf8').replace(/\r\n/g, '\n');
  const m = SHOT_RE.exec(src);
  if (!m) continue;
  const script = path.join(DIR, f.replace('Scene.tsx', 'Script.ts'));
  if (!existsSync(script)) continue;
  const body = beatsBody(decomment(readScript(script)));
  if (!body) continue;
  withShots++;
  const beats = beatChunks(body).length;
  const shots = (m[1].match(/\{\s*cx:/g) || []).length;
  if (shots !== beats) mismatched.push(`  ${f.replace('Scene.tsx', '')}: ${shots} shots for ${beats} beats`);
}

console.log('\nONE SHOT PER BEAT\n');
console.log(`  ${withShots} scene(s) carry a hand-written shot list`);
if (!mismatched.length) {
  console.log('  ok    every shot list has exactly one entry per beat.\n');
} else {
  console.log(`\n  FAIL  ${mismatched.length} shot list(s) are indexed against the wrong beat count:\n`);
  console.log(mismatched.join('\n'));
  console.log('\n  A shot list is indexed BY BEAT. Repeat a beat\'s shot for each piece it was');
  console.log('  split into, or the arc plays against the wrong sentences.\n');
}

console.log('\nTAPPABLE THINGS INSIDE THE SHOT\n');
console.log(`  ${scenes.length} scenes scanned`);
console.log('  player-owned cameras are guaranteed by needsBox + containShot (CinematicPlayer.tsx)');
if (!rows.length) {
  console.log('  ok    no scene answers a question under a camera the player does not own.\n');
} else {
  console.log(`\n  ${unguarded} scene(s) roll their own camera AND ask a question in the scene.`);
  console.log('  These bypass the central pull-back and want checking by hand:\n');
  console.log(rows.join('\n'));
  console.log('');
}

if (mismatched.length || rows.length) process.exit(1);
