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
  /**
   * Word indices after which the board reveals its next item. This is how a board
   * stays welded to the line that describes it: both the word and the thing it
   * names are timed off the SAME table, so retiming a line retimes the picture and
   * the two cannot drift. Cueing the boards off hand-written p-values was the
   * alternative and it silently rots the first time a line is reworded.
   */
  cues: number[];
}
export type Visual = 'lesson' | 'map' | 'thinkers' | 'growth';
export type Gesture = 'point' | 'shrug' | 'open' | 'emphasize';

// ── the host's entrance and exit ─────────────────────────────────────────────
// He used to be simply PRESENT on frame one — full opacity, legs frozen, while
// the bubble faded in around him. Nothing arrives that way, which is why it read
// as a glitch rather than a beginning. So he walks on.
//
// HE NO LONGER OVERSHOOTS. The entrance was a sight gag: he sailed past his mark,
// planted, double-took, and reversed two steps onto it without turning round.
// Read cold by someone who has never seen the app, that is not a joke — it is a
// figure arriving, stopping, and then repositioning itself, which reads as the
// animation correcting a mistake. A first-run screen cannot afford to look like
// it is fixing itself in front of you.
//
// He walks on, decelerates onto the mark, plants, and turns. The time the
// double-take used to occupy went back into the march, so the walk is a shade
// longer and ends in a real deceleration rather than a stop.
export const T_MARCH = 2.30; // off-stage right → onto the mark, decelerating
export const T_STOP = 0.36; // the weight arrives and settles
export const T_TURN = 0.46; // pivots out of profile to face the audience
/** He does not say a word until he is standing on his mark facing you. */
export const SPEAK_T0 = T_MARCH + T_STOP + T_TURN;

// …and the way out. He does not dissolve either: he turns, fails to get any
// traction for half a second, and then leaves at a speed the walk never had.
export const T_BEAT = 0.42; // the line lands. he stands in it.
export const T_WINDUP = 0.55; // legs spinning, going nowhere
export const T_BOLT = 0.46; // and gone

// Beat times below are relative to SPEAK_T0 and shifted onto the absolute clock
// when BEATS is built. `speak` is derived from the word count but CAPPED by the
// beat's own slot, so a line that outgrows its slot doesn't throw — it silently
// rushes. Lengthen a line and you must check it still fits.
const SCRIPT: Array<[number, string, Visual | null, Gesture | null, number[]?]> = [
  [0.0, 'Think philosophy is boring, or too difficult?', null, 'point'],
  [3.4, "Watch. Here's a real one.", null, 'shrug'],
  [5.8, 'Is it ever right to lie?', 'lesson', null],
  [8.6, 'You answer. Then Kant tells you why.', 'lesson', null],
  [11.8, 'Philosophy has six branches.', 'map', null],
  // Three names per line, in the order the board draws them (A1: what the text
  // says, the picture must do). The cues are the words each name lands on.
  [14.4, 'What is real. How you know. What follows.', 'map', null, [2, 5, 7]],
  [18.0, 'How to live. What is beautiful. Who rules.', 'map', null, [2, 5, 7]],
  // THE EXACT FIGURE, because it is more impressive than the round one — and it
  // has to be the RIGHT exact figure. This said "two hundred and twenty-three"
  // for as long as the intro has existed; there are 322. A wrong number is worse
  // than a round one in the first thirty seconds of an app about thinking
  // clearly, and it is the one line here that can rot on its own.
  //
  // `check-thinkers` now compares this line and the board's "AND n MORE" against
  // ALL_PHILOSOPHERS.length, so the next person to add a thinker is told.
  [21.8, 'Three hundred and twenty-two thinkers.', 'thinkers', null],
  [25.0, 'Socrates. Kant. Nietzsche. Simone de Beauvoir.', 'thinkers', null],
  // The bars and the rank line. This beat exists because the intro said what
  // philosophy IS and never what a habit of it adds up to — and the board column
  // sat empty through both closing lines anyway.
  [28.6, 'A little every day. It adds up.', 'growth', null],
  [34.2, 'Ready to think differently?', null, 'open'],
];

const SPEAK_END = 37.0; // relative — he stops talking here

