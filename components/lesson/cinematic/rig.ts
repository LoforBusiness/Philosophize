// ─────────────────────────────────────────────────────────────────────────────
// Shared stickman rig for cinematic lessons.
//
// This generalises the rig proven in components/home/StickmanStroll.tsx: the same
// two-bone IK, the same foot-lock, the same "measure the figure, don't guess it"
// discipline — but posed by TARGETS rather than by hard-coded angles, so a figure
// can box, walk, point and stand from one solver.
//
//   · legs  are driven by FOOT targets  (ground-relative: y 0 = planted)
//   · arms  are driven by FIST targets  (pelvis-relative: y negative = raised)
//
// Driving arms from fist targets is what makes boxing expressive — a punch is
// just "move the fist target out and let IK find the elbow", and a guard is
// "hold the fists by the chin". Angles could never express that as cleanly.
//
// ── RENDERING RULE (see components/welcome/ease.ts) ─────────────────────────
// On react-native-svg 15 + Fabric only transform/opacity repaint; animated
// geometry does NOT. Worse, an <Svg> has no partial invalidation — any animated
// child re-uploads the WHOLE surface to a GPU bitmap every frame, which measured
// ~10fps full-screen on an S24 Ultra (see WelcomeAnimation.tsx). So figures here
// are drawn as native RN Views composited by Reanimated transforms, and SVG is
// reserved for small bounded surfaces (the illustration board).
//
// This module is pure maths — it returns joint positions and transform arrays.
// It draws nothing, so it can feed either a View renderer or an SVG one.
// ─────────────────────────────────────────────────────────────────────────────

export const DEG = 180 / Math.PI;

/** Design stage. Everything is authored here, then scaled to fit the device. */
export const STAGE_W = 400;
export const STAGE_H = 800;

/**
 * Figure proportions in RIG UNITS (pre-scale), lifted verbatim from the approved
 * StickmanStroll figure so the character reads as the same person everywhere.
 */
export const U = {
  spine: 33, head: 16, thigh: 19, shin: 18,
  uarm: 17, farm: 16, hipW: 1, shW: 3, shDrop: 7, standH: 34,
};

/**
 * Stroke weights in rig units. `glove` is the fist radius when boxing — kept to
 * under half the head radius, because at 15 it was 75% of the head and the two
 * gloves plus the head fused into one unreadable mass.
 */
export const STR = { torso: 12, limb: 11, headR: 20, glove: 9 };

/**
 * Feet-to-crown in rig units: hip + spine + neck + the head's full DIAMETER.
 * Measured, not guessed — StickmanStroll shipped a version that undercounted the
 * head as a radius and had its crown clipped off. Use this for any fit maths.
 */
export const FIG_H = U.standH + U.spine + U.head + 2 * (STR.headR / 2);

// ── worklet maths ────────────────────────────────────────────────────────────

export function clamp01(x: number) { 'worklet'; return x < 0 ? 0 : x > 1 ? 1 : x; }
export function lerp(a: number, b: number, t: number) { 'worklet'; return a + (b - a) * t; }
export function ease01(t: number) { 'worklet'; const c = clamp01(t); return c * c * (3 - 2 * c); }
export function seg(p: number, a: number, b: number) {
  'worklet';
  const d = b - a;
  return clamp01(d === 0 ? 0 : (p - a) / d);
}
export function easeOutCubic(u: number) { 'worklet'; const c = clamp01(u); return 1 - Math.pow(1 - c, 3); }
export function easeOutBack(u: number) {
  'worklet';
  const c = clamp01(u), c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

export interface P2 { x: number; y: number }

/** Two-bone IK. Returns the mid joint; `bend` picks which way the elbow/knee bows. */
export function ik(hx: number, hy: number, tx: number, ty: number, l1: number, l2: number, bend: number): P2 {
  'worklet';
  const dx = tx - hx, dy = ty - hy;
  const dist = Math.hypot(dx, dy) || 1e-4;
  const ux = dx / dist, uy = dy / dist;
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, dist));
  const a = (d * d + l1 * l1 - l2 * l2) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  return { x: hx + ux * a - uy * h * bend, y: hy + uy * a + ux * h * bend };
}

// ── gaits ────────────────────────────────────────────────────────────────────
// Same shape as StickmanStroll's table. `tilt` is NEGATIVE for a forward lean,
// because the spine is built off Math.PI — a positive angle rocks the figure
// onto its heels.
export interface Gait {
  S: number; lift: number; stance: number; bob: number; bobSign: number;
  tilt: number; armBase: number; armSwing: number; standH: number;
}
export const WALK: Gait = {
  S: 34, lift: 13, stance: 0.62, bob: 3.0, bobSign: -1,
  tilt: 0.09, armBase: 0.09, armSwing: 0.42, standH: 34,
};

/**
 * Planted through stance, eased arc through swing — this is what stops the feet
 * skating. Returns GROUND-RELATIVE offsets (y 0 = planted, negative = lifted).
 */
export function footTarget(ph: number, g: Gait): P2 {
  'worklet';
  const u = ((ph / (2 * Math.PI)) % 1 + 1) % 1;
  if (u < g.stance) {
    const s = u / g.stance;
    return { x: g.S / 2 - g.S * s, y: 0 };
  }
  const s = (u - g.stance) / (1 - g.stance);
  const se = s * s * (3 - 2 * s);
  return { x: -g.S / 2 + g.S * se, y: -g.lift * Math.sin(Math.PI * s) };
}

/** Step phase from DISTANCE, not time — so a pause can't break the foot-lock. */
export function phaseFor(dist: number, g: Gait) {
  'worklet';
  return 2 * Math.PI * dist * g.stance / g.S;
}

// ── the pose ─────────────────────────────────────────────────────────────────

export interface Cfg {
  /** Stage position of the point between the feet, and the ground line. */
  x: number;
  groundY: number;
  /** Stage units per rig unit. */
  k: number;
  /** +1 faces right, -1 faces left. Mirrors the whole local frame. */
  dir: number;
  /** Torso lean. NEGATIVE leans forward. */
  tilt: number;
  /** Head tilt on top of the spine. Positive looks up. */
  neck: number;
  /** Vertical bounce of the pelvis, rig units, positive = higher. */
  bob: number;
  /** GROUND-relative foot targets (y 0 = planted, negative = lifted). */
  footL: P2;
  footR: P2;
  /** PELVIS-relative fist targets (y negative = raised). */
  fistL: P2;
  fistR: P2;
}

/** Pulls a target back onto a limb's reach circle if it sits outside it. */
export function reachTo(from: P2, target: P2, max: number): P2 {
  'worklet';
  const dx = target.x - from.x, dy = target.y - from.y;
  const d = Math.hypot(dx, dy);
  if (d <= max || d === 0) return target;
  return { x: from.x + (dx / d) * max, y: from.y + (dy / d) * max };
}

/** Pulls a target back onto the arm's reach circle if it sits outside it. */
export function reachable(sh: P2, target: P2): P2 {
  'worklet';
  return reachTo(sh, target, U.uarm + U.farm - 0.02);
}

export interface Joints {
  pel: P2; chest: P2; head: P2; shB: P2;
  shL: P2; shR: P2; hipL: P2; hipR: P2;
  kneeL: P2; kneeR: P2; ankL: P2; ankR: P2;
  elL: P2; elR: P2; wrL: P2; wrR: P2;
}

/**
 * Solves one figure into STAGE coordinates.
 *
 * Everything is built in a local frame whose origin is the pelvis and whose +x is
 * the facing direction, then mirrored by `dir` on the way out. That mirror is the
 * whole trick behind two figures facing each other: identical maths, opposite dir.
 */
export function solve(c: Cfg): Joints {
  'worklet';
  const pelUp = U.standH + c.bob;               // pelvis height above ground
  const up = Math.PI + c.tilt;

  const chest = { x: Math.sin(up) * U.spine, y: Math.cos(up) * U.spine };
  const ha = up + c.neck;
  const head = { x: chest.x + Math.sin(ha) * U.head, y: chest.y + Math.cos(ha) * U.head };
  const ax = { x: Math.cos(c.tilt), y: Math.sin(c.tilt) };
  const shB = { x: chest.x + Math.sin(c.tilt) * U.shDrop, y: chest.y + Math.cos(c.tilt) * U.shDrop };
  const shL = { x: shB.x - U.shW * ax.x, y: shB.y - U.shW * ax.y };
  const shR = { x: shB.x + U.shW * ax.x, y: shB.y + U.shW * ax.y };
  const hipL = { x: -U.hipW * ax.x, y: -U.hipW * ax.y };
  const hipR = { x: U.hipW * ax.x, y: U.hipW * ax.y };

  // Feet arrive ground-relative; lift them into the pelvis frame.
  //
  // CLAMPED TO THE LEG'S LENGTH, for exactly the reason fists are clamped to the
  // arm's — and this half was missing. The IK quietly gives up on an out-of-range
  // target and returns the best knee it can, but the shin is then DRAWN from that
  // knee to the target, so a foot the leg cannot reach STRETCHES the lower leg
  // like rubber rather than failing visibly. Two things hit it: a jump whose
  // pelvis rises further than the feet lift (the legs became two long straight
  // bars and the figure read as a lollipop), and a seated pose with the legs
  // stretched too far forward. Clamping puts the foot where the leg can actually
  // put it, which for an airborne figure is exactly right — the feet come up.
  const legMax = U.thigh + U.shin - 0.02;
  const ankL = reachTo(hipL, { x: c.footL.x, y: pelUp + c.footL.y }, legMax);
  const ankR = reachTo(hipR, { x: c.footR.x, y: pelUp + c.footR.y }, legMax);
  const kneeL = ik(hipL.x, hipL.y, ankL.x, ankL.y, U.thigh, U.shin, -1);
  const kneeR = ik(hipR.x, hipR.y, ankR.x, ankR.y, U.thigh, U.shin, -1);

  // Arms: IK straight to the fist target. bend +1 bows the elbow down-and-back,
  // which is what reads as a human arm whether guarding or reaching.
  //
  // The target must be CLAMPED to arm's length first. IK silently gives up when a
  // target is out of range — it returns the best elbow it can and the arm stops
  // short — but the fist is drawn at the target, so an over-reaching punch left a
  // glove floating 4 units off the end of the forearm. Clamping fixes it at the
  // source: within range, IK guarantees |elbow → target| is exactly the forearm.
  const fistL = reachable(shL, c.fistL);
  const fistR = reachable(shR, c.fistR);
  const elL = ik(shL.x, shL.y, fistL.x, fistL.y, U.uarm, U.farm, 1);
  const elR = ik(shR.x, shR.y, fistR.x, fistR.y, U.uarm, U.farm, 1);

  // Local → stage.
  const pelY = c.groundY - pelUp * c.k;
  const M = (p: P2): P2 => {
    'worklet';
    return { x: c.x + c.dir * p.x * c.k, y: pelY + p.y * c.k };
  };
  return {
    pel: M({ x: 0, y: 0 }), chest: M(chest), head: M(head), shB: M(shB),
    shL: M(shL), shR: M(shR), hipL: M(hipL), hipR: M(hipR),
    kneeL: M(kneeL), kneeR: M(kneeR), ankL: M(ankL), ankR: M(ankR),
    elL: M(elL), elR: M(elR), wrL: M(fistL), wrR: M(fistR),
  };
}

// ── pose vocabulary ──────────────────────────────────────────────────────────
// Each returns the parts of a Cfg that define a stance. The caller supplies
// placement (x / groundY / k / dir) and blends between poses with `lerpCfg`.

export interface Stance {
  tilt: number; neck: number; bob: number;
  footL: P2; footR: P2; fistL: P2; fistR: P2;
  /** Root motion toward the opponent, in stage units (a lunge or step). */
  adv: number;
}

// Two sines whose frequencies are not simple multiples never realign, so their
// sum has no visible period. This is the single most useful anti-loop trick in
// the file: every idle here — bounce, sway, breath, hand-drift — rides one of
// these instead of a bare sin(t), so a figure a viewer stares at for 20 seconds
// never reads as a repeating cycle.
export function life2(t: number, f1: number, f2: number, ph: number) {
  'worklet';
  return Math.sin(t * f1) * 0.62 + Math.sin(t * f2 + ph) * 0.38;
}

/**
 * Deterministic 0..1 from a seed — the same hash `gaitVary` deals its habits from,
 * pulled out so anything that needs to tell two identical figures apart can use it.
 */
