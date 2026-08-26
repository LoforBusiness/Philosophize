// WHAT A MEASUREMENT WAS TAKEN FROM — one definition, two readers.
//
// `measure-must` writes a stamp beside every lesson's must-see box and
// `validate-cinematic` re-derives it to say whether the box still describes the
// picture. They used to compute it separately, from the same two files, which
// worked right up until the thing that changed was neither of those files.
//
// It hashes THREE things:
//
//   · the scene, because a moved prop moves the box;
//   · the script, because a changed beat changes what is on stage;
//   · the PROBE that did the measuring, because a collector that records less
//     than it used to leaves every stamp matching and every list wrong. That is
//     not hypothetical — an older probe recorded about one word a beat, the tour
//     generator drops a station only when it can see a word being sliced, and so
//     it pushed to 1.68x over labels it had no record of. Forty-nine cut words
//     across twenty-four lessons, and nothing red anywhere.
//
// Rot in a scene announces itself; rot in the apparatus does not. So the
// apparatus is in the hash, and changing it makes every lesson stale at once.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Files that decide what a lesson draws, in a stable order. */
export function stampFiles(dir, comp) {
  const base = comp.replace(/Lesson$/, '');
  const lower = `${base[0].toLowerCase()}${base.slice(1)}`;
  return [`${lower}Scene.tsx`, `${lower}Script.ts`, `${comp}.tsx`]
    .map((f) => path.join(dir, f))
    .filter((p) => fs.existsSync(p))
    .sort();
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
  for (const p of files) h.update(fs.readFileSync(p));
  h.update(crypto.createHash('sha1').update(String(probe)).digest('hex').slice(0, 8));
  return h.digest('hex').slice(0, 12);
}
