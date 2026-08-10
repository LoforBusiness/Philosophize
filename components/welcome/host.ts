import { clamp01, lerp } from './ease';
import {
  CX,
  FRONT,
  FRONT_FOOT_X,
  GROUND,
  K,
  LEN,
  MARCH,
  PROFILE,
  PROFILE_FOOT_X,
  SHUFFLE,

  SPRINT,
  STAND,
  SPEAK_T0,
  T_BEAT,
  T_BOLT,
  T_EXIT,
  T_MARCH,
  T_STOP,
  T_TURN,
  T_WINDUP,
  WALK_PELV,
  footTarget,
  phaseFor,
  swayAt,
  type Gait,
} from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// THE HOST'S CHOREOGRAPHY — everything about where he is and what shape he is in,
// as one pure function of time.
//
// He used to have no entrance and no exit. He was simply drawn, at full opacity,
// on frame one — legs frozen, arms already gesturing — while the speech bubble
// faded in around him, and at the end he dissolved on the spot. Nothing arrives
// or leaves that way, which is why the opening read as a fault rather than a
// beginning.
//
// Now: he marches on from off-stage left, sails straight past his mark, stops,
// realises, backs up two steps onto it, and turns to face you. He talks. Then he
// turns away, fails to find any traction for half a second, and is gone.
//
// ZERO REACT, ZERO RN. Same discipline as rig.ts and the lesson rig: this file is
// arithmetic and nothing else, so the whole performance can be sampled in plain
// Node and MEASURED — which is how the foot-slide below was proved absent rather
// than eyeballed in a screenshot.
// ─────────────────────────────────────────────────────────────────────────────

export interface P2 {
  x: number;
  y: number;
}
export interface Feet {
  footL: P2;
  footR: P2;
}

export interface HostPose {
  /** Stage x of the point between his feet, sway already folded in. */
  x: number;
  /** Pelvis height above GROUND. */
  pelvH: number;
  /** Torso lean. POSITIVE tips the top of him toward +x, the way he walks. */
  lean: number;
  /** Extra head angle on top of the spine, same sign convention as `lean`. */
  neck: number;
  /** 0 = profile, 1 = facing you. Blends the hip/shoulder width and the arms. */
  face: number;
  /** 0 = the talking system owns the pose, 1 = the walk does. */
  walking: number;
  /** GROUND-relative foot offsets from `x` (y 0 = planted, negative = lifted). */
  footL: P2;
  footR: P2;
  /** Hand targets in STAGE space — only consulted while `walking` > 0. */
  handL: P2;
  handR: P2;
  /** How hard the component's hand smoothing chases. A windmill must not be damped. */
  handK: number;
  /** +1 faces right, −1 faces left. The component needs it for the knee's bow. */
  dir: number;
  /** 0 once he is off the stage, so nothing is drawn for him at all. */
  vis: number;
}

// ── the marks ────────────────────────────────────────────────────────────────
//
// HE COMES IN FROM THE RIGHT, and that is forced by the stage rather than chosen.
// His mark is at x 316 on a 400-wide stage and his head has a radius of 60, so
// there are 24 units of clearance to his right and 256 to his left. Overshooting
// rightward put a quarter of his head past the edge of the screen at the exact
// moment the joke asks you to look at him, which reads as a clipping fault and not
// as a man who has walked too far. Overshooting LEFT has all the room in the world.
/** Fully off-stage right: his widest point is the head, so 520 clears x = 400. */
export const X_OFF = 520;
/** Where he means to stop. */
export const X_MARK = CX;
/** Where he actually stops, the first time — a comfortable two strides past it. */
/**
 * Just far enough. He is fully off once x passes 460 (head included), so 500 keeps
 * him on the glass for almost the whole bolt; at 580 he cleared the frame a fifth
 * of a second early and the stage sat empty waiting for the wordmark.
 */
export const X_GONE = 500;

/**
 * Facing. −1 through the entrance (he walks in leftward and backs up without ever
 * turning round), +1 for the exit. The whole gait is authored facing +x, so this
 * mirrors the parts of it that have a front: the feet, the hand swing, the lean,
 * and — in the component — which way the knee bows.
 */