export const T_FADE = SPEAK_T0 + SPEAK_END; // bubble + board dissolve
export const T_EXIT = T_FADE; // …and he starts turning to leave
export const T_GONE = T_EXIT + T_BEAT + T_WINDUP + T_BOLT; // off the stage entirely
export const T_BEGIN = T_GONE + 0.15; // wordmark + Begin resolve into the empty stage
// Freeze here — this plays ONCE, it must not loop. Long enough for the LAST thing
// on the end card to finish arriving: the analytics notice resolves at T_BEGIN +
// 1.15, and at the old +1.0 the clock stopped while it was still fading in, so the
// one line on this screen that has to be read plainly sat at four-fifths opacity.
export const T_HOLD = T_BEGIN + 1.4;

export const BEATS: Beat[] = SCRIPT.map(([t, text, visual, gesture, cues], i) => {
  const nextT = i + 1 < SCRIPT.length ? SCRIPT[i + 1][0] : SPEAK_END;
  const words = text.split(' ');
  return {
    t: t + SPEAK_T0,
    text,
    words,
    speak: Math.max(0.5, Math.min(nextT - t - 0.5, words.length * 0.3 + 0.3)),
    visual,
    gesture,
    cues: cues ?? [],
  };
});

/**
 * Absolute time at which word `j` of beat `i` fades in. Mirrors the Word
 * component's own arithmetic exactly, which is the point: a board cued off this
 * lands on the same frame as the word that names it.
 */
export function wordAt(i: number, j: number) {
  const b = BEATS[i];
  return b.t + 0.14 + b.speak * (j / Math.max(1, b.words.length));
}

/** Every board cue on the timeline, in order, for one visual. */
export function cueTimes(visual: Visual): number[] {
  const out: number[] = [];
  BEATS.forEach((b, i) => {
    if (b.visual === visual) b.cues.forEach((j) => out.push(wordAt(i, j)));
  });
  return out;
}

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
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Chapter {
  visual: Visual;
  t0: number;
  t1: number;
  /** Where this board sits on the 400×800 stage. */
  box: Box;
  /** The chart's own coordinate space, scaled to fill `box`. */
  cw: number;
  ch: number;
}

/**
 * A board per chapter rather than one shared box, because the three now hold very
 * different amounts. The lesson card keeps the exact geometry it was approved at;
 * the two boards that replaced the decorative curve and tree have real words on
 * them and need the room — a six-branch map at the old 224×112 put its type at
 * about 8px on a phone, which is a picture of information rather than information.
 *
 * The right edge is the constraint: the host stands at CX with a 60-unit head, so
 * he occupies x 256…376 and nothing may cross 248.
 */
const BOARDS: Record<Visual, { box: Box; cw: number; ch: number }> = {
  // 232×116 keeps the card's approved 2:1 aspect exactly, and only brings it up to
  // the same width as the two beside it so the three do not read as three sizes.
  lesson: { box: { x: 14, y: 392, w: 232, h: 116 }, cw: 300, ch: 150 },
  map: { box: { x: 14, y: 386, w: 232, h: 174 }, cw: 300, ch: 225 },
  thinkers: { box: { x: 14, y: 396, w: 232, h: 156 }, cw: 300, ch: 202 },
  // Tall, because it is the only board with a plot in it: bars need height to be
  // a shape rather than a row of ticks, and x 14…246 is the width the layout
  // reserves for boards (see X_MARK in hostFigure).
  growth: { box: { x: 14, y: 384, w: 232, h: 232 }, cw: 300, ch: 300 },
};

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
    ...BOARDS[visual],
  }));
})();
export const CHAP_T: number[][] = CHAPTERS.map((c) => [c.t0, c.t1]);
/** Flattened board boxes for the worklets: [x, y, w, h]. */
export const CHAP_BOX: number[][] = CHAPTERS.map((c) => [c.box.x, c.box.y, c.box.w, c.box.h]);

// ── stage + figure proportions (straight from the preview) ───────────────────
export const STAGE_W = 400;
export const STAGE_H = 800;

export const K = 3.0;
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