export function rand01(seed: number, salt: number) {
  'worklet';
  const v = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/** Snap out to a peak then recover to guard — a punch's tempo. Earlier peak = snappier. */
export function jabEnv(u: number, peak: number) {
  'worklet';
  if (u <= peak) return easeOutCubic(u / peak);
  return 1 - ease01((u - peak) / (1 - peak));
}

/**
 * A PUNCH, with the wind-up that stops it reading as a machine part.
 *
 * `jabEnv` fires the fist from a standing start and eases it back — technically a
 * snap, but with no anticipation and no follow-through, which is most of what reads
 * as "blocky, obviously fake". Real strikes load first: the fist draws back a little,
 * *then* goes. The return also has to overshoot slightly past the guard and settle,
 * because an arm that stops dead exactly where it started looks keyframed.
 *
 * Returns slightly NEGATIVE during the load (the pose lerps away from the target,
 * i.e. the fist pulls back) and dips just under zero on the recovery.
 */
export function punchEnv(u: number, peak: number) {
  'worklet';
  const w = peak * 0.36;                          // the load
  if (u < w) return -0.2 * Math.sin(Math.PI * (u / w));
  if (u <= peak) return easeOutCubic((u - w) / (peak - w));
  const r = (u - peak) / (1 - peak);
  // settle: back past the guard by a hair, then in
  return (1 - ease01(r)) - 0.06 * Math.sin(Math.PI * ease01(r));
}

/** A smooth one-shot pulse, 0 → 1 → 0, with no corners. For footfalls and shuffles. */
export function pulse(u: number) {
  'worklet';
  return Math.sin(Math.PI * ease01(clamp01(u)));
}
/** Rise, hold briefly, fall — a block / duck / slip that returns to guard. */
export function holdEnv(u: number) {
  'worklet';
  return Math.sin(Math.PI * ease01(u));
}

/**
 * A GESTURE'S TRANSIENT RISE, and why every raised arm has to come back down.
 *
 * A beat holds until the reader taps, which can be ten seconds. Whatever pose the
 * figure is left in is what they stare at — so the settled pose has to be one a
 * person would actually still be in. It wasn't: `celebrate` and `reach-up-high`
 * rested with both arms locked straight overhead, `wave` rested mid-wave, `proclaim`
 * and `point-up` rested with an arm aloft. Fourteen of the forty-eight gestures
 * ended with a hand in the air and simply froze there.
 *
 * So the raised instant lives HERE instead of in the resting pose: the *Hold pose is
 * the arm-down version, and the *Live pose adds this rise on top. It must return to
 * exactly zero, and quickly — the next beat's transition blends out of the hold
 * (`mixStance(holdPrev, liveNext, tr)`), so any lift still up when the reader taps
 * would snap the arm down in one frame. 1.5s is long enough to read as a deliberate
 * gesture and short enough that it is always finished before a tap.
 *
 * Declared up here with the other envelopes because BOTH gesture libraries use it,
 * and a worklet that calls one declared later captures it as undefined.
 */
export function lift(bt: number): number {
  'worklet';
  return Math.sin(Math.min(bt, 1.5) / 1.5 * Math.PI);
}

// ── the guard, and the ten boxing moves ──────────────────────────────────────
// Every move takes (t, u): u is 0→1 progress through the move, t drives the idle
// underneath. Each move is the GUARD at u=0 and u=1, so consecutive moves meet at
// the guard and chain with no snap — the choreography never has to cross-fade.

/**
 * Hands up by the chin, weight low, feet shifting — a boxer's guard.
 *
 * `seed` IS NOT OPTIONAL DECORATION. Two fighters used to share one clock and one
 * set of frequencies, so they bounced, swayed and breathed on exactly the same
 * frame — and two figures moving in perfect sync read as one figure and its mirror
 * image, not as two people. It is the same defect `strideStance` learned to avoid
 * for walking, and the fight never got the lesson. Each fighter now gets its own
 * tempo, phase, bounce depth and stance width, dealt deterministically from `seed`
 * so it is stable across frames.
 */
export function guard(t: number, load = 0, seed = 0): Stance {
  'worklet';
  const r1 = rand01(seed, 1), r2 = rand01(seed, 2), r3 = rand01(seed, 3);
  const ph = r1 * 6.283;                        // this fighter's own place in the cycle
  const rate = 0.88 + r2 * 0.26;                // and their own tempo
  const b = life2(t * rate + ph, 5.0, 3.1, 1.3) * (1.35 + r3 * 0.55);
  const sway = life2(t * rate + ph * 0.6, 2.3, 1.37, 0.4) * (1.1 + r1 * 0.5);
  const w = r2 * 2 - 1;                         // slightly wider or narrower stance
  return {
    // Only a slight lean — a deep one closes the gap faster than the spacing can
    // hold, and the pair reads as one blob.
    tilt: -0.10, neck: -0.05, bob: b - 2,
    footL: { x: -15 + w - 1 + sway * 0.3, y: 0 },
    footR: { x: 13 + w + sway * 0.3, y: 0 },
    // HANDS AT THE JAW, NOT OUT IN FRONT OF IT. They used to sit at x 27 and 33 —
    // twenty-odd units ahead of a head whose centre is at x 6 — which is not a guard,
    // it is holding your arms out. Two figures doing that at punching range put four
    // 9-radius gloves in the same few units of paper, and the pair fused into one
    // black bridge between two heads at exactly the moments the fight was busiest.
    // Pulled back under the chin (the head's underside is about y −29) they stay
    // clear of the head disc, leave the middle of the ring empty for whatever is
    // actually being thrown, and give every punch a longer, more visible extension.
    fistL: { x: 17 + sway * 0.4 - load * 5, y: -30 + b * 0.4 },
    fistR: { x: 22 + sway * 0.4 - load * 7, y: -26 + b * 0.4 },
    adv: 0,
  };
}

// ── WHY THE PUNCH TARGETS ARE ALL INSIDE 33 ──────────────────────────────────
// The arm reaches U.uarm + U.farm = 33 from the shoulder, and `solve` CLAMPS any
// fist target past that back onto the reach circle. Deliberately — an unclamped
// target floats the glove off the end of the forearm. But it means every target
// beyond 33 collapses onto the same circle, and the old jab (55, −31) and cross
// (60, −29) both did: they landed 1.5 units apart, so two of the four punches were
// the SAME PICTURE and only the body behind them differed. Targets now sit inside
// the reach so each punch keeps its own line and height:
//     jab      straight, chin height, quick        (35, −30)
//     cross    committed, flatter, deeper lunge    (38, −25)
//     hook     around the side, higher, shorter    (29, −41)
//     uppercut rises from underneath, close in     (28, −49)
//     leadHook the FRONT hand, which never threw   (28, −40) from the left shoulder
//     bodyShot the only one that goes down         (32,  −8)
// Check a new one with hypot(target − shoulder) < 33, shoulders at about
// (5.6, −26) right and (−0.4, −26) left, and keep it clear of the head disc
// (centre ≈ (5.7, −48.6), radius 20) or the glove is swallowed.

/** Quick straight lead — snappy, little commitment. */
export function jab(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = punchEnv(u, 0.30);
  return {
    ...g, tilt: g.tilt - 0.04 * e, adv: 8 * e,
    fistR: { x: lerp(g.fistR.x, 35, e), y: lerp(g.fistR.y, -30, e) },
    fistL: { x: lerp(g.fistL.x, 24, e), y: g.fistL.y },
  };
}
/** Power straight — bigger lunge, more rotation into it, and a flatter line. */
export function cross(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = punchEnv(u, 0.42);
  return {
    ...g, tilt: g.tilt - 0.16 * e, neck: g.neck - 0.04 * e, adv: 18 * e,
    fistR: { x: lerp(g.fistR.x, 38, e), y: lerp(g.fistR.y, -25, e) },
    fistL: { x: lerp(g.fistL.x, 20, e), y: lerp(g.fistL.y, -33, e) },
  };
}
/** Comes around the side at head height, fist bowing up mid-swing. */
export function hook(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = punchEnv(u, 0.44);
  return {
    ...g, tilt: g.tilt - 0.08 * e, adv: 12 * e,
    fistR: { x: lerp(g.fistR.x, 29, e), y: lerp(g.fistR.y, -41, e) - Math.sin(Math.PI * e) * 6 },
    fistL: { x: lerp(g.fistL.x, 22, e), y: lerp(g.fistL.y, -37, e) },
  };
}
/** Rises from underneath, close in. */
export function uppercut(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = punchEnv(u, 0.46);
  return {
    ...g, tilt: g.tilt - 0.06 * e, bob: g.bob - Math.sin(Math.PI * u) * 2.5, adv: 11 * e,
    fistR: { x: lerp(g.fistR.x, 30, e), y: lerp(g.fistR.y, -47, e) },
    fistL: { x: lerp(g.fistL.x, 24, e), y: lerp(g.fistL.y, -34, e) },
  };
}
// ── AND WHY EVERY DEFENSIVE TARGET IS PUSHED OUT ─────────────────────────────
// The glove is a filled disc of radius STR.glove = 9 and the head is a disc of
// radius 20 centred near (2, −49). A fist within 20 of that centre does not read as
// a hand held by the face — it is DRAWN INSIDE THE HEAD and disappears, and the
// forearm behind it disappears with it. The old block put its lead fist at
// (18, −42), which is 14 from the head centre: the glove vanished, the arm vanished,
// and the figure became a lump with a bump on it. `hitReact` did the same at
// (12, −30). Both are used constantly, which is most of why the fight read as two
// blobs rather than two boxers.
//
// A guard genuinely IS hands-by-the-chin, so a little overlap is correct and the
// arm can't reach far enough to clear the head disc entirely at head height anyway.
// The rule is therefore the weaker one that actually matters: keep the fist CENTRE
// outside the head circle — hypot(fist − headCentre) > ~23 — so a lobe of glove
// always shows and the forearm stays visible against paper.

/** Both gloves up and tight, weight giving a touch — absorbing a shot. */
export function block(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return {
    ...g, tilt: g.tilt + 0.06 * e, neck: g.neck + 0.10 * e, adv: -3 * e,
    fistL: { x: lerp(g.fistL.x, 26, e), y: lerp(g.fistL.y, -40, e) },
    fistR: { x: lerp(g.fistR.x, 31, e), y: lerp(g.fistR.y, -37, e) },
  };
}
/** Drops under a punch — pelvis sinks, chin tucks. */
export function duck(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return { ...g, bob: g.bob - 13 * e, tilt: g.tilt - 0.06 * e, neck: g.neck - 0.20 * e, adv: 2 * e };
}
/** Leans off the line of fire without moving the feet. */
export function slip(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return { ...g, tilt: g.tilt + 0.20 * e, neck: g.neck + 0.12 * e, adv: -4 * e };
}
/** A quick step back to reset the distance, feet shuffling. */
export function backstep(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  // Two overlapping footfalls rather than max(0, sin), which has a corner at every
  // zero crossing and reads as a foot snapping off the floor.
  const a = pulse(u / 0.5), b = pulse((u - 0.45) / 0.5);
  return {
    ...g, adv: -15 * e,
    footL: { x: g.footL.x - 6 * a, y: -3.5 * a },
    footR: { x: g.footR.x - 5 * b, y: -3.5 * b },
  };
}
/** Takes a clean shot — head snaps back, weight rocks onto the heels. */
export function hitReact(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed);
  // DELAYED, so the glove gets there first. Punches peak at u ≈ 0.42; a reaction on
  // the same clock means the head has already left by the time the fist arrives, and
  // the shot visibly misses a man who is recoiling from nothing. Starting at 0.30
  // leaves a beat where the glove is ON the head, which is the whole picture.
  // A plain sine ramp, because smoothstep-then-pow rises far too fast at small d:
  // it had the head 70% of the way back by the time the fist arrived. This puts it
  // under 40% at the punch's peak (u 0.42) and peaks at u 0.65, after contact.
  const e = Math.sin(Math.PI * clamp01((u - 0.34) / 0.62));
  return {
    ...g, tilt: g.tilt + 0.34 * e, neck: g.neck + 0.34 * e, bob: g.bob - 2 * e, adv: -7 * e,
    footL: { x: g.footL.x - 6 * e, y: 0 }, footR: { x: g.footR.x - 3 * e, y: 0 },
    fistL: { x: lerp(g.fistL.x, 21, e), y: lerp(g.fistL.y, -29, e) },
    fistR: { x: lerp(g.fistR.x, 27, e), y: lerp(g.fistR.y, -25, e) },
  };
}

// ── the second wave of boxing, so a round stops being four punches on a loop ──
// Ten moves could only ever produce ten pictures, all thrown with the same hand at
// the same height, and a viewer watching a beat for ten seconds sees the cycle. The
// eight below add the things a real exchange has and this one did not: the FRONT
// hand throwing, a punch that goes DOWNWARD, defences lighter than a full block,
// movement that changes the SPACING rather than trading, and two beats of nothing
// happening — a feint and a stall — which is what gives a fight its rhythm.