const DIR_IN = -1;
const DIR_OUT = 1;

function faceFeet(f: Feet, dir: number): Feet {
  'worklet';
  if (dir > 0) return f;
  return {
    footL: { x: -f.footL.x, y: f.footL.y },
    footR: { x: -f.footR.x, y: f.footR.y },
  };
}

// Phase boundaries, absolute.
const T1 = T_MARCH; // marching
const T2 = T1 + T_STOP; // planted
const T5 = T2 + T_TURN; // facing you — equals SPEAK_T0

const E1 = T_EXIT + T_BEAT; // the line has landed; he has turned away
const E2 = E1 + T_WINDUP; // legs going, still here
const E3 = E2 + T_BOLT; // gone

/**
 * How much of a journey the arrival blend occupies, in TRAVEL rather than time —
 * the lesson rig's SETTLE_UNITS at this rig's scale.
 */
const SETTLE_UNITS = 7 * K;

const FRONT_FEET: Feet = {
  footL: { x: -FRONT_FOOT_X, y: 0 },
  footR: { x: FRONT_FOOT_X, y: 0 },
};
const PROFILE_FEET: Feet = {
  footL: { x: -PROFILE_FOOT_X, y: 0 },
  footR: { x: PROFILE_FOOT_X, y: 0 },
};

function smooth(u: number) {
  'worklet';
  const c = clamp01(u);
  return c * c * (3 - 2 * c);
}

function mixFeet(a: Feet, b: Feet, t: number): Feet {
  'worklet';
  return {
    footL: { x: lerp(a.footL.x, b.footL.x, t), y: lerp(a.footL.y, b.footL.y, t) },
    footR: { x: lerp(a.footR.x, b.footR.x, t), y: lerp(a.footR.y, b.footR.y, t) },
  };
}

/**
 * THE LAST STEP OF ANY WALK, and the only place a foot can ever skate.
 *
 * Through the planted part of a stride the foot moves backward through the body's
 * frame at exactly the speed the body moves forward, so its position ON THE GROUND
 * does not change — the lock is exact by construction and costs nothing. The one
 * moment that is not covered is the hand-off from walking to standing, and a naive
 * blend there drags the planted foot across the floor for the whole blend.
 *
 * So the standing pose is not blended toward where it will BE; it is blended
 * toward where it must be RIGHT NOW for the foot to arrive without moving. With
 * `remaining` units of travel still to come, the settled foot's body-relative
 * offset is `settled.x + remaining` — and as `remaining` falls to zero that target
 * slides back to the settled pose on its own.
 *
 * `remaining` is SIGNED here, where the lesson rig takes its magnitude: he backs
 * onto his mark travelling in −x, and the magnitude version puts that foot the
 * wrong side of the body.
 */
function settleTo(moving: Feet, settled: Feet, remaining: number, a: number): Feet {
  'worklet';
  if (a <= 0) return moving;
  const tgtL = settled.footL.x + remaining;
  const tgtR = settled.footR.x + remaining;
  const gapL = Math.abs(tgtL - moving.footL.x);
  const gapR = Math.abs(tgtR - moving.footR.x);
  // EACH foot gets its own lift, sized to its own gap. Lifting only the foot with
  // the larger gap — which is what the lesson rig does — leaves the other one to
  // close a smaller gap along the floor, and at this rig's scale "smaller" was
  // still eleven units of visible skating.
  //
  // And the two curves are deliberately different shapes. The horizontal blend is
  // a smoothstep, so its speed is zero at both ends; the lift is a sine, so it is
  // already rising when the foot first moves. Ease the position in linearly and
  // the foot travels fastest exactly where the lift is nil, which puts the slide
  // back at the two edges of the blend.
  const w = smooth(a);
  const e = Math.sin(Math.PI * clamp01(a));
  const cap = WALK_PELV * 0.38;
  const liftL = e * Math.min(cap, gapL * 0.55) * 2;
  const liftR = e * Math.min(cap, gapR * 0.55) * 2;
  return {
    footL: {
      x: lerp(moving.footL.x, tgtL, w),
      y: Math.min(lerp(moving.footL.y, settled.footL.y, w), -liftL),
    },
    footR: {
      x: lerp(moving.footR.x, tgtR, w),
      y: Math.min(lerp(moving.footR.y, settled.footR.y, w), -liftR),
    },
  };
}

