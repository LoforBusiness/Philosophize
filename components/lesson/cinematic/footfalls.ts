import { WALK, gaitVary, moveTr, type Gait } from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// WHEN THE FEET HIT THE GROUND.
//
// A footstep sound that is merely "about right" is worse than no footstep at all:
// the eye sees the foot land and the ear hears the thud a beat later, and the
// figure stops looking like it is walking and starts looking like it is being
// dubbed. So none of this is timed by feel. It is solved from `rig.ts` — the same
// file that positions the foot — and the two cannot disagree because they are the
// same three constants.
//
// ── THE DERIVATION ───────────────────────────────────────────────────────────
//
// `rig.walk(dist, g)` puts the right foot at `footTarget(ph)` and the left at
// `footTarget(ph + π)`, where
//
//     ph = phaseFor(dist, g) = 2π · dist · g.stance / g.S
//
// and `footTarget(u < g.stance)` is the PLANTED arc (y = 0). A foot therefore
// touches down at the instant its own phase wraps to zero: the right foot at
// ph ≡ 0, the left at ph ≡ π. Both together: a plant every π of phase, which is
// every
//
//     S / (2 · stance)      stage units travelled
//
// — a DISTANCE, not an interval, which is the whole reason this works. The gait is
// distance-driven precisely so the feet cannot skate, and that same property means
// a footfall is a fixed number of units apart no matter how the figure accelerates.
//
// Then the scene's own easing converts distance back into time. Every scene walks
// the figure with
//
//     tr = ease01(bt / moveTr(x0, x1, 0.85))       and       traveled = span · tr
//
// so a plant at distance `d` happens when `ease01(bt/dur) = d/span`. Smoothstep
// inverts in closed form —
//
//     ease01(c) = c²(3 − 2c)   ⇒   c = ½ − sin(asin(1 − 2u) / 3)
//
// — and the time is `unEase(d/span) · dur`. The figure accelerates out of a
// standstill and decelerates into its mark, so the steps genuinely bunch and
// spread: the first and last of a long walk are the slowest, which is what
// walking does.
//
// (Inverting it TWICE was right until the rig was fixed. `strideStance` used to
// ease `tr` a second time, so the feet ran on `ease01(ease01(u))` while the body
// ran on `ease01(u)` — which is exactly why a planted foot slid. Both are on one
// curve now. If footfalls ever start arriving early again, that is the first
// place to look.)
//
// This is exactly the kind of claim that should not be taken on trust, which is
// why scripts/validate-sound.mjs does not check the formula — it samples the
// actual pose `travelStance` returns and finds the frames where a foot is on the
// ground, then asks whether these times are among them.
//
// ── WHY THIS RETURNS NUMBERS AND SCHEDULES NOTHING ───────────────────────────
//
// The caller feeds these seconds to a worklet that compares them against the same
// `bt` clock the animation runs on. NOT to setTimeout: `bt` accumulates frame
// deltas, so on a device that drops frames it falls behind the wall clock and the
// figure walks slower — and wall-clock footsteps would march on ahead of the feet,
// which is exactly the dubbing failure this file exists to prevent.
//
// Passing an ARRAY OF NUMBERS across is also the rule from §17: a plain JS closure
// cannot cross into a worklet, and this way none has to.
//
// Being pure and import-free-of-React is what lets `npm run check:sound` load it
// in plain Node and check every one of these times against a brute-force sampling
// of the actual pose — see scripts/validate-sound.mjs.
// ─────────────────────────────────────────────────────────────────────────────

/** Inverse of `ease01`'s smoothstep, for u ∈ [0,1]. */
function unEase(u: number): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 0.5 - Math.sin(Math.asin(1 - 2 * u) / 3);
}