/** The lead hand finally throws: a short hook from the front. */
export function leadHook(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = punchEnv(u, 0.38);
  return {
    ...g, tilt: g.tilt - 0.07 * e, adv: 10 * e,
    fistL: { x: lerp(g.fistL.x, 28, e), y: lerp(g.fistL.y, -40, e) - Math.sin(Math.PI * e) * 5 },
    fistR: { x: lerp(g.fistR.x, 27, e), y: lerp(g.fistR.y, -32, e) },
  };
}
/** A dig to the body — the one punch that travels DOWN, so the fight isn't all head height. */
export function bodyShot(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = punchEnv(u, 0.38);
  return {
    ...g, tilt: g.tilt - 0.20 * e, neck: g.neck + 0.10 * e, bob: g.bob - 6 * e, adv: 14 * e,
    fistR: { x: lerp(g.fistR.x, 32, e), y: lerp(g.fistR.y, -8, e) },
    fistL: { x: lerp(g.fistL.x, 22, e), y: lerp(g.fistL.y, -36, e) },
  };
}
/** A flick of the lead hand that turns a punch aside — quicker and lighter than a block. */
export function parry(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return {
    ...g, tilt: g.tilt + 0.03 * e, neck: g.neck + 0.04 * e, adv: -2 * e,
    fistL: { x: lerp(g.fistL.x, 30, e), y: lerp(g.fistL.y, -33, e) },
  };
}
/** Rolls under the shot and comes up the other side — a weave, not a straight drop. */
export function roll(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed);
  const e = holdEnv(u);
  const across = Math.sin(2 * Math.PI * ease01(u));   // down, through, up
  return {
    ...g,
    bob: g.bob - 15 * e,
    tilt: g.tilt + across * 0.16,
    neck: g.neck - 0.10 * e,
    adv: 4 * e,
    fistL: { x: g.fistL.x + 1 * e, y: g.fistL.y + 5 * e },
    fistR: { x: g.fistR.x, y: g.fistR.y + 3 * e },
  };
}
/** A fake: the lead shoulder and hand twitch out and pull straight back. Nothing lands. */
export function feint(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = jabEnv(u, 0.20);
  return {
    ...g, tilt: g.tilt - 0.05 * e, adv: 5 * e,
    fistL: { x: lerp(g.fistL.x, 30, e), y: g.fistL.y + 2 * e },
  };
}
/** Circling — the only move that changes the DISTANCE rather than trading through it. */
export function circleStep(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed);
  const e = holdEnv(u);
  const a = pulse(u / 0.45), b = pulse((u - 0.5) / 0.45);
  return {
    ...g, adv: -6 * e,
    footL: { x: g.footL.x - 7 * a, y: -4 * a },
    footR: { x: g.footR.x - 6 * b, y: -4 * b },
  };
}
/** Arms in, leaning together — the exchange stalls and nothing happens. */
export function clinch(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return {
    ...g, tilt: g.tilt - 0.14 * e, neck: g.neck + 0.06 * e, adv: 16 * e,
    fistL: { x: lerp(g.fistL.x, 25, e), y: lerp(g.fistL.y, -22, e) },
    fistR: { x: lerp(g.fistR.x, 29, e), y: lerp(g.fistR.y, -18, e) },
  };
}
/** Hands drop, chin comes up — the "come on then" that is this whole lesson's point. */
export function taunt(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return {
    ...g, tilt: g.tilt + 0.06 * e, neck: g.neck + 0.14 * e, adv: 3 * e,
    fistL: { x: lerp(g.fistL.x, -14, e), y: lerp(g.fistL.y, 2, e) },
    fistR: { x: lerp(g.fistR.x, 26, e), y: lerp(g.fistR.y, -6, e) },
  };
}

// ── the third wave, so an exchange can actually resolve ──────────────────────
// Everything above either throws or answers a single punch. A round also needs the
// things that happen BETWEEN punches and AFTER one lands, or the fight is a list of
// attacks with no consequences: a shot that loops over the top of a guard, a
// deflection made with the body instead of the hands, a shove to make room, and a
// stagger — the one thing that says a punch actually hurt.

/** Loops over the top of a high guard. The one punch that comes DOWN onto the target. */
export function overhand(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = punchEnv(u, 0.46);
  const arc = Math.sin(Math.PI * clamp01(e));      // rises on the way out, drops in
  return {
    ...g, tilt: g.tilt - 0.14 * e, neck: g.neck - 0.05 * e, adv: 15 * e,
    fistR: { x: lerp(g.fistR.x, 34, e), y: lerp(g.fistR.y, -33, e) - arc * 14 },
    fistL: { x: lerp(g.fistL.x, 22, e), y: lerp(g.fistL.y, -36, e) },
  };
}
/** Turns the lead shoulder in so the punch slides off it — a defence made with the body. */
export function shoulderRoll(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return {
    ...g, tilt: g.tilt + 0.13 * e, neck: g.neck + 0.20 * e, bob: g.bob - 4 * e, adv: -5 * e,
    fistL: { x: lerp(g.fistL.x, 20, e), y: lerp(g.fistL.y, -30, e) },
    fistR: { x: lerp(g.fistR.x, 24, e), y: lerp(g.fistR.y, -22, e) },
  };
}
/** A shove into the chest to make room. Both hands, and the other man goes back. */
export function pushOff(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = punchEnv(u, 0.34);
  return {
    ...g, tilt: g.tilt - 0.08 * e, adv: 9 * e,
    fistL: { x: lerp(g.fistL.x, 31, e), y: lerp(g.fistL.y, -24, e) },
    fistR: { x: lerp(g.fistR.x, 33, e), y: lerp(g.fistR.y, -20, e) },
  };
}
/**
 * Hurt. Not `hitReact` — that is a head snapping back and recovering on the spot.
 * This is balance actually lost: the feet cross behind, the body goes with them, and
 * it takes the whole exchange to get back. It is what makes a landed shot mean
 * something instead of being a pose the other man happens to be in.
 */
export function stagger(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed);
  const e = Math.sin(Math.PI * clamp01((u - 0.34) / 0.62));  // the punch lands first
  const step = pulse((u - 0.42) / 0.52);
  return {
    ...g,
    tilt: g.tilt + 0.30 * e, neck: g.neck + 0.26 * e, bob: g.bob - 5 * e, adv: -16 * e,
    footL: { x: g.footL.x - 13 * step, y: -4 * step },
    footR: { x: g.footR.x - 7 * e, y: 0 },
    fistL: { x: lerp(g.fistL.x, 22, e), y: lerp(g.fistL.y, -22, e) },
    fistR: { x: lerp(g.fistR.x, 27, e), y: lerp(g.fistR.y, -18, e) },
  };
}
/** Light on the toes, in and out — the resting state of a fighter who is not tired. */
export function bounce(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed);
  const hop = pulse(u / 0.5) + pulse((u - 0.5) / 0.5);
  return {
    ...g, bob: g.bob + hop * 1.6, adv: 4 * Math.sin(2 * Math.PI * ease01(u)),
    footL: { x: g.footL.x, y: -3.5 * pulse(u / 0.5) },
    footR: { x: g.footR.x, y: -3.5 * pulse((u - 0.5) / 0.5) },
  };
}
/** Pulls the head straight back off the end of a punch, feet planted. */
export function leanBack(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return {
    ...g, tilt: g.tilt + 0.26 * e, neck: g.neck + 0.06 * e, bob: g.bob - 2 * e, adv: -8 * e,
    fistL: { x: g.fistL.x - 3 * e, y: g.fistL.y - 2 * e },
  };
}
/** Two of the lead hand, quick — the rhythm the single jab cannot make. */
export function doubleJab(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed);
  const e = u < 0.5 ? punchEnv(u / 0.5, 0.30) : punchEnv((u - 0.5) / 0.5, 0.30) * 0.86;
  return {
    ...g, tilt: g.tilt - 0.04 * e, adv: 9 * e,
    fistL: { x: lerp(g.fistL.x, 30, e), y: lerp(g.fistL.y, -32, e) },
    fistR: { x: lerp(g.fistR.x, 28, e), y: g.fistR.y },
  };
}
/** A glove brushed across the nose. Nothing happens; that is the point of it. */
export function wipe(t: number, u: number, seed = 0): Stance {
  'worklet';
  const g = guard(t, 0, seed), e = holdEnv(u);
  return {
    ...g, neck: g.neck + 0.04 * e,
    fistL: { x: lerp(g.fistL.x, 26, e) + Math.sin(u * 18) * 2 * e, y: lerp(g.fistL.y, -37, e) },
  };
}

/**
 * PEAK ROOT MOTION PER CODE, so a scene can work out how far apart to stand.
 *
 * `adv` is how far a move carries the whole body toward the opponent at its peak.
 * A scene that wants a punch to actually ARRIVE has to know it: the separation the
 * reader sees at the moment of contact is `base − MOVE_ADV[attacker] −
 * MOVE_ADV[defender]`, and if that is not near 64 the glove lands in open paper
 * (too far) or inside the other man's head (too close). Kept next to the moves so
 * it cannot drift away from them.
 */
export const MOVE_ADV: number[] = [
  0,    // 0 guard
  8,    // 1 jab
  18,   // 2 cross
  12,   // 3 hook
  11,   // 4 uppercut
  -3,   // 5 block
  2,    // 6 duck
  -4,   // 7 slip
  -15,  // 8 backstep
  -7,   // 9 hit
  10,   // 10 lead hook
  14,   // 11 body shot
  -2,   // 12 parry
  4,    // 13 roll
  5,    // 14 feint
  -6,   // 15 circle
  16,   // 16 clinch
  3,    // 17 taunt
  15,   // 18 overhand
  -5,   // 19 shoulder roll
  9,    // 20 push off
  -16,  // 21 stagger
  0,    // 22 bounce
  -8,   // 23 lean back
  9,    // 24 double jab
  0,    // 25 wipe
];

// ── THE GLOVE-OUT-OF-THE-HEAD GUARD RAIL ─────────────────────────────────────
// Fixing the individual targets above is necessary but NOT sufficient, because the
// head does not stay still: `neck` tips it forward, and a duck (−0.25) or an
// uppercut swings the 20-radius head disc straight onto hands that were perfectly
// clear in the upright guard. Every such combination is a separate bug waiting to
// be found by eye on a phone, and one was — a boxer whose head, glove and arm had
// fused into a single lump with a bump on it.
//
// So the clearance is enforced HERE, once, for every boxing pose that exists or
// ever will. The head centre is re-derived from the pose's own tilt and neck (the
// same maths `solve` uses), and any fist inside GLOVE_CLEAR of it is pushed back
// out along the line between them. 26 puts the glove centre 6 units outside the
// head's edge, so a 9-radius glove overlaps by only 3 and still reads as its own
// shape. Where that push would take a fist past the arm's 33-unit reach, `solve`
// clamps it back — but only as far as the reach circle, which measurement puts at
// 25 from the head centre in the worst case (a full uppercut), still clear.
const GLOVE_CLEAR = 26;

/**
 * Head centre in the pelvis frame, from a stance's tilt and neck. Exported because
 * anything that has to POINT at a figure — a speech bubble's tail, a thread, a label
 * — needs the head, not the feet: a leaning figure's head sits several units ahead of
 * its x, and two figures leaning toward each other are noticeably closer at the head
 * than at the ground.
 */
export function headAt(tilt: number, neck: number): P2 {
  'worklet';
  const up = Math.PI + tilt;
  const cx = Math.sin(up) * U.spine, cy = Math.cos(up) * U.spine;
  const ha = up + neck;
  return { x: cx + Math.sin(ha) * U.head, y: cy + Math.cos(ha) * U.head };
}

/** Push a glove out of the head disc so the two always read as separate shapes. */
function clearHead(f: P2, h: P2): P2 {
  'worklet';
  const dx = f.x - h.x, dy = f.y - h.y;
  const d = Math.hypot(dx, dy);
  if (d >= GLOVE_CLEAR) return f;
  if (d < 1e-3) return { x: h.x + GLOVE_CLEAR, y: h.y };
  return { x: h.x + (dx / d) * GLOVE_CLEAR, y: h.y + (dy / d) * GLOVE_CLEAR };
}

/** The raw pose for a code. Declared BEFORE boxMove: a worklet that calls a worklet
 *  declared later captures it as undefined and takes down the UI thread. */
function boxPose(code: number, t: number, u: number, seed: number): Stance {
  'worklet';
  if (code === 1) return jab(t, u, seed);
  if (code === 2) return cross(t, u, seed);
  if (code === 3) return hook(t, u, seed);
  if (code === 4) return uppercut(t, u, seed);
  if (code === 5) return block(t, u, seed);
  if (code === 6) return duck(t, u, seed);
  if (code === 7) return slip(t, u, seed);
  if (code === 8) return backstep(t, u, seed);
  if (code === 9) return hitReact(t, u, seed);
  if (code === 10) return leadHook(t, u, seed);
  if (code === 11) return bodyShot(t, u, seed);
  if (code === 12) return parry(t, u, seed);
  if (code === 13) return roll(t, u, seed);
  if (code === 14) return feint(t, u, seed);
  if (code === 15) return circleStep(t, u, seed);
  if (code === 16) return clinch(t, u, seed);
  if (code === 17) return taunt(t, u, seed);
  if (code === 18) return overhand(t, u, seed);
  if (code === 19) return shoulderRoll(t, u, seed);
  if (code === 20) return pushOff(t, u, seed);
  if (code === 21) return stagger(t, u, seed);
  if (code === 22) return bounce(t, u, seed);
  if (code === 23) return leanBack(t, u, seed);
  if (code === 24) return doubleJab(t, u, seed);
  if (code === 25) return wipe(t, u, seed);
  return guard(t, 0, seed);
}

/**
 * Dispatch a boxing move by numeric code, so the choreography is plain data.
 *  0 guard · 1 jab · 2 cross · 3 hook · 4 uppercut · 5 block · 6 duck · 7 slip ·
 *  8 backstep · 9 hit · 10 lead hook · 11 body shot · 12 parry · 13 roll ·
 * 14 feint · 15 circle · 16 clinch · 17 taunt · 18 overhand · 19 shoulder roll ·
 * 20 push off · 21 stagger · 22 bounce · 23 lean back · 24 double jab · 25 wipe.
 *
 * `seed` separates one fighter's idle from another's — always pass a different one
 * per figure, or they move as a single mirrored body. Every pose leaves here with
 * its gloves pushed clear of the head (see the guard rail above).
 */
export function boxMove(code: number, t: number, u: number, seed = 0): Stance {
  'worklet';
  const s = boxPose(code, t, u, seed);
  const h = headAt(s.tilt, s.neck);
  return { ...s, fistL: clearHead(s.fistL, h), fistR: clearHead(s.fistR, h) };
}

