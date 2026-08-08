// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE FIGURE ON THE ROAD IS DOING, AS PURE MATHS.
//
// Split out of BranchWorld for the same reason rig.ts has no imports: a walk that
// can only be judged by staring at a phone is a walk nobody checks. This file
// imports rig, moves and worldPath — all three of which are themselves free of
// React — so `scripts/check-walk.mjs` can run the exact code the screen runs and
// measure it frame by frame.
//
// It answers one question: given how far along a journey the figure is, what pose
// is it in and how high off the ground?
//
// FOUR THINGS IT FIXES, all of them things a viewer noticed:
//
//   1. THE FIRST STEP — see START_PHASE and `held` below. This is the one that
//      read as "the ground starts moving before he starts walking".
//   2. THE GROUND. `pose` takes one ground line for the whole figure. It is level
//      now, so this costs nothing — but it is still asked rather than assumed.
//   3. THE JUMP. See worldPath: aimed at a drawn obstacle, parabolic, low, and
//      the legs tuck.
//   4. THE HOP — tapping a lesson you are not standing at. It used to be a
//      standing figure sliding sideways 150 units in the air on `Easing.bounce`.
// ─────────────────────────────────────────────────────────────────────────────
import { stand, mixStance, clamp01, ease01, type Stance } from '../lesson/cinematic/rig';
import { strideMode, firstStep } from '../lesson/cinematic/moves';
import {
  groundAt, jumpPhase, jumpLift, jumpCrouch,
  JUMP_GATHER, JUMP_RUN, JUMP_ABSORB,
} from './worldPath';

/**
 * World units of travel spent easing out of the stand and into the stride.
 *
 * DERIVED, and the derivation is the fix. It is one first step: the distance
 * from `startPhase` to the moment the raised foot comes back down (`firstStep`),
 * converted from stance units to world by the figure scale.
 *
 * The first attempt at this tied it to the speed ramp instead — finish the pose
 * exactly when the body reaches cruise — which sounds right and measured wrong.
 * At 18 units the blend was still half-standing when the swing foot reached the
 * ground, so for eight units of travel that foot sat ON the road and slid
 * forward with the body. Whatever else a departure does, it has to be over before
 * the first footfall.
 *
 * CAPPED, because a run's first step is 26 world units long and a blend held that
 * far is not a step any more, it is a drag: measured at 9 units of stance-foot
 * drift against the 2.5 the walking gaits give. Nine is a little over a walk's
 * own first step, which is as long as any pose change here has business lasting.
 */
export const DEPART_MAX = 9;

export function departUnits(mode: number, k: number): number {
  'worklet';
  const d = firstStep(mode) * k;
  return d > DEPART_MAX ? DEPART_MAX : d;
}

/** Folded, the way legs are in the air. Blended in for the flight only. */
export const TUCK: Stance = {
  tilt: -0.06,                 // negative leans FORWARD (rig: the spine is off π)
  neck: -0.10,
  bob: 1.5,
  footL: { x: -7, y: -15 },
  footR: { x: 13, y: -7 },
  fistL: { x: 14, y: -8 },
  fistR: { x: -2, y: 2 },
  adv: 0,
};

/**
 * PUT THE FEET ON THE GROUND.
 *
 * On a level road every one of these samples returns the same number, so this is
 * an identity — and it is kept anyway, because `groundAt` is the single place
 * that decides whether the road is flat. If it ever stops being flat, the feet
 * follow it again without anyone remembering to come back here.
 */
