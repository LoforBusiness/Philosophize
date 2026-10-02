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
// OVERRIDABLE, so a counter-test never edits the working tree. `countertest-idle`
// copies the four files elsewhere, stages a defect in the copy and points `RIG_SRC`
// at it — the pattern `countertest-firstrun` already uses, and the reason is not
// tidiness: another session is usually working in this repo, and a
// mutate-then-revert counter-test is a window in which their build takes the defect.
const SRC = process.env.RIG_SRC || 'components/lesson/cinematic';

/** One temp dir per SOURCE, so a staged copy cannot be served to the real check. */
const TMP_NAME = process.env.RIG_SRC
  ? `philosophize-rig-${path.basename(process.env.RIG_SRC)}` : 'philosophize-rig';

let loaded = null;

/** `{ RIG, MOVES }`, transpiled once per process. */
export async function loadRig() {
  if (loaded) return loaded;
  const { transform } = await import(
    pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
  );
  const tmp = path.join(os.tmpdir(), TMP_NAME);
  fs.mkdirSync(tmp, { recursive: true });
  const emit = (rel, name) => {
    const from = path.isAbsolute(rel) ? rel : path.join(REPO, rel);
    const js = transform(fs.readFileSync(from, 'utf8'), { transforms: ['typescript'] }).code
      // A data: URL has no base path, so a relative import has nowhere to resolve;
      // one temp directory plus a rewritten specifier gives it somewhere, and keeps
      // generated .mjs out of components/ where Metro would find it.
      .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
    fs.writeFileSync(path.join(tmp, name), js);
    return pathToFileURL(path.join(tmp, name)).href;
  };
  const RIG = await import(emit(`${SRC}/rig.ts`, 'rig.mjs'));
  const MOVES = await import(emit(`${SRC}/moves.ts`, 'moves.mjs'));
  // And `interact.ts` — the figure's relationship to what is outside it — imports
  // only those two as well, so the whole pose vocabulary of the app is loadable
  // here. `check:idle` sweeps it for AL1, because a clock-driven `bob` in a
  // carry or a haul would be the same wobble arriving through a different door.
  const INTERACT = await import(emit(`${SRC}/interact.ts`, 'interact.mjs'));
  loaded = { RIG, MOVES, INTERACT };
  return loaded;
}

// (`skullRise` and `loadHats` — where the lead's head and his hat were, for hanging a
// thought bubble off them — lived here until the bubble went with the narrated library
// on 2026-10-02.)