/**
 * THE TURN IS THREE NUMBERS.
 *
 * This figure and the cinematic one are the same skeleton at different scales —
 * LEN is the lesson rig's `U` times K, and the only real difference is that this
 * one faces the camera. Facing is entirely carried by width: seen head-on the
 * hips and shoulders show their full span and the arms are foreshortened; seen in
 * profile the hips and shoulders are nearly edge-on and the arms are not. So
 * turning him is a lerp between these two sets, with no second skeleton, no
 * mirrored art and no scaleX pinch. `face` 0 = profile, 1 = facing you.
 *
 * The profile numbers are the lesson rig's own (hipW 1, shW 3) times K, which is
 * why he reads as the same person in both.
 */
export const PROFILE = { hipW: 1 * K, shW: 3 * K, armK: 1.0 };
export const FRONT = { hipW: LEN.hipW, shW: LEN.shW, armK: 0.82 };

export const LEG_LEN = LEN.thigh + LEN.shin;
const LEG_SPLAY = 0.14; // legs straight, splayed ~8°
export const STAND = LEG_LEN * Math.cos(LEG_SPLAY); // feet land at exactly full leg length
/**
 * Pelvis height while WALKING. Standing, he is locked out at 0.99 of leg length,
 * which leaves the leg no room to reach the end of a stride — the foot target
 * falls outside the leg's circle and gets clamped, which is the "rubber shin"
 * defect. Nobody walks with locked knees anyway. 0.92 is the lesson rig's own
 * standH/legLen ratio, and at a 96-unit stride it keeps every foot target inside
 * the leg's reach.
 */
export const WALK_PELV = 0.92 * LEG_LEN;
export const ARM_REACH = LEN.uarm + LEN.farm;

export const CX = 316;
export const GROUND = 760;
export const SH_Y = GROUND - STAND - LEN.spine + LEN.shDrop;
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

/**
 * The standing feet as offsets from the point between them — the form the walk
 * works in. Derived from FOOT_L/FOOT_R rather than restated, so the pose the walk
 * settles into is bit-for-bit the pose he talks from and the hand-off cannot show
 * a step.
 */
export const FRONT_FOOT_X = FOOT_R.x - CX; // +27.8; the left foot is its mirror
/** Profile standing: feet close, one slightly forward. The lesson rig's ±4, ×K. */
export const PROFILE_FOOT_X = 4 * K;

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

/**
 * Centre of whichever board is up at t — what the pointing hand aims at.
 *
 * Must stay BELOW chapIdxAt and CHAP_BOX. A worklet's closure is built when this
 * module is evaluated, so one that reads a binding declared further down the file
 * throws on import and takes the whole screen with it (G51e).
 */
export function boardCentreAt(t: number) {
  'worklet';
  const i = chapIdxAt(t);
  const c = CHAP_BOX[i >= 0 ? i : 0];
  return { x: c[0] + c[2] / 2, y: c[1] + c[3] / 2 };
}

// ── the gait ─────────────────────────────────────────────────────────────────
// Lifted from the lesson rig, whose walk is already tuned and already carries the
// no-slide arrival (C22f). Stride and lift are scaled up: this figure is K× the
// lesson one, and the march is deliberately broader and higher than a stroll —
// he is making an entrance.

export interface Gait {
  S: number; // stride length, stage units
  lift: number; // how high the swinging foot clears the ground
  stance: number; // fraction of the cycle a foot is planted
  bob: number;
  armSwing: number;
  /** Hand height, PELVIS-relative. +21 hangs at arm's length; negative pumps. */
  armY: number;
}
/**
 * The entrance march: long, high-kneed, slightly absurd.
 *
 * The stride is capped by the leg, not by taste. At 96 the foot at full extension
 * sat 104% of the way down a leg that is only 111 units long, and a target the leg
 * cannot reach does not fail visibly — the IK returns the best knee it can and the
 * shin is then DRAWN to the target anyway, stretching like rubber. 88 keeps every
 * foot inside the circle its own leg can describe.
 */
export const MARCH: Gait = { S: 88, lift: 44, stance: 0.6, bob: 7, armSwing: 0.5, armY: 18 };
/** Backing up onto the mark: short, quick, apologetic. */
export const SHUFFLE: Gait = { S: 30, lift: 12, stance: 0.56, bob: 3, armSwing: 0.18, armY: 21 };
/** Legs going, nothing happening. Short, frantic, and NOT distance-locked (see host.ts). */
export const SPIN: Gait = { S: 40, lift: 26, stance: 0.5, bob: 6, armSwing: 0.95, armY: -14 };
/** The exit proper: a short, fast stride with the arms up. */
export const SPRINT: Gait = { S: 64, lift: 34, stance: 0.42, bob: 9, armSwing: 0.8, armY: -10 };

