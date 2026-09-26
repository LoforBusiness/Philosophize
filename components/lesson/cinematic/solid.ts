import type { Stance } from './rig';
import { handAt, reachHandTo } from './interact';
import { GROUND, K_FIG } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN OBJECT HE TOUCHES IS SOLID (LESSON_RULES Y7), as a function a scene calls.
//
// logic-arguments-1 worked this out for its lecterns (`atLectern`), and every lesson
// that puts a figure AT something — a console, a desk, a counter, a rail — needs the
// same three things, so they live here rather than being re-derived per scene:
//
//   · his hands REST on the surface, at the surface's own height where each hand is
//     (a sloped top is sloped for the hand too);
//   · a FREE hand may gesture, and lands on the surface rather than going into it;
//   · the rest of him — the lean, the breath, the head — keeps moving, because the
//     hands are placed on the pose he is actually in (`reachHandTo`), not a fixed one.
//
// Stage units throughout. `side` is which side of the surface the figure stands on
// (−1: he is to its LEFT, facing right), so he faces −side.
// ─────────────────────────────────────────────────────────────────────────────

/** A flat or sloped top a figure can put his hands on. */
export interface Desk {
  /** Centre x of the top. */
  cx: number;
  /** y of the top's upper face at its centre. */
  top: number;
  /** Half the top's width. */
  half: number;
  /** Degrees; the edge nearer him is LOWER by this much. 0 for a flat top. */
  tilt: number;
  /** Which side of the desk he stands on: −1 left, +1 right. */
  side: -1 | 1;
}

/** The y of a desk's upper face at stage x `hx`. */
export function deskY(d: Desk, hx: number): number {
  'worklet';
  return d.top + (hx - d.cx) * d.side * Math.tan((d.tilt * Math.PI) / 180);
}

/**
 * His hands on the desk. The back hand rests `backIn` inside the near edge; the front
 * hand rests `frontIn` inside it unless `free` (0 → 1, carried by the caller) lets it
 * go to whatever the pose was doing — and then, if the pose would put it over the top
 * and BELOW the surface, it lands on the surface instead. `grip` is how far above the
 * surface a fist's centre sits (a limb is 11 thick).
 */
export function handsOnDesk(
  s: Stance, x: number, d: Desk, free: number, backIn = 6, frontIn = 16, grip = 4.5,
): Stance {
  'worklet';
  const p = { x, groundY: GROUND, k: K_FIG, dir: -d.side };
  const back = d.cx + d.side * (d.half - backIn);
  const front = d.cx + d.side * (d.half - frontIn);
  let o = reachHandTo(s, p, -1, back, deskY(d, back) - grip, 1);
  o = reachHandTo(o, p, 1, front, deskY(d, front) - grip, 1 - free);
  const h = handAt(o, p, 1);
  if (Math.abs(h.x - d.cx) < d.half + 3) {
    const floor = deskY(d, h.x) - grip;
    if (h.y > floor) o = reachHandTo(o, p, 1, h.x, floor, 1);
  }
  return o;
}

/**
 * One hand held on a point — a dial, a knob, a lever's grip — blended in by `w`. The
 * other hand is left to the pose. For "he turns the dial": pin the hand here while
 * the dial's indicator rotates, and the hand is the thing turning it.
 */
export function handOn(s: Stance, x: number, dir: 1 | -1, tx: number, ty: number, w: number, which: 1 | -1 = 1): Stance {
  'worklet';
  return reachHandTo(s, { x, groundY: GROUND, k: K_FIG, dir }, which, tx, ty, w);
}
