import { clamp01, seg, lerp } from './ease';

// ─────────────────────────────────────────────────────────────────────────────
// Welcome screen rig — the pure maths, ported 1:1 from the approved canvas
// preview. Everything here is worklet-safe and runs on the UI thread.
//
// Design stage is a fixed 400×800; the component scales it to the device.
// See ease.ts for the rule about which animated props actually repaint.
// ─────────────────────────────────────────────────────────────────────────────

// ── script ───────────────────────────────────────────────────────────────────
export interface Beat {
  t: number;
  text: string;
  words: string[];
  speak: number; // seconds he spends actually saying the line
  visual: Visual | null;
  gesture: Gesture | null;
}
export type Visual = 'lesson' | 'growth' | 'tree';
export type Gesture = 'point' | 'shrug' | 'open' | 'emphasize';

const SCRIPT: Array<[number, string, Visual | null, Gesture | null]> = [
  [0.0, 'Think philosophy is boring?', null, 'point'],
  [2.6, "It doesn't have to be.", null, 'shrug'],
  [5.0, 'Explore famous philosophers.', null, 'open'],
  [7.0, 'Discover timeless ideas.', null, 'open'],
  [9.0, 'No long lectures.', null, 'emphasize'],
  [11.0, 'One short lesson at a time.', 'lesson', null],
  [14.0, 'Just simple, interactive learning.', 'lesson', null],
  [16.4, 'Learn in just a few minutes a day.', 'growth', null],
  [19.4, 'And it adds up. Fast.', 'growth', null],
  [21.6, 'Train yourself to think clearly.', 'tree', null],
  [24.2, 'Ask better questions.', 'tree', null],
  [26.4, 'Challenge your perspective.', 'tree', null],
  [28.6, 'Ready to think differently?', null, 'open'],
];

export const T_FADE = 30.8; // everything dissolves
export const T_BEGIN = 32.2; // wordmark + Begin resolve in
export const T_HOLD = 33.2; // freeze here — this plays ONCE, it must not loop

export const BEATS: Beat[] = SCRIPT.map(([t, text, visual, gesture], i) => {
  const nextT = i + 1 < SCRIPT.length ? SCRIPT[i + 1][0] : T_FADE;
  const words = text.split(' ');
  return {
    t,
    text,
    words,
    speak: Math.max(0.5, Math.min(nextT - t - 0.5, words.length * 0.3 + 0.3)),
    visual,
    gesture,
  };
});

// Flattened numeric tables for the worklets: [t, speak, gestureIndex].
// GESTURES order must match GP below; -1 means "no gesture on this beat".
const GESTURES: Gesture[] = ['point', 'shrug', 'open', 'emphasize'];
export const BEAT_T: number[][] = BEATS.map((b) => [
  b.t,
  b.speak,
  b.gesture ? GESTURES.indexOf(b.gesture) : -1,
]);

// Gesture hand presets as fractions of arm reach: [l.dx, l.dy, r.dx, r.dy]
const GP: number[][] = [
  [-0.72, 0.62, 0.58, -0.18], // point
  [-1.14, 0.82, 1.14, 0.82], // shrug
  [-1.05, 0.42, 1.05, 0.42], // open
  [-0.8, 0.56, 0.8, 0.16], // emphasize
];

// Consecutive beats sharing a visual become one chapter, so the board stays up
// across several lines instead of flickering per beat.
export interface Chapter {
  visual: Visual;
  t0: number;
  t1: number;
}
export const CHAPTERS: Chapter[] = (() => {
  const runs: Array<{ visual: Visual; startIdx: number; endIdx: number }> = [];
  BEATS.forEach((b, i) => {
    if (!b.visual) return;
    const last = runs[runs.length - 1];
    if (last && last.visual === b.visual && last.endIdx === i - 1) last.endIdx = i;
    else runs.push({ visual: b.visual, startIdx: i, endIdx: i });
  });
  return runs.map(({ visual, startIdx, endIdx }) => ({
    visual,
    t0: BEATS[startIdx].t,
    t1: endIdx + 1 < BEATS.length ? BEATS[endIdx + 1].t : T_FADE,
  }));
})();
export const CHAP_T: number[][] = CHAPTERS.map((c) => [c.t0, c.t1]);