/**
 * Relaxed standing, but never a scarecrow. Real people at rest are in constant
 * small motion, so this layers four non-periodic channels: a visible breath, a
 * slow weight rock that shifts the stance and leans the torso, a head that drifts
 * and glances, and hands that never sit perfectly still. All on `life2`, so none
 * of it repeats.
 */
export function stand(t: number): Stance {
  'worklet';
  const breath = 0.7 * (0.5 - 0.5 * Math.cos(t * 1.6)) + 0.4 * (0.5 - 0.5 * Math.cos(t * 1.02));
  const ws = life2(t, 0.33, 0.19, 0.7);         // slow weight rock, in the torso only
  const hd = life2(t, 0.5, 0.31, 1.1);          // head drift / glance
  // WEIGHT TRANSFER. Nobody stands evenly on both legs for long — they settle onto
  // one, then drift onto the other. The pelvis can't be moved sideways directly (x
  // is defined as the point between the feet), so sliding BOTH foot targets the
  // other way is the same thing: the body rides out over the loaded foot and sinks
  // a little onto it. Kept under two units deliberately. A wide, sliding stance is
  // exactly what once made these near-straight legs read as segmented bars with a
  // gap between them, and that is a far worse defect than a stiff stance.
  const wt = life2(t, 0.21, 0.13, 2.3);
  // And every so often they RE-PLANT: the unloaded foot lifts a little and sets
  // back down. A narrow pulse raised off a slow sine, so it lands about every
  // fifteen seconds and never on the same beat as anything else.
  const sp = Math.sin(t * 0.37 + 1.2);
  const adj = sp > 0 ? Math.pow(sp, 26) * 2.4 : 0;
  return {
    tilt: 0.05 + ws * 0.02 + wt * 0.012,
    neck: -0.02 + hd * 0.05,
    bob: breath - Math.abs(wt) * 0.5,
    // Feet PLANTED and close, so the legs are near-vertical and read as two solid
    // bars. The wide, sliding stance made the near-straight legs look segmented and
    // opened a paper gap between them; the boxing stance only hid it by being deep
    // and bent. Life comes from the torso/head/arms and the small weight transfer
    // above, never from a big stride-width slide.
    footL: { x: -4 - wt * 1.7, y: wt > 0 ? -adj : 0 },
    footR: { x: 4 - wt * 1.7, y: wt > 0 ? 0 : -adj },
    fistL: { x: -5 + ws * 1.2 - wt * 1.2, y: 6 + hd },
    fistR: { x: 5 + ws * 1.2 - wt * 1.2, y: 6 - hd },
    adv: 0,
  };
}

// ── narrator gestures ────────────────────────────────────────────────────────
// A gesture is a SETTLED pose (`narratorHold`) plus a living overlay
// (`narratorLive`). The one-shot raise that used to live here is GONE: it read
// the beat clock, which resets to 0 on every tap, so the arm snapped back to the
// neutral stand and re-raised on each advance — the glitch. Now the scene blends
// the previous beat's hold into the new beat's live pose over the same smooth
// transition the camera uses, so the hand travels from wherever it was straight
// into the next gesture. It never snaps home.
//
// `narratorLive` adds the life the settled pose can't: while the line is being
// read the free hand beats with the speech and the head nods; some gestures have
// their own accent (an emphatic dip, counted chops, a sweep landing into place).
// Everything additive is 0 at bt=0, so entering a beat is still seamless.

/**
 * BOTH hands, because one is not enough to tell gestures apart.
 *
 * This used to take only the working hand's target and pin the other one at the
 * figure's side. That was survivable while the gestures rested in their raised
 * positions — a hand at −48 and a hand at −30 are obviously different pictures —
 * but once every gesture correctly rests with its arm DOWN, the only thing left
 * distinguishing them was a few units of height on one wrist, and all seven
 * settled into what looked like the same pose. A silhouette is what reads at a
 * glance, so the left hand and the lean have to carry their share of it.
 */
function gestureHold(
  t: number, lx: number, ly: number, rx: number, ry: number, tneck: number, tilt = 0,
): Stance {
  'worklet';
  const base = stand(t);                        // inherit breath + weight rock + head drift
  const dx = life2(t, 1.3, 0.83, 0.7) * 1.3;    // the gesturing hand keeps drifting
  const dy = life2(t, 1.05, 0.61, 1.9) * 1.1;
  const dl = life2(t, 0.97, 0.59, 2.6) * 0.9;   // and the other one is never quite still
  const hd = life2(t, 0.5, 0.31, 1.1);
  return {
    ...base,
    tilt: -0.03 + tilt + (base.tilt - 0.05),    // gesture lean, keeping the weight rock
    neck: tneck + hd * 0.03,
    fistR: { x: rx + dx, y: ry + dy },
    fistL: { x: lx + dl, y: ly },
  };
}

/**
 * The settled target pose for a gesture. 0 open · 1 emphatic · 2 board · 3 count ·
 * 4 chin · 5 sweep · 6 up.
 *
 * THESE ARE THE ARM-DOWN VERSIONS. They used to be the raised ones, which meant a
 * beat that waits for a tap froze the narrator with his hand in the air for as long
 * as the reader took to read — and this library, unlike `emoteHold`, never got the
 * fix. Two of them were worse than frozen: code 4 rested its fist at (9, −50) and
 * code 6 at (12, −56), and the head is a 20-radius disc centred near (0, −49), so
 * BOTH hands sat inside the skull and the forearm behind them vanished with it. The
 * thinking pose — the one the Socrates beat uses — had no visible hand at all.
 * The raise now lives in `narratorLive`'s LIFT block and comes back down.
 */
export function narratorHold(code: number, t: number): Stance {
  'worklet';
  //                          left hand      right hand    neck    lean
  if (code === 1) return gestureHold(t, -16, -12, 27, -17, -0.04, -0.03); // emphatic: both hands in, leaning at you
  if (code === 2) return gestureHold(t, -7, 5, 31, -13, -0.15, 0);        // toward the easel, other arm hanging
  if (code === 3) return gestureHold(t, 14, -14, 28, -20, -0.06, 0);      // counting onto the flat of one hand
  if (code === 4) return gestureHold(t, -4, 5, 9, -32, 0.12, 0.02);       // hand AT THE CHIN — thinking
  if (code === 5) return gestureHold(t, -20, 0, 33, -19, -0.10, 0);       // arms opposed, wide — the sweep
  if (code === 6) return gestureHold(t, -9, -8, 26, -18, -0.14, -0.02);   // hand on hip, other about to rise
  return gestureHold(t, -6, 6, 32, -20, -0.03, 0);                        // 0 open hand, explaining
}

/** The settled pose plus the beat's living overlay: speech beats, head nods, per-gesture accents. */
export function narratorLive(code: number, t: number, bt: number): Stance {
  'worklet';
  const s = narratorHold(code, t);
  const speech = clamp01(1 - bt / 2.4);          // energetic while the line reveals, then eases off
  const talk = Math.sin(bt * 8.5) * speech * 2.4;
  const nod = Math.sin(bt * 8.5 + 0.4) * speech * 0.018;
  let dy = 0, dx = 0, dn = 0;
  if (code === 3) dy = Math.sin(bt * 7.2) * Math.max(0, 1 - bt / 1.6) * 3;     // counted chops
  if (code === 5) dx = lerp(-30, 0, ease01(bt / 1.0));                         // sweep into place

  // ── LIFT: the raised instant, which then comes back down ───────────────────
  // Peaks are the poses these gestures used to REST in, chosen to clear the head
  // disc: presenting tops out at (28, −48) and pointing up at (26, −50), both just
  // outside the 20-radius head and just inside the arm's 33-unit reach.
  const L = lift(bt);
  if (code === 1) dy -= 20 * L;                                                // emphatic
  if (code === 2) { dy -= 32 * L; dn -= 0.08 * L; }                            // up at the board
  if (code === 3) dy -= 16 * L;                                                // up to count
  if (code === 5) dy -= 20 * L;                                                // sweeps at head height
  if (code === 6) { dy -= 32 * L; dn -= 0.12 * L; }                            // point up
  return {
    ...s,
    neck: s.neck + nod + dn,
    fistR: { x: s.fistR.x + dx, y: s.fistR.y + talk + dy },
  };
}

// ── the wide expressive gesture library ──────────────────────────────────────
// A much larger movement vocabulary than the 7 narrator gestures, so a scene can
// rotate through many distinct poses and never read as a loop. Each code is a
// SETTLED pose (emoteHold) plus a living overlay (emoteLive) that gives it its own
// secondary motion. All built on stand(), so breath / weight-rock / head-drift
// come for free. Fist targets are pelvis-relative (y negative = raised); keep |x|
// under ~34 so the arm never over-reaches its IK clamp.

/** Set both fists on a base stance. */
function hands(base: Stance, lx: number, ly: number, rx: number, ry: number): Stance {
  'worklet';
  return { ...base, fistL: { x: lx, y: ly }, fistR: { x: rx, y: ry } };
}

/**
 * The settled pose for gesture `code`. 0 neutral · 1 explain · 2 present-up ·
 * 3 count · 4 think · 5 sweep · 6 point-up · 7 both-wide · 8 shrug · 9 hand-on-hip ·
 * 10 arms-crossed · 11 forehead · 12 scratch-head · 13 point-forward · 14 reach-out ·
 * 15 recoil · 16 celebrate · 17 bow · 18 cower · 19 adore · 20 hold-up · 21 weigh ·
 * 22 clutch-chest · 23 wave ·
 * — the second wave (24–39), added for the branch-3/4 lessons —
 * 24 reach-up-high · 25 gaze-up-wonder · 26 stamp · 27 pull-lever · 28 power-pose ·
 * 29 push-out · 30 offer-up · 31 receive · 32 sway-conduct · 33 release-open ·
 * 34 shield-eyes · 35 proclaim · 36 sign-write · 37 grasp-pull · 38 gesture-down ·
 * 39 clasp-forward ·
 * — the third wave (40–47), for the lessons where the figure WALKS to a prop and
 *   works at it (a whiteboard, an easel, a chart, a fence) —
 * 40 write-on-board · 41 tap-high-on-board · 42 carry-load · 43 set-it-down ·
 * 44 hands-behind-back (contemplative stroll) · 45 double-take · 46 slump ·
 * 47 frame-it-up (both hands sizing something) ·
 * — floor level (48–49). 46 "slump" is a STANDING slump; if the script says
 *   someone is down, it has to be one of these —
 * 48 sitting on the floor · 49 down on one knee beside someone.
 */
