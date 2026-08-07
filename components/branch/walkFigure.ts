// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE FIGURE ON THE ROAD IS DOING, AS PURE MATHS.
//
// Split out of BranchWorld for the same reason rig.ts has no imports: a walk that
// can only be judged by staring at a phone is a walk nobody checks. This file
// imports rig, moves and worldPath — all three of which are themselves free of
// React — so `scripts/check-walk.mjs` can run the exact code the screen runs and
// measure it frame by frame.
//
// It answers one question: given how far along a traverse the figure is, what
// pose is it in and how high off the ground?
//
// THREE THINGS IT FIXES, all of them things a viewer noticed:
//
//   1. THE FIRST STEP. `walk(0)` is not a standing pose — it is one phase of the
//      cycle, and for the house gait that phase has the feet 27 stance units
//      apart. Standing has them 8 apart. So the traverse used to begin with a
//      foot jumping ~8 world units in a single frame.
//   2. THE GROUND. `pose` takes one ground line for the whole figure, so both
//      feet sat on a flat rule under the pelvis while the drawn hill curved
//      underneath. Each foot is sampled at its own world x now.
//   3. THE JUMP. See worldPath: distance-based, parabolic, and the legs tuck.
// ─────────────────────────────────────────────────────────────────────────────
import { stand, mixStance, clamp01, ease01, type Stance } from '../lesson/cinematic/rig';
import { strideMode } from '../lesson/cinematic/moves';
import { groundAt, jumpPhase, jumpLift, jumpCrouch } from './worldPath';

/** World units of travel spent easing out of the stand and into the stride. */
export const DEPART_UNITS = 26;

/** Folded, the way legs are in the air. Blended in for the flight only. */
export const TUCK: Stance = {
  tilt: 0.05,
  neck: -0.10,
  bob: 1.5,
  footL: { x: -7, y: -15 },
  footR: { x: 13, y: -7 },
  fistL: { x: 12, y: -6 },
  fistR: { x: -3, y: 3 },
  adv: 0,
};

/**
 * PUT THE FEET ON THE HILL.
 *
 * The two feet can be 17 world units apart on ground that runs at a slope of up
 * to 0.27, so the leading foot floated or sank by as much as 2.6 units against
 * the hill it was supposed to be standing on. Each foot is sampled at its OWN
 * world x; the division by `k` is because a foot's y is in stance units and
 * `pose` multiplies it by the figure scale on the way out.
 */
export function onTerrain(s: Stance, bodyX: number, k: number): Stance {
  'worklet';
  const g0 = groundAt(bodyX);
  const dl = (groundAt(bodyX + s.footL.x * k) - g0) / k;
  const dr = (groundAt(bodyX + s.footR.x * k) - g0) / k;
  // And lean into the slope. A positive tilt takes the head BACKWARD (measured in
  // Node against `solve`), and walking uphill means the ground behind is falling
  // away, so an uphill slope is negative here and the sign gives a forward lean.
  const slope = (groundAt(bodyX + 9) - groundAt(bodyX - 9)) / 18;
  return {
    ...s,
    tilt: s.tilt + slope * 0.42,
    footL: { x: s.footL.x, y: s.footL.y + dl },
    footR: { x: s.footR.x, y: s.footR.y + dr },
  };
}

export interface Figure {
  stance: Stance;
  /** How far above the ground line the whole figure is, in world units. */
  lift: number;
}

/**
 * The figure at one instant of a traverse.
 *
 * `t` is the idle clock (so a standing figure keeps breathing), `wp` the eased
 * 0→1 progress of the traverse, and `takeoff` the distance at which this span
 * jumps, or −1 for one it simply walks.
 */
export function figureAt(
  x0: number, x1: number, wp: number, t: number, mode: number,
  takeoff: number, jumpH: number, k: number
): Figure {
  'worklet';
  const standing = stand(t);
  const bodyX = x0 + (x1 - x0) * wp;
  if (wp <= 0) return { stance: onTerrain(standing, bodyX, k), lift: 0 };

  const span = Math.abs(x1 - x0);
  const trav = span * wp;
  // ── THE ENDPOINTS GO IN AS STANCE UNITS, DIVIDED BY THE FIGURE SCALE ───────
  //
  // This is the one that made the walk look wrong on the ground, and it is a
  // scale bug, not an animation one.
  //
  // rig.ts's foot-lock is exact BY CONSTRUCTION: over one stance the foot's local
  // x travels −S while the figure advances +S, so a planted foot does not move.
  // But the foot's local x is in STANCE units and `pose` multiplies it by `k` on
  // the way out, while the body advances the full distance in WORLD units. The
  // two only cancel when k is 1 — which is exactly what every cinematic lesson
  // uses (§17 rule 2: K_FIG is 1.0). This road draws the figure at 0.62, so the
  // planted foot crept forward at (1 − k) = 38% OF WALKING SPEED, every step of
  // every span. Measured at 0.581 world units per frame against a body moving
  // 1.533 — the ground sliding under a foot that was supposed to be on it.
  //
  // Handing the rig `x/k` puts its internal distances in stance units, so its
  // −S cancels the body's +S once `pose` has scaled it back. Slide goes to zero.
  const moving = strideMode(x0 / k, x1 / k, standing, wp, mode);
  // Out of the stand and into the stride — a first step, not a cut.
  const depart = ease01(clamp01(trav / DEPART_UNITS));
  let s = depart >= 1 ? moving : mixStance(standing, moving, depart);
  s = onTerrain(s, bodyX, k);

  let lift = 0;
  if (takeoff >= 0) {
    const u = jumpPhase(trav, takeoff);
    lift = jumpLift(u, jumpH);
    // The tuck comes on fast off the ground and lets go before landing, so the
    // legs are already reaching down when the feet arrive.
    const air = clamp01(Math.sin(Math.PI * clamp01(u)) * 1.9);
    if (air > 0) s = mixStance(s, TUCK, air);
    // Gather, then absorb. Compression is the only reason a jump reads as having
    // weight rather than as a figure being lifted by the screen.
    const cr = jumpCrouch(trav, takeoff);
    if (cr > 0) s = { ...s, bob: s.bob - cr * 6, tilt: s.tilt - cr * 0.05 };
  }
  return { stance: s, lift };
}
