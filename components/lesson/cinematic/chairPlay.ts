import { makeMutable } from 'react-native-reanimated';
import { chairFrame, partLen, type ChairFrame } from './chairRoutine';

// ─────────────────────────────────────────────────────────────────────────────
// THE CHAIR ROUTINE'S PLAYHEAD — how a set piece that spans several taps is played.
//
// A stretch is laid out as ONE timeline: the setup, the seated parts and the
// putaway end to end, each beat owning one part. The player says which beat is on
// screen; this decides where on that timeline the figure is, and it never jumps:
//
//   · on its own beat the playhead runs at 1× until the part is done, then holds
//     (a seated part idles on the scene clock; a finished setup is a seated man);
//   · BEHIND its beat — the reader tapped on before the part finished — it runs
//     at HURRY until it catches up, so the move finishes rather than vanishing;
//   · AHEAD of its beat — the reader tapped back — it runs BACKWARDS at HURRY to
//     the end of that beat's part, so he sits back down, or unfolds the chair
//     again, rather than being teleported into the earlier picture.
//
// A beat before the stretch is the timeline's start and a beat after it is the
// end, so tapping out of a stretch early finishes the putaway, and tapping back
// into one from after it leaves him standing (its end state) with nothing to redo.
//
// HURRY IS 1.8, NOT 4. The owner asked for no fast movements in the same note that
// asked for the chair, and a routine sped up to get out of the way of a tap is the
// easiest place to put one back. At 1.8 the quickest move in the routine, the
// 0.45s flick, still takes a quarter of a second.
//
// A PLAYER-DRAWN LAYER, like the wander and the answer nod: `lookPose` reads this,
// so every solo lesson gets it with no scene edited (CLAUDE.md, "player-drawn
// reaches every scene").
// ─────────────────────────────────────────────────────────────────────────────

/** How fast the playhead catches up with, or backs off to, the beat on screen. */
export const HURRY = 1.8;
/** How long the figure takes to blend into the routine and back out of it. */
export const BLEND_S = 0.45;

/**
 * `plan` is the lesson's row from `data/lessonChair.ts`: `[beat, kind, crossedIn,
 * mugIn, beat, kind, …]` — one QUAD per part, in playing order. A beat may own more
 * than one part (a long line sets the chair up AND brings the mug out), and every
 * beat from the first part's to the last part's owns at least one. Empty for a
 * lesson with none.
 */
export const CHAIR = {
  plan: makeMutable<readonly number[]>([]),
  beat: makeMutable(-1),
  p: makeMutable(0),
  u: makeMutable(0),
  last: makeMutable(-1),
  lastBt: makeMutable(-1),
};

/** Put the playhead back where a lesson starts. */
export function chairReset(plan: readonly number[]) {
  CHAIR.plan.value = plan;
  CHAIR.beat.value = -1;
  CHAIR.p.value = 0;
  CHAIR.u.value = 0;
  CHAIR.last.value = -1;
  CHAIR.lastBt.value = -1;
}

/** How many parts a plan has. */
function partCount(plan: readonly number[]): number {
  'worklet';
  return Math.floor(plan.length / 4);
}

/** Where part `j` starts on the timeline (`j` = the part count gives its whole length). */
function partStart(plan: readonly number[], j: number): number {
  'worklet';
  let s = 0;
  for (let q = 0; q < j; q += 1) s += partLen(plan[1 + q * 4]);
  return s;
}

/** The frame the routine draws at playhead `p`. */
export function frameAt(plan: readonly number[], p: number, life: number): ChairFrame {
  'worklet';
  const n = partCount(plan);
  let s = 0;
  for (let j = 0; j < n; j += 1) {
    const L = partLen(plan[1 + j * 4]);
    // The last part owns its own end, so p == END draws the putaway's last frame.
    if (p < s + L || j === n - 1) {
      return chairFrame(plan[1 + j * 4], Math.max(0, Math.min(L, p - s)), plan[2 + j * 4], plan[3 + j * 4], life);
    }
    s += L;
  }
  return chairFrame(plan[1], 0, 0, 0, life);
}

/** The stretch of timeline beat `beat` owns: `[lo, hi, owned]`. */
function beatSpan(plan: readonly number[], beat: number): number[] {
  'worklet';
  const n = partCount(plan);
  const end = partStart(plan, n);
  if (beat < plan[0]) return [0, 0, 0];
  if (beat > plan[(n - 1) * 4]) return [end, end, 0];
  let s = 0;
  let lo = -1;
  let hi = 0;
  for (let j = 0; j < n; j += 1) {
    const L = partLen(plan[1 + j * 4]);
    if (plan[j * 4] === beat) {
      if (lo < 0) lo = s;
      hi = s + L;
    }
    s += L;
  }
  return lo < 0 ? [end, end, 0] : [lo, hi, 1];
}

/**
 * Advance the playhead one frame toward the beat on screen and return the routine's
 * weight `u` (0…1, eased) — 0 means the routine is not on screen at all.
 *
 * `now` is the scene clock and `bt` the beat clock. The 1× run is taken off `bt`,
 * which the player freezes while the camera travels (K1) and behind the lesson
 * guide, so he never sits down during a shot the reader is not being shown; the
 * hurry is taken off `now`, because a catch-up that waited for the camera would be
 * a figure frozen mid-move.
 */
export function chairStep(now: number, bt: number): number {
  'worklet';
  const plan = CHAIR.plan.value;
  if (plan.length < 4) return 0;
  const end = partStart(plan, partCount(plan));
  const span = beatSpan(plan, CHAIR.beat.value);
  const lo = span[0];
  const hi = span[1];

  const dt = CHAIR.last.value < 0 ? 0 : Math.max(0, Math.min(0.1, now - CHAIR.last.value));
  CHAIR.last.value = now;
  // The beat clock's own step: 0 while it is frozen, and a fresh beat (bt reset to
  // 0) counts its first frame from zero rather than as a step backwards.
  const was = CHAIR.lastBt.value;
  const dBt = was < 0 || bt < was ? 0 : Math.min(0.1, bt - was);
  CHAIR.lastBt.value = bt;

  let p = CHAIR.p.value;
  if (p < lo) p = Math.min(lo, p + dt * HURRY);
  else if (p > hi) p = Math.max(hi, p - dt * HURRY);
  else p = Math.min(hi, p + dBt);
  CHAIR.p.value = p;

  // IN THE ROUTINE while the playhead is inside the timeline, or while its own beat
  // is on screen and it is about to start; out of it at either end. The weight is
  // rate-limited on the scene clock, so a tap either way can never flip him.
  const inside = (p > 0.0005 && p < end - 0.0005) || (span[2] > 0 && p <= 0.0005);
  const u = CHAIR.u.value;
  const step = dt / BLEND_S;
  const nu = inside ? Math.min(1, u + step) : Math.max(0, u - step);
  CHAIR.u.value = nu;
  return nu * nu * (3 - 2 * nu);
}