// ── stage + figure proportions (straight from the preview) ───────────────────
export const STAGE_W = 400;
export const STAGE_H = 800;

const K = 3.0;
export const LEN = {
  spine: 33 * K,
  head: 16 * K,
  thigh: 19 * K,
  shin: 18 * K,
  uarm: 17 * K * 0.82, // foreshortened — he faces the camera
  farm: 16 * K * 0.82,
  hipW: 4.1 * K,
  shW: 8.2 * K,
  shDrop: 7 * K,
};
export const STR = { torso: 12 * K, limb: 11 * K, headR: 20 * K };

const LEG_LEN = LEN.thigh + LEN.shin;
const LEG_SPLAY = 0.14; // legs straight, splayed ~8°
const STAND = LEG_LEN * Math.cos(LEG_SPLAY); // feet land at exactly full leg length
export const ARM_REACH = LEN.uarm + LEN.farm;

export const CX = 316;
export const GROUND = 760;
export const SH_Y = GROUND - STAND - LEN.spine + LEN.shDrop;
export const GB = { x: 16, y: 392, w: 224, h: 112 }; // graph board: LEFT, at his arm level
export const GB_C = { x: GB.x + GB.w / 2, y: GB.y + GB.h / 2 }; // what he points at
const HAND_DX = 0.72 * ARM_REACH;
const HAND_DY = 0.3 * ARM_REACH;

// Static skeleton, computed ONCE. The whole figure only ever sways horizontally,
// so every one of these is fixed geometry — exactly what the Fabric repaint rule
// demands. Sway is applied as a parent transform.
export const PEL = { x: CX, y: GROUND - STAND };
export const CHEST = { x: CX, y: PEL.y - LEN.spine };
export const HEAD0 = { x: CX, y: CHEST.y - LEN.head }; // head at rest (tilt 0, bob 0)
export const SH_B = { x: CHEST.x, y: CHEST.y + LEN.shDrop };
export const SH_L = { x: SH_B.x - LEN.shW, y: SH_B.y };
export const SH_R = { x: SH_B.x + LEN.shW, y: SH_B.y };
export const HIP_L = { x: PEL.x - LEN.hipW, y: PEL.y };
export const HIP_R = { x: PEL.x + LEN.hipW, y: PEL.y };
// Straight legs: the foot sits at exactly full leg length from the hip, so the
// IK would resolve the knee dead straight — meaning each leg is just one line.
const FX = Math.sin(LEG_SPLAY) * LEG_LEN;
const FY = Math.cos(LEG_SPLAY) * LEG_LEN;
export const FOOT_L = { x: HIP_L.x - FX, y: HIP_L.y + FY };
export const FOOT_R = { x: HIP_R.x + FX, y: HIP_R.y + FY };

// ── worklet maths ────────────────────────────────────────────────────────────

/** Index of the beat active at t, or -1 before the first. */
export function beatIdxAt(t: number) {
  'worklet';
  let idx = -1;
  for (let i = 0; i < BEAT_T.length; i++) if (t >= BEAT_T[i][0]) idx = i;
  return idx;
}

/** Index of the chapter whose board is up at t, or -1. */
export function chapIdxAt(t: number) {
  'worklet';
  for (let i = 0; i < CHAP_T.length; i++) {
    if (t >= CHAP_T[i][0] - 0.35 && t < CHAP_T[i][1] + 0.3) return i;
  }
  return -1;
}

/** How far into saying the current line he is: 0 = silent, 1 = mid-sentence. */
export function speechEnv(t: number) {
  'worklet';
  const idx = beatIdxAt(t);
  if (idx < 0) return 0;
  if (t >= T_FADE - 0.25) return 0; // he stops talking before the dissolve
  const age = t - BEAT_T[idx][0];
  const s0 = 0.14;
  const s1 = s0 + BEAT_T[idx][1];
  return clamp01(seg(age, s0, s0 + 0.14)) * (1 - clamp01(seg(age, s1 - 0.18, s1)));
}

export function swayAt(t: number) {
  'worklet';
  return 2.0 * Math.sin(t * 0.7) + 0.7 * Math.sin(t * 1.9 + 1.1);
}

