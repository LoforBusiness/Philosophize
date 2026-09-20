// THE FIRST SCREEN'S TIMELINE, READ OUT OF THE SCREEN ITSELF.
//
// `components/welcome/rig.ts` owns when the host arrives, when he starts talking
// and when the end card resolves. Three tools need those numbers —
// `check-thinkers` re-derives the speaking schedule, `check-intro` measures the
// lines as they land, and `sheet-intro` labels its frames with them — and the one
// thing none of them may do is restate a constant.
//
// §19 records what that costs in this exact file: `SETTLE_MS` and the launch
// screen's outro were "a pair in two files" and the first draft warmed a tab 140ms
// before the last frame of the dissolve, which would have looked wrong in neither
// file. A frame label is the same shape of mistake, one step quieter — a strip
// labelled from a restated SPEAK_T0 mislabels every frame in it and reads as a
// screen that has lost its timeline.
//
// rig.ts imports only ./ease, and ease.ts only `@/constants/design` (itself
// zero-import, and the reason the intro's palette is no longer a set of literals
// — see the header there). So the whole chain transforms and evaluates in plain
// Node with no React and no Reanimated. Same approach `check-thinkers` already
// takes to the same file.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const REPO = process.cwd();
const req = createRequire(import.meta.url);
const { transform } = req('sucrase');

const asModule = (rel) => transform(readFileSync(path.join(REPO, rel), 'utf8'), {
  transforms: ['typescript', 'imports'],
}).code;

// `ease` first, then `rig` against it. A tiny CommonJS shim rather than a real
// loader: two files, both pure, and a loader would be more machinery than the
// thing it loads.
const load = (code, deps = {}) => {
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', 'require', code)(
    module, module.exports, (id) => {
      const k = id.replace(/^\.\//, '');
      if (deps[k]) return deps[k];
      throw new Error(`introtime: "${id}" is imported by the intro now — teach this loader about it`);
    },
  );
  return module.exports;
};

const design = load(asModule('constants/design.ts'));
const ease = load(asModule('components/welcome/ease.ts'), { '@/constants/design': design });
const rig = load(asModule('components/welcome/rig.ts'), { ease });

export const {
  SPEAK_T0, T_MARCH, T_STOP, T_TURN, T_FADE, T_EXIT, T_GONE, T_BEGIN, T_HOLD, BEATS,
} = rig;

/** Everything rig.ts exports, for a caller that wants something not named above. */
export const introRig = rig;
