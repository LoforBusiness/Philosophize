import {
  walk, sipStance, seated, ease01, lerp,
  WALK, type Stance,
} from '@/components/lesson/cinematic/rig';
import { postureLive, actStance } from '@/components/lesson/cinematic/moves';
import type { Crest } from './launchArt';

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

// ─────────────────────────────────────────────────────────────────────────────
// THE TWO THAT DID NOT READ, AND THE ONE RULE THEY BOTH BROKE.
//
// A reader, about the launch screen: *"the one where the stickman is laying
// down, supposedly reading a book. And then the other one … where it\'s sitting
// down and its arm is, like, crossed into his head. These two really do not look
// good. It\'s kinda difficult to understand what\'s going on."* And, about the
// two that work: *"the one that the stickman is slowly walking or the one where
// it\'s sitting down and has a cup of coffee."*
//
// THE FIGURE IS ABOUT SEVENTY PIXELS TALL HERE — eight per cent of the panel. At
// that size nothing survives but the SILHOUETTE, and `seated()` in the lesson rig
// already writes the rule down: *"a fist near the body buries the whole forearm
// inside the torso silhouette at this stroke weight and the figure loses an
// arm."* `sipStance` obeys it — *"held OUT in front of the chin, not against it"*
// — which is exactly why the coffee one reads and the other two did not.
//
//   · READ folded the legs flat along the ground and leaned the torso over them,
//     so leg, torso and both arms merged into one horizontal mass. That is why
//     a SEATED pose was being described as lying down.
//   · THINKER put the fist under the jaw, which at this scale welds the forearm
//     to the head disc and leaves a lozenge with a bump on it.
//
// AND NEITHER OF THEM MOVED. Sampled across a whole cycle, seven of read\'s eight
// frames were the same pose (its page-turn window was 0.8s of a 5.6s period) and
// the thinker was damped on purpose — "the thinker barely moves; that is the
// point", which is true of a sculpture and wrong for the only moving thing on a
// loading screen.
//
// Both are rebuilt on `seated()`, the primitive the coffee scene already uses,
// with the working limb kept clear of the torso and a motion big enough to see.
// ─────────────────────────────────────────────────────────────────────────────

/** Seat height and foot reach shared by both, so the two scenes sit alike. */
const SEAT_H = 12;

/**
 * READING — sitting up, book held out at arm\'s length, turning a page.
 *
 * The knees come UP (a short foot reach) so the leg is a visible bent shape
 * rather than a bar along the floor, and the book rides on the wrists out in
 * front of the chest where there is open paper behind it.
 *
 * The page turn is a there-and-back inside its window, so the value at the end
 * of a cycle is the value at the start of the next and the wrap cannot be seen.
 */
export function readingStance(t: number): Stance {
  'worklet';
  const base = seated(SEAT_H, t, 15);
  const turn = cycle(t, ACTIVITY_PERIOD.read, 0.8, 4.4);
  // sin(pi*x) is 0 at both ends and 1 in the middle: the loop closes by
  // construction rather than by anyone remembering to bring the hand back.
  const e = turn <= 0 ? 0 : Math.sin(Math.PI * ease01(turn));
  return {
    ...base,
    // A reader looks DOWN at a book. Leaning the whole torso over it is what
    // flattened the old pose; the chin does the work instead.
    tilt: base.tilt + 0.05,
    neck: 0.30 - 0.05 * e,
    // Both wrists forward and level — the book is drawn BETWEEN them and takes
    // its angle from the line they make, so this is what decides whether it
    // reads as an open book or a smudge on his lap.
    // Kept LOW enough that the book never crowds the head disc: the book is
    // drawn 0.8 of its height above the wrist line, so a wrist at −31 puts its
    // top edge within a few units of the chin.
    fistL: { x: lerp(21, 25, e), y: lerp(-17, -26, e) },
    fistR: { x: 30, y: -14 },
  };
}

/**
 * PONDERING — sitting, one hand raised in front of the face, turning something
 * over; then the hand opens outward as the thought lands, and comes back.
 *
 * THE HAND STAYS IN FRONT OF THE HEAD, NEVER UNDER IT. Chin-in-hand is the
 * canonical thinker and it is unreadable at this size: the forearm runs up the
 * jaw and the two shapes weld. Held forward of the face the forearm crosses open
 * paper, so the arm is a line you can actually see — and the gesture still says
 * the same thing.
 */
