import {
  walk, sipStance, readStance,
  WALK, type Stance,
} from '@/components/lesson/cinematic/rig';
import { postureLive, actStance } from '@/components/lesson/cinematic/moves';

// ─────────────────────────────────────────────────────────────────────────────
// Everything the launch figure DOES, as pure maths, so it can be sampled outside
// the app. It used to live inline in LaunchFigure's worklet, where the only way
// to check it was to watch it — and watching is exactly how a loop that jumps
// once every 40 seconds gets missed.
//
// Two rules hold for every activity here:
//
//   1. THE LOOP MUST CLOSE. Whatever drives a pose has to arrive back at its
//      resting value before it wraps. Every envelope below is a there-and-back:
//      it reaches its peak in the middle of its window and is 0 again at the end,
//      so the modulo reset lands on a pose identical to the one it left.
//   2. NOTHING VISIBLE MAY TELEPORT. A position that wraps has to wrap off-stage.
//
// Both are enforced by the sampler, not by eye.
// ─────────────────────────────────────────────────────────────────────────────

export type LaunchActivity = 'walk' | 'sip' | 'read' | 'thinker' | 'stargazer' | 'lookout';

/** Rig units per second for the hill walk — an unhurried pace at this distance. */
export const WALK_SPEED = 22;

/**
 * Where the walker starts along its span, in span units.
 *
 * This is not cosmetic. The span deliberately begins off-stage so the wrap is
 * never seen, but that also meant the figure spent the first seconds of every
 * walk scene OUTSIDE the stage: at 0.6 scale it covers 13.2 units a second, and
 * the span starts 60 units to the left of the frame, so it took ~4.5s to appear.
 * A launch is often over in ~3.4s, so the walk scene showed an empty hillside.
 * Starting part-way along the span puts the figure on screen from frame one and
 * still leaves the wrap off-stage.
 */
export const WALK_START = 150;

/**
 * A there-and-back envelope over [a, b] of a `period`-second cycle: 0 at both
 * ends, 1 across the middle, smooth throughout. Outside the window it is 0, so
 * the value at the end of a cycle equals the value at the start of the next and
 * the wrap is invisible.
 */
export function cycle(t: number, period: number, a: number, b: number): number {
  'worklet';
  const p = t % period;
  if (p <= a || p >= b) return 0;
  return (p - a) / (b - a);
}

/**
 * How long one full cycle of each activity takes.
 *
 * Exported because the loop-closure check samples across exactly one period, and
 * a period the checker has to guess is a period that stops being checked the day
 * someone retunes it.
 */
export const ACTIVITY_PERIOD: Record<LaunchActivity, number> = {
  // gait is driven by distance, not by this period — it's just the window the
  // sampler measures one lap of the stride over.
  walk: 8.0,
  sip: 7.4,
  read: 5.6,
  thinker: 9.0,
  stargazer: 11.0,
  lookout: 8.2,
};

/** The pose for one activity at time `t`. */
export function launchStance(activity: LaunchActivity, t: number): Stance {
  'worklet';
  // sipStance / readStance each ease their action out to nothing by u = 1, so a
  // linear 0→1 ramp inside the window is enough to close the loop.
  if (activity === 'sip') return sipStance(t, cycle(t, ACTIVITY_PERIOD.sip, 1.5, 4.7));
  if (activity === 'read') return readStance(t, cycle(t, ACTIVITY_PERIOD.read, 3.9, 4.7));

  // THE THINKER — elbow on knee, chin in hand, perched on a rock at a cliff edge.
  // postureLive(9) already damps this one on purpose: "the thinker barely moves;
  // that is the point". `bt` is the beat clock, and folding it by the period is
  // what re-takes the settle each cycle rather than settling once forever.
  if (activity === 'thinker') return postureLive(9, t, t % ACTIVITY_PERIOD.thinker);

  // STARGAZER — reclined, weight back on one propping arm, head to the sky.
  if (activity === 'stargazer') return postureLive(5, t, t % ACTIVITY_PERIOD.stargazer);

  // THE LOOKOUT — hand up to shade the eyes, sweep the valley, lower.
  // actStance(18) does NOT ease itself back to neutral by u = 1 the way sipStance
  // / readStance do — its `up` term rises once (over u 0→0.22) and then HOLDS,
  // so the hand is still raised at u = 1. Feeding it cycle()'s raw 0→1 ramp
  // leaves the hand up right at the window edge: a real jump back to neutral the
  // instant the window closes. It looked closed on the sampler at first only
  // because that jump is bigger than any other step in the cycle, so it inflated
  // the sampler's own "ordinary step" baseline and buried itself in it — the
  // exact false pass the loop-closure check exists to catch.
  // Folding the ramp into a tent (rise for the window's first half, fall for its
  // second) makes actStance(18) itself carry the hand back down to u = 0 before
  // the window ends, which is what the check now measures as actually closing.
  if (activity === 'lookout') {
    const p = cycle(t, ACTIVITY_PERIOD.lookout, 1.4, 6.0);
    const u = p <= 0.5 ? p * 2 : (1 - p) * 2;
    return actStance(18, t, u);
  }

  // walk: the gait phase comes from DISTANCE, which only ever increases, so the
  // stride is continuous however long the screen is up.
  return walk(t * WALK_SPEED, WALK);
}

/**
 * Where the walker is, and how high the ground is under it.
 *
 * The position wraps; the gait does not. `dist` feeding `walk()` keeps climbing
 * while only x is folded back into the span — and the span's ends are off-stage,
 * so the fold is never seen.
 */
export function walkPlacement(
  t: number, k: number, dir: number,
  span: { from: number; to: number },
  wave: { base: number; amp: number; off: number; per: number } | undefined,
  groundY: number
): { x: number; groundY: number } {
  'worklet';
  const width = span.to - span.from;
  const travelled = t * WALK_SPEED * k * dir + WALK_START;
  const x = span.from + (((travelled % width) + width) % width);
  return {
    x,
    groundY: wave ? wave.base - Math.sin((x - wave.off) / wave.per) * wave.amp : groundY,
  };
}
