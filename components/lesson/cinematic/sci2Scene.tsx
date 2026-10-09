import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './sci2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, parkSteps, grassBank, parkLawn, parkTree, tapeCase, STEP_TREADS, STEP_RISERS, STEP_WIDTHS,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-2, "What Makes a Fair Test?" — STONE STEPS UP A PARK BANK, TWO
// PAPER PLANES AND A TAPE MEASURE ON THE GRASS.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The woman with the bun is sure her pointy pink
// plane is the best there is; the man in the newsboy cap throws his from the grass; the
// scientist (the top hat) walks in with a tape measure and shows them why the race
// proved nothing yet.
//
//   b0   she climbs the steps, tread by tread, her pink plane at her chest, and holds it
//        up on "Watch this!"; the cap watches from the grass with his own plane.
//   b1   she turns and throws from the top step: the plane sails far out over the
//        grass on a long shallow glide and lands by the far edge; the cap throws his and
//        it noses down just past his feet.
//   b2   she comes down two steps to the bottom one and throws both arms up.
//   b3   the scientist walks in from the right, a tape case in his hand, tips his hat,
//        and points up at the top step, then down at the grass.
//   b4   he lays the case down at the chalk line, walks the blade out along the grass,
//        lays its hook down and picks her plane up off the lawn.
//   b5   Q1: he holds her plane out — tap the steps, its pointy nose or its pink paper.
//   b6   the cap fetches his plane, walks past her to the line and beckons; she steps
//        down and comes to stand beside him; the scientist floats her plane back to her.
//   b7   both throw from the line; his lands on the tape, hers just past it. She
//        cheers, points at the little gap, and pumps a fist.
//   b8   the scientist licks a finger and holds it up; a gust crosses the grass and
//        nudges both planes; his two hands weigh up and down and settle level.
//   b9   Q2: three rows chalked on the risers — tap one.
//   b10  the cap hands her a stick of chalk; she steps to the flight, crouches and
//        chalks a tally on the middle riser, and looks round at him.
//   b11  she stands; everyone at ease under the quotation.
//
// COMPOSITION, in stage units. A turfed bank runs across the back, its lit top at
// 437–449 and its face in shade down to the lower lawn (0–330, sloping off to the
// ground by 386). The stone steps 53–231 × 430–500 climb it: piers 53–71 and 213–231
// with ball finials at 432–444; the flight FLARES, its risers 87–197, 79–205 and 71–213
// top to bottom, 12 tall; the treads' tops at 449 (top), 466 and 483 — she stands ON a
// tread, feet on its top, and goes up and down a tread at a time. A park tree stands on
// the bank at the left edge. The lower lawn 0–400 × 500–518. The cap throws from 28 and
// his plane noses down at 54; hers glides from the top step to 388. The chalk line is at
// 302, the tape's case at 307–319, its hook laid at 376. At the line she stands at 238
// and the cap at 286; the scientist at 374; she chalks the tally from 218. Every
// hand-off is within the rig's safe reach (~23 units from the shoulder at K 0.76).
// Band [306, 516].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still. The one
// crossing is in depth: the cap passes in front of her while she stands up on a step.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('science');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 210-unit band: 37.1%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, science-foundations-2), except b4 and b6, whose walks,
 * crouches and hand-offs run on a little after the line ends.
 */
const LINES = [4.75, 4.97, 3.83, 4.54, 7, 0, 7.2, 4.47, 6.62, 0, 3.96, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// leaning in, and waiting — alive — while the reader answers or reads the quotation (N21).
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const LEAN = 177;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_BOAST = is('boast');
const A_THROW = is('throw');
const A_CLAIM = is('claim');
const A_ARRIVE = is('arrive');
const A_FAIR = is('fair');
const A_LINE = is('line');
const A_RETRY = is('retry');
const A_LUCK = is('luck');
const A_TALLY = is('tally');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.unfair ? 1 : 0));
const Q2 = BEATS.map((b) => (b.next ? 1 : 0));
const MARKS = BEATS.map((b) => b.marks ?? 0);

// ── the steps, the line and the tape ─────────────────────────────────────────
const STEPS = { x: 142, y: 465, w: 178, h: 70 };
const S_LEFT = STEPS.x - STEPS.w / 2;
const S_TOP = STEPS.y - STEPS.h / 2;
/** Where a foot stands, by level: the lawn, then the bottom, middle and top treads. */
const LEVEL = [GROUND, S_TOP + STEP_TREADS[2], S_TOP + STEP_TREADS[1], S_TOP + STEP_TREADS[0]];
/** The risers' tops, top to bottom, and the risers' span across the steps. */
const RISER = STEP_RISERS.map((r) => S_TOP + r);
const RISER_H = 12;
/** Each riser's left and right ends, top to bottom: the flight flares. */
const RISER_L = STEP_WIDTHS.map((w) => STEPS.x - w / 2);
const RISER_R = STEP_WIDTHS.map((w) => STEPS.x + w / 2);
const LINE_X = 302;
const CASE = { x: 313, y: 504.5, w: 12, h: 11 };
/** The slot the blade runs out of, and where its hook is laid. */
const SLOT = { x: CASE.x - CASE.w / 2 + 11.4, y: CASE.y - CASE.h / 2 + 9.4 };
const HOOK = { x: 376, y: 508.4 };
/** A plane lying on the lawn, and where each lands. */
const REST_Y = 503.5;
const HERS_FAR = 388;
const HIS_NEAR = 54;
/** Where the cap throws from, on the grass left of the steps. */
const CAP_X0 = 28;
const HIS_FAIR = 334;
const HERS_FAIR = 350;
/** How far the gust on b8 pushes both planes along the grass. */
const GUST = 4;
/** A plane in a hand: its middle a little past the wrist, nose the way he faces. */
const HOLD_OFF = 4;
/** Where the scientist holds her plane out for Q1 (his wrist). */
const SHOW = { x: 352, y: 451 };
/** Where the cap hands her the chalk. */
const PASS = { x: 262, y: 458 };
/** The tally she chalks on the middle riser's right-hand end: the first two throws. */
const TALLY_X = [184, 188.5];
const TALLY_N = TALLY_X.length;
/** Her two fists up in front of her, in a cheer: the far one higher, both clear of her head. */
const CHEER_FAR = 20;
const CHEER_NEAR = 15;
const TALLY_TOP = RISER[1] + 2.5;
const TALLY_LEN = 7.5;

