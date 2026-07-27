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

/** Snap out to a peak then recover to guard — a punch's tempo. Earlier peak = snappier. */
export function jabEnv(u: number, peak: number) {
  'worklet';
  if (u <= peak) return easeOutCubic(u / peak);
  return 1 - ease01((u - peak) / (1 - peak));
}
/** Rise, hold briefly, fall — a block / duck / slip that returns to guard. */
export function holdEnv(u: number) {
  'worklet';
  return Math.sin(Math.PI * ease01(u));
}

// ── the guard, and the ten boxing moves ──────────────────────────────────────
// Every move takes (t, u): u is 0→1 progress through the move, t drives the idle
// underneath. Each move is the GUARD at u=0 and u=1, so consecutive moves meet at
// the guard and chain with no snap — the choreography never has to cross-fade.

/** Hands up by the chin, weight low, feet shifting — a boxer's guard. */
export function guard(t: number, load = 0): Stance {
  'worklet';
  const b = life2(t, 5.0, 3.1, 1.3) * 1.6;      // bounce, never on a fixed beat
  const sway = life2(t, 2.3, 1.37, 0.4) * 1.3;  // weight drifting side to side
  return {
    // Only a slight lean — a deep one closes the gap faster than the spacing can
    // hold, and the pair reads as one blob.
    tilt: -0.10, neck: -0.05, bob: b - 2,
    footL: { x: -15 + sway * 0.3, y: 0 },
    footR: { x: 13 + sway * 0.3, y: 0 },
    // Fists clear of the HEAD CIRCLE (40% of figure height), so both gloves and
    // the head read as three shapes rather than one mass.
    fistL: { x: 27 + sway * 0.4 - load * 5, y: -34 + b * 0.4 },
    fistR: { x: 33 + sway * 0.4 - load * 7, y: -29 + b * 0.4 },
    adv: 0,
  };
}

