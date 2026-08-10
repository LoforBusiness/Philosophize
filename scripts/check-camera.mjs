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
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

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