export function emoteHold(code: number, t: number): Stance {
  'worklet';
  const s = stand(t);
  const g = life2(t, 1.25, 0.8, 0.6) * 1.3;     // active-hand drift so a hold never freezes
  if (code === 1) return hands(s, -6, 6, 32 + g, -22);
  if (code === 2) return { ...hands(s, -6, 6, 30 + g, -12), neck: -0.04 };
  if (code === 3) return { ...hands(s, -6, 6, 30 + g, -16), neck: -0.05 };
  // The hand rests AT THE CHIN — the head is a 20-radius disc centred on (0, −49),
  // so its underside is about y −29. At −50 the fist sat dead in the middle of the
  // skull and vanished, which read as a forearm ending in the face rather than a
  // thinker. This is the most-used gesture in the app, so it is worth the two units.
  if (code === 4) return { ...hands(s, -6, 5, 9, -32 + g), neck: 0.12 };
  if (code === 5) return hands(s, -24, 0, 31 + g, -18);
  if (code === 6) return { ...hands(s, -8, 4, 20, -28), neck: -0.08 };
  if (code === 7) return hands(s, -32 - g, -18, 32 + g, -18);
  if (code === 8) return { ...hands(s, -26, -6, 26, -6), tilt: s.tilt + 0.03, bob: s.bob + 3, neck: 0.05 };
  if (code === 9) return { ...hands(s, -6, 6, 9, -8), tilt: s.tilt + 0.02 };
  // ARMS CROSSED, and BOTH forearms have to sit forward of the torso to exist at all.
  // At (9, −24) / (−9, −24) the hands were almost on the spine, so both forearms lay
  // along a 12-thick torso in the same ink and the pose rendered as a figure with no
  // arms — the defect the leaning figure on the completion screen had (B16b). Moving
  // one hand behind does not help either: an ink forearm on an ink torso is invisible
  // wherever it is. Folded IN FRONT, the two forearms are two horizontals against open
  // paper, one slightly below the other, which is what folded arms look like in profile.
  if (code === 10) return { ...hands(s, 18, -22, 13, -17), tilt: s.tilt + 0.02 };
  // HAND TO THE HEAD — AT THE TEMPLE, NOT THROUGH IT.
  //
  // These targeted (6, −52) and (4, −56) against a head centred near (0, −49) with a
  // radius of 20, so a fist of radius 5.5 sat 13 and 10 units INSIDE the skull: not
  // "a hand on the forehead", but no hand at all. Nine beats across the app play
  // `scratch-head` and the reader sees a figure standing perfectly still.
  //
  // The arm cannot fix this by reaching higher. It is 33 units from a shoulder 23
  // below the head centre, so the crown is simply out of range — the reachable part
  // of the head's rim is its FRONT, about eye level. A fist centred on the rim half
  // overlaps and half shows, which is exactly how "touching my own head" should read.
  // The two are told apart by the head and the far hand, not by the near fist.
  if (code === 11) return { ...hands(s, -6, 6, 17, -47), neck: 0.2, tilt: s.tilt + 0.03 };
  if (code === 12) return { ...hands(s, -14, -6, 21, -47), neck: -0.07 };
  if (code === 13) return { ...hands(s, -6, 6, 34, -16), tilt: s.tilt - 0.05 };
  if (code === 14) return { ...hands(s, -24, -16, 24, -16), tilt: s.tilt - 0.04 };
  if (code === 15) return { ...hands(s, -16, -6, 16, -6), tilt: s.tilt + 0.10, neck: 0.04, footL: { x: -9, y: 0 }, footR: { x: 9, y: 0 } };
  if (code === 16) return { ...hands(s, -16, -4, 16, -4), neck: -0.04 };
  if (code === 17) return { ...hands(s, -3, 6, 5, 6), tilt: s.tilt - 0.30, neck: 0.22, bob: s.bob - 3 };
  if (code === 18) return { ...hands(s, -12, -16, 12, -16), bob: s.bob - 14, tilt: s.tilt + 0.06, neck: 0.10, footL: { x: -11, y: 0 }, footR: { x: 11, y: 0 } };
  if (code === 19) return { ...hands(s, -12, -10, 14, -10), neck: -0.04 };
  if (code === 20) return { ...hands(s, -6, 6, 20, -18 + g) };
  if (code === 21) return hands(s, -26, -8, 26, -8);
  if (code === 22) return { ...hands(s, -6, 5, 4, -30), neck: 0.02 };
  if (code === 23) return { ...hands(s, -6, 6, 28, -14) };
  // ── the second wave ─────────────────────────────────────────────────────────
  if (code === 24) return { ...hands(s, -16, -4 + g, 16, -6 + g), neck: -0.06, tilt: s.tilt - 0.02 };       // reached up, arms now down
  if (code === 25) return { ...hands(s, -8, 2, 18 + g, -16), neck: -0.10, tilt: s.tilt - 0.02 };            // still looking up, hand lowered
  if (code === 26) return { ...hands(s, -6, 6, 24, -12), neck: -0.04, tilt: s.tilt - 0.03 };                // stamp done, arm back down
  if (code === 27) return { ...hands(s, 18, 4, 26, 8), tilt: s.tilt - 0.10, neck: 0.06 };                    // grip the lever, both hands low-forward
  if (code === 28) return { ...hands(s, -9, -6, 9, -6), tilt: s.tilt - 0.05, bob: s.bob + 2, neck: -0.06 };  // power pose, both hands on hips, chest up
  if (code === 29) return { ...hands(s, -30 - g, -14, 30 + g, -14), tilt: s.tilt + 0.02 };                   // press outward against the walls
  if (code === 30) return { ...hands(s, 12, -18, 22, -24), tilt: s.tilt - 0.06, neck: -0.08 };               // offer up with both hands
  if (code === 31) return { ...hands(s, 14, -2, 24, -6), tilt: s.tilt - 0.03, neck: 0.04 };                  // receive, hands cupped forward
  if (code === 32) return { ...hands(s, -24, -22, 24, -22), tilt: s.tilt };                                  // conduct / sway (live oscillates both hands)
  if (code === 33) return { ...hands(s, -26, -4, 26, -4), neck: -0.06, tilt: s.tilt - 0.03 };                // released, arms open but down
  // A shielding hand goes IN FRONT of the eyes, not on them: (4, −48) was dead centre
  // of the head disc and the hand vanished (three beats use this).
  if (code === 34) return { ...hands(s, -8, 5, 23, -41), neck: 0.08, tilt: s.tilt + 0.06 };                 // shield eyes from a bright light
  if (code === 35) return { ...hands(s, -6, 6, 28, -18 + g), neck: -0.05, tilt: s.tilt - 0.03 };            // proclaimed, arm back down
  if (code === 36) return { ...hands(s, -6, 6, 26, -2), tilt: s.tilt - 0.06, neck: 0.10 };                  // sign / write on a surface
  if (code === 37) return { ...hands(s, -6, 5, 10, -14), tilt: s.tilt - 0.04 };                             // the catch, already pulled in
  if (code === 38) return { ...hands(s, -6, 6, 22, 6), neck: 0.16, tilt: s.tilt + 0.03 };                   // gesture down at the ground / shared floor
  if (code === 39) return { ...hands(s, -6, 6, 28, -8), tilt: s.tilt - 0.05, neck: 0.02 };                  // reach forward to clasp / covenant
  // ── the third wave: working at a prop ───────────────────────────────────────
  // These assume the prop is just in FRONT of the figure (the scene walks them to
  // it and turns them to face it), so the working hand stays forward and visible —
  // never tucked behind the head or crossing the face.
  if (code === 40) return { ...hands(s, -7, 6, 30 + g, -40), neck: -0.10, tilt: s.tilt - 0.05 };  // write on a board
  if (code === 41) return { ...hands(s, -7, 6, 31, -54), neck: -0.18, tilt: s.tilt - 0.05 };      // tap high on the board
  if (code === 42) return { ...hands(s, 18, 2, 26, 2), tilt: s.tilt + 0.04, bob: s.bob - 2 };      // carry a load, both hands forward-low
  if (code === 43) return { ...hands(s, 16, 10, 24, 12), tilt: s.tilt - 0.14, bob: s.bob - 9, neck: 0.14 }; // set it down
  if (code === 44) return { ...hands(s, -12, 2, -15, 4), neck: -0.06, tilt: s.tilt - 0.02 };       // hands clasped behind the back
  if (code === 45) return { ...hands(s, -7, 6, 14, -20), neck: 0.02 };                            // double-take (the live pass snaps the head)
  if (code === 46) return { ...hands(s, -8, 4, 8, 4), tilt: s.tilt + 0.10, neck: 0.20, bob: s.bob - 6 }; // slump, defeated
  if (code === 47) return { ...hands(s, -18, -20, 18, -20), neck: -0.02, tilt: s.tilt - 0.02 };    // framed it, hands lowered
  // ── floor level ─────────────────────────────────────────────────────────────
  // Until these existed the vocabulary could not say "on the floor" at all, so a
  // script that said someone was on the floor beside their bed got the nearest
  // available pose — a STANDING slump — and the picture contradicted the sentence.
  // `bob` drops the pelvis (34 + bob is its height above the ground) and the feet
  // go FORWARD, because a leg folded straight down under a low pelvis throws the
  // knee out sideways.
  if (code === 48) return {                                                                        // sitting on the floor, slumped
    ...hands(s, 11, 12, 17, 10),
    tilt: s.tilt + 0.08,                      // leaning back against whatever is behind
    neck: 0.18,                               // head down
    bob: s.bob - 26,                          // pelvis 8 above the ground
    footL: { x: 26, y: 0 }, footR: { x: 32, y: 0 },   // legs out along the floor
  };
  if (code === 49) return {                                                                        // down on one knee beside someone
    ...hands(s, 20, 4, 27, 0),
    tilt: s.tilt - 0.08,
    neck: 0.12,
    bob: s.bob - 18,                          // pelvis 16 above the ground
    footL: { x: 15, y: 0 }, footR: { x: -11, y: 0 },  // one knee forward, one tucked back
  };
  return s;                                       // 0 neutral
}

/** emoteHold plus its living overlay: speech beats, head nods, and a per-gesture accent. */
export function emoteLive(code: number, t: number, bt: number): Stance {
  'worklet';
  const s = emoteHold(code, t);
  const speech = clamp01(1 - bt / 2.6);
  const talk = Math.sin(bt * 8.2) * speech * 2.6;      // the gesturing hand beats with the line
  const nod = Math.sin(bt * 8.2 + 0.4) * speech * 0.02;
  let dx = 0, dy = 0, db = 0, dn = 0, dxl = 0, dyl = 0;
  // (the lift accents for 2 / 6 / 20 / 23 now live in the LIFT block below)
  if (code === 3) dy = Math.sin(bt * 7.0) * Math.max(0, 1 - bt / 1.7) * 3;                     // counted chops
  if (code === 5) dx = lerp(-30, 0, ease01(bt / 1.0));                                          // sweep into place
  if (code === 8) db = Math.sin(Math.min(bt, 0.6) / 0.6 * Math.PI) * 2.5;                       // shrug lifts once
  if (code === 15) { dn = 0.10 * Math.max(0, 1 - bt / 0.5); dx = 6 * Math.max(0, 1 - bt / 0.4); } // recoil snaps back
  if (code === 16) db = Math.abs(Math.sin(bt * 6)) * Math.max(0, 1 - bt / 1.5) * 4;             // celebrate bounce
  if (code === 18) { dx = Math.sin(bt * 22) * Math.max(0, 1 - bt / 1.2) * 1.2; }                // cower tremble
  if (code === 23) dx = Math.sin(bt * 9) * speech * 5;                                          // wave oscillation
  // ── the second wave's accents ────────────────────────────────────────────────
  // (24 / 33 / 25 / 35 rise in the LIFT block below)
  // The stamp raises first and strikes DOWN after, so its blow is offset past the
  // rise rather than fighting it.
  if (code === 26) dy = Math.sin(Math.min(Math.max(bt - 0.55, 0), 0.4) / 0.4 * Math.PI) * 24;
  if (code === 27) { const p = Math.sin(Math.min(bt, 0.5) / 0.5 * Math.PI); dy = p * 14; dyl = p * 14; db = -p * 3; } // both hands yank the lever down, body dips
  if (code === 29) { const p = Math.sin(bt * 5) * Math.max(0, 1 - bt / 1.4) * 2; dx = p; dxl = -p; }            // straining push tremble
  if (code === 32) { dx = Math.sin(bt * 3.0) * 6; dxl = Math.sin(bt * 3.0 + Math.PI) * 6; }                     // conduct: hands sway in opposition
  if (code === 36) dx = Math.sin(bt * 12) * Math.max(0, 1 - bt / 1.6) * 4;                      // signing strokes
  // Reach OUT to the catch, then draw it in to where the hold already sits. It used
  // to end 14 units inboard of its own hold pose, so the hand jumped back out the
  // moment the reader tapped.
  if (code === 37) dx = lerp(14, 0, ease01(bt / 0.9));
  // ── the third wave's accents ────────────────────────────────────────────────
  if (code === 40) {                                                                             // writing: small looping strokes that fade out
    const w = Math.max(0, 1 - bt / 2.2);
    dx = Math.sin(bt * 11) * w * 5;
    dy = Math.cos(bt * 8.5) * w * 3;
  }
  if (code === 41) dx = Math.sin(Math.min(bt, 0.5) / 0.5 * Math.PI) * 7;                         // one deliberate tap at the board
  if (code === 43) { const p = Math.sin(Math.min(bt, 0.8) / 0.8 * Math.PI); db = -p * 5; dy = p * 9; dyl = p * 9; } // crouch and set it down
  if (code === 45) dn = Math.sin(Math.min(bt, 0.45) / 0.45 * Math.PI) * -0.28;                   // the head snaps round
  if (code === 46) db = -Math.sin(Math.min(bt, 0.9) / 0.9 * Math.PI) * 2.5;                      // the slump settles heavier
  if (code === 47) { const p = Math.sin(bt * 2.4) * Math.max(0, 1 - bt / 1.8) * 3; dx = p; dxl = -p; } // framing hands adjust the crop

  // ── LIFT: the raised instant of a gesture ───────────────────────────────────
  // Each of these RESTS with the arm down (see emoteHold) and rises only here, so
  // the reader sees the gesture made and then the arm come back down instead of a
  // figure frozen with a hand in the air. `lift` is zero by 1.5s, which keeps
  // emoteLive converging on emoteHold — the pose the next transition blends out of.
  const L = lift(bt);
  if (code === 2) { dy -= 34 * L; dn -= 0.10 * L; }
  if (code === 3) dy -= 18 * L;
  if (code === 5) { dy -= 20 * L; dyl -= 16 * L; }
  if (code === 6) { dy -= 30 * L; dn -= 0.12 * L; }
  if (code === 15) { dy -= 28 * L; dyl -= 28 * L; }
  if (code === 16) { dy -= 52 * L; dyl -= 52 * L; dn -= 0.10 * L; }
  if (code === 18) { dy -= 30 * L; dyl -= 30 * L; }
  if (code === 19) { dy -= 40 * L; dyl -= 40 * L; dn -= 0.08 * L; }
  if (code === 20) dy -= 34 * L;
  if (code === 23) dy -= 32 * L;
  if (code === 24) { dy -= 52 * L; dyl -= 52 * L; dn -= 0.18 * L; }
  if (code === 25) { dy -= 34 * L; dn -= 0.12 * L; }
  if (code === 26) dy -= 34 * L;
  if (code === 33) { dy -= 26 * L; dyl -= 26 * L; dn -= 0.12 * L; }
  if (code === 35) { dy -= 34 * L; dn -= 0.09 * L; }
  if (code === 47) { dy -= 14 * L; dyl -= 14 * L; }
  return {
    ...s,
    neck: s.neck + nod + dn,
    bob: s.bob + db,
    fistL: { x: s.fistL.x + dxl, y: s.fistL.y + dyl },
    fistR: { x: s.fistR.x + dx, y: s.fistR.y + talk + dy },
  };
}

// ── the builder (lesson 2) ────────────────────────────────────────────────────
// A mason at work: leans into the job, drops a little lower, and rests the lead
// hand out-forward and low where the next brick lands. `builderLive` adds the
// single crouch-and-set dip that plays as the beat opens, in sync with the brick
// drawing itself on. Same hold/live split as the narrator, so the scene can blend
// the previous beat's settled pose straight into it without a snap.