/** Two-bone IK. Returns the mid joint; the end joint is the target itself. */
export function ik(
  hx: number,
  hy: number,
  tx: number,
  ty: number,
  l1: number,
  l2: number,
  bend: number
) {
  'worklet';
  const dx = tx - hx;
  const dy = ty - hy;
  const dist = Math.hypot(dx, dy) || 1e-4;
  const ux = dx / dist;
  const uy = dy / dist;
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, dist));
  const a = (d * d + l1 * l1 - l2 * l2) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  return { x: hx + ux * a - uy * h * bend, y: hy + uy * a + ux * h * bend };
}

/**
 * RAW hand targets — a pure function of t. These can jump hard when a line or a
 * board changes; the component chases them exponentially so the hand can only
 * ever glide. That smoothing is what kills the "he resets" artefact.
 */
export function handTargets(t: number) {
  'worklet';
  const idx = beatIdxAt(t);
  const gesture = idx < 0 ? -1 : BEAT_T[idx][2];
  const gAge = idx < 0 ? 99 : t - BEAT_T[idx][0];
  const gStrength =
    gesture >= 0
      ? clamp01(
          (1 - Math.pow(1 - clamp01(gAge / 0.5), 3)) * (1 - clamp01((gAge - 2.2) / 1.6))
        )
      : 0;

  const ci = chapIdxAt(t);
  const pointAmt =
    ci >= 0 ? clamp01((t - CHAP_T[ci][0] + 0.35) / 0.6) * (1 - clamp01((t - CHAP_T[ci][1]) / 0.3)) : 0;

  const sway = swayAt(t);
  const R = ARM_REACH;
  const lx = -HAND_DX + 0.14 * R * Math.sin(t * 1.7 + 0.3) + 0.05 * R * Math.sin(t * 3.1 + 1.7);
  const ly = HAND_DY + 0.18 * R * Math.sin(t * 1.1 + 1.2) + 0.07 * R * Math.sin(t * 2.6 + 0.5);
  const rx = HAND_DX + 0.14 * R * Math.sin(t * 1.5 + 2.4) + 0.05 * R * Math.sin(t * 2.9 + 0.2);
  const ry = HAND_DY + 0.18 * R * Math.sin(t * 1.25 + 0.1) + 0.07 * R * Math.sin(t * 2.2 + 2.8);

  let lXa = CX + sway + lx;
  let lYa = SH_Y + ly;
  let rXa = CX + sway + rx;
  let rYa = SH_Y + ry;

  if (gesture >= 0 && gStrength > 0) {
    const w = 0.6 * gStrength;
    lXa = lerp(lXa, CX + sway + GP[gesture][0] * R, w);
    lYa = lerp(lYa, SH_Y + GP[gesture][1] * R, w);
    rXa = lerp(rXa, CX + sway + GP[gesture][2] * R, w);
    rYa = lerp(rYa, SH_Y + GP[gesture][3] * R, w);
  }

  // TEACHER: the left arm aims at the board — the hand extends along the real
  // line to it, so he points at whatever is actually on screen.
  if (pointAmt > 0) {
    const shx = CX + sway - LEN.shW;
    const dx = GB_C.x - shx;
    const dy = GB_C.y - SH_Y;
    const d = Math.hypot(dx, dy) || 1;
    const ext = R * (0.95 + 0.02 * Math.sin(t * 2.1)); // breathing, so the point isn't frozen
    lXa = lerp(lXa, shx + (dx / d) * ext, pointAmt);
    lYa = lerp(lYa, SH_Y + (dy / d) * ext, pointAmt);
  }

  return { lx: lXa, ly: lYa, rx: rXa, ry: rYa };
}

// ── speech bubble geometry ───────────────────────────────────────────────────
export const BUB = {
  bottom: 374, // bottom edge is FIXED, so the tail root never moves vertically
  cx: 200,
  padX: 20,
  padY: 15,
  lh: 34,
  radius: 16,
  maxTextW: 322,
  tailW: 15,
  tailLen0: 60, // canonical tail length the static path is drawn at
};

/** Where the tail must point: just clear of his head, which sways. */
export function tailTip(t: number, headX: number, headY: number, tbx: number) {
  'worklet';
  const ang = Math.atan2(BUB.bottom - headY, tbx - headX);
  const gap = STR.headR + 10; // stop short of the ink disc, don't merge with it
  return { x: headX + Math.cos(ang) * gap, y: headY + Math.sin(ang) * gap };
}