/**
 * A PIVOT, not a slide. Turning between profile and front moves the feet a long
 * way — ±12 to ±28 — and blending them straight across drags both across the floor
 * for the whole turn. So they go one at a time and each one steps: the left
 * repositions over the first half of the turn, the right over the second, and
 * neither is ever on the ground while it is moving.
 */
function pivotFeet(from: Feet, to: Feet, u: number, lift: number): Feet {
  'worklet';
  const uL = clamp01(u / 0.55);
  const uR = clamp01((u - 0.45) / 0.55);
  return {
    footL: {
      x: lerp(from.footL.x, to.footL.x, smooth(uL)),
      y: lerp(from.footL.y, to.footL.y, smooth(uL)) - Math.sin(Math.PI * uL) * lift,
    },
    footR: {
      x: lerp(from.footR.x, to.footR.x, smooth(uR)),
      y: lerp(from.footR.y, to.footR.y, smooth(uR)) - Math.sin(Math.PI * uR) * lift,
    },
  };
}

/**
 * The pose the run starts in. The exit turn pivots into THIS rather than into a
 * neutral profile stance: the wind-up begins on the run cycle's first frame, and
 * a stance chosen for tidiness instead of for what comes next teleported a foot
 * eight units at the seam.
 */
const RUN_FEET: Feet = { footL: footTarget(Math.PI, SPRINT), footR: footTarget(0, SPRINT) };

/** Cycles per second while the legs are going and he is not. */
/**
 * How far he GATHERS BACK before the run, in stage units.
 *
 * The anticipation is the whole of it: a figure that simply starts moving right
 * has no weight, and the eye reads the first frames as a jump cut. Loading in the
 * opposite direction first is what makes the release read as effort.
 */
const WINDUP_BACK = 30;
/** Phase the wheel-spin has wound up to when the bolt takes over. */

/**
 * One leg of the journey: the gait, foot-locked to distance, settling on arrival.
 * Returns the settle amount as well, because the BOB has to die with the walk —
 * a pelvis still riding its stride cycle at the instant the phase changes drops
 * the whole figure by however much bob it happened to be carrying.
 */
function stride(x0: number, x1: number, x: number, g: Gait, settled: Feet, dir: number) {
  'worklet';
  // Everything is solved in a FORWARD-facing local frame — the gait is authored
  // that way and `phaseFor` needs distance measured along the facing direction, so
  // a leftward walk solved in stage x would run its cycle backwards. Mirrored to
  // the stage on the way out.
  const span = dir * (x1 - x0);
  const dist = dir * (x - x0);
  const ph = phaseFor(dist, g);
  const moving: Feet = { footL: footTarget(ph + Math.PI, g), footR: footTarget(ph, g) };
  const mag = Math.abs(span);
  if (mag < 1e-6) return { ...faceFeet(settled, dir), settle: 1, ph };
  const sf = Math.min(0.22, SETTLE_UNITS / mag);
  const a = clamp01((dist / span - (1 - sf)) / Math.max(sf, 1e-6));
  const local = settleTo(moving, settled, dir * (x1 - x), a);
  return { ...faceFeet(local, dir), settle: a, ph };
}

/** Pelvis height for a gait, fading its bob out as the walk settles to a stop. */
function gaitBob(ph: number, g: Gait, settle: number) {
  'worklet';
  return g.bob * (0.5 - 0.5 * Math.cos(2 * ph)) * (1 - smooth(settle));
}

/** Step phase for a gait, used for everything that rides the cycle but isn't a foot. */
function phaseOf(x0: number, x: number, g: Gait) {
  'worklet';
  return phaseFor(x - x0, g);
}

/**
 * Hands for a gait: they swing opposite the legs, hanging or pumping per `armY`.
 * `settle` fades both the swing and the pumped height back to hanging, so the arms
 * arrive at rest on the same frame the feet do.
 */