function builderHold(t: number): Stance {
  'worklet';
  const base = stand(t);
  const dy = life2(t, 1.1, 0.7, 0.5) * 1.0;      // the working hand never sits still
  return {
    ...base,
    tilt: base.tilt - 0.11,                       // lean toward the work
    neck: 0.05,                                   // eyes down on the bricks
    bob: base.bob - 6,                            // settle a touch lower
    fistR: { x: 34, y: 6 + dy },                  // lead hand out-forward, low
    // Trailing hand HANGS. At y −6 it sat only ~20 units below a shoulder on a
    // 33-unit arm, so the elbow bowed out and enclosed a triangle of paper against
    // the torso — the hole-in-the-body defect, still here after the gesture sweep.
    fistL: { x: -4, y: 6 },
    adv: 0,
  };
}

function builderLive(t: number, bt: number): Stance {
  'worklet';
  const s = builderHold(t);
  // One place-a-brick dip over the first ~0.9s: reach down, set it, rise back.
  const place = Math.sin(Math.min(bt, 0.9) / 0.9 * Math.PI);
  return {
    ...s,
    bob: s.bob - place * 6,                        // crouch deeper as he sets it
    tilt: s.tilt - place * 0.06,
    fistR: { x: s.fistR.x + place * 8, y: s.fistR.y + place * 16 },
  };
}

/** Master's settled pose. Code 7 lays a brick; every other code is a narrator gesture. */
export function masterHold(code: number, t: number): Stance {
  'worklet';
  if (code === 7) return builderHold(t);
  return narratorHold(code, t);
}

/** Master's living pose. Code 7 is the crouch-and-set; the rest are narrator gestures. */
export function masterLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 7) return builderLive(t, bt);
  return narratorLive(code, t, bt);
}

/** Mid-stride, driven by distance so the feet stay locked. */
export function walk(dist: number, g: Gait = WALK): Stance {
  'worklet';
  const ph = phaseFor(dist, g);
  const fR = footTarget(ph, g);
  const fL = footTarget(ph + Math.PI, g);
  const swing = g.armSwing;
  // The torso rocks and the head counter-nods twice per stride. Tiny numbers, but
  // a walk with a perfectly rigid spine is the main thing that reads as "animated"
  // rather than "walking".
  const rock = Math.sin(2 * ph);
  return {
    tilt: g.tilt + rock * 0.014,
    neck: -0.04 - rock * 0.012,                   // eyes up the road, not at the floor
    bob: g.bob * (0.5 + 0.5 * g.bobSign * Math.cos(2 * ph)),
    footL: fL, footR: fR,
    // Hands swing opposite the legs, HANGING AT ARM'S LENGTH — about y +6 below a
    // shoulder that sits at y −26, on a 33-unit arm. They used to swing at y −4,
    // barely 22 below the shoulder, which forced the elbow to bow outward and
    // enclosed a triangle of paper against the torso: the hole-in-the-body defect,
    // present in every walking figure in every lesson until now. A hanging hand
    // belongs at mid-thigh; anything higher must be a deliberately bent arm.
    fistL: { x: 3 + Math.cos(ph) * swing * 24, y: 7 - Math.abs(Math.cos(ph)) * 2 },
    fistR: { x: 3 + Math.cos(ph + Math.PI) * swing * 24, y: 7 - Math.abs(Math.cos(ph + Math.PI)) * 2 },
    adv: 0,
  };
}

/** Blend two stances. Every field is numeric, so this is a straight lerp. */
export function mixStance(a: Stance, b: Stance, t: number): Stance {
  'worklet';
  const m = (p: P2, q: P2): P2 => { 'worklet'; return { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) }; };
  return {
    tilt: lerp(a.tilt, b.tilt, t),
    neck: lerp(a.neck, b.neck, t),
    bob: lerp(a.bob, b.bob, t),
    footL: m(a.footL, b.footL), footR: m(a.footR, b.footR),
    fistL: m(a.fistL, b.fistL), fistR: m(a.fistR, b.fistR),
    adv: lerp(a.adv, b.adv, t),
  };
}

/**
 * Give a walk its own HABIT.
 *
 * One shared Gait meant every journey in every lesson used the identical stride,
 * bounce and arm swing — the figure read as the same loop pacing back and forth.
 * This deals each walk a deterministic variation from its own start/end position:
 * a longer or shorter stride, feet that clear the ground more or less, a heavier
 * or lighter bob, arms that swing freely or stay close, a touch more or less lean.
 * Same journey always walks the same way (so it never flickers between beats), but
 * two different journeys never look alike.
 *
 * Defined BEFORE strideStance — a worklet that calls one declared later captures it
 * as undefined and crashes the UI thread.
 */
export function gaitVary(g: Gait, seed: number): Gait {
  'worklet';
  const frac = (v: number) => { 'worklet'; return v - Math.floor(v); };
  const r1 = frac(Math.sin(seed * 12.9898) * 43758.5453);
  const r2 = frac(Math.sin(seed * 78.233 + 1.7) * 43758.5453);
  const r3 = frac(Math.sin(seed * 39.425 + 3.1) * 43758.5453);
  const st = g.stance + (r1 - 0.5) * 0.06;
  return {
    S: g.S * (0.84 + r1 * 0.34),            // stride length: short and busy → long and loping
    lift: g.lift * (0.76 + r2 * 0.54),      // how far the feet clear the ground
    stance: st < 0.55 ? 0.55 : st > 0.70 ? 0.70 : st,
    bob: g.bob * (0.78 + r3 * 0.6),         // heavy tread → light tread
    bobSign: g.bobSign,
    tilt: g.tilt * (0.84 + r3 * 0.42),      // how much they lean into the walk
    armBase: g.armBase,
    armSwing: g.armSwing * (0.70 + r2 * 0.66),
    standH: g.standH,
  };
}

/**
 * Locomotion: a stance that WALKS from x0 to x1 as `tr` goes 0→1, easing into the
 * `settled` gesture on arrival. The scene interpolates the x-position itself; this
 * supplies the stride (feet driven by distance, so they never skate) and the settle.
 * Facing is the scene's job (mirror via `dir`). Defined AFTER walk + mixStance: a
 * worklet that calls a forward-declared worklet captures it as `undefined` and
 * crashes the UI runtime, so order matters here.
 */
export function strideStance(
  x0: number, x1: number, settled: Stance, tr: number, g: Gait = WALK, seed = 0
): Stance {
  'worklet';
  // Every walk gets its own habit, dealt from where it starts and ends, so the
  // figure never paces the stage in one identical repeating motion. This lives
  // here rather than at the call sites so EVERY lesson gets it for free.
  //
  // `seed` is what stops TWO FIGURES WALKING THE SAME JOURNEY from being clones.
  // The habit is dealt from the journey's endpoints, so a companion handed the same
  // x0/x1 gets the same stride, the same bob, the same arm swing — and because the
  // step phase comes from distance travelled, the same foot on the ground at the
  // same instant. Two people in perfect lockstep read as one figure duplicated, not
  // as two people. Give the second walker any non-zero seed and they get their own
  // habit and their own footfall. Defaults to 0, so every existing caller is
  // untouched. (A numeric literal default is safe in a worklet; a default that
  // references a module const — like `g = WALK` — is not, and crashes the runtime.)
  const vg = gaitVary(g, x0 * 0.37 + x1 * 0.11 + seed * 3.7);
  const span = Math.abs(x1 - x0);
  const traveled = span * ease01(tr) + seed * 11;
  const w = walk(traveled, vg);
  // A departure has a PRELOAD and an arrival has a LANDING. Without them the figure
  // simply switches on mid-stride, which is most of why a walk that also flips the
  // figure's facing looks like a teleport into a mirrored copy: nothing physical
  // happens at the moment of turning. Here the body rocks back and dips before the
  // first step, and soaks up the last one before the gesture settles.
  //
  // Both scale with the DISTANCE. A four-unit nudge should not perform a whole
  // push-off; only a real journey gets the full weight shift.
  const far = clamp01(span / 40);
  const push = ease01(clamp01(1 - tr / 0.13)) * far;
  const land = Math.sin(Math.PI * clamp01((tr - 0.66) / 0.28)) * far;
  const moving: Stance = {
    ...w,
    tilt: w.tilt + push * 0.07,
    neck: w.neck - push * 0.05,
    bob: w.bob - push * 2.4 - land * 1.7,
  };
  const arrive = clamp01((tr - 0.78) / 0.22);
  return mixStance(moving, settled, arrive);
}

/**
 * THE canonical beat-to-beat body motion for a figure that moves around the stage.
 *
 * If the beat moves the figure (x changed), they WALK there — feet driven by
 * distance so they never skate — and ease into the new beat's settled gesture over
 * the last 20% of the transition, so arriving at a whiteboard flows straight into
 * writing on it. If the beat doesn't move them, the previous beat's settled pose
 * blends into the new beat's living gesture, so the hands travel from wherever they
 * were into the next gesture and never snap home.
 *
 * The scene still owns the x-interpolation and the facing (`dirsFrom` → `pose`'s
 * `dir`). Pass `WALK` explicitly — a Gait left to a default parameter is NOT
 * captured into the worklet runtime and throws "Property 'WALK' doesn't exist".
 * Defined after strideStance/mixStance: a worklet that calls a worklet declared
 * later captures it as undefined and crashes the UI thread.
 */
export function travelStance(
  x0: number, x1: number, holdPrev: Stance, holdNext: Stance, liveNext: Stance, tr: number,
  g: Gait, seed = 0
): Stance {
  'worklet';
  if (Math.abs(x1 - x0) > 1) return strideStance(x0, x1, holdNext, tr, g, seed);
  return mixStance(holdPrev, liveNext, tr);
}

/**
 * Stage units a figure covers in one second at an unhurried pace.
 *
 * Everything in these scenes crossfades over a fixed 0.85s, and a walk was being
 * crammed into that same 0.85s NO MATTER HOW FAR IT WENT. A short shuffle looked
 * fine; a hundred-unit journey across the stage was sprinted, which is what reads
 * as "the stickman walks over way too fast". The feet never skated — the gait is
 * distance-driven — so it wasn't a stride problem. It was a TIME problem: the same
 * number of steps, played in a third of the time they need.
 */
export const WALK_SPEED = 74;

/**
 * How long this beat's transition should take.
 *
 * A beat that doesn't move the figure keeps the plain crossfade. A beat that walks
 * takes as long as the walk actually needs, so the pace is the same whether the
 * figure crosses the stage or steps aside. Because the scene drives BOTH the
 * x-interpolation and the gait from this one number, stretching it slows the body
 * and the position together and the feet stay planted.
 */
export function moveTr(x0: number, x1: number, base = 0.85): number {
  'worklet';
  const d = Math.abs(x1 - x0);
  if (d < 1) return base;
  const t = d / WALK_SPEED;
  return t > base ? t : base;
}

/**
 * Facing direction per beat, precomputed on the JS thread from the beats' x track:
 * +1 walking right, -1 walking left, and HOLD the last direction while standing
 * still — so a figure that walks left to a chart keeps facing the chart while it
 * talks about it, instead of snapping back to face right.
 *
 * Plain JS (not a worklet): call it once at module scope next to the x array.
 */
export function dirsFrom(xs: number[], start = 1): number[] {
  const out: number[] = [];
  let d = start;
  for (let i = 0; i < xs.length; i++) {
    if (i > 0) {
      if (xs[i] > xs[i - 1] + 1) d = 1;
      else if (xs[i] < xs[i - 1] - 1) d = -1;
    }
    out.push(d);
  }
  return out;
}

/**
 * Climbing a ladder: hands reach up to grab rungs and feet step up, opposite limbs
 * moving together (left hand with right foot). `u` is a continuous phase (radians);
 * the SCENE raises the figure's groundY as it climbs so the body actually ascends.
 * Feet sit FORWARD on the rungs (x positive toward the ladder), hands reach forward
 * and high — never behind the head, so both stay visible.
 */
/**
 * CLIMBING, and why it does not look the way you would draw it.
 *
 * The obvious climb puts a hand on a rung above the head. This figure cannot do that
 * and never will: the arm is 33 units from a shoulder that sits 23 below a head
 * centre of radius 20, so everything above the crown is out of range, and any hand
 * raised to head height is drawn INSIDE the skull (B11). The first version tried
 * anyway — hands travelling y −24 → −42 while the head centre sat at −49 — so the
 * hands never cleared the chest, the arms stayed tucked, and the whole thing read as
 * a hunched crouch bobbing on the spot. Which is exactly what it was.
 *
 * So the climb is carried by the parts that CAN do it:
 *   · the LEGS. A climbing knee drives up and FORWARD onto the next rung — 26 up and
 *     14 across, against the old 11 straight up. This is most of the read.
 *   · the LEAN. Into the ladder, chin up toward the next rung, not upright.
 *   · the PUMP. The pelvis rises on the drive and settles on the reach.
 *   · the HANDS working the rail at chest-to-shoulder height, alternating, clear of
 *     the head disc and clear of the torso so both forearms are actually visible.
 * The figure still stays put and the rungs scroll down past it (C22d).
 */
export function climb(u: number): Stance {
  'worklet';
  const s = Math.sin(u);
  const l = Math.max(0, s);               // left side reaching, right side driving
  const r = Math.max(0, -s);
  return {
    tilt: -0.15,                          // leaning into the ladder
    neck: 0.14,                           // looking up at the next rung
    bob: -2 + 3 * Math.abs(s),            // rises on the drive, settles on the reach
    // The lifting knee comes up AND forward to find the rung; the planted leg
    // straightens under the weight.
    footL: { x: 7 + 14 * r, y: -1 - 26 * r },
    footR: { x: 9 + 14 * l, y: -1 - 26 * l },
    // Hands on the rail, alternating, out in front where they can be seen.
    fistL: { x: 21 + 3 * l, y: -14 - 18 * l },
    fistR: { x: 23 + 3 * r, y: -16 - 18 * r },
    adv: 0,
  };
}