const BANK_ART = grassBank(200, 468.5, 400, 63);
const TREE_ART = parkTree(0, 392, 64, 110);
const STEPS_ART = parkSteps(STEPS.x, STEPS.y, STEPS.w, STEPS.h);
const LAWN_ART = parkLawn(200, 509, 400, 18);
const CASE_ART = tapeCase(0, 0, CASE.w, CASE.h);
// The planes are drawn about their middle, nose to the right, and carried by a rider.

// ── who stands where, which way, doing what ──────────────────────────────────
/** Her place on the steps, at the line beside him, and at the step chalking the tally. */
const BUN_X0 = 190;
const BUN_LINE = 238;
const BUN_TALLY = 218;
/** His place at the line. */
const CAP_LINE = 286;
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing]; it
// eases through a profile over 0.36s (cinematicKit.facing).
type Track = readonly (readonly number[])[];
const BUN_LEGS: Track[] = BEATS.map((_, n) => (n < 6 ? [[0, BUN_X0]] : n === 6 ? [[0.82, BUN_LINE]] : n < 10 ? [[0, BUN_LINE]] : n === 10 ? [[0.22, BUN_TALLY]] : [[0, BUN_TALLY]]));
const BUN_TURN: Track[] = [
  [[0, -1]], [[0, 1], [0.42, -1]], [[0, -1]], [[0.24, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
  [[0, 1], [0.2, -1], [0.9, 1]], [[0, 1]], [[0, 1]],
];
const CAP_LEGS: Track[] = BEATS.map((_, n) => (n < 6 ? [[0, CAP_X0]] : n === 6 ? [[0.02, CAP_X0 + 14], [0.33, CAP_LINE]] : [[0, CAP_LINE]]));
const CAP_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1], [0.4, -1]], [[0.02, 1]],
  [[0, 1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** The scientist is off the stage, right, until he walks in on b3. */
const TH_LEGS: Track[] = BEATS.map((_, n) => (n < 3 ? [[0, 440]] : n === 3 ? [[0, 344]] : n === 4 ? [[0.02, 320], [0.34, 374]] : [[0, 374]]));
const TH_TURN: Track[] = BEATS.map((_, n) => (n === 4 ? [[0, -1], [0.31, 1], [0.84, -1]] : [[0, -1]]));
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const BUN_P = [TALK, LISTEN, TALK, LISTEN, NOD, WAIT, LISTEN, TALK, LEAN, WAIT, LISTEN, WAIT, LISTEN];
const CAP_P = [LISTEN, TALK, NOD, NOD, LEAN, WAIT, TALK, NOD, NOD, WAIT, TALK, NOD, LISTEN];
const TH_P = [LISTEN, LISTEN, LISTEN, EXPLAIN, EXPLAIN, WAIT, LISTEN, NOD, EXPLAIN, WAIT, NOD, WAIT, LISTEN];

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** Down on his heels by `sq`, 0 → 1: a cause, not a clock (AL1). */
function crouch(s: Stance, sq: number): Stance {
  'worklet';
  if (sq <= 0) return s;
  return {
    ...s,
    bob: s.bob - 22 * sq,
    tilt: s.tilt - 0.3 * sq,
    neck: s.neck + 0.22 * sq,
    footL: { x: lerp(s.footL.x, -7, sq), y: s.footL.y * (1 - sq) },
    footR: { x: lerp(s.footR.x, 9, sq), y: s.footR.y * (1 - sq) },
  };
}
/**
 * One step up or down a flight, `u` 0 → 1. The FRONT foot goes first and the back foot
 * follows it onto the same tread; each clears the nosing on an arc; and the standing knee
 * bends through the middle of the step (`bob`, a cause: AL1), because a leg cannot reach
 * a tread a whole step away from a straight one. Returns the ground the body stands on
 * and the two feet relative to it, in rig units.
 */
function stepOf(from: number, to: number, u: number) {
  'worklet';
  const uL = ease01(u / 0.55);
  const uT = ease01((u - 0.45) / 0.55);
  const wL = lerp(from, to, uL) - 5 * Math.sin(Math.PI * uL);
  const wT = lerp(from, to, uT) - 5 * Math.sin(Math.PI * uT);
  const g = lerp(from, to, ease01(u));
  // the feet are handed over from the stance and back over the first and last eighth
  const w = clamp01(u * 8) * clamp01((1 - u) * 8);
  return { g, fr: (wL - g) / K, fl: (wT - g) / K, bob: -8 * Math.sin(Math.PI * clamp01(u)), w };
}
/** Where her feet are, beat by beat: the climb on b0, two steps down on b2, off on b6. */
function bunFeet(n: number, f: number) {
  'worklet';
  if (A_BOAST[n]) {
    if (f < 0.26) return stepOf(LEVEL[0], LEVEL[1], (f - 0.06) / 0.18);
    if (f < 0.46) return stepOf(LEVEL[1], LEVEL[2], (f - 0.26) / 0.18);
    return stepOf(LEVEL[2], LEVEL[3], (f - 0.46) / 0.18);
  }
  if (A_THROW[n]) return stepOf(LEVEL[3], LEVEL[3], 1);
  if (A_CLAIM[n]) {
    if (f < 0.22) return stepOf(LEVEL[3], LEVEL[2], (f - 0.04) / 0.16);
    return stepOf(LEVEL[2], LEVEL[1], (f - 0.22) / 0.16);
  }
  if (A_LINE[n]) return stepOf(LEVEL[1], LEVEL[0], (f - 0.75) / 0.07);
  if (n > 2 && n < 6) return stepOf(LEVEL[1], LEVEL[1], 1);
  return stepOf(GROUND, GROUND, 1);
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn. He starts
 * from WHERE HE IS ON SCREEN (`src`, out of the carry), never from where the script
 * left him, so a tap mid-walk or a step back cannot put him anywhere in one frame
 * (group L). A leg starts at its time or when the leg before it has finished.
 */
function legsOf(src: number, legs: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[k][0] * L, free);
    if (b < start) break;
    x0 = from;
    x1 = to;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking };
}
/** Which way a figure faces at time `b`, turning through a profile from its screen facing. */
function faceOf(src: number, turns: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let d = src;
  for (let k = 0; k < turns.length; k += 1) {
    const at = turns[k][0] * L;
    if (b < at) break;
    d = facing(from, turns[k][1], b - at);
    from = turns[k][1];
  }
  return d;
}
/** One figure's body for a beat: walking its legs, or holding its pose live. */
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(codes[n], t), hHold(codes[n], t), hLive(codes[n], t, b), w.u, WALK, 0)
    : hLive(codes[n], t, b);
}
/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
type Fly = { x: number; y: number; r: number; sx: number };
/** A plane held in a hand: its middle just past the wrist, nose the way he faces, a little up. */
function heldBy(wr: { x: number; y: number }, dir: number): Fly {
  'worklet';
  return { x: wr.x + HOLD_OFF * dir, y: wr.y - 1.5, r: -10 * dir, sx: dir };
}
/** A plane lying on the lawn. */
function lying(x: number): Fly {
  'worklet';
  return { x, y: REST_Y, r: 0, sx: 1 };
}
function mixFly(a: Fly, z: Fly, u: number): Fly {
  'worklet';
  return { x: lerp(a.x, z.x, u), y: lerp(a.y, z.y, u), r: lerp(a.r, z.r, u), sx: lerp(a.sx, z.sx, u) };
}
/**
 * A paper plane in the air, `s` 0 → 1 from (x0, y0) to (x1, y1). A GLIDE holds its speed
 * along the ground and sinks slowly at first, faster through the middle, and flattens out
 * to land; `lift` is the little rise a good throw gives it first. A DIVE runs out of speed
 * at once and noses down. The nose follows the path, and levels as it touches down.
 */