function gaitHands(ph: number, g: Gait, pel: P2, dir: number, settle = 0): { handL: P2; handR: P2 } {
  'worklet';
  // Pelvis-relative, at this rig's scale: the lesson rig's swing of 24 units on a
  // 33-unit arm, times K. A hand at y +21 hangs at exactly arm's length from the
  // shoulder, which is what stops the elbow bowing out and cutting a hole of paper
  // through the torso. Mirrored by `dir`, or the arms swing against the legs.
  const s = 1 - smooth(settle);
  const sw = g.armSwing * 24 * K * s;
  const y = lerp(21, g.armY, s);
  return {
    handL: {
      x: pel.x + dir * (9 + Math.cos(ph) * sw),
      y: pel.y + y - Math.abs(Math.cos(ph)) * 6 * s,
    },
    handR: {
      x: pel.x + dir * (9 + Math.cos(ph + Math.PI) * sw),
      y: pel.y + y - Math.abs(Math.cos(ph + Math.PI)) * 6 * s,
    },
  };
}

/** The pose he holds while he is talking: on his mark, facing you, swaying. */
function talking(t: number): HostPose {
  'worklet';
  const x = X_MARK + swayAt(t);
  return {
    x,
    pelvH: STAND,
    lean: 0,
    neck: 0,
    face: 1,
    walking: 0,
    footL: FRONT_FEET.footL,
    footR: FRONT_FEET.footR,
    handL: { x, y: GROUND - STAND },
    handR: { x, y: GROUND - STAND },
    handK: 8.5,
    dir: 1,
    vis: 1,
  };
}

/**
 * Everything about the host at time t.
 *
 * Reduces EXACTLY to the approved talking pose between T5 and T_EXIT — same
 * pelvis height, same splayed feet, same zero lean — so the thirty seconds that
 * were already right are untouched by any of this.
 */