// ── transform bundles for the View renderer ──────────────────────────────────

/**
 * The LAYOUT width of a bone View, before `scaleX` stretches it to length.
 *
 * It used to be 1, and that single pixel is why the figure's joints were visible.
 * A 1×thick View scaled up by 150 is rasterised from a one-pixel-wide source, and
 * the resulting edges do not land where the maths says they should — by a pixel or
 * two, which is enough to open a sharp white nick between a bone's squared-off end
 * and the round joint that is supposed to cap it. Every elbow, knee, wrist and
 * ankle had one, and a nick in a silhouette is exactly what the eye reads as "a
 * joint". Starting from a wide source means the scale factor is near 1 and the
 * edges land true, so the bone and its cap fuse into one smooth shape.
 *
 * `Stickman.tsx` must use this as its bone width; the two are a matched pair.
 */
export const BONE_SRC = 100;

export type XF = any[];
export interface Bundle {
  opacity: number;
  thighL: XF; shinL: XF; thighR: XF; shinR: XF; torso: XF;
  uarmL: XF; farmL: XF; uarmR: XF; farmR: XF;
  kneeL: XF; kneeR: XF; ankL: XF; ankR: XF;
  elL: XF; elR: XF; wrL: XF; wrR: XF;
  /** Caps for the tops of the arms. The arms hang off shL/shR, not off shB. */
  shLd: XF; shRd: XF;
  pel: XF; shB: XF; head: XF; scale: number;
}

/** Off-stage and invisible — used for figures not in the current shot. */
export const BLANK: Bundle = (() => {
  const off: XF = [{ translateX: -9999 }, { translateY: -9999 }];
  return {
    opacity: 0, scale: 1,
    thighL: off, shinL: off, thighR: off, shinR: off, torso: off,
    uarmL: off, farmL: off, uarmR: off, farmR: off,
    kneeL: off, kneeR: off, ankL: off, ankR: off,
    elL: off, elR: off, wrL: off, wrR: off,
    shLd: off, shRd: off,
    pel: off, shB: off, head: off,
  };
})();

/**
 * Joints → View transform arrays.
 *
 * A bone is a 1×STR View whose LEFT-CENTRE is its origin (transformOrigin
 * '0% 50%'), so [translate, rotate, scaleX(len)] stretches it from the start
 * joint along the bone — the very array the SVG <G> version used. A joint is a
 * circle centred on the origin, so translate alone places it.
 */
export function bundle(j: Joints, k: number, opacity: number): Bundle {
  'worklet';
  const bone = (a: P2, b: P2): XF => {
    'worklet';
    return [
      { translateX: a.x }, { translateY: a.y },
      { rotate: `${Math.atan2(b.y - a.y, b.x - a.x) * DEG}deg` },
      // Divided by the bone's source width — see BONE_SRC. Stretching a
      // one-pixel-wide View is what put a visible nick at every joint.
      { scaleX: Math.hypot(b.x - a.x, b.y - a.y) / BONE_SRC },
    ];
  };
  const at = (p: P2): XF => { 'worklet'; return [{ translateX: p.x }, { translateY: p.y }]; };
  return {
    opacity, scale: k,
    thighL: bone(j.hipL, j.kneeL), shinL: bone(j.kneeL, j.ankL),
    thighR: bone(j.hipR, j.kneeR), shinR: bone(j.kneeR, j.ankR),
    torso: bone(j.pel, j.chest),
    uarmL: bone(j.shL, j.elL), farmL: bone(j.elL, j.wrL),
    uarmR: bone(j.shR, j.elR), farmR: bone(j.elR, j.wrR),
    kneeL: at(j.kneeL), kneeR: at(j.kneeR), ankL: at(j.ankL), ankR: at(j.ankR),
    elL: at(j.elL), elR: at(j.elR), wrL: at(j.wrL), wrR: at(j.wrR),
    // The arms hang off shL/shR, which sit ±3 either side of the spine — NOT off
    // shB, where the only shoulder dot used to be. So the top of each upper arm was
    // an uncapped square end, and wherever the arm swung wide enough to clear the
    // torso's edge that corner showed as a step at the shoulder: the last visible
    // joint on the figure once the elbows, knees, wrists and ankles were fixed.
    shLd: at(j.shL), shRd: at(j.shR),
    pel: at(j.pel), shB: at(j.shB), head: at(j.head),
  };
}

/** Convenience: stance + placement → a finished Bundle. */
export function pose(
  s: Stance, x: number, groundY: number, k: number, dir: number, opacity = 1
): Bundle {
  'worklet';
  return bundle(
    solve({ x, groundY, k, dir, tilt: s.tilt, neck: s.neck, bob: s.bob,
            footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR }),
    k, opacity
  );
}

// ── outdoor / leisure poses ──────────────────────────────────────────────────
// The launch screen puts the same figure outdoors on a hill: sitting, swinging,
// flying a kite, picnicking, reading. These are additive to the fight/narrator
// vocabulary above and are just as usable inside a lesson.
//
// Everything here rides `life2`, so a figure a viewer stares at through a whole
// cold start never reads as a loop.
//
// SEATING. `bob` moves the pelvis: pelUp = standH + bob, so a seat at height h
// is bob = h - standH. Feet stay ground-relative (y = 0 is the ground), and the
// knee falls out of the existing IK — a low pelvis with the feet forward folds
// the leg on its own. That is the whole trick; there is no separate "sit" solve.
//
// HEAD CLEARANCE — the constraint that decides every fist target here. The head
// is drawn at radius STR.headR (20) about roughly (0,-49), and the arm only
// reaches U.uarm+U.farm = 33 from a shoulder at about (2,-40). Two consequences:
//   · a fist within ~26 of the head centre is SWALLOWED — the hand, and the whole
//     forearm behind it, disappear into the head circle. On device the kite figure
//     read as a string growing out of its skull, and the swinger's grip and the
//     picnicker's food vanished entirely.
//   · the figure CANNOT raise a hand above its own crown (-69): that needs ~35 of
//     vertical reach and it has 33. Anything "overhead" must instead be held out
//     in front at an angle, which is why the kite line is carried forward-up.
// Check a new target with hypot(fist-head) - 20 > ~6, and hypot(fist-shoulder) < 33.

/** Pelvis height for a seat, as a `bob`. */
export function seatBob(seatH: number) {
  'worklet';
  return seatH - U.standH;
}

/**
 * Base seated pose: pelvis dropped to `seatH`, feet planted forward, hands
 * resting on the lap. Breathes and shifts weight like `stand` does.
 */
export function seated(seatH: number, t: number, reach = 18): Stance {
  'worklet';
  const breath = 0.55 * (0.5 - 0.5 * Math.cos(t * 1.5)) + 0.3 * (0.5 - 0.5 * Math.cos(t * 0.97));
  const ws = life2(t, 0.29, 0.17, 0.9);
  const hd = life2(t, 0.47, 0.29, 1.4);
  return {
    tilt: 0.06 + ws * 0.02,
    neck: -0.03 + hd * 0.04,
    bob: seatBob(seatH) + breath,
    // Slight left/right asymmetry so the legs never read as one mirrored bar.
    footL: { x: reach - 2, y: 0 },
    footR: { x: reach + 4, y: 0 },
    // Hands DOWN on the knees, NOT tucked at the hip. A fist near the body buries
    // the whole forearm inside the torso silhouette at this stroke weight and the
    // figure loses an arm — the same "read as separate shapes" rule the boxing
    // guard is built around. They also have to sit low enough to keep the arm
    // near-straight: at y −2 the hand was 28 units from a 33-unit arm's shoulder,
    // enough slack for the elbow to bow out and cut a hole against the torso.
    // …but NOT so low that the arm is asking for a point it cannot reach. At
    // y 4/6 the hand sat 33+ units from a 33-unit arm, so the IK clamped: the
    // elbow was pinned 0.4 units off dead straight for 82% of the cycle, and any
    // move that brought the hand back inside range made it spring out in a single
    // frame. These sit at ~92% extension — still visibly a straight arm, but with
    // a real elbow that travels instead of snapping.
    // The two arms are NOT symmetric here: the far shoulder sits across the body,
    // so the same local point is a longer reach for the left hand than the right.
    // Measured, not assumed — at (13, 0.5) the left arm ran at 32.2 of 33 for the
    // whole cycle while the right was a comfortable 30.3.
    fistL: { x: reach - 8 + ws, y: -3 + hd * 0.5 },
    fistR: { x: reach + 1 + ws, y: -2 - hd * 0.5 },
    adv: 0,
  };
}

/**
 * Seated on a chair with a cup: every few seconds the near hand carries the cup
 * up to the mouth, holds, and comes back down to the lap. `u` is 0→1 across one
 * sip; hold it at 0 to just sit.
 */
export function sipStance(t: number, u: number, seatH = 21): Stance {
  'worklet';
  const base = seated(seatH, t, 19);
  // Rise, dwell at the lip, lower — a drink's tempo, not a punch's.
  //
  // ease01 (smoothstep) on the rise, NOT easeOutCubic. easeOutCubic has slope 3
  // at zero, so the arm left rest at full speed: measured at 60fps the elbow
  // moved 2.1 units in the first frame of the lift against a 0.004 median — a
  // visible flick out of stillness. Smoothstep leaves and arrives at zero speed,
  // which is what the page-turn in readStance already did and why that one
  // sampled clean.
  const e = u <= 0 ? 0 : u < 0.34 ? ease01(u / 0.34) : u < 0.66 ? 1 : 1 - ease01((u - 0.66) / 0.34);
  return {
    ...base,
    // The head dips to meet the cup rather than the arm doing all the travel.
    neck: base.neck - 0.16 * e,
    tilt: base.tilt - 0.05 * e,
    // Held OUT in front of the chin, not against it — a cup drawn on top of the
    // torso silhouette just looks like a lump on the chest.
    fistR: { x: lerp(base.fistR.x, 27, e), y: lerp(base.fistR.y, -40, e) },
  };
}

/**
 * Sitting on a tire swing: legs out front and lifted clear of the ground, both
 * hands gripping the rope above. The ARC belongs to the scene (rotate the whole
 * figure about the branch), not here — this is only what the body does while it
 * swings: legs pumping, torso leaning against the direction of travel.
 *
 * `sw` is the swing's signed phase, -1..1, so the pose leans into the arc.
 */
export function swingStance(t: number, sw: number): Stance {
  'worklet';
  const breath = 0.4 * (0.5 - 0.5 * Math.cos(t * 1.7));
  const pump = Math.sin(t * 1.9) * 0.5 + Math.sin(t * 1.17 + 0.6) * 0.3;
  return {
    // Leaning back at the top of the forward arc is what sells a swing.
    tilt: 0.18 - sw * 0.16,
    neck: -0.08 - sw * 0.05,
    bob: seatBob(20) + breath,
    // Legs straight out front, rising and falling with the pump; never touching down.
    footL: { x: 33 + pump * 3, y: -15 - pump * 5 },
    footR: { x: 38 + pump * 3, y: -10 - pump * 5 },
    // Hands on the TIRE RIM at hip height, not up on the rope. The rider sits at
    // the rope's x so the rope passes BEHIND the body (it is drawn under the
    // figure) and only shows above the head — which is how a tire swing looks.
    // Reaching up the rope instead put both fists inside the head circle, and a
    // grip high enough to clear it is past the arm's 33-unit reach.
    fistL: { x: -16, y: -14 },
    fistR: { x: 14, y: -16 },
    adv: 0,
  };
}

/**
 * Flying a kite: standing, string hand held high, spool hand at the waist, head
 * tipped back to watch. `tug` (0..1) is the line pulling — it travels up the arm
 * into the shoulder and chest, which is what makes the kite feel attached.
 */
export function kiteStance(t: number, tug: number): Stance {
  'worklet';
  const base = stand(t);
  const drift = life2(t, 0.9, 0.53, 0.4);
  return {
    ...base,
    tilt: base.tilt - 0.04 - tug * 0.05,
    // Chin up — reading the sky. Without this the figure is just a raised arm.
    neck: -0.26 + drift * 0.03,
    footL: { x: -7, y: 0 },
    footR: { x: 6, y: 0 },
    // The string hand goes up AND WELL FORWARD. Straight overhead it lay along
    // the torso and the arm vanished into the body — there was no visible arm at
    // all, just a hunch. Out at x≈26 the whole limb reads against open paper.
    fistL: { x: -13 + drift, y: 5 },
    fistR: { x: 32 + drift * 1.4 - tug * 2, y: -47 - tug * 3 },
    adv: 0,
  };
}

/**
 * Picnic: sitting low on a blanket, one hand travelling to the basket and back
 * to the mouth. The pelvis is nearly on the ground, so the knees ride high and
 * the figure reads cross-legged.
 */