function flight(s: number, x0: number, y0: number, x1: number, y1: number, lift: number, dive: boolean): Fly {
  'worklet';
  const at = (v: number) => {
    'worklet';
    const c = v < 0 ? 0 : v > 1 ? 1 : v;
    const xs = dive ? 1 - (1 - c) * (1 - c) : c;
    const ys = dive ? c * c : c * c * (3 - 2 * c);
    return { x: lerp(x0, x1, xs), y: lerp(y0, y1, ys) - lift * Math.sin(Math.PI * c) };
  };
  const p = at(s);
  const q = at(s + 0.02);
  const sx = x1 >= x0 ? 1 : -1;
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const ang = (Math.atan2(sx * dy, sx * dx) * 180) / Math.PI;
  const level = 1 - clamp01((s - 0.9) / 0.1);
  return { x: p.x, y: p.y, r: ang * level, sx };
}
/** The first frames of a flight start from the hand that let go, not from a fixed point. */
function launch(from: Fly, path: Fly, b: number, at: number): Fly {
  'worklet';
  return mixFly(from, path, clamp01((b - at) / 0.12));
}

const CAM = followMoves(BUN_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('science'));

export default function Sci2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
  const cv = useCarry(29);
  const on = useLinger(i);
  // The answer, felt on the stage. RIGHT: the steps take a heavy thud (a squash and a
  // settle) and the chalked row stamps down. WRONG: both planes are knocked and rock, hop
  // and settle. Both run on the UI thread and ease out; nothing glows.
  const thud = useSharedValue(0);
  const jolt = useSharedValue(0);
  useEffect(() => {
    if (picked === null) {
      thud.value = 0;
      jolt.value = 0;
    } else if (picked === 'steps' || picked === 'ten') {
      thud.value = withSequence(withTiming(1, { duration: 80 }), withSpring(0, { damping: 6, stiffness: 220 }));
    } else {
      jolt.value = withSequence(
        withTiming(1, { duration: 80 }), withTiming(-1, { duration: 120 }), withTiming(0.6, { duration: 110 }),
        withTiming(-0.35, { duration: 100 }), withTiming(0, { duration: 110 }),
      );
    }
  }, [picked, thud, jolt]);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    /** A quicker blend, for what is carried in a hand or moves by the clock in the beat. */
    const trq = ease01(b / 0.25);
    const L = lineOf(LINES, n);
    const f = b / L;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the woman with the bun ──────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, BUN_LEGS[0][0][1]), BUN_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), BUN_TURN[n], b, L), 1);
    const ft = bunFeet(n, f);
    const gB = carry(cv, 2, n, ft.g, ft.g, ease01(b / 0.3));
    let sb = bodyOf(wb, BUN_P, n, t, b);
    if (ft.w > 0) {
      sb = {
        ...sb,
        bob: sb.bob + ft.bob,
        footL: { x: lerp(sb.footL.x, -4, ft.w), y: lerp(sb.footL.y, ft.fl, ft.w) },
        footR: { x: lerp(sb.footR.x, 4, ft.w), y: lerp(sb.footR.y, ft.fr, ft.w) },
      };
    }
    // b0: her plane at her chest up the steps, then held up on "Watch this!"
    if (A_BOAST[n]) {
      const up = st(0.72, 0.82);
      // the target rides her own knee-bend (ft.bob) so the plane stays still at her chest
      // through every step, rather than bobbing in her hand on each tread (AR5, AR6)
      sb = hand(sb, xB, gB, dB, 1, xB + lerp(9, 10, up) * dB, gB - lerp(46, 72, up) - ft.bob * K * ft.w, 1);
    }
    // b1: wound back over her shoulder, and thrown out off the top step
    if (A_THROW[n]) {
      const back = st(0.03, 0.09);
      const fwd = st(0.09, 0.14);
      const tx = lerp(lerp(xB + 10 * dB, xB - 6 * dB, back), xB + 16 * dB, fwd);
      const ty = lerp(lerp(gB - 72, gB - 66, back), gB - 60, fwd);
      sb = hand(sb, xB, gB, dB, 1, tx, ty, 1 - st(0.3, 0.42));
    }
    // b2: both fists up IN FRONT of her once she is down on the bottom step, toward the
    // man she is crowing at, and one pump. Clear of her head (a hand straight up is lost
    // in the head's silhouette) and never thrown back behind it (AR4).
    if (A_CLAIM[n]) {
      const up = st(0.36, 0.48);
      const pump = 3 * Math.sin(Math.PI * 2 * clamp01((f - 0.5) / 0.4)) * st(0.48, 0.52);
      sb = hand(sb, xB, gB, dB, 1, xB + CHEER_FAR * dB, gB - 60 - pump, up);
      sb = hand(sb, xB, gB, dB, -1, xB + CHEER_NEAR * dB, gB - 55 - pump, up);
    }
    // b6: out to catch her plane as it floats back to her
    if (A_LINE[n]) sb = hand(sb, xB, gB, dB, 1, xB + 14 * dB, 456, st(0.88, 0.95));
    // b7: from the catch, wound back high and thrown; a cheer; a hand at the little
    // gap between the planes; a fist
    if (A_RETRY[n]) {
      const back = st(0, 0.05);
      const fwd = st(0.05, 0.09);
      const tx = lerp(lerp(xB + 14 * dB, xB - 6 * dB, back), xB + 16 * dB, fwd);
      const ty = lerp(lerp(456, 432, back), 434, fwd);
      sb = hand(sb, xB, gB, dB, 1, tx, ty, 1 - st(0.16, 0.24));
      const cheer = bp(0.28, 0.34, 0.46);
      sb = hand(sb, xB, gB, dB, 1, xB + CHEER_FAR * dB, gB - 60, cheer);
      sb = hand(sb, xB, gB, dB, -1, xB + CHEER_NEAR * dB, gB - 55, cheer);
      sb = hand(sb, xB, gB, dB, 1, xB + 40 * dB, 470, bp(0.5, 0.58, 0.72));
      sb = hand(sb, xB, gB, dB, -1, xB + 6 * dB, gB - 76, bp(0.76, 0.82, 0.98));
    }
    // b10: a hand out for the chalk, then crouched at the step chalking the tally
    let sqB = 0;
    if (A_TALLY[n]) {
      sb = hand(sb, xB, gB, dB, 1, PASS.x, PASS.y, bp(0.08, 0.15, 0.22));
      sqB = st(0.42, 0.5);
      sb = crouch(sb, sqB);
      // the first two throws chalked: each stroke drawn top to bottom, then the chalk
      // lifted across to the next — two strokes, then the hand rests (AR5)
      const g = clamp01((f - 0.52) / 0.36) * TALLY_N;
      const k = Math.min(TALLY_N - 1, Math.floor(g));
      const ph = g - k;
      const down = clamp01(ph / 0.7);
      const over = k < TALLY_N - 1 ? clamp01((ph - 0.7) / 0.3) : 0;
      const tx = lerp(TALLY_X[k], TALLY_X[Math.min(TALLY_N - 1, k + 1)], ease01(over));
      const ty = TALLY_TOP + TALLY_LEN * down * (1 - ease01(over));
      sb = hand(sb, xB, gB, dB, 1, tx, ty, st(0.46, 0.52) * (1 - st(0.92, 1)));
    }
    if (A_REST[n]) {
      sqB = 1 - st(0, 0.12);
      sb = crouch(sb, sqB);
    }
    // down on her heels, her free hand rests on her front knee — never left hanging
    // behind a body that leans forward (AR4)
    sb = hand(sb, xB, gB, dB, -1, xB + 8 * dB, gB - 15, sqB);
    const prevB = carryFrom(heldB, n, hHold(BUN_P[p], t));
    const figB = keepHeld(heldB, wb.walking || ft.w > 0 ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the man in the cap ──────────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 3, n, CAP_LEGS[0][0][1]), CAP_LEGS[n], b, L);
    const xC = carry(cv, 3, n, wc.x, wc.x, 1);
    const dC = carry(cv, 4, n, 0, faceOf(carrySource(cv, 4, n, 1), CAP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CAP_P, n, t, b);
    // b0–b1: his plane at his side, then thrown — and it noses straight down
    if (n === 0) sc = hand(sc, xC, GROUND, dC, 1, xC + 9 * dC, 472, 1);
    if (A_THROW[n]) {
      const back = st(0.5, 0.56);
      const fwd = st(0.56, 0.59);
      const tx = lerp(lerp(xC + 9 * dC, xC - 4 * dC, back), xC + 16 * dC, fwd);
      const ty = lerp(lerp(472, 436, back), 446, fwd);
      sc = hand(sc, xC, GROUND, dC, 1, tx, ty, 1 - st(0.66, 0.76));
    }
    // b6: down to pick his plane up off the lawn, then to the line with it, beckoning
    // her over behind him
    let sqC = 0;
    if (A_LINE[n]) {
      sqC = st(0.13, 0.19) * (1 - st(0.26, 0.32));
      sc = crouch(sc, sqC);
      sc = hand(sc, xC, GROUND, dC, 1, HIS_NEAR - HOLD_OFF, 502, bp(0.14, 0.2, 0.3));
      sc = hand(sc, xC, GROUND, dC, 1, xC + 8 * dC, 464, st(0.26, 0.32));
      // turned to face her (CAP_TURN), his hand out in front and two curls of it, then
      // down (AR4: not waved behind him; AR5: two strokes and the hand rests)
      const cs = Math.sin(Math.PI * 2 * clamp01((f - 0.74) / 0.1));
      const curl = 3.5 * cs * cs;
      sc = hand(sc, xC, GROUND, dC, -1, xC + (17 - curl) * dC, 452 - curl, bp(0.7, 0.74, 0.86)); // AP18: beckoning her over, twice
    }
    // b7: from his chest, wound back and thrown
    if (A_RETRY[n]) {
      const back = st(0, 0.05);
      const fwd = st(0.05, 0.09);
      const tx = lerp(lerp(xC + 8 * dC, xC - 4 * dC, back), xC + 16 * dC, fwd);
      const ty = lerp(lerp(464, 436, back), 444, fwd);
      sc = hand(sc, xC, GROUND, dC, 1, tx, ty, 1 - st(0.16, 0.24));
    }
    // b10: the chalk out of his pocket and into her hand; then both arms out on
    // "Lovely day for it!"
    if (A_TALLY[n]) {
      sc = hand(sc, xC, GROUND, dC, 1, xC + 3 * dC, 470, bp(0.0, 0.04, 0.08));
      sc = hand(sc, xC, GROUND, dC, 1, PASS.x, PASS.y, bp(0.06, 0.14, 0.24));
      const wide = bp(0.74, 0.82, 0.98);
      // both arms open IN FRONT of him, to the day and to her (AR4)
      sc = hand(sc, xC, GROUND, dC, 1, xC + 20 * dC, 436, wide);
      sc = hand(sc, xC, GROUND, dC, -1, xC + 12 * dC, 444, wide);
    }
    const prevC = carryFrom(heldC, n, hHold(CAP_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the scientist ───────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 5, n, TH_LEGS[0][0][1]), TH_LEGS[n], b, L);
    const xT = carry(cv, 5, n, wt.x, wt.x, 1);
    const dT = carry(cv, 6, n, 0, faceOf(carrySource(cv, 6, n, -1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    // the tape case in his left hand until he sets it down on b4
    const caseNow = A_FAIR[n] ? st(0.24, 0.27) : n > 4 ? 1 : 0;
    const caseDown = carry(cv, 7, n, caseNow, caseNow, trq);
    // the hook: 0 rolled up · 1 in his right hand · 2 laid on the grass
    const hookNow = A_FAIR[n] ? st(0.25, 0.28) + st(0.6, 0.64) : n > 4 ? 2 : 0;
    const hookT = carry(cv, 8, n, hookNow, hookNow, trq);
    let sqT = 0;
    if (A_ARRIVE[n]) {
      const after = moveTr(440, 344, TR) / L;
      stt = hand(stt, xT, GROUND, dT, 1, xT + 5 * dT, GROUND - 76, bp(after + 0.01, after + 0.06, after + 0.13));
      stt = hand(stt, xT, GROUND, dT, 1, xT + 22 * dT, 432, bp(0.38, 0.46, 0.64));
      stt = hand(stt, xT, GROUND, dT, 1, xT + 20 * dT, 482, bp(0.68, 0.76, 0.94));
    }
    if (n <= 4) stt = hand(stt, xT, GROUND, dT, -1, xT + 3 * dT, 474, 1 - caseDown);
    if (A_FAIR[n]) {
      // down at the line: the case set on the grass, the hook taken in the other hand
      sqT = st(0.14, 0.2) * (1 - st(0.27, 0.32)) + st(0.56, 0.62) * (1 - st(0.74, 0.8));
      stt = crouch(stt, sqT);
      stt = hand(stt, xT, GROUND, dT, -1, CASE.x, CASE.y - 2, bp(0.15, 0.22, 0.3));
      // ONE PATH for the working hand, each place handed straight on to the next — the
      // hook out of the slot, the blade walked out along the grass, the hook laid, her
      // plane picked up, held at his chest, held out — never back to his side between
      // them, which read as the same jab over and over (AR5)
      const PATH = [
        [xT + 12 * dT, 482, 0.28, 0.34],
        [HOOK.x, HOOK.y - 3, 0.57, 0.62],
        [HERS_FAR - HOLD_OFF, 501, 0.64, 0.69],
        [xT + 9 * dT, 462, 0.74, 0.8],
        [SHOW.x, SHOW.y, 0.88, 0.96],
      ];
      let wx = SLOT.x + 1;
      let wy = SLOT.y - 2;
      for (let k = 0; k < PATH.length; k += 1) {
        const u = st(PATH[k][2], PATH[k][3]);
        wx = lerp(wx, PATH[k][0], u);
        wy = lerp(wy, PATH[k][1], u);
      }
      stt = hand(stt, xT, GROUND, dT, 1, wx, wy, st(0.2, 0.25));
      // down on his heels to lay the hook, his free hand on his front knee (AR4)
      const knee = st(0.22, 0.26) * (1 - st(0.27, 0.32)) + st(0.56, 0.62) * (1 - st(0.74, 0.8));
      stt = hand(stt, xT, GROUND, dT, -1, xT + 8 * dT, GROUND - 15, knee);
    }
    // b5: her plane held out for the question; b6: held, then floated back to her
    if (n === 5) stt = hand(stt, xT, GROUND, dT, 1, SHOW.x, SHOW.y, 1);
    if (A_LINE[n]) {
      const back = st(0.8, 0.85);
      const fwd = st(0.85, 0.88);
      const tx = lerp(lerp(SHOW.x, xT - 4 * dT, back), SHOW.x - 4, fwd);
      const ty = lerp(lerp(SHOW.y, 446, back), 449, fwd);
      stt = hand(stt, xT, GROUND, dT, 1, tx, ty, 1 - st(0.94, 1));
    }
    // b8: a finger licked and held up to the breeze; then two hands weighing up and down
    // until they settle level — the luck cancelling out
    if (A_LUCK[n]) {
      stt = hand(stt, xT, GROUND, dT, 1, xT + 4 * dT, GROUND - 66, bp(0.02, 0.06, 0.12));
      stt = hand(stt, xT, GROUND, dT, 1, xT + 9 * dT, GROUND - 92, st(0.1, 0.16) * (1 - st(0.36, 0.44)));
      const weigh = bp(0.46, 0.52, 0.98);
      // one weighing, up and down and level, however long the line is (AR5): a swing
      // timed in seconds would weigh more often the slower the line is said
      const osc = Math.sin(Math.PI * 2 * clamp01((f - 0.5) / 0.38)) * (1 - st(0.55, 0.88));
      stt = hand(stt, xT, GROUND, dT, 1, xT + 19 * dT, 456 - 9 * osc, weigh);
      stt = hand(stt, xT, GROUND, dT, -1, xT + 6 * dT, 456 + 9 * osc, weigh);
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the bodies, and the things in their hands ───────────────────────────
    const bun = pose(figB, xB, gB, K, dB, 1);
    const cap = pose(figC, xC, GROUND, K, dC, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const wB = wristOf(bun, 'wrR');
    const wC = wristOf(cap, 'wrR');
    const wT = wristOf(th, 'wrR');
    const wTL = wristOf(th, 'wrL');

    // the gust on b8, and how far it has pushed the planes along the grass
    const gustNow = A_LUCK[n] ? bp(0.15, 0.24, 0.4) : 0;
    const gust = carry(cv, 9, n, gustNow, gustNow, trq);
    const pushNow = A_LUCK[n] ? st(0.2, 0.3) : n > 8 ? 1 : 0;
    const push = GUST * carry(cv, 10, n, pushNow, pushNow, trq);
    const wob = A_LUCK[n] ? 9 * Math.sin(f * 60) * bp(0.18, 0.24, 0.34) : 0;

    // HER PLANE
    let hp: Fly;
    if (n === 0) hp = heldBy(wB, dB);
    else if (A_THROW[n]) {
      const R = { x: xB + 16 + HOLD_OFF, y: gB - 61.5 };
      hp = f < 0.14 ? heldBy(wB, dB)
        : launch(heldBy(wB, dB), flight((f - 0.14) / 0.34, R.x, R.y, HERS_FAR, REST_Y, 12, false), b, 0.14 * L);
    } else if (n < 4) hp = lying(HERS_FAR);
    else if (A_FAIR[n]) hp = mixFly(lying(HERS_FAR), heldBy(wT, dT), st(0.67, 0.7));
    else if (n === 5) hp = heldBy(wT, dT);
    else if (A_LINE[n]) {
      const R = { x: SHOW.x - 4 - HOLD_OFF, y: 447.5 };
      const C = { x: BUN_LINE + 14 + HOLD_OFF, y: 454.5 };
      hp = f < 0.88 ? heldBy(wT, dT)
        : mixFly(launch(heldBy(wT, dT), flight((f - 0.88) / 0.08, R.x, R.y, C.x, C.y, 6, false), b, 0.88 * L), heldBy(wB, dB), st(0.955, 0.985));
    } else if (A_RETRY[n]) {
      const R = { x: xB + 16 + HOLD_OFF, y: 432.5 };
      hp = f < 0.09 ? heldBy(wB, dB)
        : launch(heldBy(wB, dB), flight((f - 0.09) / 0.24, R.x, R.y, HERS_FAIR, REST_Y, 14, false), b, 0.09 * L);
    } else hp = lying(HERS_FAIR + push);
    if (A_LUCK[n]) hp = { ...hp, r: wob };

    // HIS PLANE
    let mp: Fly;
    if (n === 0) mp = heldBy(wC, dC);
    else if (A_THROW[n]) {
      const R = { x: CAP_X0 + 16 + HOLD_OFF, y: 444.5 };
      mp = f < 0.59 ? heldBy(wC, dC)
        : launch(heldBy(wC, dC), flight((f - 0.59) / 0.1, R.x, R.y, HIS_NEAR, REST_Y, 0, true), b, 0.59 * L);
    } else if (n < 6) mp = lying(HIS_NEAR);
    else if (A_LINE[n]) mp = mixFly(lying(HIS_NEAR), heldBy(wC, dC), st(0.19, 0.22));
    else if (A_RETRY[n]) {
      const R = { x: CAP_LINE + 16 + HOLD_OFF, y: 442.5 };
      mp = f < 0.09 ? heldBy(wC, dC)
        : launch(heldBy(wC, dC), flight((f - 0.09) / 0.2, R.x, R.y, HIS_FAIR, REST_Y, 7, false), b, 0.09 * L);
    } else mp = lying(HIS_FAIR + push);
    if (A_LUCK[n]) mp = { ...mp, r: -wob * 0.8 };

    // the hook: at the slot, in his hand, or laid
    const hookHand = { x: wT.x + 2 * dT, y: wT.y + 2 };
    const hookAt = hookT <= 1
      ? { x: lerp(SLOT.x, hookHand.x, hookT), y: lerp(SLOT.y, hookHand.y, hookT) }
      : { x: lerp(hookHand.x, HOOK.x, hookT - 1), y: lerp(hookHand.y, HOOK.y, hookT - 1) };
    // the chalk: in his hand, then hers
    const chalkNow = A_TALLY[n] ? st(0.15, 0.17) : n > 10 ? 1 : 0;
    const chalkT = carry(cv, 11, n, chalkNow, chalkNow, trq);
    const chalkAt = { x: lerp(wC.x, wB.x, chalkT), y: lerp(wC.y, wB.y, chalkT) };
    // the tally, stroke by stroke
    const marksNow = A_TALLY[n]
      ? st(0.52, 0.646) + st(0.7, 0.826)
      : n > 10 ? MARKS[n] : 0;
    // the rows on the risers: 0 none · 1 all three · 2 only the right one left
    const rowsNow = n === 9 ? 1 : n > 9 ? 2 : 0;

    return {
      bun, cap, th,
      hp: {
        x: carry(cv, 12, n, hp.x, hp.x, trq), y: carry(cv, 13, n, hp.y, hp.y, trq),
        r: carry(cv, 14, n, hp.r, hp.r, trq), sx: carry(cv, 15, n, hp.sx, hp.sx, trq), o: 1,
      },
      mp: {
        x: carry(cv, 16, n, mp.x, mp.x, trq), y: carry(cv, 17, n, mp.y, mp.y, trq),
        r: carry(cv, 18, n, mp.r, mp.r, trq), sx: carry(cv, 19, n, mp.sx, mp.sx, trq), o: 1,
      },
      case: {
        x: lerp(wTL.x + 1, CASE.x, caseDown), y: lerp(wTL.y + 5, CASE.y, caseDown), r: 0, sx: 1, o: 1,
      },
      hook: { x: carry(cv, 20, n, hookAt.x, hookAt.x, trq), y: carry(cv, 21, n, hookAt.y, hookAt.y, trq) },
      blade: carry(cv, 22, n, caseNow, caseNow, trq),
      chalk: { x: chalkAt.x, y: chalkAt.y, o: carry(cv, 23, n, n >= 10 ? 1 : 0, n >= 10 ? 1 : 0, trq) },
      marks: carry(cv, 24, n, marksNow, marksNow, trq),
      gust,
      gustX: carry(cv, 28, n, A_LUCK[n] ? st(0.15, 0.4) : 1, A_LUCK[n] ? st(0.15, 0.4) : 1, trq),
      rows: carry(cv, 25, n, rowsNow, rowsNow, tr),
      q1: carry(cv, 26, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 27, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bun);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={TREE_ART} tone={TONE} />
      <ObjectArt parts={BANK_ART} tone={TONE} />
      <Thud v={thud}>
        <ObjectArt parts={STEPS_ART} tone={TONE} />
      </Thud>
      <Rows S={SCENE} thud={thud} />
      <Tally S={SCENE} />
      <ObjectArt parts={LAWN_ART} tone={TONE} />
      <View style={styles.chalkLine} pointerEvents="none" />
      <Tape S={SCENE} />
      <Gust S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Plane S={SCENE} k="hp" name="sci2-hers" jolt={jolt} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="second" wear={BY_ID.stroller.pieces} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      <Plane S={SCENE} k="mp" name="sci2-his" jolt={jolt} />
      <Chalk S={SCENE} />
      {on(Q1) ? <UnfairTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <NextTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the planes, the tape, the chalk ──────────────────────────────────────────

function Plane({ S, k, name, jolt }: { S: SharedValue<any>; k: 'hp' | 'mp'; name: string; jolt: SharedValue<number> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value[k];
    const j = jolt.value;
    return {
      opacity: v.o,
      transform: [
        { translateX: v.x }, { translateY: v.y - 5 * Math.abs(j) }, { rotate: `${v.r + 16 * j}deg` }, { scaleX: v.sx },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name={name} />
    </Animated.View>
  );
}

/** The squash and settle the steps take on a right answer: heavy, down at the foot. */
function Thud({ v, children }: { v: SharedValue<number>; children: React.ReactNode }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ scaleY: 1 - 0.07 * v.value }, { scaleX: 1 + 0.025 * v.value }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: `${STEPS.x}px ${S_TOP + STEPS.h}px` }, st]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}

const TICKS = Array.from({ length: 16 }, (_, k) => k);
function Tape({ S }: { S: SharedValue<any> }) {
  const caseSt = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.case.x }, { translateY: S.value.case.y }],
  }));
  const blade = useAnimatedStyle(() => {
    const h = S.value.hook;
    const dx = h.x - SLOT.x;
    const dy = h.y - SLOT.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    return {
      opacity: S.value.blade,
      width: len,
      transform: [{ rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }],
    };
  });
  const hook = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.hook.x - 1 }, { translateY: S.value.hook.y - 2.6 }],
    opacity: S.value.blade,
  }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.blade, blade]}>
        {TICKS.map((k) => <View key={k} style={[styles.tick, { left: 4 + k * 6, height: k % 2 ? 1.2 : 2 }]} />)}
      </Animated.View>
      <Animated.View style={[styles.hook, hook]} />
      <Animated.View style={[styles.rider, caseSt]}>
        <ObjectArt parts={CASE_ART} tone={TONE} />
      </Animated.View>
    </View>
  );
}

