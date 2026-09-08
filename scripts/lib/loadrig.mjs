// ─────────────────────────────────────────────────────────────────────────────
// THE FIGURE, IN PLAIN NODE.
//
// `rig.ts` has zero imports and `moves.ts` imports only `rig`, which is what lets
// the whole figure be posed and measured without Metro, a browser or a device.
// `loadTs` cannot do it — that shim evaluates one module with `new Function` and
// has nowhere to resolve `./rig` from — so the pair are transpiled into one temp
// directory with the specifier rewritten, exactly as check-moves has done since
// the first motion check.
//
// IT IS A SHARED FILE FOR THE REASON loadTs's OWN HEADER GIVES: three copies of a
// transpile step is how a checker ends up validating a slightly different rig from
// the one that ships. There were four before this.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..', '..');
const SRC = 'components/lesson/cinematic';

let loaded = null;

/** `{ RIG, MOVES }`, transpiled once per process. */
export async function loadRig() {
  if (loaded) return loaded;
  const { transform } = await import(
    pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
  );
  const tmp = path.join(os.tmpdir(), 'philosophize-rig');
  fs.mkdirSync(tmp, { recursive: true });
  const emit = (rel, name) => {
    const js = transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
      // A data: URL has no base path, so a relative import has nowhere to resolve;
      // one temp directory plus a rewritten specifier gives it somewhere, and keeps
      // generated .mjs out of components/ where Metro would find it.
      .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
    fs.writeFileSync(path.join(tmp, name), js);
    return pathToFileURL(path.join(tmp, name)).href;
  };
  const RIG = await import(emit(`${SRC}/rig.ts`, 'rig.mjs'));
  const MOVES = await import(emit(`${SRC}/moves.ts`, 'moves.mjs'));
  loaded = { RIG, MOVES };
  return loaded;
}

/**
 * THE TOP OF HIS SKULL FOR ONE POSE CODE, in rig units above the ground.
 *
 * `mustBoxes` records the union of a figure's limb Views, which is not his head:
 * measured across the corpus, a beat's box top sits a median FOURTEEN units above
 * his skull and as much as ninety, because a raised hand is in the union and a
 * pointing arm reaches higher than anything else he owns. Anything that wants to
 * sit "just above his head" and reads the box instead ends up above his fingers.
 *
 * Sampled across the loop, because acts 59–78 and 157–168 read the monotonic clock
 * and never stop moving: the answer has to clear his highest skull, not his first.
 */
export function skullRise(RIG, MOVES, code, ground = 500) {
  let top = Infinity;
  for (const t of [0, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2]) {
    const B = RIG.pose(MOVES.emoteAny(code ?? 0, t), 0, ground, 1, 1, 1);
    // `head` is a transform array — [{translateX}, {translateY}] — not a point.
    top = Math.min(top, B.head[1].translateY - RIG.STR.headR);
  }
  return ground - top;
}
