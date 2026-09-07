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
// `wardrobe.ts` was in this hash for an afternoon and was taken back out, which is
// worth recording because putting it in is the obvious move. It decides how far a
// costume reaches past the bare figure, and the figure is inside every must-see
// box — so a wider hat brim really does make 186 boxes wrong. But a HASH can only
// say that something changed, and the honest response to that message is a
// multi-hour re-measure. `check:wardrobe` answers the actual question offline and
// in milliseconds — it re-derives each lesson's reach from the current geometry
// and compares it with the reach the stored boxes were grown by, so it names the
// lessons, says by how much, and tells you to run `make:wardrobe`. A check that
// says WHAT is wrong beats a hash that says something is.
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

/**
 * THE SCRIPT'S PROSE CANNOT MOVE A BOX, AND HASHING IT COSTS HOURS.
 *
 * This is `layoutOf` one file over, for the same reason and with the same
 * evidence. A must-box records what a beat has ON STAGE: `mustprobe` scopes to
 * `#stage-clip`, and every word a script carries — `text`, `cite`, the graded
 * `prompt` and `explain`, a control's `reads`, the quote plate — is drawn by
 * `CinematicPlayer` in the LOWER DECK, outside that element. Checked rather than
 * assumed: no `*Scene.tsx` reads prose off a beat. The one that looked like it
 * did (`ethics10Scene`'s `f.text`) reads an array declared in the scene itself,
 * and the scene is hashed whole regardless.
 *
 * So a rewritten sentence made all 186 lessons stale and demanded a browser
 * sweep that could not change a single number — exactly the failure this file
 * already refuses for `Target.tsx` and `cinematicKit.tsx`. A ratchet that goes
 * red for a change it cannot measure is a ratchet nobody runs, and the writing
 * pass is the change that would have proved it.
 *
 * WHAT STAYS IN THE HASH is everything that CAN move a box: every key, every
 * channel value, and — because boxes are stored per beat index — the beat count
 * and ordering. Only the characters between the quotes of a prose key go.
 *
 * THE LENGTH GOES TOO, and the counter-test is why. Keeping it looked prudent —
 * "so a split beat still reads as a change" — and a rewritten sentence is almost
 * never the same length as the one before it, so the guard defeated the whole
 * point while the four other cases passed and made it look right. It was never
 * needed: splitting a beat adds a `{ … }` to the array, which changes the
 * structure on its own. Anything not on this list keeps invalidating, which is
 * the conservative direction.
 */
const PROSE_KEYS = ['text', 'cite', 'explain', 'prompt', 'reads', 'author', 'work', 'era', 'label'];

function proselessScript(file) {
  const src = fs.readFileSync(file, 'utf8');
  const re = new RegExp(
    `\\b(${PROSE_KEYS.join('|')})(\\s*:\\s*)(['"\`])((?:\\\\.|(?!\\3)[^\\\\])*)\\3`,
    'g',
  );
  return src.replace(re, (_m, key, sep, q, body) => `${key}${sep}${q}${q}`);
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

/**
 * The bytes each stamped file contributes: the layout block of a shared component,
 * the structure-only reading of a script, the whole of a scene.
 */
function bytesOf(dir, file) {
  if (SHARED.some((f) => file === path.join(dir, f))) return Buffer.from(layoutOf(file));
  if (file.endsWith('Script.ts')) return Buffer.from(proselessScript(file));
  return fs.readFileSync(file);
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
