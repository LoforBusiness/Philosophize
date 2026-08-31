// WHAT A MEASUREMENT WAS TAKEN FROM — one definition, two readers.
//
// `measure-must` writes a stamp beside every lesson's must-see box and
// `validate-cinematic` re-derives it to say whether the box still describes the
// picture. They used to compute it separately, from the same two files, which
// worked right up until the thing that changed was neither of those files.
//
// It hashes FOUR things:
//
//   · the scene, because a moved prop moves the box;
//   · the script, because a changed beat changes what is on stage;
//   · the SHARED COMPONENTS the scene mounts that decide how big its art is —
//     see below;
//   · the PROBE that did the measuring, because a collector that records less
//     than it used to leaves every stamp matching and every list wrong. That is
//     not hypothetical — an older probe recorded about one word a beat, the tour
//     generator drops a station only when it can see a word being sliced, and so
//     it pushed to 1.68x over labels it had no record of. Forty-nine cut words
//     across twenty-four lessons, and nothing red anywhere.
//
// Rot in a scene announces itself; rot in the apparatus does not. So the
// apparatus is in the hash, and changing it makes every lesson stale at once.
//
// ── AND A SHARED COMPONENT IS APPARATUS TOO ─────────────────────────────────
//
// `Target` sizes the wrapper its children are laid out in. When that wrapper
// stopped collapsing to its content (S11), the art inside 146 scenes changed
// size — aesthetics14's verdict cards went from 146x15 to 146x47 — and every
// stamp in the repo still matched, because the hash could only see files named
// after the lesson. The same shape as the probe, one level out.
//
// ONLY WHERE THE SCENE ACTUALLY IMPORTS IT, so a deck-only lesson is not made
// stale by a component it never mounts.
//
// The other candidates were considered and left out on purpose. `rig.ts` and
// `Stickman.tsx` do decide the figure's box, but they are already replayed frame
// by frame against the real maths by `check:smooth` and `check:walk`, so a change
// there is loud. `cinematicKit.tsx` decides GROUND and STAGE_W and would be the
// most correct of all — and it is the highest-traffic file in the repo, so
// putting it here would make all 186 lessons stale on most working days, which
// is how a ratchet stops being run. Add it the day that stops being true.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Shared components that decide the SIZE of what a scene draws. */
const SHARED = ['Target.tsx'];

/**
 * ONLY THE PART OF A SHARED COMPONENT THAT DECIDES LAYOUT.
 *
 * Hashing all of `Target.tsx` is correct and unaffordable: it made all 186 lessons
 * stale the moment the file gained an exported hook that moves nothing, and a
 * two-hour re-measure for a change that cannot alter a single box is how a ratchet
 * stops being run — the same argument that keeps `cinematicKit.tsx` out entirely.
 *
 * What actually resized the art in 146 scenes was one line inside StyleSheet.create
 * (`art: { flexGrow: 1 }`), so that block is what goes in the hash. A new hook, a
 * comment, or a change to which conditions draw the ring cannot move a child's box
 * and does not invalidate anything.
 */
function layoutOf(file) {
  const src = fs.readFileSync(file, 'utf8');
  const at = src.indexOf('StyleSheet.create(');
  if (at < 0) return src;                       // no styles — hash the lot
  const open = src.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') { depth -= 1; if (!depth) return src.slice(open, i + 1); }
  }
  return src.slice(open);
}

/** Files that decide what a lesson draws, in a stable order. */
export function stampFiles(dir, comp) {
  const base = comp.replace(/Lesson$/, '');
  const lower = `${base[0].toLowerCase()}${base.slice(1)}`;
  const own = [`${lower}Scene.tsx`, `${lower}Script.ts`, `${comp}.tsx`]
    .map((f) => path.join(dir, f))
    .filter((p) => fs.existsSync(p));
  const src = own.map((p) => fs.readFileSync(p, 'utf8')).join('\n');
  const shared = SHARED
    .filter((f) => src.includes(`from './${f.replace(/\.tsx?$/, '')}'`))
    .map((f) => path.join(dir, f))
    .filter((p) => fs.existsSync(p));
  return [...own, ...shared].sort();
}

/** The bytes each stamped file contributes: whole for a lesson, layout for a shared one. */
function bytesOf(dir, file) {
  return SHARED.some((f) => file === path.join(dir, f))
    ? Buffer.from(layoutOf(file))
    : fs.readFileSync(file);
}

/**
 * @param dir     components/lesson/cinematic
 * @param comp    the component name the route maps the lesson id to
 * @param probe   the measuring expression, verbatim — see the note above
 */
export function mustStamp(dir, comp, probe) {
  const files = stampFiles(dir, comp);
  if (!files.length) return null;
  const h = crypto.createHash('sha1');
  for (const p of files) h.update(bytesOf(dir, p));
  h.update(crypto.createHash('sha1').update(String(probe)).digest('hex').slice(0, 8));
  return h.digest('hex').slice(0, 12);
}
