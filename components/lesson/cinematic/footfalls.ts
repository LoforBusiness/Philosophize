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
// Then the scene's own easing converts distance back into time — and it is eased
// TWICE, which is the one thing here that cannot be guessed from either file
// alone. Every scene computes
//
//     tr = ease01(bt / moveTr(x0, x1, 0.85))
//
// and hands that to `travelStance`, which passes it to `strideStance`, which walks
//
//     traveled = span · ease01(tr)
//
// so the distance covered is `span · ease01(ease01(bt/dur))`. Smoothstep applied
// to smoothstep is a much flatter curve at both ends than either one: the figure
// creeps off the mark, crosses the middle quickly and creeps into the arrival.
// Inverting only once puts the early footfalls hundreds of milliseconds ahead of
// the feet. `ease01(c) = c²(3−2c)` inverts to `c = ½ − sin(asin(1−2u)/3)`, so the
// time is `unEase(unEase(d/span)) · dur`.
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
 * The seconds, measured from the start of the beat, at which a foot lands while
 * the figure walks from `x0` to `x1`.
 *
 * Empty when the figure is not walking. `travelStance` only strides when the move
 * exceeds one stage unit — below that it crossfades between gestures on the spot,
 * and a stationary figure has no footfalls to make.
 *
 * `seed` must match the one the scene passes to `travelStance`, since a second
 * walker is deliberately given a different gait AND a different phase offset so
 * two figures on the same journey do not march in lockstep.
 */
export function footfallTimes(
  x0: number, x1: number, seed = 0, dur = moveTr(x0, x1, 0.85), gait: Gait = WALK,
): number[] {
  const span = Math.abs(x1 - x0);
  if (span <= 1) return [];

  // Exactly the gait the scene will draw with — same expression, same file.
  const g = gaitVary(gait, x0 * 0.37 + x1 * 0.11 + seed * 3.7);
  const halfStride = g.S / (2 * g.stance);
  if (!(halfStride > 0)) return [];

  const offset = seed * 11;   // `strideStance` adds this to the distance travelled

  const out: number[] = [];
  // m = 0 is the pose the figure is ALREADY holding when the beat opens — the foot
  // is on the ground before the first frame, so there is nothing to hear.
  for (let m = 1; ; m++) {
    const d = m * halfStride - offset;
    if (d > span) break;
    if (d <= 0) continue;      // a seeded walk can start mid-stride
    // Twice, for the two smoothsteps between `bt` and the distance walked.
    out.push(unEase(unEase(d / span)) * dur);
    if (m > 400) break;        // a walk that long is a bug, not a journey
  }
  return out;
}

/**
 * Every beat's footfalls, worked out once at module scope from a scene's x track.
 *
 * Index i holds the times for the walk INTO beat i, so a player holding the beat
 * index can look them up directly. Beat 0 is always empty — the figure is placed
 * there, it does not walk on.
 */
export function footfallTrack(xs: number[], seed = 0): number[][] {
  return xs.map((x, i) => (i === 0 ? [] : footfallTimes(xs[i - 1], x, seed)));
}

/** Exposed so the validator can invert the same curve the times were built on. */
export const easeInverse = unEase;
