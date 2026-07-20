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

/** Stroke weights in rig units. `glove` is the fist radius when boxing. */
export const STR = { torso: 12, limb: 11, headR: 20, glove: 15 };

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

/** Pulls a target back onto the arm's reach circle if it sits outside it. */
export function reachable(sh: P2, target: P2): P2 {
  'worklet';
  const max = U.uarm + U.farm - 0.02;
  const dx = target.x - sh.x, dy = target.y - sh.y;
  const d = Math.hypot(dx, dy);
  if (d <= max || d === 0) return target;
  return { x: sh.x + (dx / d) * max, y: sh.y + (dy / d) * max };
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
  const ankL = { x: c.footL.x, y: pelUp + c.footL.y };
  const ankR = { x: c.footR.x, y: pelUp + c.footR.y };
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
}

/** Hands up by the chin, weight low, feet staggered — a boxer's guard. */
export function guard(t: number, load = 0): Stance {
  'worklet';
  const b = Math.sin(t * 5.0) * 1.4;            // light on the toes
  const sway = Math.sin(t * 2.5) * 1.2;
  return {
    // Only a slight lean. Two heads this size are 40% of the figure's height, so
    // a deep forward lean closes the gap between opponents faster than the
    // spacing can open it and the pair reads as one blob.
    tilt: -0.10, neck: -0.05, bob: b - 2,
    footL: { x: -15 + sway * 0.3, y: 0 },
    footR: { x: 13 + sway * 0.3, y: 0 },
    // Fists up by the chin but held OFF the body — tucked any tighter and the
    // folded arm disappears into the torso and head at this size.
    fistL: { x: 11 + sway * 0.4 - load * 5, y: -43 + b * 0.4 },
    fistR: { x: 17 + sway * 0.4 - load * 7, y: -39 + b * 0.4 },
  };
}

/** A thrown punch. `reach` 0→1 extends the lead fist; the rear stays guarding. */
export function punch(t: number, reach: number, lead: 'L' | 'R' = 'R'): Stance {
  'worklet';
  const g = guard(t);
  const e = easeOutCubic(reach);
  // The extended fist is clamped to arm's length by solve(), so `out` can aim
  // past it without the glove ever leaving the wrist.
  const out = { x: lerp(14, 44, e), y: lerp(-40, -31, e) };
  const tuck = { x: lerp(13, 18, e), y: lerp(-43, -45, e) };
  return {
    tilt: -0.10 - 0.13 * e,                      // drives forward off the back foot
    neck: -0.05,
    bob: g.bob,
    footL: { x: -15 - 3 * e, y: 0 },
    footR: { x: 13 + 7 * e, y: 0 },
    fistL: lead === 'L' ? out : tuck,
    fistR: lead === 'R' ? out : tuck,
  };
}

/** Head snapped back, weight rocked onto the heels. `hit` 0→1. */
export function recoil(t: number, hit: number): Stance {
  'worklet';
  const g = guard(t);
  const e = easeOutCubic(hit);
  return {
    tilt: lerp(-0.10, 0.32, e),                  // positive rocks him BACKWARD
    neck: lerp(-0.05, 0.36, e),
    bob: g.bob - 2 * e,
    footL: { x: -15 - 6 * e, y: 0 },
    footR: { x: 13 - 4 * e, y: 0 },
    fistL: { x: lerp(11, 2, e), y: lerp(-43, -36, e) },
    fistR: { x: lerp(17, 7, e), y: lerp(-39, -32, e) },
  };
}

/** Relaxed standing, arms down, with a slow breath. */
export function stand(t: number): Stance {
  'worklet';
  const br = 0.9 * (0.5 - 0.5 * Math.cos(t * 2.0));
  return {
    tilt: 0.05, neck: 0, bob: br,
    footL: { x: -5, y: 0 }, footR: { x: 6, y: 0 },
    fistL: { x: -4, y: -2 }, fistR: { x: 5, y: -2 },
  };
}

/** Standing but gesturing at the board — the narrator's default. */
export function present(t: number, amt: number): Stance {
  'worklet';
  const s = stand(t);
  const e = ease01(amt);
  const lift = Math.sin(t * 1.6) * 2;
  return {
    ...s,
    tilt: lerp(0.05, -0.04, e),
    neck: lerp(0, -0.16, e),                     // glances up at the board
    fistR: { x: lerp(5, 30, e), y: lerp(-2, -46 + lift, e) },
  };
}

/** Mid-stride, driven by distance so the feet stay locked. */
export function walk(dist: number, g: Gait = WALK): Stance {
  'worklet';
  const ph = phaseFor(dist, g);
  const fR = footTarget(ph, g);
  const fL = footTarget(ph + Math.PI, g);
  const swing = g.armSwing;
  return {
    tilt: g.tilt, neck: 0,
    bob: g.bob * (0.5 + 0.5 * g.bobSign * Math.cos(2 * ph)),
    footL: fL, footR: fR,
    // Hands swing opposite the legs, hanging near the hips.
    fistL: { x: 4 + Math.cos(ph) * swing * 22, y: -4 - Math.abs(Math.cos(ph)) * 3 },
    fistR: { x: 4 + Math.cos(ph + Math.PI) * swing * 22, y: -4 - Math.abs(Math.cos(ph + Math.PI)) * 3 },
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
  };
}

// ── transform bundles for the View renderer ──────────────────────────────────

export type XF = any[];
export interface Bundle {
  opacity: number;
  thighL: XF; shinL: XF; thighR: XF; shinR: XF; torso: XF;
  uarmL: XF; farmL: XF; uarmR: XF; farmR: XF;
  kneeL: XF; kneeR: XF; ankL: XF; ankR: XF;
  elL: XF; elR: XF; wrL: XF; wrR: XF;
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
      { scaleX: Math.hypot(b.x - a.x, b.y - a.y) },
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