function Chalk({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.chalk.o,
    transform: [{ translateX: S.value.chalk.x - 1 }, { translateY: S.value.chalk.y - 3 }, { rotate: '20deg' }],
  }));
  return <Animated.View style={[styles.chalkStick, st]} pointerEvents="none" />;
}

/** The tally on the middle riser: a stroke at a time, chalked top to bottom. */
function Tally({ S }: { S: SharedValue<any> }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {TALLY_X.map((x, k) => <Stroke key={k} S={S} k={k} x={x} />)}
    </View>
  );
}
function Stroke({ S, k, x }: { S: SharedValue<any>; k: number; x: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ scaleY: clamp01(S.value.marks - k) }] }));
  return <Animated.View style={[styles.stroke, { left: x - 0.7 }, st]} />;
}

/** The gust on b8: three streaks of air running across the grass. */
const STREAKS = [{ y: 466, w: 34 }, { y: 480, w: 46 }, { y: 492, w: 28 }];
function Gust({ S }: { S: SharedValue<any> }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STREAKS.map((s, k) => <Streak key={k} S={S} k={k} y={s.y} w={s.w} />)}
    </View>
  );
}
function Streak({ S, k, y, w }: { S: SharedValue<any>; k: number; y: number; w: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.gust,
    transform: [{ translateX: 250 + 140 * S.value.gustX + k * 9 }],
  }));
  return <Animated.View style={[styles.streak, { top: y, width: w }, st]} />;
}

