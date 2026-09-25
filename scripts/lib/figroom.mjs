// WHERE THE LEAD STANDS AND WHAT HE MAY SEE — shared by `make:wander` and
// `make:chair`, so the two generators cannot disagree about whether a beat has one
// figure, how much floor it has or what the camera shows. One rule, one reader
// (CLAUDE.md records three generators and validators that drifted apart).
import fs from 'node:fs';
import { sceneOf } from './scenefig.mjs';
import { windowOf } from './tourrule.mjs';
import { poseTrack } from './posetrack.mjs';
import { LESSONS } from './narration.mjs';
import { GROUND_Y } from './wanderrule.mjs';

const DIR = 'components/lesson/cinematic';

export const bandOf = (id) => {
  const s = sceneOf(id);
  const m = s && s.match(/band=\{\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]\}/);
  return m ? [+m[1], +m[2]] : [0, 560];
};

/**
 * WHICH SCENES A LEAD-FIGURE LAYER MAY DRIVE AT ALL.
 *
 * `lookPose` is a singleton seam — one module-level shared value read by whichever
 * scene is mounted — so it moves EVERY figure a scene poses through it. That is
 * right for the scenes with one figure and wrong for a scene that poses a crowd or
 * a pair: they would move in lockstep, which reads as one figure duplicated rather
 * than two people (`strideStance`'s own `seed` note).
 *
 * Detected from the source rather than assumed: more than one `<Stickman>`, a pose
 * call inside a `.map(`, or two pose tracks (`poseTrack` returns null) all mean
 * the lesson is left alone.
 */
export function soloFigure(id) {
  const src = sceneOf(id);
  if (!src) return false;
  const mounts = (src.match(/<Stickman\b/g) || []).length;
  if (mounts !== 1) return false;
  if (/\.map\([^)]*\)\s*=>[\s\S]{0,400}?\b(lookPose|reactPose)\(/.test(src)) return false;
  const stem = (LESSONS[id] || '').replace(/Script\.ts$/, '');
  return !!poseTrack(DIR, stem);
}

/**
 * The lead figure's box on a beat: `{ x, y, w, h, items }`, or null for a crowd.
 *
 * A BEAT RECORDS THE SAME FIGURE SEVERAL TIMES, and that cost a diagnosis: the
 * probe reads the stage more than once per beat and keeps each reading, so
 * `aesthetics-aesthetics-1` has three `fig` boxes within a unit of each other and
 * `ethics-ethics-6` has twenty-two — five citizens read four times over. Taking
 * "exactly one fig item" as "one figure" therefore found a single figure in 12
 * beats of 2,600.
 *
 * So they are clustered by overlap: one cluster is one person, and a beat with more
 * than one is left alone whatever the scene's source looked like.
 */
export function leadBox(items) {
  const figs = (items || []).filter((it) => it.k === 'fig' && !it.v);
  if (!figs.length) return null;
  const groups = [];
  for (const it of figs) {
    const [x, , w] = it.b;
    const g = groups.find((q) => x <= q.x1 + 4 && x + w >= q.x0 - 4);
    if (g) {
      g.x0 = Math.min(g.x0, x); g.x1 = Math.max(g.x1, x + w); g.items.push(it);
    } else groups.push({ x0: x, x1: x + w, items: [it] });
  }
  if (groups.length !== 1) return null;
  const g = groups[0];
  const y0 = Math.min(...g.items.map((it) => it.b[1]));
  const y1 = Math.max(...g.items.map((it) => it.b[1] + it.b[3]));
  return { x: g.x0, y: y0, w: g.x1 - g.x0, h: y1 - y0, items: g.items };
}

/**
 * Every frame the camera shows on beat `k` of a lesson — the tour's stations, or,
 * on a beat with no tour, the frame the camera is still holding from before (the
 * player keeps the shot it has, K-group). Empty for a scene with no camera.
 */
export function windowsFor(id, graded, TOURS, J) {
  const band = bandOf(id);
  const toured = (k) => !graded[k] && (TOURS[id]?.[k]?.length ?? 0) > 0;
  const mustWin = (k) => (J.boxes[id]?.[k] ? windowOf(J.boxes[id][k], band, GROUND_Y) : null);
  const leaves = (k) => {
    if (toured(k)) {
      const last = TOURS[id][k][TOURS[id][k].length - 1];
      return windowOf(last.length === 10 ? last.slice(6, 10) : last.slice(0, 4), band, GROUND_Y);
    }
    if (k === 0 || graded[k]) return mustWin(k);
    return leaves(k - 1);
  };
  return (k) => {
    if (!/\bcamera=\{/.test(sceneOf(id) ?? '')) return [];
    if (toured(k)) {
      return TOURS[id][k].flatMap((st) => [windowOf(st.slice(0, 4), band, GROUND_Y),
        ...(st.length === 10 ? [windowOf(st.slice(6, 10), band, GROUND_Y)] : [])]);
    }
    const w = k === 0 || graded[k] ? mustWin(k) : leaves(k - 1);
    return w ? [w] : [];
  };
}

export const sceneExists = (id) => {
  const stem = (LESSONS[id] || '').replace(/Script\.ts$/, '');
  return !!stem && fs.existsSync(`${DIR}/${stem}Scene.tsx`);
};