/**
 * Planted through stance, eased arc through swing. This is the whole reason the
 * feet don't skate: through the planted part of the cycle the foot moves backward
 * at exactly the speed the body moves forward, so its ground position is constant.
 * Returns GROUND-RELATIVE offsets (y 0 = planted, negative = lifted).
 */
export function footTarget(ph: number, g: Gait) {
  'worklet';
  const u = (((ph / (2 * Math.PI)) % 1) + 1) % 1;
  if (u < g.stance) {
    const s = u / g.stance;
    return { x: g.S / 2 - g.S * s, y: 0 };
  }
  const s = (u - g.stance) / (1 - g.stance);
  const se = s * s * (3 - 2 * s);
  return { x: -g.S / 2 + g.S * se, y: -g.lift * Math.sin(Math.PI * s) };
}

/** Step phase from DISTANCE TRAVELLED, not from time — so a pause, a slow-down or
 *  a decelerating arrival can never break the foot-lock. */
export function phaseFor(dist: number, g: Gait) {
  'worklet';
  return (2 * Math.PI * dist * g.stance) / g.S;
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

/**
 * Pulls a target back onto a limb's reach circle if it sits outside it.
 *
 * Needed because IK FAILS INVISIBLY: handed a target it cannot reach it returns
 * the straightest knee it can and stops, but the shin is then drawn from that knee
 * to the target anyway — so the lower leg stretches like rubber instead of the
 * pose visibly breaking. Clamping first puts the foot where the leg can actually
 * put it, and within the circle IK guarantees the shin is exactly shin-length.
 */
export function reachTo(hx: number, hy: number, tx: number, ty: number, max: number) {
  'worklet';
  const dx = tx - hx;
  const dy = ty - hy;
  const d = Math.hypot(dx, dy);
  if (d <= max || d === 0) return { x: tx, y: ty };
  return { x: hx + (dx / d) * max, y: hy + (dy / d) * max };
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
export function handTargets(t: number, hx: number) {
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

  const R = ARM_REACH;
  const lx = -HAND_DX + 0.14 * R * Math.sin(t * 1.7 + 0.3) + 0.05 * R * Math.sin(t * 3.1 + 1.7);
  const ly = HAND_DY + 0.18 * R * Math.sin(t * 1.1 + 1.2) + 0.07 * R * Math.sin(t * 2.6 + 0.5);
  const rx = HAND_DX + 0.14 * R * Math.sin(t * 1.5 + 2.4) + 0.05 * R * Math.sin(t * 2.9 + 0.2);
  const ry = HAND_DY + 0.18 * R * Math.sin(t * 1.25 + 0.1) + 0.07 * R * Math.sin(t * 2.2 + 2.8);

  // `hx` is where he ACTUALLY is, sway already in it. This used to be CX + sway,
  // which silently assumed he was always standing on his mark — true when he could
  // not move, and wrong the moment he could walk.
  let lXa = hx + lx;
  let lYa = SH_Y + ly;
  let rXa = hx + rx;
  let rYa = SH_Y + ry;

  if (gesture >= 0 && gStrength > 0) {
    const w = 0.6 * gStrength;
    lXa = lerp(lXa, hx + GP[gesture][0] * R, w);
    lYa = lerp(lYa, SH_Y + GP[gesture][1] * R, w);
    rXa = lerp(rXa, hx + GP[gesture][2] * R, w);
    rYa = lerp(rYa, SH_Y + GP[gesture][3] * R, w);
  }

  // TEACHER: the left arm aims at the board — the hand extends along the real
  // line to it, so he points at whatever is actually on screen. The boards are no
  // longer one shared box, so the target is the ACTIVE board's centre; pointing at
  // a fixed spot would have him gesturing below the tall ones.
  if (pointAmt > 0) {
    const bc = boardCentreAt(t);
    const shx = hx - LEN.shW;
    const dx = bc.x - shx;
    const dy = bc.y - SH_Y;
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