export function ponderStance(t: number): Stance {
  'worklet';
  const base = seated(SEAT_H, t, 16);
  const p = cycle(t, ACTIVITY_PERIOD.thinker, 1.0, 7.6);
  // Up, hold, out, back: a tent through the window with a dwell in the middle,
  // so it is a considered gesture rather than a twitch.
  const u = p <= 0 ? 0 : p < 0.3 ? ease01(p / 0.3) : p < 0.62 ? 1 : 1 - ease01((p - 0.62) / 0.38);
  // …and a second, later swing where the hand opens away from him.
  const o = p <= 0.55 ? 0 : p < 0.78 ? ease01((p - 0.55) / 0.23) : 1 - ease01((p - 0.78) / 0.22);
  return {
    ...base,
    // ── THE REST POSE IS WHAT IS ON SCREEN MOST OF THE TIME ─────────────────
    //
    // This one has no white prop. The book and the cup do half the legibility
    // work in the other two seated scenes — a light rectangle against an ink
    // body is the clearest mark on the figure — and walking reads because both
    // legs move. So the first instinct was to make the SEAT more distinctive:
    // one knee drawn up, the other leg out, the far arm propped behind the hip.
    //
    // Rendered, that was worse. A propping arm behind the hip and two splayed
    // legs widen the base into a low mound, and the base is what a reader is
    // looking at for most of the cycle — the gesture only occupies the middle of
    // it. `seated()`'s own legs and resting hands are already tuned against
    // exactly this ("hands DOWN on the knees, NOT tucked at the hip … at ~92%
    // extension"), which is why the coffee scene reads at rest as well as in
    // motion. So the base is left alone and ONLY the working arm moves, which is
    // all `sipStance` changes either.
    tilt: base.tilt + 0.05 * u,
    // The head lifts as the thought does. It is the largest shape on the figure,
    // so moving it is worth more than moving anything else.
    neck: base.neck - 0.20 * u + 0.08 * o,
    fistL: base.fistL,
    // Forward of the face, never under it — and far enough forward that the
    // forearm is a long diagonal across open paper. At x 15 it was a stub.
    fistR: {
      x: lerp(base.fistR.x, lerp(21, 38, o), u),
      y: lerp(base.fistR.y, lerp(-40, -26, o), u),
    },
  };
}

/** The pose for one activity at time `t`. */
export function launchStance(activity: LaunchActivity, t: number): Stance {
  'worklet';
  // sipStance eases its action out to nothing by u = 1, so a linear 0→1 ramp
  // inside the window is enough to close the loop.
  if (activity === 'sip') return sipStance(t, cycle(t, ACTIVITY_PERIOD.sip, 1.5, 4.7));
  if (activity === 'read') return readingStance(t);
  if (activity === 'thinker') return ponderStance(t);

  // STARGAZER — reclined, weight back on one propping arm, head to the sky.
  //
  // AND THE FREE HAND HAS TO DO SOMETHING, which the new range-of-motion check
  // in check-launch found the moment it existed: sampled across a whole cycle,
  // not one of this pose's four tracked points moved by a single unit. All its
  // life was in `postureLive`'s settle — the body breathing — so it passed every
  // smoothness assertion in the file while being, in the terms that matter, a
  // photograph. It is the same fault the reader reported in the reading and the
  // thinking scenes; nobody had happened to be shown this one.
  //
  // The smallest honest fix rather than a redesign: the free hand drifts up
  // toward the sky he is looking at and comes back. A there-and-back inside its
  // window, so the loop still closes on itself.
  if (activity === 'stargazer') {
    const base = postureLive(5, t, t % ACTIVITY_PERIOD.stargazer);
    const p = cycle(t, ACTIVITY_PERIOD.stargazer, 2.2, 8.4);
    const e = p <= 0 ? 0 : Math.sin(Math.PI * ease01(p));
    return { ...base, fistR: { x: base.fistR.x + 6 * e, y: base.fistR.y - 17 * e } };
  }

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
  crest: Crest | undefined,
  groundY: number
): { x: number; groundY: number } {
  'worklet';
  const width = span.to - span.from;
  const travelled = t * WALK_SPEED * k * dir + WALK_START;
  const x = span.from + (((travelled % width) + width) % width);
  return {
    x,
    groundY: crest ? crest.base - Math.sin((x - crest.off) / crest.per) * crest.amp : groundY,
  };
}