export function picnicStance(t: number, u: number): Stance {
  'worklet';
  const breath = 0.5 * (0.5 - 0.5 * Math.cos(t * 1.4));
  const ws = life2(t, 0.31, 0.19, 0.5);
  const hd = life2(t, 0.44, 0.27, 1.7);
  // Out to the basket, back to the mouth, rest — one unhurried round trip.
  // ease01 on the reach for the same reason as sipStance: easeOutCubic starts at
  // full speed and the hand snapped off the lap.
  const outE = u < 0.3 ? ease01(u / 0.3) : u < 0.45 ? 1 : 1 - ease01((u - 0.45) / 0.2);
  const eatE = u > 0.5 && u < 0.9 ? Math.sin(Math.PI * ease01((u - 0.5) / 0.4)) : 0;
  return {
    // Reclined onto the propping arm — that lean is most of what says "on the grass".
    tilt: 0.20 + ws * 0.02 - eatE * 0.05,
    neck: -0.04 + hd * 0.04 - eatE * 0.12,
    bob: seatBob(7) + breath,
    // Legs stretched out along the ground, nearly straight. Tucking the feet in
    // close threw both knees up and the whole figure read as a squat, not as
    // someone sitting on a blanket — in side view, extended legs are the only
    // unambiguous "sitting on the ground".
    footL: { x: 34, y: 0 },
    footR: { x: 40, y: 1 },
    // One hand planted behind for support, the other doing the eating.
    fistL: { x: -15 + ws, y: 5 },
    // The reach to the basket is OUT and slightly UP, not out and down. A hand
    // both far forward and near the ground is outside the arm's envelope from a
    // seated shoulder — (31, 3) was 41 units from a 33-unit arm — so the IK
    // clamped for a quarter of the cycle and the elbow snapped coming off it.
    fistR: {
      x: lerp(lerp(15, 22, outE), 24, eatE),
      y: lerp(lerp(-2, -6, outE), -32, eatE),
    },
    adv: 0,
  };
}

/**
 * PROPPED AGAINST A WALL, doing nothing in particular.
 *
 * For the end-of-lesson screen, where the figure is not teaching anything — he is
 * loitering while the reader reads their score. Which means the pose has to survive
 * being stared at: weight on the back foot, the other crossed over in front,
 * shoulder against whatever is behind him, and enough breath and drift that he never
 * freezes. The wall is the SCENE's job; this only leans on it.
 *
 * Author him facing the content (the caller passes dir −1 for a wall on his right),
 * so +x local is away from the wall: the feet sit forward of the shoulders, which is
 * what stops a lean reading as a fall.
 */
export function leanHold(t: number): Stance {
  'worklet';
  const breath = 0.55 * (0.5 - 0.5 * Math.cos(t * 1.45));
  const drift = life2(t, 0.4, 0.23, 1.4);
  const shift = life2(t, 0.19, 0.11, 2.2);      // weight easing from hip to hip
  return {
    tilt: 0.17 + drift * 0.012,                 // leaning back into the wall
    neck: -0.05 + drift * 0.05,
    bob: breath - 1.5 - Math.abs(shift) * 0.6,
    // Feet forward of the pelvis, staggered — one leg carrying, the other crossed
    // over it. Only just forward, though: at 15 and 24 the legs raked 40° off
    // vertical and the whole figure read as a plank propped against the wall rather
    // than a person standing at it.
    footL: { x: 7 + shift * 1.0, y: 0 },
    footR: { x: 14 + shift * 1.0, y: 0 },
    // HANDS LOW AND FORWARD, one resting over the other.
    //
    // These were FOLDED, with the near fist tucked back at x −8, and that is the
    // pose the reader complained about. Measured against this rig, a near fist at
    // (−8, −17) puts its ELBOW at (−18, −30) — 4.1 units INSIDE the 20-radius head
    // disc, on the arm that draws in FRONT of the head. Being the resting pose, it
    // is also where he spends most of a thirteen-second loop, so the result was an
    // arm parked up behind his head for seconds at a time. The complaint was
    // exactly right and it was never the wave, which clears the head by 8–13 units.
    //
    // Anything at x ≤ −4 does it: the fist folding back past the shoulder is what
    // throws the elbow up and behind. At x 4 the elbow drops to (−11, −11) and
    // clears the head by 11.6, and the hands end up in front of the body where they
    // can actually be seen rather than tucked behind the torso.
    //
    // Forward hands also solve what folding was there for (B16b): the forearms come
    // away from the torso, so there is paper between arm and body and the two never
    // merge into one lump. Verified with scripts — see the sweep in the commit.
    // …and LOW, at the hip rather than the chest. Held up at −16 the forearm made a
    // bent wing across the ribs: clear of the head, but stiff, and not what a person
    // propped against a wall does with their hands. Dropped to the hip the upper arm
    // hangs, the forearm comes forward, and the elbow sits just behind the back where
    // a relaxed elbow belongs.
    fistL: { x: 14 + drift * 0.6, y: -9 },
    fistR: { x: 8, y: -8 - drift * 0.6 },
    adv: 0,
  };
}

/**
 * ...and the business he does while he waits. Three bits on a long loop: a look
 * around the room, a bored inspection of his nails, and a small wave at whoever is
 * reading. Blended through `pulse` windows rather than switched, so there is never a
 * frame where a hand jumps, and every window returns to the resting pose — which is
 * the same rule every gesture in this file obeys (C20).
 */
export function leanLive(t: number): Stance {
  'worklet';
  const s = leanHold(t);
  const P = 13;                                  // one full round of business
  const u = (((t % P) + P) % P) / P;
  // Each bit of business gets its OWN progress value as well as its envelope, because
  // anything shaped by the monotonic `t` inside a windowed gesture has a phase nobody
  // chose: the old wave wobbled on `sin(t·9)`, so the hand could be travelling down
  // while the arm was going up. Everything below is a function of its own window.
  const lu = clamp01((u - 0.02) / 0.18);
  const nu = clamp01((u - 0.24) / 0.18);
  // A nod at what they just scored: the near hand comes OUT AND FORWARD, toward
  // the number he is standing next to. Added because "move his hands in ways the
  // user can see" is half the point of him — a figure whose only business happens
  // against his own chest may as well be still.
  const pu = clamp01((u - 0.46) / 0.20);
  // The wave gets a THIRD of the loop, and it needs it. Squeezed into 0.28 the hand
  // peaked at 2.89 units/frame — at 103 units to a human body that is about 2.9 m/s,
  // a hand being thrown rather than raised. The window must also close before u = 1 or
  // the gesture is still up when the loop restarts and the arm drops in one frame.
  const wu = clamp01((u - 0.70) / 0.28);
  const look = pulse(lu);
  const nails = pulse(nu);
  // Rise, a short hold, fall. `pulse`/`holdEnv` arrive and leave in the same
  // instant, so a gesture built on them only ever travels and never reads as a
  // gesture — but the hold here is about 0.8s, out in front of him. That is the
  // whole distinction the reader drew: a hand doing something visible for a moment
  // is fine, a hand parked behind his head is not.
  const point =
    pu <= 0 || pu >= 1
      ? 0
      : pu < 0.34
        ? ease01(pu / 0.34)
        : pu > 0.6
          ? ease01((1 - pu) / 0.4)
          : 1;

  // THE WAVE — two problems, both of them geometry.
  //
  // (There were three. The first was that the hand had to DROP out of the fold before
  // it could rise: from the old folded rest at (−8, −22) the path up and out passed
  // within 0.67 units of its own shoulder, so the arm collapsed to nothing and the
  // elbow whipped round the singularity at six times the speed of the hand it was
  // following. A `dip` term swung the hand down and out first to avoid it. The rest
  // pose now starts forward and BELOW the shoulder, and the path from there to the
  // raised hand never comes closer than 10.9 units to it — so the dip was correcting
  // for a problem that no longer exists, and dropping it removes a downward dive the
  // gesture had no reason to make.)
  //
  // ONE: it needs to stop at the top. `pulse` is a triangle — it arrives and leaves in
  // the same instant, so there was never a moment of waving, only of travelling.
  // Rise 1.2s · hold 1.3s · fall 1.2s, and the sweeps live in the hold.
  //
  // TWO: a wave is LATERAL. The old one wobbled the hand vertically on `sin(t·9)` —
  // 0 sideways reversals against 2 vertical, i.e. a twitch — and being a function of
  // the free clock rather than of its own window, its phase was nobody's decision: the
  // hand could be dropping while the arm was still going up.
  // Up briskly, hold, down lazily — a hand goes up to wave with intent and comes back
  // down because it is finished, and the asymmetry is most of what makes it read.
  const raise = wu < 0.28 ? ease01(wu / 0.28) : wu < 0.62 ? 1 : 1 - ease01((wu - 0.62) / 0.38);
  const outE = ease01(clamp01(raise / 0.45));            // out of the fold, early
  const upE = ease01(clamp01((raise - 0.3) / 0.7));      // and only then upward
  const fu = clamp01((wu - 0.26) / 0.38);                // the hold, where the waving is
  const flick = Math.sin(fu * Math.PI * 6) * Math.sin(Math.PI * fu);

  // THE SWEEP IS A ROTATION, NOT A SLIDE. Waving by adding ±4 to the hand's x drags it
  // toward the head on every inward stroke and changes the arm's extension on every
  // stroke as well. Swinging it round the shoulder at a FIXED radius does neither: the
  // arm stays at 82% for the whole wave, and the hand traces the arc a forearm actually
  // traces. 27 units at 0.34 rad above horizontal puts the fist 34 from the head centre
  // — and it is the FIST EDGE that has to clear, not its centre. At the old peak the
  // centre was 23.9 out from a head of radius 20, so the fist's own 5.5 radius put its
  // edge at 18.4: inside the skull, on the near arm, which draws in front of the head.
  // …and the sweep is the REACH, not the angle. This figure is drawn in profile, so a
  // real wave — a hand rocking side to side — happens straight through the screen and
  // cannot be drawn at all. What reads in profile is the forearm rocking fore-and-aft.
  // Swinging the angle instead looks like the same fix and is not: at 19° above
  // horizontal, rotating the arm moves the hand almost entirely UP AND DOWN, so it
  // measured 0 lateral reversals and 2.7 units of x-range — the vertical twitch again,
  // wearing a costume. Oscillating the radius gives 6.6 units of x against 2.3 of y.
  const WSH_X = -1.4, WSH_Y = -25.1;                     // the near shoulder in this pose
  // ±5.5 gives the hand about 10 stage units of travel — roughly 17cm once you scale a
  // 103-unit figure to a person, which is a wave. At ±3.5 it was 9cm: a twitch.
  const wr = 24 + flick * 5.5;                           // 56%…89% of reach, never clamped
  const wa = 0.34 + flick * 0.03;
  const wx = WSH_X + wr * Math.cos(wa);
  const wy = WSH_Y - wr * Math.sin(wa);

  return {
    ...s,
    // The head tips through its own window rather than on the free-running clock, so
    // "looking around" is up, down and back to level every time instead of stopping
    // wherever the sine happened to be. A touch of positive neck as the hand comes up
    // carries the head back, away from it.
    neck: s.neck + look * 0.2 * Math.sin(lu * Math.PI * 2) + nails * 0.16 - point * 0.05 + upE * 0.08,
    tilt: s.tilt - raise * 0.03,
    // Each bit of business moves the near hand OUT from the rest, never back past
    // it. The windows do not overlap, so only one of these is ever non-zero.
    fistR: {
      // +16, not +25. At +25 the point target sits (33, −12), which is 36.8 from a
      // shoulder at (−1.4, −25.1) — 3.8 units BEYOND the 33-unit arm, so `solve`
      // clamped it back onto the reach circle and the elbow snapped along it at 1.81
      // units/frame against a hand doing 0.72. Measured, not guessed: 100% of reach,
      // the extended end of the same singularity the dip was removed for at the
      // folded end. +16 lands at 87%, which still reads as a full arm out in front
      // and leaves the elbow somewhere to travel (B11).
      x: lerp(lerp(s.fistR.x + nails * 10, s.fistR.x + 16, point), wx, outE),
      y: lerp(lerp(s.fistR.y - nails * 9, s.fistR.y - 4, point), wy, upE),
    },
    fistL: { x: s.fistL.x + nails * 2 + point * 2, y: s.fistL.y + nails * 3 },
  };
}

/**
 * Reading outdoors: sitting with a book held up in both hands, head down on the
 * page. Every so often the far hand flicks a page over (`turn`, 0..1).
 */
export function readStance(t: number, turn: number): Stance {
  'worklet';
  const breath = 0.45 * (0.5 - 0.5 * Math.cos(t * 1.45));
  const ws = life2(t, 0.27, 0.16, 1.1);
  // The eyes tracking down the page, then flicking back up to the next line.
  const scan = (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.06;
  const e = turn <= 0 ? 0 : Math.sin(Math.PI * ease01(turn));
  return {
    tilt: 0.14 + ws * 0.02,
    neck: 0.20 + scan,                    // chin tucked toward the page
    bob: seatBob(9) + breath,
    // Legs out along the ground, same reason as the picnic: folded legs read as
    // a crouch at this stroke weight.
    footL: { x: 32, y: 0 },
    footR: { x: 38, y: 1 },
    // The book is held out and up, clear of the chest, so both forearms and the
    // book itself sit against open paper instead of on the torso.
    // The turning hand rises far more than it travels forward. At e*5 it ended up
    // at x 32, which put it 33 units from the shoulder — dead against the arm's
    // limit, so the elbow pinned at the top of every page turn.
    fistL: { x: 17 + ws * 0.5, y: -24 - e * 9 },
    fistR: { x: 27 + ws * 0.5 + e * 2, y: -19 - e * 13 },
    adv: 0,
  };
}