// ── the rows chalked on the risers ───────────────────────────────────────────

type Row = { id: string; label: string; riser: number; correct: boolean };
/** Q2: the three rows. Throwing ten times each is how a close result is tested. */
const ROWS: Row[] = [
  { id: 'settled', label: 'CALL IT SETTLED', riser: 0, correct: false },
  { id: 'harder', label: 'THROW HARDER', riser: 1, correct: false },
  { id: 'ten', label: 'THROW TEN TIMES EACH', riser: 2, correct: true },
];
const rowBox = (k: number) => ({ left: RISER_L[k] + 4, top: RISER[k] + 0.5, width: RISER_R[k] - RISER_L[k] - 8, height: RISER_H - 1 });

/** After the question, the right row stays chalked on its riser. */
function Rows({ S, thud }: { S: SharedValue<any>; thud: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.rows - 1),
    transform: [{ scale: 1 + 0.22 * thud.value }],
  }));
  return (
    <Animated.View style={[styles.keptRow, rowBox(2), st]} pointerEvents="none">
      <View style={styles.rowPlate}>
        <Text style={styles.rowText}>{ROWS[2].label}</Text>
      </View>
    </Animated.View>
  );
}

function NextTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {ROWS.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', ...rowBox(q.riser) }}
        >
          <View style={styles.rowPlate}>
            <Text style={styles.rowText}>{q.label}</Text>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

// ── Q1: the steps, her plane's pointy nose, its pink paper ───────────────────

/**
 * The nose and the paper are two parts of one small plane, so each is named on a plate
 * beside it with a hairline to the part, and the plate is what is tapped. The steps
 * carry their name on the middle riser. No two targets touch.
 */
const NOSE = { x: SHOW.x - HOLD_OFF - 12, y: SHOW.y - 1.5 };
const PAPER = { x: SHOW.x - HOLD_OFF + 2, y: SHOW.y - 4 };
type Tag = { id: string; label: string; left: number; top: number; w: number; h: number; pl: number; pw: number; pt: number; correct: boolean };
const UNFAIR_Q: Tag[] = [
  { id: 'steps', label: 'THE STEPS', left: RISER_L[2] + 4, top: 446, w: 104, h: 53, pl: 22, pw: 60, pt: RISER[1] + 0.5 - 446, correct: true },
  { id: 'nose', label: 'POINTY NOSE', left: 250, top: 440, w: 78, h: 17, pl: 3, pw: 70, pt: 2.5, correct: false },
  { id: 'paper', label: 'PINK PAPER', left: 282, top: 404, w: 72, h: 17, pl: 3, pw: 58, pt: 2.5, correct: false },
];
function UnfairTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {/* the hairlines from the two plates to the parts they name */}
      <View style={[styles.leader, leaderStyle(317, 448.5, NOSE.x, NOSE.y)]} pointerEvents="none" />
      <View style={[styles.leader, leaderStyle(320, 419, PAPER.x, PAPER.y)]} pointerEvents="none" />
      {UNFAIR_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place}>
            <View style={[styles.tagPlate, { left: q.pl, top: q.pt, width: q.pw }]}>
              <Text style={styles.rowText}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}