export function onTerrain(s: Stance, bodyX: number, k: number): Stance {
  'worklet';
  const g0 = groundAt(bodyX);
  const dl = (groundAt(bodyX + s.footL.x * k) - g0) / k;
  const dr = (groundAt(bodyX + s.footR.x * k) - g0) / k;
  const slope = (groundAt(bodyX + 9) - groundAt(bodyX - 9)) / 18;
  if (dl === 0 && dr === 0 && slope === 0) return s;
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

// ─────────────────────────────────────────────────────────────────────────────
// THE FIRST STEP, WHICH IS WHERE THE WALK WAS BREAKING.
//
// A viewer put it exactly: "the ground starts moving before the stickman starts
// walking." That is not a timing bug. It is a FOOT SKATE, and it had two causes
// that compounded.
//
// ── one: the journey began at the widest point of the stride ────────────────
//
// `walk(0)` is not a standing pose. It is mid-stance with the feet 27 units apart
// and BOTH of them planted; standing has them 8 apart. So the departure had to
// drag two planted feet 19 units apart against the ground they were standing on.
// `strideMode`'s `fromStand` moves the start to the instant the feet cross — swing
// foot at the top of its arc directly above the planted one — which is what the
// first step of a real gait initiation looks like. The pose difference from a
// stand is then one foot rising, and a rising foot is allowed to move.
//
// ── two: the pose was blended against a stand that did not travel ───────────
//
// A foot's x is measured from the body. rig's foot-lock works by walking the
// planted foot BACKWARD through stance at exactly the speed the body goes
// forward, so the two cancel and the foot stays on one spot of world. Lerping
// that against a standing pose — whose feet sit at a FIXED offset from the body,
// because a standing body does not go anywhere — reintroduces the body's motion
// in proportion to how much stand is left in the mix. Integrated over a 26-unit
// blend that is thirteen world units of skate, every single departure.
//
// So the stand is world-locked first (`held`). Both ends of the blend then hold
// their feet still against the ground, and any lerp between them does too.
// ─────────────────────────────────────────────────────────────────────────────

// ── DEFINED BEFORE `figureAt`, AND THAT IS NOT A STYLE CHOICE ───────────────
//
// The Reanimated babel plugin rewrites a `function foo()` carrying 'worklet' into
// a `const foo = function ...` and then, immediately at module scope, builds the
// CLOSURE OBJECT of every worklet that mentions it. A `const` is in its temporal
// dead zone until its own line runs — so a worklet declared above one it calls
// crashes the whole bundle on import with "Cannot access 'airborne' before
// initialization", before a single component mounts.
//
// Function declarations hoist and worklets do not, which is exactly why this
// looks fine and is not. rig.ts carries the same warning on `gaitVary`. tsc,
// check-walk and the contact sheet all passed with this broken; the browser found
// it in one load.

/**
 * The body of a jump, laid over whatever it was doing before.
 *
 * Split out because the road's hop uses the identical anatomy — see `hopAt`. A
 * jump that gathers one way while walking and another way while hopping is two
 * jumps, and the reader would be able to tell.
 */
function airborne(s: Stance, trav: number, takeoff: number, u: number): Stance {
  'worklet';
  let out = s;
  // The tuck comes on fast off the ground and lets go before landing, so the legs
  // are already reaching down when the feet arrive.
  const air = clamp01(Math.sin(Math.PI * clamp01(u)) * 1.9);
  if (air > 0) out = mixStance(out, TUCK, air);
  // Gather, then absorb. Compression is the only reason a jump reads as having
  // weight rather than as a figure being lifted by the screen — and it is what a
  // viewer meant by "he needs to bend down a little bit". Nine stance units is
  // about an eighth of his height, which is a real knee bend and not a nod.
  const cr = jumpCrouch(trav, takeoff);
  if (cr > 0) {
    out = {
      ...out,
      bob: out.bob - cr * 9,
      tilt: out.tilt - cr * 0.10,
      // Arms swing BACK as he loads and the shoulders drop. Without this the
      // crouch is a squat performed by a mannequin: the legs bend and nothing
      // above the waist knows a jump is about to happen.
      fistL: { x: out.fistL.x - cr * 9, y: out.fistL.y + cr * 3 },
      fistR: { x: out.fistR.x - cr * 7, y: out.fistR.y + cr * 3 },
    };
  }
  return out;
}

/**
 * The figure at one instant of a traverse.
 *
 * `t` is the idle clock (so a standing figure keeps breathing), `wp` the 0→1
 * progress of the traverse, and `takeoff` the distance at which this span jumps,
 * or −1 for one it simply walks.
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
  const moving = strideMode(x0 / k, x1 / k, standing, wp, mode, 0, true);

  let s: Stance;
  const depart = ease01(clamp01(trav / departUnits(mode, k)));
  if (depart >= 1) {
    s = moving;
  } else {
    // The stand, WORLD-LOCKED: its feet walk backward at exactly the rate the
    // body walks forward, so they stay on the spot they were standing on. See the
    // block comment above — without this, the blend itself is the skate.
    const back = trav / k;
    const held: Stance = {
      ...standing,
      footL: { x: standing.footL.x - back, y: standing.footL.y },
      footR: { x: standing.footR.x - back, y: standing.footR.y },
    };
    s = mixStance(held, moving, depart);
  }
  s = onTerrain(s, bodyX, k);

  let lift = 0;
  if (takeoff >= 0) {
    const u = jumpPhase(trav, takeoff);
    lift = jumpLift(u, jumpH);
    s = airborne(s, trav, takeoff, u);
  }
  return { stance: s, lift };
}

// ─────────────────────────────────────────────────────────────────────────────
// THE HOP — what happens when you tap a lesson you are not standing at.
//
// It was: a standing figure translated 150 units into the air and back down on
// `Easing.bounce`, sliding sideways the whole time. Three separate lies in one
// animation. He never bent his knees, he was three and a half times his own
// height off the ground at the top, and `bounce` is a rubber ball hitting
// concrete — it gives the landing three visible rebounds, which is a thing feet
// do not do.
//
// It is now the same gather → flight → absorb as the jump over a log, from the
// same three functions, with two properties a leap has and a slide does not:
//
//   · the horizontal distance is covered ONLY DURING THE FLIGHT. He crouches
//     where he is, travels while he is in the air, and lands where he is going.
//     Constant velocity through the flight, because nothing pushes him sideways
//     once his feet have left the ground.
//   · the apex is measured against HIS OWN HEIGHT. ~43 world units tall, so the
//     ceiling here is 40 — he clears his own knee-to-shoulder, and no more.
// ─────────────────────────────────────────────────────────────────────────────

/** The three phases end-to-end, as a distance, so the jump maths can be reused. */
export const HOP_UNITS = JUMP_GATHER + JUMP_RUN + JUMP_ABSORB;

/** How high a hop of this length goes. Capped below the figure's own height. */
export function hopHeight(dist: number): number {
  'worklet';
  const h = 18 + Math.abs(dist) * 0.02;
  return h > 40 ? 40 : h;
}

/** How long a hop of this length should take, in ms. Longer leap, longer flight. */
export function hopMs(dist: number): number {
  const ms = 620 + Math.abs(dist) * 0.55;
  return ms > 1400 ? 1400 : ms;
}

/**
 * Fraction of the horizontal distance covered at hop progress `p` (0→1).
 * Flat, then linear, then flat: he only moves while he is off the ground.
 */
export function hopTravel(p: number): number {
  'worklet';
  const a = JUMP_GATHER / HOP_UNITS;
  const b = (JUMP_GATHER + JUMP_RUN) / HOP_UNITS;
  return clamp01((p - a) / (b - a));
}

/** The figure at hop progress `p` (0→1), leaping `dist` world units. */
export function hopAt(p: number, dist: number, t: number, k: number): Figure {
  'worklet';
  const standing = stand(t);
  if (p <= 0 || p >= 1) return { stance: standing, lift: 0 };
  const trav = p * HOP_UNITS;
  const u = jumpPhase(trav, JUMP_GATHER);
  const h = hopHeight(dist);
  return { stance: airborne(standing, trav, JUMP_GATHER, u), lift: jumpLift(u, h) };
}