/**
 * WHERE THE STRIDE STOPS AND THE ARRIVAL BEGINS.
 *
 * `strideStance` spends the last 22% of every transition blending the walking pose
 * into the beat's settled gesture — `arrive = clamp01((tr − 0.78) / 0.22)` — and
 * inside that stretch the blend, not the gait, decides where the feet are. The
 * split is not a matter of taste; it was measured. Sampling every drawn touchdown
 * across 200 positions of the free-running idle clock:
 *
 *   plants with arrive == 0   drawn in 200/200 clocks, within 1ms, every time
 *   plants with arrive  > 0   drawn in 185–193/200, off by up to 383ms
 *
 * Because the settled gesture is alive — it drifts with the app's global clock —
 * the same walk played at a different moment lands its last foot somewhere else.
 * Nothing scheduled ahead of time can be right about that.
 *
 * So a plant before the blend is a STRIDE and gets a footfall. The first plant
 * inside the blend is the ARRIVAL and gets the soft settle instead: a weight shift
 * has no sharp transient, so its few frames of slack cannot be seen. Any further
 * plants inside the blend are dropped — the figure has stopped walking.
 */
const ARRIVE_FROM = 0.78;   // must match `(tr - 0.78) / 0.22` in rig.strideStance

export interface Footfalls {
  /** Seconds into the beat at which a striding foot lands. */
  steps: number[];
  /**
   * Seconds at which the walk comes to rest. −1 only when there is no walk.
   *
   * EVERY walk gets one. A figure that travels always stops travelling, and the
   * blend always puts a foot down doing it — whether the gait had another stride
   * left in it or the walk simply ran out mid-swing. Leaving the short walks
   * silent at the end made them stop dead.
   */
  settle: number;
}

/**
 * When the feet land during the walk from `x0` to `x1`.
 *
 * No footfalls when the figure is not walking: `travelStance` only strides when
 * the move exceeds one stage unit, and below that it crossfades between gestures
 * on the spot.
 *
 * `seed` must match the one the scene passes to `travelStance`, since a second
 * walker is deliberately given a different gait AND a different phase offset so
 * two figures on the same journey do not march in lockstep.
 */
export function footfallTimes(
  x0: number, x1: number, seed = 0, dur = moveTr(x0, x1, 0.85), gait: Gait = WALK,
): Footfalls {
  const none: Footfalls = { steps: [], settle: -1 };
  const span = Math.abs(x1 - x0);
  if (span <= 1) return none;

  // Exactly the gait the scene will draw with — same expression, same file.
  const g = gaitVary(gait, x0 * 0.37 + x1 * 0.11 + seed * 3.7);
  const halfStride = g.S / (2 * g.stance);
  if (!(halfStride > 0)) return none;

  const offset = seed * 11;   // `strideStance` adds this to the distance travelled

  const steps: number[] = [];
  let settle = -1;
  // m = 0 is the pose the figure is ALREADY holding when the beat opens — the foot
  // is on the ground before the first frame, so there is nothing to hear.
  for (let m = 1; ; m++) {
    const d = m * halfStride - offset;
    if (d > span) break;
    if (d <= 0) continue;      // a seeded walk can start mid-stride
    // `tr` IS the fraction of the journey covered — `traveled = span · tr` — so the
    // arrival threshold is tested against d/span, NOT against the time. They are
    // different numbers and confusing them is easy: the time is unEase(tr), which
    // for a plant at tr 0.837 is 0.744, so testing the time let a plant sitting
    // inside the blend pass as a stride on exactly one of the five walks.
    const trAt = d / span;
    const at = unEase(trAt) * dur;
    if (trAt > ARRIVE_FROM) { settle = at; break; }
    steps.push(at);
    if (m > 400) break;        // a walk that long is a bug, not a journey
  }
  // Where the walk ends when the gait had no stride left inside the blend: the
  // figure simply runs out mid-swing and the blend lowers that foot as it stops.
  // The end of the transition is a few tens of milliseconds after the foot touches,
  // which is the forgiving direction for a sound with no transient in it.
  if (settle < 0) settle = dur;
  return { steps, settle };
}

/**
 * Every beat's footfalls, worked out once at module scope from a scene's x track.
 *
 * Index i holds the times for the walk INTO beat i, so a player holding the beat
 * index can look them up directly. Beat 0 is always empty — the figure is placed
 * there, it does not walk on.
 */
export function footfallTrack(xs: number[], seed = 0): { steps: number[][]; settle: number[] } {
  const all = xs.map((x, i) => (i === 0 ? { steps: [], settle: -1 } : footfallTimes(xs[i - 1], x, seed)));
  return { steps: all.map((f) => f.steps), settle: all.map((f) => f.settle) };
}

/** Exposed so the validator can invert the same curve the times were built on. */
export const easeInverse = unEase;