/** Quick straight lead — snappy, little commitment. */
export function jab(t: number, u: number): Stance {
  'worklet';
  const g = guard(t), e = jabEnv(u, 0.26);
  return {
    ...g, tilt: g.tilt - 0.04 * e, adv: 8 * e,
    fistR: { x: lerp(g.fistR.x, 55, e), y: lerp(g.fistR.y, -31, e) },
    fistL: { x: lerp(g.fistL.x, 24, e), y: g.fistL.y },
  };
}
/** Power straight — bigger lunge, more rotation into it. */
export function cross(t: number, u: number): Stance {
  'worklet';
  const g = guard(t), e = jabEnv(u, 0.40);
  return {
    ...g, tilt: g.tilt - 0.16 * e, neck: g.neck - 0.04 * e, adv: 18 * e,
    fistR: { x: lerp(g.fistR.x, 60, e), y: lerp(g.fistR.y, -29, e) },
    fistL: { x: lerp(g.fistL.x, 20, e), y: lerp(g.fistL.y, -33, e) },
  };
}
/** Comes around the side at head height, fist bowing up mid-swing. */
export function hook(t: number, u: number): Stance {
  'worklet';
  const g = guard(t), e = jabEnv(u, 0.42);
  return {
    ...g, tilt: g.tilt - 0.08 * e, adv: 12 * e,
    fistR: { x: lerp(g.fistR.x, 50, e), y: lerp(g.fistR.y, -41, e) - Math.sin(Math.PI * e) * 6 },
    fistL: { x: lerp(g.fistL.x, 22, e), y: lerp(g.fistL.y, -37, e) },
  };
}
/** Rises from the guard to above the head. */
export function uppercut(t: number, u: number): Stance {
  'worklet';
  const g = guard(t), e = jabEnv(u, 0.46);
  return {
    ...g, tilt: g.tilt - 0.06 * e, bob: g.bob - Math.sin(Math.PI * u) * 2.5, adv: 11 * e,
    fistR: { x: lerp(g.fistR.x, 40, e), y: lerp(g.fistR.y, -49, e) },
    fistL: { x: lerp(g.fistL.x, 22, e), y: lerp(g.fistL.y, -35, e) },
  };
}
/** Both gloves up and tight, weight giving a touch — absorbing a shot. */
export function block(t: number, u: number): Stance {
  'worklet';
  const g = guard(t), e = holdEnv(u);
  return {
    ...g, tilt: g.tilt + 0.06 * e, neck: g.neck + 0.10 * e, adv: -3 * e,
    fistL: { x: lerp(g.fistL.x, 18, e), y: lerp(g.fistL.y, -42, e) },
    fistR: { x: lerp(g.fistR.x, 25, e), y: lerp(g.fistR.y, -40, e) },
  };
}
/** Drops under a punch — pelvis sinks, chin tucks. */
export function duck(t: number, u: number): Stance {
  'worklet';
  const g = guard(t), e = holdEnv(u);
  return { ...g, bob: g.bob - 13 * e, tilt: g.tilt - 0.06 * e, neck: g.neck - 0.20 * e, adv: 2 * e };
}
/** Leans off the line of fire without moving the feet. */
export function slip(t: number, u: number): Stance {
  'worklet';
  const g = guard(t), e = holdEnv(u);
  return { ...g, tilt: g.tilt + 0.20 * e, neck: g.neck + 0.12 * e, adv: -4 * e };
}
/** A quick step back to reset the distance, feet shuffling. */
export function backstep(t: number, u: number): Stance {
  'worklet';
  const g = guard(t), e = holdEnv(u);
  const sh = Math.sin(Math.PI * u * 2);
  return {
    ...g, adv: -15 * e,
    footL: { x: -15 - 5 * Math.max(0, sh), y: -3 * Math.max(0, sh) },
    footR: { x: 13 - 4 * Math.max(0, -sh), y: -3 * Math.max(0, -sh) },
  };
}
/** Takes a clean shot — head snaps back, weight rocks onto the heels. */
export function hitReact(t: number, u: number): Stance {
  'worklet';
  const g = guard(t);
  const e = Math.sin(Math.PI * Math.pow(ease01(u), 0.55));   // fast snap, slow recover
  return {
    ...g, tilt: g.tilt + 0.34 * e, neck: g.neck + 0.34 * e, bob: g.bob - 2 * e, adv: -7 * e,
    footL: { x: -15 - 6 * e, y: 0 }, footR: { x: 13 - 3 * e, y: 0 },
    fistL: { x: lerp(g.fistL.x, 12, e), y: lerp(g.fistL.y, -30, e) },
    fistR: { x: lerp(g.fistR.x, 18, e), y: lerp(g.fistR.y, -26, e) },
  };
}

