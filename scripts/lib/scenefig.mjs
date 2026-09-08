// ─────────────────────────────────────────────────────────────────────────────
// WHICH FIGURE ON STAGE IS THE MASCOT, AND WHERE HIS HEAD IS.
//
// `mustBoxes` records one box per `<Stickman>` and nothing about who is who, and
// a beat can draw a lot of them — `ethics-ethics-6` draws twenty-five. Two things
// follow, and both were wrong for the life of the thought bubble:
//
//   · THE UNION IS NOT HIM. Taking the top of all the boxes anchored his bubble
//     on the tallest person in the scene: 148 units above his own head on that
//     lesson. Mount order cannot break the tie either — that is PAINT order, and
//     check:nod already records a two-figure scene mounting its lead LAST.
//   · A BOX TOP IS NOT A SKULL. The box is the union of his LIMBS, so a beat
//     where he lifts a hand, points, or wears a hat reports a top a median of
//     fourteen units above his head and as much as ninety.
//
// What settles the first is the track the RUNTIME uses: every scene passes
// `walk={X}` where `X = BEATS.map(b => b.x ?? …)`, and `CinematicPlayer` derives
// the live figure x from that same array. What settles the second is the rig,
// which poses him in plain Node.
//
// It is one file because `make:thoughts` places against these answers and
// `check:thoughts` re-derives them — loadTs's own header records what three
// copies of a rule cost the camera.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { loadTs } from './loadts.mjs';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..', '..');
const DIR = 'components/lesson/cinematic';
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

const route = fs.readFileSync(path.join(REPO, ROUTE), 'utf8');
const COMP = new Map([...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));

/** The scene source for a lesson id, or null. */
export function sceneOf(id) {
  const c = COMP.get(id);
  if (!c) return null;
  const base = `${c[0].toLowerCase()}${c.slice(1).replace(/Lesson$/, '')}Scene.tsx`;
  for (const f of [base, `${c}.tsx`]) {
    const p = path.join(REPO, DIR, f);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return null;
}

/** A scene-level `const NAME = 1.06;`, so a named constant resolves to its value. */
function constIn(src, token) {
  if (/^-?[\d.]+$/.test(token)) return Number(token);
  const d = src.match(new RegExp(`const ${token} = (-?[\\d.]+)`));
  return d ? Number(d[1]) : null;
}

const X_LINE = /const X = BEATS\.map\(\([^)]*\) => \w+\.x \?\? ([A-Za-z_$][\w$]*|-?[\d.]+)\)/;

/**
 * Per beat, the x the PLAYER walks him to — the scene's own `X` array, rebuilt.
 *
 * Null where nothing names him: the two lessons that predate the shared player
 * have no `const X` line at all, and a caller that cannot identify him must fall
 * back to the union rather than guess, because a wrong figure is worse than a
 * wide one.
 */
export async function walkOf(id) {
  const s = sceneOf(id);
  if (!s) return null;
  const m = s.match(X_LINE);
  if (!m) return null;
  const def = constIn(s, m[1]);
  if (def === null) return null;
  const c = COMP.get(id);
  const script = path.join(REPO, DIR, `${c[0].toLowerCase()}${c.slice(1).replace(/(Scene|Lesson)$/, '')}Script.ts`);
  if (!fs.existsSync(script)) return null;
  try {
    const { BEATS } = await loadTs(script);
    return BEATS.map((b) => b.x ?? def);
  } catch { return null; }
}

/** What the scene draws the lead at — `K_FIG`, which is 1, in all but a handful. */
export function scaleOf(id) {
  const s = sceneOf(id);
  if (!s) return 1;
  const m = s.match(/<Stickman[^/>]*\bk=\{([A-Za-z_$][\w$]*)\}/);
  if (!m || m[1] === 'K_FIG') return 1;
  return constIn(s, m[1]) ?? 1;
}

/**
 * HOW FAR ABOVE THE TOP OF HIS BOX A BUBBLE MAY NOT BE PUSHED.
 *
 * A skull estimate is the rig's answer scaled by what the scene draws him at, and
 * the two can disagree — a figure the scene transforms, a box the probe grew for a
 * costume. Both directions are bounded rather than trusted: never higher than the
 * box (he is inside it), and never more than this far down into it, so a bad
 * estimate can put a bubble over his own raised arm but never onto his face.
 */
export const LIFT_CAP = 46;

/**
 * The stage y a bubble hangs from on this beat: the top of his head, plus his hat.
 *
 * `figs` are the beat's figure boxes, `mx` the x from `walkOf` (or null), `rise`
 * how far his skull stands above the ground for the pose he holds — `skullRise`
 * from ./loadrig, already multiplied by the scene's scale — and `hat` what the
 * costume adds on top (make:wardrobe records it per lesson).
 *
 * Null when there are no figures at all.
 */
export function crownOf(figs, mx, rise, hat) {
  if (!figs.length) return null;
  const known = typeof mx === 'number';
  const his = known ? figs.filter((f) => mx >= f.b[0] - 8 && mx <= f.b[0] + f.b[2] + 8) : [];
  // The TOPMOST of the boxes his x falls in: where he stands in front of something
  // the probe also called a figure, the highest crown is the one to clear.
  //
  // AND THE NEAREST WHEN HIS x FALLS IN NONE OF THEM, which is not an edge case —
  // it is every beat where he walks far enough that the probe caught him somewhere
  // other than where the beat leaves him, and those are the beats this matters on.
  // Refusing to answer there sent them all down the union branch, which is how a
  // thought ended up 154 units to his side with the check declining to look.
  // Whichever box is nearest, its FEET are on the same ground as his, so the skull
  // it yields is right even if the figure is not.
  const own = figs.length === 1 ? figs[0]
    : his.length ? his.reduce((a, b) => (a.b[1] < b.b[1] ? a : b))
      : known ? figs.reduce((a, b) => (Math.abs(a.b[0] + a.b[2] / 2 - mx) < Math.abs(b.b[0] + b.b[2] / 2 - mx) ? a : b))
        : null;
  if (!own) {
    const fx0 = Math.min(...figs.map((f) => f.b[0]));
    const fx1 = Math.max(...figs.map((f) => f.b[0] + f.b[2]));
    return { crown: Math.min(...figs.map((f) => f.b[1])), cx: (fx0 + fx1) / 2, sure: false };
  }
  const feet = own.b[1] + own.b[3];
  const skull = feet - rise;
  return {
    crown: Math.max(own.b[1], Math.min(skull - hat, own.b[1] + LIFT_CAP)),
    // WHERE THE BEAT LEAVES HIM, NOT WHERE THE PROBE CAUGHT HIM.
    //
    // A must-box is measured at ONE moment of a beat and the figure moves during
    // it, so on a walking beat the recorded centre is wherever he happened to be
    // when the camera settled: measured across the corpus, 113 of 317 walking
    // beats record him 40 or more units from the x the script walks him to, and
    // one is 151 units out. Anchor there and the bubble comes to REST that far to
    // his side — `logic-arguments-21` beat 6 parked a thought 154 units left of
    // him — because the player restores exactly the offset this recorded.
    //
    // His end x is what the reader looks at: it is where he stands for the rest of
    // the beat, and it is the value the player itself settles on. On a beat he
    // does not walk the two agree to within 13 units either way (median 4.5), so
    // this is one rule rather than two.
    cx: typeof mx === 'number' ? mx : own.b[0] + own.b[2] / 2,
    sure: true,
  };
}
