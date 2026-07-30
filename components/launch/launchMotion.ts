import {
  clamp01, walk, sipStance, swingStance, kiteStance, picnicStance, readStance,
  WALK, type Stance,
} from '@/components/lesson/cinematic/rig';

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

export type LaunchActivity = 'walk' | 'kite' | 'swing' | 'sip' | 'picnic' | 'read';

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

/** Signed swing phase, -1..1. The scene rotates by it AND the body leans into it. */
export function swingPhaseAt(t: number): number {
  'worklet';
  return Math.sin(t * 1.35);
}

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

/** The pose for one activity at time `t`. */
export function launchStance(activity: LaunchActivity, t: number): Stance {
  'worklet';
  if (activity === 'kite') {
    // Irregular tugs — a kite pulls when the wind decides to, not on a beat.
    // Sum of two incommensurate sines: continuous forever, never repeating.
    const g = Math.sin(t * 1.7) * 0.5 + Math.sin(t * 1.06 + 0.9) * 0.5;
    return kiteStance(t, clamp01(g * 0.9 + 0.25));
  }
  if (activity === 'swing') return swingStance(t, swingPhaseAt(t));
  // sipStance / picnicStance / readStance each ease their action out to nothing
  // by u = 1, so a linear 0→1 ramp inside the window is enough to close the loop.
  if (activity === 'sip') return sipStance(t, cycle(t, 7.4, 1.5, 4.7));
  if (activity === 'picnic') return picnicStance(t, cycle(t, 6.8, 1.2, 5.2));
  if (activity === 'read') return readStance(t, cycle(t, 5.6, 3.9, 4.7));
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