function leaderStyle(x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  return {
    left: x0, top: y0 - 0.5, width: Math.sqrt(dx * dx + dy * dy),
    transform: [{ rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }],
  };
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  chalkLine: {
    position: 'absolute', left: LINE_X - 1, top: 500.5, width: 2.2, height: 17, borderRadius: 1,
    backgroundColor: PAPER_LIT, transform: [{ skewX: '-24deg' }],
  },
  blade: {
    position: 'absolute', left: SLOT.x, top: SLOT.y - 1.4, height: 2.8, backgroundColor: NATURAL.tapeBlade.base,
    borderWidth: 0.6, borderColor: INK, overflow: 'hidden', transformOrigin: '0% 50%',
  },
  tick: { position: 'absolute', top: 0, width: 0.6, backgroundColor: INK },
  hook: {
    position: 'absolute', left: 0, top: 0, width: 2, height: 4, backgroundColor: NATURAL.silver.shade,
    borderWidth: 0.5, borderColor: INK,
  },
  chalkStick: {
    position: 'absolute', left: 0, top: 0, width: 2, height: 6, borderRadius: 1, backgroundColor: PAPER_LIT,
    borderWidth: 0.5, borderColor: INK,
  },
  stroke: {
    position: 'absolute', top: TALLY_TOP, width: 1.4, height: TALLY_LEN, borderRadius: 0.7, backgroundColor: PAPER_LIT,
    transformOrigin: '50% 0%',
  },
  streak: { position: 'absolute', left: 0, height: 1.2, borderRadius: 0.6, backgroundColor: PAPER_LIT },
  keptRow: { position: 'absolute' },
  rowPlate: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1, borderColor: INK,
  },
  rowText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.4, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  place: { flexGrow: 1 },
  tagPlate: {
    position: 'absolute', height: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1, borderColor: INK,
  },
  leader: { position: 'absolute', height: 1, backgroundColor: INK, transformOrigin: '0% 50%' },
});

export function Sci2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Sci2Scene} band={[306, 516]} camera={CAM} />;
}