export function hostAt(t: number): HostPose {
  'worklet';

  // ── standing on the mark, talking ─────────────────────────────────────────
  if (t >= T5 && t <= T_EXIT) return talking(t);

  // ── 1 · the march ─────────────────────────────────────────────────────────
  if (t < T1) {
    const u = clamp01(t / T_MARCH);
    // He is already at speed when the audience first sees him — no ease-in, or he
    // appears to start from a standstill just off-frame, which is a stranger idea
    // than simply walking in. Constant pace for most of it, then a real deceleration
    // into the stop, because the joke needs the stop to look intentional.
    // Constant pace for most of it, then a real deceleration — which now ARRIVES
    // rather than overruns, so the slowdown is the walk ending instead of the
    // set-up for a double-take. A longer tail than before, because stopping on
    // the mark has to look chosen.
    const e = u < 0.70 ? (u / 0.70) * 0.86 : 0.86 + 0.14 * (1 - Math.pow(1 - (u - 0.70) / 0.30, 2));
    const x = X_OFF + (X_MARK - X_OFF) * e;
    const st = stride(X_OFF, X_MARK, x, MARCH, PROFILE_FEET, DIR_IN);
    const rock = Math.sin(2 * st.ph) * (1 - smooth(st.settle));
    const pel = { x, y: GROUND - WALK_PELV };
    const h = gaitHands(st.ph, MARCH, pel, DIR_IN, st.settle);
    return {
      x,
      pelvH: WALK_PELV + gaitBob(st.ph, MARCH, st.settle),
      // Chest out, leaning very slightly BACK. A forward lean reads as hurrying;
      // this reads as a man who believes he knows where he is going.
      lean: DIR_IN * (-0.05 + rock * 0.02),
      neck: DIR_IN * (-0.04 - rock * 0.015),
      face: 0,
      walking: 1,
      footL: st.footL,
      footR: st.footR,
      ...h,
      handK: 22,
      dir: DIR_IN,
      vis: 1,
    };
  }

  // ── 2 · the weight arrives ────────────────────────────────────────────────
  if (t < T2) {
    const u = clamp01((t - T1) / T_STOP);
    const sm = smooth(u);
    // A shallow dip and recovery as the last step takes his weight. That is all
    // that is left of the old stop-notice-reverse: he is where he meant to be, so
    // there is nothing to correct and nothing to react to.
    const pelvH = WALK_PELV - Math.sin(Math.PI * u) * 2.4;
    const pel = { x: X_MARK, y: GROUND - pelvH };
    // The march's settled feet, held. `stride` at its own endpoint returns the
    // settled pose, so this is literally the walk's last frame and cannot snap.
    const arrived = stride(X_OFF, X_MARK, X_MARK, MARCH, PROFILE_FEET, DIR_IN);
    return {
      x: X_MARK,
      pelvH,
      // Out of the march's chest-out lean and into the upright the turn expects.
      lean: DIR_IN * lerp(-0.05, 0.02, sm),
      neck: DIR_IN * lerp(-0.04, -0.01, sm),
      face: 0,
      walking: 1,
      footL: arrived.footL,
      footR: arrived.footR,
      handL: { x: pel.x + DIR_IN * 9, y: pel.y + 21 },
      handR: { x: pel.x + DIR_IN * 9, y: pel.y + 21 },
      handK: lerp(22, 18, sm),
      dir: DIR_IN,
      vis: 1,
    };
  }

  // ── 5 · the turn ──────────────────────────────────────────────────────────
  if (t < T5) {
    const raw = clamp01((t - T2) / T_TURN);
    const u = smooth(raw);
    // A small rise through the middle. Turning on the spot with the pelvis pinned
    // reads as a sprite being flipped; lifting him a few units over the middle of
    // it reads as a person putting their weight somewhere to do it.
    const hop = Math.sin(Math.PI * raw) * 5;
    const feet = pivotFeet(faceFeet(PROFILE_FEET, DIR_IN), FRONT_FEET, raw, 15);
    const pelvH = lerp(WALK_PELV, STAND, u) + hop;
    const pel = { x: X_MARK, y: GROUND - pelvH };
    return {
      x: X_MARK + swayAt(T5) * u,
      pelvH,
      lean: lerp(DIR_IN * 0.02, 0, u),
      neck: lerp(DIR_IN * -0.01, 0, u),
      face: u,
      walking: 1 - u,
      footL: feet.footL,
      footR: feet.footR,
      handL: { x: pel.x + DIR_IN * 9 * (1 - u), y: pel.y + 21 },
      handR: { x: pel.x + DIR_IN * 9 * (1 - u), y: pel.y + 21 },
      handK: lerp(18, 8.5, u),
      // Squares up as he turns, so the knee's bow swings through with him.
      dir: u < 0.5 ? DIR_IN : DIR_OUT,
      vis: 1,
    };
  }

  // ── 6 · the beat, and turning away ────────────────────────────────────────
  if (t < E1) {
    const u = clamp01((t - T_EXIT) / T_BEAT);
    // He holds the last line for a moment before anything happens — the pause is
    // what makes the bolt funny rather than abrupt — then turns and crouches.
    const raw = clamp01((u - 0.34) / 0.66);
    const g = smooth(raw);
    const pelvH = lerp(STAND, WALK_PELV - 5, g);
    const pel = { x: X_MARK, y: GROUND - pelvH };
    // Steps back into profile rather than dragging both feet together — the same
    // pivot as the entrance, run the other way, and landing on the exact pose the
    // wind-up's first frame wants.
    const feet = pivotFeet(FRONT_FEET, RUN_FEET, raw, 13);
    return {
      x: X_MARK + swayAt(t) * (1 - g),
      pelvH,
      lean: 0.3 * g,
      neck: -0.06 * g,
      face: 1 - g,
      walking: g,
      ...feet,
      handL: { x: pel.x + 9 - 26 * g, y: pel.y + 21 - 30 * g },
      handR: { x: pel.x + 9 + 14 * g, y: pel.y + 21 - 6 * g },
      handK: lerp(8.5, 20, g),
      dir: DIR_OUT,
      vis: 1,
    };
  }

  // ── 7 · the wind-up ───────────────────────────────────────────────────────
  if (t < E2) {
    const u = clamp01((t - E1) / T_WINDUP);
    // He GATHERS BACKWARD first, then holds coiled for the last third of the beat.
    // The hold matters as much as the move: an anticipation with no stillness at
    // the end of it is just a wobble.
    const g = smooth(clamp01(u / 0.66));
    const x = X_MARK - WINDUP_BACK * g;
    // STEPPED, not slid. `stride` drives the cycle from DISTANCE, so the feet are
    // planted the whole way back — the previous version spun the legs on the spot
    // at 4.2 revolutions a second while the body moved fourteen units, which is
    // why it read as running in place and then teleporting off.
    //
    // It settles onto RUN_FEET, which is SPRINT's phase 0 — exactly the frame the
    // bolt below starts from, so the two share a pose rather than meeting at one.
    const st = stride(X_MARK, X_MARK - WINDUP_BACK, x, SHUFFLE, RUN_FEET, DIR_OUT);
    // Coiling: down into the crouch and further over the front foot.
    const pelvH = lerp(WALK_PELV - 5, WALK_PELV - 17, g);
    const pel = { x, y: GROUND - pelvH };
    // The arms are the run's OWN phase 0 — one forward, one back — which is a
    // sprinter's set by construction, and means the bolt inherits them unchanged.
    const h = gaitHands(0, SPRINT, pel, DIR_OUT);
    return {
      x,
      pelvH,
      lean: lerp(0.3, 0.66, g),
      neck: -0.06 - 0.06 * g,
      face: 0,
      walking: 1,
      footL: st.footL,
      footR: st.footR,
      ...h,
      handK: 30,
      dir: DIR_OUT,
      vis: 1,
    };
  }

  // ── 8 · and gone ──────────────────────────────────────────────────────────
  if (t < E3) {
    const u = clamp01((t - E2) / T_BOLT);
    // Traction, all at once. Quadratic out of the crouch, then flat out.
    const e = u < 0.34 ? 2.6 * u * u : 0.3 + (u - 0.34) * 1.06;
    // FROM WHERE THE WIND-UP LEFT HIM, which is behind the mark — so the bolt has
    // a real runway and covers 44 units more than it used to in the same time.
    const x0 = X_MARK - WINDUP_BACK;
    const x = x0 + (X_GONE - x0) * clamp01(e);
    // The wind-up settled on SPRINT's phase 0, so the run simply carries on from
    // there, distance-driven like every other walk in the piece.
    const ph = phaseOf(x0, x, SPRINT);
    // OUT OF THE COIL, not out of a stand. The bolt used to start from
    // WALK_PELV−5 while the wind-up left him at −17, so he snapped twelve units
    // upright on the first frame of the run — the pop that made the old exit read
    // as two clips spliced together. He uncoils across the first third instead,
    // which is what a sprinter's drive phase actually is.
    const pelvH = lerp(WALK_PELV - 17, WALK_PELV - 2, smooth(clamp01(u * 2.2))) +
      SPRINT.bob * (0.5 - 0.5 * Math.cos(2 * ph));
    const pel = { x, y: GROUND - pelvH };
    const h = gaitHands(ph, SPRINT, pel, DIR_OUT);
    return {
      x,
      pelvH,
      // Continues the wind-up's 0.66 and comes up as he reaches speed, rather
      // than starting at 0.40 and snapping the torso back on frame one.
      lean: lerp(0.66, 0.38, smooth(clamp01(u * 1.8))),
      neck: -0.1,
      face: 0,
      walking: 1,
      footL: footTarget(ph + Math.PI, SPRINT),
      footR: footTarget(ph, SPRINT),
      ...h,
      handK: 30,
      dir: DIR_OUT,
      vis: 1,
    };
  }

  // Off the stage. Nothing to draw, and saying so lets the component skip him
  // entirely rather than compositing a figure nobody can see behind the end card.
  const gone = talking(T5);
  return { ...gone, x: X_GONE, vis: 0 };
}

/** Blended hip half-width, shoulder half-width and arm foreshortening at `face`. */
export function proportions(face: number) {
  'worklet';
  const f = clamp01(face);
  return {
    hipW: lerp(PROFILE.hipW, FRONT.hipW, f),
    shW: lerp(PROFILE.shW, FRONT.shW, f),
    uarm: LEN.uarm * (lerp(PROFILE.armK, FRONT.armK, f) / FRONT.armK),
    farm: LEN.farm * (lerp(PROFILE.armK, FRONT.armK, f) / FRONT.armK),
  };
}

export { SPEAK_T0 };