/** Dispatch a boxing move by numeric code, so the choreography is plain data. */
export function boxMove(code: number, t: number, u: number): Stance {
  'worklet';
  if (code === 1) return jab(t, u);
  if (code === 2) return cross(t, u);
  if (code === 3) return hook(t, u);
  if (code === 4) return uppercut(t, u);
  if (code === 5) return block(t, u);
  if (code === 6) return duck(t, u);
  if (code === 7) return slip(t, u);
  if (code === 8) return backstep(t, u);
  if (code === 9) return hitReact(t, u);
  return guard(t);
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

function gestureHold(t: number, tx: number, ty: number, tneck: number): Stance {
  'worklet';
  const base = stand(t);                        // inherit breath + weight rock + head drift
  const dx = life2(t, 1.3, 0.83, 0.7) * 1.3;    // the gesturing hand keeps drifting
  const dy = life2(t, 1.05, 0.61, 1.9) * 1.1;
  const hd = life2(t, 0.5, 0.31, 1.1);
  return {
    ...base,
    tilt: -0.03 + (base.tilt - 0.05),           // gesture lean, keeping the weight rock
    neck: tneck + hd * 0.03,
    fistR: { x: tx + dx, y: ty + dy },
    fistL: { x: base.fistL.x + 2, y: base.fistL.y },
  };
}

/** The settled target pose for a gesture. 0 open · 1 emphatic · 2 board · 3 count · 4 chin · 5 sweep · 6 up. */
export function narratorHold(code: number, t: number): Stance {
  'worklet';
  if (code === 1) return gestureHold(t, 30, -30, -0.04);   // emphatic
  if (code === 2) return gestureHold(t, 26, -48, -0.15);   // present the board (up-forward)
  if (code === 3) return gestureHold(t, 30, -34, -0.06);   // count off
  if (code === 4) return gestureHold(t, 9, -50, 0.10);     // hand to chin — thinking
  if (code === 5) return gestureHold(t, 34, -40, -0.10);   // sweep, resolved to hand-out
  if (code === 6) return gestureHold(t, 12, -56, -0.20);   // point up (at the quote)
  return gestureHold(t, 36, -22, -0.03);                   // 0 open hand, explaining
}

/** The settled pose plus the beat's living overlay: speech beats, head nods, per-gesture accents. */
export function narratorLive(code: number, t: number, bt: number): Stance {
  'worklet';
  const s = narratorHold(code, t);
  const speech = clamp01(1 - bt / 2.4);          // energetic while the line reveals, then eases off
  const talk = Math.sin(bt * 8.5) * speech * 2.4;
  const nod = Math.sin(bt * 8.5 + 0.4) * speech * 0.018;
  let dy = 0, dx = 0;
  if (code === 1) dy = Math.sin(Math.min(bt, 0.6) / 0.6 * Math.PI) * 6;        // one emphatic dip
  if (code === 3) dy = Math.sin(bt * 7.2) * Math.max(0, 1 - bt / 1.6) * 3;     // counted chops
  if (code === 5) dx = lerp(-30, 0, ease01(bt / 1.0));                         // sweep into place
  return {
    ...s,
    neck: s.neck + nod,
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
 * 47 frame-it-up (both hands sizing something).
 */
export function emoteHold(code: number, t: number): Stance {
  'worklet';
  const s = stand(t);
  const g = life2(t, 1.25, 0.8, 0.6) * 1.3;     // active-hand drift so a hold never freezes
  if (code === 1) return hands(s, -6, 6, 32 + g, -22);
  if (code === 2) return { ...hands(s, -6, 6, 26 + g, -46), neck: -0.14 };
  if (code === 3) return { ...hands(s, -6, 6, 30 + g, -34), neck: -0.05 };
  if (code === 4) return { ...hands(s, -6, 5, 8, -50 + g), neck: 0.12 };
  if (code === 5) return hands(s, -28, -16, 32 + g, -38);
  if (code === 6) return { ...hands(s, -8, 4, 12, -58 + g), neck: -0.20 };
  if (code === 7) return hands(s, -32 - g, -18, 32 + g, -18);
  if (code === 8) return { ...hands(s, -26, -6, 26, -6), tilt: s.tilt + 0.03, bob: s.bob + 3, neck: 0.05 };
  if (code === 9) return { ...hands(s, -6, 6, 9, -8), tilt: s.tilt + 0.02 };
  if (code === 10) return hands(s, 9, -24, -9, -24);
  if (code === 11) return { ...hands(s, -6, 6, 6, -52), neck: 0.16, tilt: s.tilt + 0.03 };
  if (code === 12) return { ...hands(s, -6, 6, 4, -56), neck: 0.06 };
  if (code === 13) return { ...hands(s, -6, 6, 34, -16), tilt: s.tilt - 0.05 };
  if (code === 14) return { ...hands(s, -24, -16, 24, -16), tilt: s.tilt - 0.04 };
  if (code === 15) return { ...hands(s, -22, -34, 22, -34), tilt: s.tilt + 0.16, neck: 0.06, footL: { x: -9, y: 0 }, footR: { x: 9, y: 0 } };
  if (code === 16) return { ...hands(s, -18, -56, 18, -56), neck: -0.14, tilt: s.tilt - 0.03 };
  if (code === 17) return { ...hands(s, -3, 6, 5, 6), tilt: s.tilt - 0.30, neck: 0.22, bob: s.bob - 3 };
  if (code === 18) return { ...hands(s, -12, -46, 12, -46), bob: s.bob - 14, tilt: s.tilt + 0.06, neck: 0.10, footL: { x: -11, y: 0 }, footR: { x: 11, y: 0 } };
  if (code === 19) return { ...hands(s, -16, -50, 18, -50), neck: -0.12, tilt: s.tilt - 0.06 };
  if (code === 20) return { ...hands(s, -6, 6, 18, -52 + g) };
  if (code === 21) return hands(s, -26, -8, 26, -8);
  if (code === 22) return { ...hands(s, -6, 5, 4, -30), neck: 0.02 };
  if (code === 23) return { ...hands(s, -6, 6, 30, -46) };
  // ── the second wave ─────────────────────────────────────────────────────────
  if (code === 24) return { ...hands(s, -18, -56 + g, 18, -58 + g), neck: -0.24, tilt: s.tilt - 0.04 };     // reach up, both hands, head back
  if (code === 25) return { ...hands(s, -8, -10, 16 + g, -50 + g), neck: -0.22, tilt: s.tilt - 0.03 };       // gaze up in wonder, one hand rising
  if (code === 26) return { ...hands(s, -6, 6, 24, -46), neck: -0.04, tilt: s.tilt - 0.03 };                // stamp poised (down-strike is a live accent)
  if (code === 27) return { ...hands(s, 18, 4, 26, 8), tilt: s.tilt - 0.10, neck: 0.06 };                    // grip the lever, both hands low-forward
  if (code === 28) return { ...hands(s, -9, -6, 9, -6), tilt: s.tilt - 0.05, bob: s.bob + 2, neck: -0.06 };  // power pose, both hands on hips, chest up
  if (code === 29) return { ...hands(s, -30 - g, -14, 30 + g, -14), tilt: s.tilt + 0.02 };                   // press outward against the walls
  if (code === 30) return { ...hands(s, 12, -18, 22, -24), tilt: s.tilt - 0.06, neck: -0.08 };               // offer up with both hands
  if (code === 31) return { ...hands(s, 14, -2, 24, -6), tilt: s.tilt - 0.03, neck: 0.04 };                  // receive, hands cupped forward
  if (code === 32) return { ...hands(s, -24, -22, 24, -22), tilt: s.tilt };                                  // conduct / sway (live oscillates both hands)
  if (code === 33) return { ...hands(s, -30, -30, 30, -30), neck: -0.18, tilt: s.tilt - 0.05 };              // open release, arms wide and up, head back
  if (code === 34) return { ...hands(s, -8, 5, 4, -48), neck: 0.08, tilt: s.tilt + 0.06 };                  // shield eyes from a bright light
  if (code === 35) return { ...hands(s, -6, 6, 26, -52 + g), neck: -0.14, tilt: s.tilt - 0.05 };            // proclaim, one arm raised out-and-up
  if (code === 36) return { ...hands(s, -6, 6, 26, -2), tilt: s.tilt - 0.06, neck: 0.10 };                  // sign / write on a surface
  if (code === 37) return { ...hands(s, -6, 5, 24, -14), tilt: s.tilt - 0.04 };                             // grasp then pull in (live pulls)
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
  if (code === 47) return { ...hands(s, -20, -34, 20, -34), neck: -0.04, tilt: s.tilt - 0.02 };    // frame it up, both hands sizing
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
  if (code === 2 || code === 6 || code === 20 || code === 23) dy = Math.sin(Math.min(bt, 0.7) / 0.7 * Math.PI) * -6; // lift accent
  if (code === 3) dy = Math.sin(bt * 7.0) * Math.max(0, 1 - bt / 1.7) * 3;                     // counted chops
  if (code === 5) dx = lerp(-30, 0, ease01(bt / 1.0));                                          // sweep into place
  if (code === 8) db = Math.sin(Math.min(bt, 0.6) / 0.6 * Math.PI) * 2.5;                       // shrug lifts once
  if (code === 15) { dn = 0.10 * Math.max(0, 1 - bt / 0.5); dx = 6 * Math.max(0, 1 - bt / 0.4); } // recoil snaps back
  if (code === 16) db = Math.abs(Math.sin(bt * 6)) * Math.max(0, 1 - bt / 1.5) * 4;             // celebrate bounce
  if (code === 18) { dx = Math.sin(bt * 22) * Math.max(0, 1 - bt / 1.2) * 1.2; }                // cower tremble
  if (code === 23) dx = Math.sin(bt * 9) * speech * 5;                                          // wave oscillation
  // ── the second wave's accents ────────────────────────────────────────────────
  if (code === 24 || code === 33) dy = Math.sin(Math.min(bt, 0.8) / 0.8 * Math.PI) * -5;        // reach / release rises
  if (code === 25 || code === 35) dy = Math.sin(Math.min(bt, 0.7) / 0.7 * Math.PI) * -5;        // wonder / proclaim lift
  if (code === 26) dy = Math.sin(Math.min(bt, 0.45) / 0.45 * Math.PI) * 22;                     // stamp strikes down and recovers
  if (code === 27) { const p = Math.sin(Math.min(bt, 0.5) / 0.5 * Math.PI); dy = p * 14; dyl = p * 14; db = -p * 3; } // both hands yank the lever down, body dips
  if (code === 29) { const p = Math.sin(bt * 5) * Math.max(0, 1 - bt / 1.4) * 2; dx = p; dxl = -p; }            // straining push tremble
  if (code === 32) { dx = Math.sin(bt * 3.0) * 6; dxl = Math.sin(bt * 3.0 + Math.PI) * 6; }                     // conduct: hands sway in opposition
  if (code === 36) dx = Math.sin(bt * 12) * Math.max(0, 1 - bt / 1.6) * 4;                      // signing strokes
  if (code === 37) dx = lerp(0, -14, ease01(bt / 0.9));                                          // grasp pulls the catch inward
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
export function strideStance(x0: number, x1: number, settled: Stance, tr: number, g: Gait = WALK): Stance {
  'worklet';
  // Every walk gets its own habit, dealt from where it starts and ends, so the
  // figure never paces the stage in one identical repeating motion. This lives
  // here rather than at the call sites so EVERY lesson gets it for free.
  const vg = gaitVary(g, x0 * 0.37 + x1 * 0.11);
  const span = Math.abs(x1 - x0);
  const traveled = span * ease01(tr);
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
  x0: number, x1: number, holdPrev: Stance, holdNext: Stance, liveNext: Stance, tr: number, g: Gait
): Stance {
  'worklet';
  if (Math.abs(x1 - x0) > 1) return strideStance(x0, x1, holdNext, tr, g);
  return mixStance(holdPrev, liveNext, tr);
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
export function climb(u: number): Stance {
  'worklet';
  const s = Math.sin(u);
  const lHand = Math.max(0, s);           // left hand reaching to the high rung
  const rHand = Math.max(0, -s);          // right hand reaching on the opposite half
  return {
    tilt: -0.10, neck: -0.16, bob: 2,
    footL: { x: 6, y: -3 - 11 * rHand },  // left foot lifts with the right hand
    footR: { x: 6, y: -3 - 11 * lHand },
    fistL: { x: 11, y: -24 - 18 * lHand }, // hands forward + up, alternating high
    fistR: { x: 13, y: -24 - 18 * rHand },
    adv: 0,
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
    fistL: { x: reach - 6 + ws, y: 4 + hd * 0.5 },
    fistR: { x: reach + 1 + ws, y: 6 - hd * 0.5 },
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
  const e = u <= 0 ? 0 : u < 0.34 ? easeOutCubic(u / 0.34) : u < 0.66 ? 1 : 1 - ease01((u - 0.66) / 0.34);
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
  const outE = u < 0.3 ? easeOutCubic(u / 0.3) : u < 0.45 ? 1 : 1 - ease01((u - 0.45) / 0.2);
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
    fistR: {
      x: lerp(lerp(15, 31, outE), 24, eatE),
      y: lerp(lerp(-2, 3, outE), -32, eatE),
    },
    adv: 0,
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
    fistL: { x: 17 + ws * 0.5, y: -24 - e * 9 },
    fistR: { x: 27 + ws * 0.5 + e * 5, y: -19 - e * 13 },
    adv: 0,
  };
}
